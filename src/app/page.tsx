"use client";

import React, { JSX } from "react";
import { trpc } from "./(providers)/providers";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FormationPitch } from "@/components/formation-pitch";
import { MatchClock } from "@/components/match/MatchClock";
import { EventIcon } from "@/components/match/EventIcon";
import { LoadingBall } from "@/components/match/LoadingBall";
import { motion } from "framer-motion";

export default function Home() {
  const [q, setQ] = useState("");
  const [debounced, setDebounced] = useState(q);
  const [selected, setSelected] = useState<number | null>(null);

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
      refetchInterval: (query) => {
        const d = query.state.data as any;
        return d && d.status && liveStatuses.includes(d.status) ? 15000 : false;
      },
    }
  );

  const status = details.data?.status ?? null;
  const apiElapsed = details.data?.elapsed ?? null;
  const matches = Array.isArray(search.data) ? search.data : [];

  const derivedStats = (() => {
    if (!details.data) return null;
    const { events, stats, home, away } = details.data as any;
    const copy = { ...stats };
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

  return (
    <div className="relative min-h-screen">
      {/* Search bar at very top (hidden while a match modal is open) */}
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
                className="absolute right-2 top-1/2 -translate-y-1/2 text-xs px-2 py-1 rounded bg-neutral-800/70 text-white hover:bg-neutral-800 focus:outline-none"
                aria-label="Clear search"
              >
                ×
              </button>
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

      {/* Center hero text (independent of list) */}
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
                transition: { type: "spring", stiffness: 90, damping: 18 },
              },
            }}
            className="font-extrabold text-7xl sm:text-8xl md:text-9xl tracking-tight
              bg-[linear-gradient(110deg,#34d399,55%,#ffffff,75%,#34d399)]
              bg-[length:200%_100%] animate-[shine_6s_linear_infinite]
              bg-clip-text text-transparent drop-shadow-xl select-none"
          >
            freekik
          </motion.h1>
          <motion.p
            variants={{
              hidden: { y: 20, opacity: 0 },
              show: {
                y: 0,
                opacity: 1,
                transition: { duration: 0.8, ease: "easeOut" },
              },
            }}
            className="mx-auto text-sm sm:text-lg md:text-2xl font-light text-white/85 leading-snug"
          >
            Live football intelligence: match clocks, events, lineups &
            momentum. One clean pitch.
          </motion.p>
        </motion.div>
      </div>

      {/* Keyframe for gradient shimmer (kept) */}
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

      {/* Main content: results now directly under search bar (no huge vertical offset) */}
      <main className="relative z-20 px-4 pt-28 pb-10 max-w-xl mx-auto space-y-4">
        {/* Fullscreen centered loading overlay while searching */}
        {search.isLoading && <LoadingBall fullscreen label="Searching" />}

        {/* Scrollable results list (prevents page height jump) */}
        <div
          className="results-scroll space-y-3 overflow-y-auto pr-1 pb-2"
          style={{
            maxHeight: "calc(100vh - 11rem)", // viewport minus search bar + top padding
          }}
        >
          {matches.map((m, i) => (
            <Card
              key={m.id}
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
                className="text-sm opacity-70 hover:opacity-100"
                onClick={() => setSelected(null)}
              >
                Close
              </button>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="font-semibold text-lg">
                    {details.data.home} <span className="opacity-60">vs</span>{" "}
                    {details.data.away}
                  </h2>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="px-2 py-0.5 rounded bg-emerald-600/10 text-emerald-600 border border-emerald-600/30 font-mono">
                      {details.data.status}
                    </span>
                    <MatchClock
                      status={status}
                      elapsed={apiElapsed}
                      className="font-mono text-emerald-600"
                    />
                  </div>
                </div>
                <p className="text-xs opacity-70">{details.data.league}</p>
                <div className="text-3xl font-mono">
                  {details.data.score.home ?? "-"} :{" "}
                  {details.data.score.away ?? "-"}
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Stats + Events */}
                  <div className="space-y-6 order-1 md:order-1">
                    {/* Stats grid */}
                    <div className="grid grid-cols-3 gap-3 text-[11px]">
                      {[
                        ["Possession", "possession"],
                        ["On Target", "shotsOn"],
                        ["Total Shots", "shotsTotal"],
                        ["Saves", "saves"],
                        ["Total Passes", "passesTotal"],
                        ["Corners", "corners"],
                        ["Fouls", "fouls"],
                        ["Yellow", "yellow"],
                        ["Red", "red"],
                      ].map(([label, key]) => {
                        const stat = (derivedStats ??
                          (details.data as any).stats)?.[key];
                        if (!stat || (stat.home == null && stat.away == null))
                          return null;
                        return (
                          <div
                            key={key}
                            className="p-2 rounded-md bg-neutral-100/80 dark:bg-neutral-800/70 border border-neutral-200/40 dark:border-neutral-700/50 backdrop-blur"
                          >
                            <p className="uppercase tracking-wide font-medium opacity-60">
                              {label}
                            </p>
                            <p className="font-semibold">
                              {stat.home ?? "-"} / {stat.away ?? "-"}
                            </p>
                          </div>
                        );
                      })}
                    </div>

                    {/* Events list */}
                    <div>
                      <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                        Events
                        <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-200/50 dark:bg-neutral-700/50">
                          {details.data.events.length}
                        </span>
                      </h3>
                      <ul className="space-y-1 max-h-64 overflow-y-auto pr-1 text-xs">
                        {details.data.events.map((ev, idx) => (
                          <li
                            key={`${idx}-${ev.team}-${ev.minute}-${ev.type}-${ev.detail}`}
                            className="flex items-start gap-2 p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800"
                          >
                            <span className="w-11 shrink-0 font-mono text-right">
                              {ev.minute}
                              {ev.extra ? `+${ev.extra}` : ""}'
                            </span>
                            <span className="w-5 flex justify-center">
                              <EventIcon type={ev.type} detail={ev.detail} />
                            </span>
                            <span className="flex-1 leading-tight">
                              <span className="font-semibold">{ev.team}</span>{" "}
                              <span className="opacity-70">{ev.type}</span>{" "}
                              <span>{ev.detail}</span>{" "}
                              {ev.player && (
                                <span className="font-medium">{ev.player}</span>
                              )}
                              {ev.assist && (
                                <span className="opacity-60">
                                  {" "}
                                  ↔ {ev.assist}
                                </span>
                              )}
                            </span>
                          </li>
                        ))}
                        {details.data.events.length === 0 && (
                          <li className="opacity-60">No events.</li>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Formations */}
                  <div className="space-y-4 order-2 md:order-2">
                    {(details.data.lineups || [])
                      .slice(0, 2)
                      .map((lu: any, i: number) => (
                        <FormationPitch
                          key={lu.team}
                          team={lu.team}
                          formation={lu.formation}
                          players={
                            lu.startXI?.map((p: any) => ({
                              id: p.id,
                              name: p.name,
                              number: p.number,
                              pos: p.pos,
                            })) || []
                          }
                          side={i === 0 ? "away" : "home"}
                        />
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Fade-in animation keyframes remain */}
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
        /* Optional nicer thin scrollbar for results list */
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
