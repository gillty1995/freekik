import { publicProcedure, router } from '@/server/api/trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

const DEFAULT_WINDOW_HOURS = 6;
const LIVE_LOOKBACK_MS = 3 * 60 * 60 * 1000;

interface APIFootballFixture {
  fixture: {
    id: number;
    date: string;
    status: { short: string; elapsed: number | null };
  };
  league: { name: string };
  teams: { home: { name: string }; away: { name: string } };
  goals: { home: number | null; away: number | null };
  events?: any[];
  lineups?: any[];
  statistics?: any[];
}

interface APIFootballEvent {
  time: { elapsed: number | null; extra: number | null };
  team: { id: number; name: string; };
  player: { id: number|null; name: string|null };
  assist: { id: number|null; name: string|null };
  type: string;
  detail: string;
  comments: string | null;
}

interface APIFootballLineup {
  team: { id: number; name: string };
  formation: string;
  coach: { name: string|null };
  startXI: { player: { id:number; name:string; number:number; pos:string } }[];
  substitutes: { player: { id:number; name:string; number:number; pos:string } }[];
}

interface APIFootballStat {
  team: { id: number; name: string };
  statistics: { type: string; value: number | string | null }[];
}

async function apiFetch<T>(path: string): Promise<T> {
  const key = process.env.APIFOOTBALL_KEY;
  const base = process.env.APIFOOTBALL_BASE || 'https://v3.football.api-sports.io';
  const rapidHost = process.env.APIFOOTBALL_HOST; // undefined => native
  if (!key) throw new Error('APIFOOTBALL_KEY not set');

  const url = `${base}${path.startsWith('/') ? path : `/${path}`}`;
  const headers: Record<string,string> = { accept: 'application/json' };
  if (rapidHost) {
    headers['x-rapidapi-key'] = key;
    headers['x-rapidapi-host'] = rapidHost;
  } else {
    headers['x-apisports-key'] = key;
  }

  let res: Response;
  try {
    res = await fetch(url, { headers, cache: 'no-store' });
  } catch (e: any) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: `Network error: ${e.message}` });
  }

  const text = await res.text();
  let json: any;
  try { json = JSON.parse(text); } catch {
    throw new TRPCError({ code: 'PARSE_ERROR', message: 'Invalid JSON from API' });
  }

  if (!res.ok) {
    const msg = json?.message || JSON.stringify(json).slice(0, 300);
    throw new TRPCError({ code: 'BAD_REQUEST', message: `API ${res.status}: ${msg}` });
  }

  // Logical / plan / subscription errors even with 200
  if (json?.message && !Array.isArray(json.response)) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: `API logical: ${json.message}` });
  }
  const errorKeys = json?.errors ? Object.keys(json.errors).filter(k => json.errors[k]) : [];
  if (errorKeys.length) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `API errors: ${errorKeys.map(k => `${k}:${json.errors[k]}`).join(', ')}`,
    });
  }

  return json.response as T;
}

const LIVE_END_STATUSES = new Set(['FT','AET','PEN']);
const NON_LIVE_PRE_STATUSES = new Set(['NS','TBD','PST','CANC','SUSP']);

export const matchRouter = router({
  search: publicProcedure
    .input(z.object({
      query: z.string().min(2),
      windowHours: z.number().min(1).max(72).optional(),
      includeLive: z.boolean().optional(),
      skipWindow: z.boolean().optional()
    }).optional())
    .query(async ({ input }) => {
      if (!input) return [];
      const { query, windowHours, includeLive = true, skipWindow = false } = input;
      const now = new Date();
      const dateStr = now.toISOString().slice(0,10);
      const windowMs = (windowHours ?? DEFAULT_WINDOW_HOURS) * 60 * 60 * 1000;

      // Fetch today + live (native plan supports both)
      const [dayRaw, liveRaw] = await Promise.all([
        apiFetch<unknown>(`/fixtures?date=${dateStr}`),
        includeLive ? apiFetch<unknown>(`/fixtures?live=all`) : Promise.resolve([])
      ]);

      const day = Array.isArray(dayRaw) ? dayRaw as APIFootballFixture[] : [];
      const live = Array.isArray(liveRaw) ? liveRaw as APIFootballFixture[] : [];

      const map = new Map<number, APIFootballFixture>();
      for (const f of day) map.set(f.fixture.id, f);
      for (const f of live) map.set(f.fixture.id, f);
      const fixtures = [...map.values()];

      const untilTs = now.getTime() + windowMs;
      const q = query.toLowerCase();

      const filtered = fixtures.filter(f => {
        if (!f?.fixture?.date) return false;
        const kick = new Date(f.fixture.date).getTime();
        const status = f.fixture.status.short;
        const isLive = !(NON_LIVE_PRE_STATUSES.has(status) || LIVE_END_STATUSES.has(status));
        const withinWindow = skipWindow
          ? true
          : (kick >= (now.getTime() - LIVE_LOOKBACK_MS) && kick <= untilTs);
        const nameMatch =
          f.league.name.toLowerCase().includes(q) ||
          f.teams.home.name.toLowerCase().includes(q) ||
          f.teams.away.name.toLowerCase().includes(q);
        return nameMatch && (withinWindow || isLive);
      });

      if (filtered.length) {
        return filtered.map(f => ({
          id: f.fixture.id,
          kickoff: f.fixture.date,
            status: f.fixture.status.short,
          league: f.league.name,
          home: f.teams.home.name,
          away: f.teams.away.name,
          score: { home: f.goals.home, away: f.goals.away }
        }));
      }

      // Fallback: next fixture for team search
      try {
        const teams = await apiFetch<any>(`/teams?search=${encodeURIComponent(query)}`);
        if (Array.isArray(teams) && teams[0]?.team?.id) {
          const next = await apiFetch<APIFootballFixture[]>(`/fixtures?team=${teams[0].team.id}&next=1`);
          if (Array.isArray(next) && next[0]) {
            const f = next[0];
            return [{
              id: f.fixture.id,
              kickoff: f.fixture.date,
              status: f.fixture.status.short,
              league: f.league.name,
              home: f.teams.home.name,
              away: f.teams.away.name,
              score: { home: f.goals.home, away: f.goals.away }
            }];
          }
        }
      } catch {/* ignore fallback */}
      return [];
    }),
  live: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const fixtures = await apiFetch<APIFootballFixture[]>(`/fixtures?id=${input.id}`);
      const f = fixtures[0];
      if (!f) return null;
      return {
        id: f.fixture.id,
        kickoff: f.fixture.date,
        status: f.fixture.status.short,
        elapsed: f.fixture.status.elapsed,
        league: f.league.name,
        home: f.teams.home.name,
        away: f.teams.away.name,
        score: { home: f.goals.home, away: f.goals.away },
        events: f.events ?? [],
        lineups: f.lineups ?? [],
        statistics: f.statistics ?? [],
      };
    }),
  details: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const id = input.id;
      const [fixtureArr, eventsArr, statsArr, lineupsArr] = await Promise.all([
        apiFetch<APIFootballFixture[]>(`/fixtures?id=${id}`),
        apiFetch<APIFootballEvent[]>(`/fixtures/events?fixture=${id}`),
        apiFetch<APIFootballStat[]>(`/fixtures/statistics?fixture=${id}`),
        apiFetch<APIFootballLineup[]>(`/fixtures/lineups?fixture=${id}`),
      ]);

      const f = fixtureArr[0];
      if (!f) return null;

      const events = Array.isArray(eventsArr) ? eventsArr : [];
      const stats = Array.isArray(statsArr) ? statsArr : [];
      const lineups = Array.isArray(lineupsArr) ? lineupsArr : [];

      function pickStat(teamName:string, type:string) {
        const teamBlock = stats.find(s => s.team.name === teamName);
        return teamBlock?.statistics.find(st => st.type === type)?.value ?? null;
      }

      function num(v:any){ if(v==null) return null; const n = typeof v==='string'? parseFloat(String(v).replace('%','')): v; return isNaN(n)? null:n; }
      const H = f.teams.home.name;
      const A = f.teams.away.name;

      const statsObj = {
        possession:      { home: pickStat(H,'Ball Possession'),      away: pickStat(A,'Ball Possession') },
        shotsOn:         { home: pickStat(H,'Shots on Goal'),        away: pickStat(A,'Shots on Goal') },
        shotsOff:        { home: pickStat(H,'Shots off Goal'),       away: pickStat(A,'Shots off Goal') },
        shotsBlocked:    { home: pickStat(H,'Blocked Shots'),        away: pickStat(A,'Blocked Shots') },
        shotsInsideBox:  { home: pickStat(H,'Shots insidebox'),      away: pickStat(A,'Shots insidebox') },
        shotsOutsideBox: { home: pickStat(H,'Shots outsidebox'),     away: pickStat(A,'Shots outsidebox') },
        shotsTotal:      { home: pickStat(H,'Total Shots'),          away: pickStat(A,'Total Shots') },
        saves:           { home: pickStat(H,'Goalkeeper Saves'),     away: pickStat(A,'Goalkeeper Saves') },
        corners:         { home: pickStat(H,'Corner Kicks'),         away: pickStat(A,'Corner Kicks') },
        offsides:        { home: pickStat(H,'Offsides'),             away: pickStat(A,'Offsides') },
        fouls:           { home: pickStat(H,'Fouls'),                away: pickStat(A,'Fouls') },
        yellow:          { home: pickStat(H,'Yellow Cards'),         away: pickStat(A,'Yellow Cards') },
        red:             { home: pickStat(H,'Red Cards'),            away: pickStat(A,'Red Cards') },
        passesTotal:     { home: pickStat(H,'Total passes'),         away: pickStat(A,'Total passes') },
        passesAccurate:  { home: pickStat(H,'Accurate passes'),      away: pickStat(A,'Accurate passes') },
        passAccuracy:    { home: null as any,                        away: null as any },
        tackles:         { home: pickStat(H,'Tackles'),              away: pickStat(A,'Tackles') },
        attacks:         { home: pickStat(H,'Attacks'),              away: pickStat(A,'Attacks') },
        dangerousAttacks:{ home: pickStat(H,'Dangerous Attacks'),    away: pickStat(A,'Dangerous Attacks') },
        throwIns:        { home: pickStat(H,'Throw Ins'),            away: pickStat(A,'Throw Ins') },
        freeKicks:       { home: pickStat(H,'Free Kicks'),           away: pickStat(A,'Free Kicks') },
      };

      const hPT = num(statsObj.passesTotal.home);
      const hPA = num(statsObj.passesAccurate.home);
      const aPT = num(statsObj.passesTotal.away);
      const aPA = num(statsObj.passesAccurate.away);
      if(hPT && hPA!=null) statsObj.passAccuracy.home = `${Math.round((hPA/hPT)*100)}%`;
      if(aPT && aPA!=null) statsObj.passAccuracy.away = `${Math.round((aPA/aPT)*100)}%`;

      return {
        id: f.fixture.id,
        league: f.league.name,
        kickoff: f.fixture.date,
        status: f.fixture.status.short,
        elapsed: f.fixture.status.elapsed,
        home: f.teams.home.name,
        away: f.teams.away.name,
        score: {
          home: f.goals.home,
          away: f.goals.away,
        },
        stats: statsObj,
        lineups: lineups.map(l => ({
          team: l.team.name,
          formation: l.formation,
          coach: l.coach?.name,
          startXI: l.startXI.map(p => ({
            id: p.player.id,
            name: p.player.name,
            number: p.player.number,
            pos: p.player.pos
          })),
          subs: l.substitutes.map(p => ({
            id: p.player.id,
            name: p.player.name,
            number: p.player.number,
            pos: p.player.pos
          }))
        })),
        events: events.map(e => ({
          minute: e.time.elapsed,
          extra: e.time.extra,
          team: e.team.name,
            type: e.type,
          detail: e.detail,
          player: e.player?.name,
          assist: e.assist?.name,
          comments: e.comments
        })),
      };
    }),
});