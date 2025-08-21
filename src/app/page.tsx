"use client";

import React, { useState, useEffect, useRef } from "react";
import { trpc } from "./(providers)/providers";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingBall } from "@/components/match/LoadingBall";
import { motion } from "framer-motion";
import { StatsGrid } from "@/components/match/StatsGrid";
import { FormationSection } from "@/components/match/FormationSection";
import { PenaltyShootout } from "@/components/match/PenaltyShootout";
import { EventsList } from "@/components/match/EventsList";
import { MatchHeader } from "@/components/match/MatchHeader";

export default function Home() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState(q);
  const [selected, setSelected] = useState<number | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const recentRef = useRef<string[]>([]);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q), 400);
    return () => clearTimeout(id);
  }, [q]);

  useEffect(() => {
    if (debounced.length > 1 && !recentRef.current.includes(debounced)) {
      setRecent((prev) => {
        const updated = [
          debounced,
          ...prev.filter((r) => r !== debounced),
        ].slice(0, 3);
        recentRef.current = updated;
        return updated;
      });
    }
  }, [debounced]);

  const search = trpc.match.search.useQuery(
    debounced.length > 1 ? { query: debounced } : undefined,
    { enabled: debounced.length > 1 }
  );

  const liveStatuses = ["1H", "2H", "HT", "ET", "P", "BT"];

  type MatchDetails = {
    id: number;
    league: string;
    kickoff: string;
    status: string;
    elapsed: number | null;
    home: string;
    away: string;
    score: { home: number | null; away: number | null };
    stats: Record<
      string,
      { home: string | number | null; away: string | number | null }
    >;
    lineups?: any[];
    events: any[];
    penalties?: {
      order: any;
      team: string;
      player: string;
      scored: boolean;
    }[];
  };

  const details = trpc.match.details.useQuery(
    { id: selected! },
    {
      enabled: selected !== null,
      refetchInterval: (query) => {
        const d = query.state.data as MatchDetails;
        return d && d.status && liveStatuses.includes(d.status) ? 15000 : false;
      },
    }
  ) as { data?: MatchDetails; isLoading: boolean };

  const status = (details.data as MatchDetails)?.status ?? null;
  const apiElapsed = (details.data as MatchDetails)?.elapsed ?? null;
  const matches = Array.isArray(search.data) ? search.data : [];

  // Derived stats logic
  const derivedStats = (() => {
    if (!details.data) return null;
    const { events, stats, home, away } = details.data as any;
    const statKeys = [
      "possession",
      "shotsOn",
      "shotsOff",
      "shotsBlocked",
      "shotsTotal",
      "saves",
      "passAccuracy",
      "passesTotal",
      "passesAccurate",
      "corners",
      "offsides",
      "fouls",
      "yellow",
      "red",
      "shotsInsideBox",
      "shotsOutsideBox",
      "tackles",
      "attacks",
      "dangerousAttacks",
      "throwIns",
      "freeKicks",
    ];
    const copy = { ...stats };
    statKeys.forEach((key) => {
      if (!copy[key]) copy[key] = { home: "-", away: "-" };
    });
    function ensure(
      cardKey: "yellow" | "red",
      predicate: (d: string) => boolean
    ) {
      const base = copy[cardKey] || { home: null, away: null };
      const hasValues = base.home != null || base.away != null;
      if (hasValues) {
        copy[cardKey] = base;
        return;
      }
      const homeCount = events.filter(
        (e: any) =>
          e.type === "Card" && predicate(e.detail || "") && e.team === home
      ).length;
      const awayCount = events.filter(
        (e: any) =>
          e.type === "Card" && predicate(e.detail || "") && e.team === away
      ).length;
      copy[cardKey] = { home: homeCount || 0, away: awayCount || 0 };
    }
    ensure("yellow", (d) => /Yellow/i.test(d));
    ensure("red", (d) => /Red/i.test(d));
    return copy;
  })();

  // Penalty shootout events derived from events array
  const penaltyEvents = Array.isArray(details.data?.events)
    ? details.data.events
        .filter(
          (ev) =>
            ev.comments === "Penalty Shootout" &&
            (ev.detail === "Penalty" || ev.detail === "Missed Penalty")
        )
        .map((ev, idx) => ({
          team: ev.team,
          player: ev.player,
          scored: ev.detail === "Penalty",
          order: idx + 1,
        }))
    : [];

  return (
    <div className="relative min-h-screen">
      {/* Search bar (hidden while a match modal is open) */}
      {!selected && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-30 animate-fade-in">
          <div className="relative">
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Team or league"
              className="pr-10 backdrop-blur bg-white/70 dark:bg-neutral-900/60 border-white/30 dark:border-neutral-700/40 shadow-sm"
            />
            {q && (
              <button
                type="button"
                onClick={() => {
                  setQ("");
                  setDebounced("");
                }}
                className="absolute cursor-pointer right-3 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-neutral-800/70 text-white hover:bg-neutral-800 focus:outline-none"
                aria-label="Clear search"
                style={{ zIndex: 2 }}
              >
                ×
              </button>
            )}
            {recent.length > 0 && !selected && (
              <div className="absolute left-0 -bottom-7 w-full flex flex-wrap items-center justify-between px-1">
                <div className="flex flex-wrap gap-2 text-xs items-center max-w-[80vw] sm:max-w-none">
                  <span className="opacity-60 mr-2">Recently searched:</span>
                  {recent.slice(0, 3).map((term) => (
                    <button
                      key={term}
                      type="button"
                      className="px-2 py-0.5 rounded cursor-pointer bg-neutral-200 dark:bg-neutral-800 hover:bg-primary/10 transition max-w-[80px] truncate"
                      onClick={() => setQ(term)}
                      style={{
                        maxWidth: "40px",
                        fontSize: "11px",
                        padding: "2px 6px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                      title={term}
                    >
                      {term}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="px-2 py-0.5 rounded cursor-pointer bg-neutral-800/70 text-white hover:bg-neutral-800 transition text-xs ml-2"
                  onClick={() => {
                    setRecent([]);
                    recentRef.current = [];
                  }}
                  aria-label="Clear recent searches"
                >
                  Clear
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Background video */}
      <video
        className="absolute inset-0 w-full h-full object-cover"
        src="/videos/soccer.mov"
        autoPlay
        loop
        muted
        playsInline
      />
      <div className="absolute inset-0 bg-black/10" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-black/40 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-black/40 to-transparent" />

      {/* Center hero text */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center px-4">
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.18, delayChildren: 0.15 },
            },
          }}
          className="text-center space-y-6 max-w-4xl"
        >
          <motion.h1
            variants={{
              hidden: { y: 40, scale: 0.9, opacity: 0, filter: "blur(8px)" },
              show: {
                y: 0,
                scale: 1,
                opacity: 1,
                filter: "blur(0px)",
                transition: {
                  delay: 0.15,
                  type: "spring",
                  stiffness: 90,
                  damping: 18,
                  duration: 2.2,
                },
              },
            }}
            className="font-extrabold text-7xl max-sm:text-8xl md:text-9xl tracking-tight
              bg-[linear-gradient(110deg,#34d399,55%,#ffffff,75%,#34d399)]
              bg-[length:200%_100%] animate-[shine_6s_linear_infinite]
              bg-clip-text text-transparent drop-shadow-xl select-none"
          >
            freekik
          </motion.h1>
          <motion.p
            variants={{
              hidden: { x: -20, opacity: 0 },
              show: {
                x: 0,
                opacity: 1,
                transition: { delay: 0.6, duration: 1.5, ease: "easeOut" },
              },
            }}
            className="mx-auto text-lg max-sm:text-2xl md:text-2xl font-light text-white/85 leading-snug"
          >
            Live football intelligence: match clocks, events, lineups &
            momentum.
          </motion.p>
          <motion.p
            variants={{
              hidden: { x: 20, opacity: 0 },
              show: {
                x: 0,
                opacity: 1,
                transition: { delay: 1, duration: 2.8, ease: "easeOut" },
              },
            }}
            className="mt-[-10] text-lg max-sm:text-2xl md:text-2xl font-light text-white/85 leading-snug"
          >
            One clean pitch.
          </motion.p>
        </motion.div>
      </div>

      {/* Keyframe for gradient shimmer */}
      <style jsx global>{`
        @keyframes shine {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>

      {/* Main content */}
      <main className="relative z-20 px-4 pt-28 pb-10 max-w-xl mx-auto space-y-4">
        {search.isLoading && <LoadingBall fullscreen label="Searching" />}

        <div
          className="results-scroll space-y-3 overflow-y-auto pr-1 pb-2"
          style={{
            maxHeight: "calc(100vh - 11rem)",
          }}
        >
          {matches.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card
                className="hover:border-primary/50 transition cursor-pointer animate-fade-in z-50"
                style={{ animationDelay: `${i * 40}ms` }}
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
            </motion.div>
          ))}

          {!search.isLoading && matches.length === 0 && q.length > 1 && (
            <p className="text-xs opacity-60 px-1">No matches found.</p>
          )}
        </div>

        {/* Match details modal / loading */}
        {selected && details.isLoading && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
            role="alert"
            aria-busy="true"
          >
            <LoadingBall label="Loading match" />
          </div>
        )}

        {selected && !details.isLoading && details.data && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex z-50"
            role="dialog"
            aria-modal="true"
          >
            <div className="bg-white/90 dark:bg-neutral-900/90 m-auto max-w-3xl w-full rounded p-4 space-y-4 overflow-y-auto max-h-[90vh] backdrop-blur-md">
              <button
                className="text-sm opacity-70 hover:opacity-100 cursor-pointer"
                onClick={() => setSelected(null)}
              >
                Close
              </button>

              <div className="space-y-4">
                <MatchHeader
                  home={details.data.home}
                  away={details.data.away}
                  status={details.data.status}
                  league={details.data.league}
                  liveElapsed={apiElapsed}
                />
                <div className="text-3xl font-mono">
                  {details.data.score.home ?? "-"} :{" "}
                  {details.data.score.away ?? "-"}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Stats and Events */}
                  <div className="space-y-6 order-1 md:order-1">
                    <StatsGrid stats={derivedStats ?? {}} />
                    <EventsList events={details.data.events as any} />
                  </div>
                  {/* Formations */}
                  <div className="space-y-4 order-2 md:order-2 flex flex-col justify-end">
                    <FormationSection lineups={details.data.lineups || []} />
                  </div>
                </div>

                {/* Conditionally show penalty shootout if present */}
                {penaltyEvents.length > 0 && (
                  <PenaltyShootout
                    penalties={penaltyEvents}
                    home={details.data.home}
                    away={details.data.away}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fade-in animation keyframes */}
      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(6px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease forwards;
        }
        .results-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .results-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .results-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.25);
          border-radius: 3px;
        }
        .dark .results-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
        }
      `}</style>
    </div>
  );
}
