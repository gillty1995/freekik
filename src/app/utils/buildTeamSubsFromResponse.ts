import { FormationPlayer, Sub } from "@/components/formation-pitch";
import { makeRosterIndex, findPlayerByLooseName } from "./playerNameMatch";

type DetailsEvent = {
  minute: number | null;
  extra: number | null;
  team: string;
  type: string;       
  player: string | null; 
  assist: string | null; 
};

type DetailsLineup = {
  team: string;
  formation: string;
  startXI: FormationPlayer[];
  subs?: FormationPlayer[];
};

function stableFallbackId(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return -Math.abs(hash || 1);
}

export function buildTeamSubsFromResponse(
  events: DetailsEvent[] | undefined,
  lineups: DetailsLineup[] | undefined
): Record<string, Sub[]> {
  const subsByTeam: Record<string, Sub[]> = {};
  if (!Array.isArray(events) || !Array.isArray(lineups)) return subsByTeam;

  const rosterByTeam = new Map<string, ReturnType<typeof makeRosterIndex>>();
  for (const l of lineups) {
    const roster = [...(l.startXI ?? []), ...(l.subs ?? [])];
    rosterByTeam.set(l.team, makeRosterIndex(roster));
  }

  for (const ev of events) {
    if (ev.type !== "subst" || !ev.team || !ev.player || !ev.assist) continue;

    const roster = rosterByTeam.get(ev.team);
    if (!roster) continue;

    const outP = findPlayerByLooseName(roster, ev.player);
    const inP = findPlayerByLooseName(roster, ev.assist);

    if (!outP) {
      console.warn("Sub OUT not found:", ev.team, ev.player);
      continue;
    }

    const inPlayer: FormationPlayer = inP
      ? { id: inP.id, name: inP.name, number: inP.number ?? 0, pos: inP.pos ?? "" }
      : {
          id: stableFallbackId(`${ev.team}:${ev.assist}`),
          name: ev.assist,
          number: 0,
          pos: "",
        };

    const sub: Sub = { outId: outP.id, in: inPlayer, minute: ev.minute ?? undefined };

    if (!subsByTeam[ev.team]) subsByTeam[ev.team] = [];
    subsByTeam[ev.team].push(sub);
  }

  for (const k of Object.keys(subsByTeam)) {
    subsByTeam[k].sort((a, b) => (a.minute ?? 1e9) - (b.minute ?? 1e9));
  }

  return subsByTeam;
}
