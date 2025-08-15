"use client";

import { trpc } from "@/app/(providers)/providers";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormationSection } from "./FormationSection";
import { StatsGrid } from "@/components/match/StatsGrid";
import { MatchHeader } from "./MatchHeader";
import { EventIcon } from "./EventIcon";

export interface MatchEvent {
  minute: number | null;
  extra: number | null;
  team: string;
  type: string;
  detail: string;
  player?: string | null;
  assist?: string | null;
}

export function EventsList({ events }: { events: MatchEvent[] }) {
  return (
    <div>
      <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
        Events
        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-200/50 dark:bg-neutral-700/50">
          {events.length}
        </span>
      </h3>
      <ul className="space-y-1 max-h-64 overflow-y-auto pr-1 text-xs">
        {events.map((ev, idx) => (
          <li
            key={`${idx}-${ev.team}-${ev.minute}-${ev.type}`}
            className="flex items-start gap-2 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
          >
            <span className="w-11 shrink-0 font-mono text-right">
              {ev.minute ?? "-"}
              {ev.extra ? `+${ev.extra}` : ""}'
            </span>
            <span className="w-5 flex justify-center">
              <EventIcon type={ev.type} detail={ev.detail} />
            </span>
            <span className="flex-1 leading-tight">
              <span className="font-semibold">{ev.team}</span>{" "}
              <span className="opacity-70">{ev.type}</span>{" "}
              <span>{ev.detail}</span>{" "}
              {ev.player && <span className="font-medium">{ev.player}</span>}
              {ev.assist && <span className="opacity-60"> ↔ {ev.assist}</span>}
            </span>
          </li>
        ))}
        {!events.length && <li className="opacity-60">No events yet.</li>}
      </ul>
    </div>
  );
}

export default function Home() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState(q);
  const [selected, setSelected] = useState<number | null>(null);
  const [clockBase, setClockBase] = useState<{
    at: number;
    elapsed: number | null;
  } | null>(null);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q), 400);
    return () => clearTimeout(id);
  }, [q]);

  const search = trpc.match.search.useQuery(
    debounced.length > 1 ? { query: debounced } : undefined,
    { enabled: debounced.length > 1 }
  );

  const liveStatuses = ["1H", "2H", "HT", "ET", "P", "BT"];
  const details = trpc.match.details.useQuery(
    { id: selected! },
    {
      enabled: selected !== null,
      refetchInterval: (q) => {
        const d = q.state.data as any;
        return d && d.status && liveStatuses.includes(d.status) ? 15000 : false;
      },
    }
  );

  useEffect(() => {
    if (
      details.data?.elapsed != null &&
      liveStatuses.includes(details.data.status)
    ) {
      setClockBase({ at: Date.now(), elapsed: details.data.elapsed });
    }
  }, [details.data?.elapsed, details.data?.status]);

  const liveElapsed = (() => {
    if (!clockBase) return details.data?.elapsed ?? null;
    const extra = Math.floor((Date.now() - clockBase.at) / 60000);
    return (clockBase.elapsed ?? 0) + extra;
  })();

  const matches = Array.isArray(search.data) ? search.data : [];

  return (
    <main className="p-4 space-y-4 max-w-xl mx-auto">
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Team or league"
      />
      {search.isLoading && (
        <p className="text-sm text-muted-foreground">Loading…</p>
      )}
      <div className="space-y-3">
        {matches.map((m) => (
          <Card
            key={m.id}
            className="hover:border-primary/50 transition cursor-pointer"
            onClick={() => setSelected(m.id)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">
                  {m.home} vs {m.away}
                </CardTitle>
                <Badge variant="secondary">{m.status}</Badge>
              </div>
              <p className="text-xs text-muted-foreground">{m.league}</p>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm font-mono">
                {m.score.home ?? "-"} : {m.score.away ?? "-"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-neutral-900 m-auto max-w-4xl w-full rounded p-4 space-y-4 overflow-y-auto max-h-[90vh]">
            <button
              className="text-sm opacity-70 hover:opacity-100"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
            {details.isLoading && <p>Loading details…</p>}
            {details.data && (
              <div className="space-y-5">
                <MatchHeader
                  home={details.data.home}
                  away={details.data.away}
                  status={details.data.status}
                  league={details.data.league}
                  liveElapsed={liveElapsed}
                />
                <div className="text-3xl font-mono">
                  {details.data.score.home ?? "-"} :{" "}
                  {details.data.score.away ?? "-"}
                </div>
                <div className="grid gap-8 md:grid-cols-2">
                  <FormationSection lineups={details.data.lineups} />
                  <StatsGrid stats={details.data.stats as any} />
                </div>
                <EventsList events={details.data.events as any} />
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
