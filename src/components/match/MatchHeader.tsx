"use client";

interface Props {
  home: string;
  away: string;
  status: string;
  league: string;
  liveElapsed: number | null;
  kickoff?: string; // optional ISO date
}

export function MatchHeader({
  home,
  away,
  status,
  league,
  liveElapsed,
  kickoff,
}: Props) {
  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 className="font-semibold text-lg">
          {home} <span className="opacity-60">vs</span> {away}
        </h2>
        <div className="flex items-center gap-3 text-sm">
          <span className="px-2 py-0.5 rounded bg-emerald-600/10 text-emerald-600 border border-emerald-600/30 font-mono">
            {status}
          </span>
          {liveElapsed != null && (
            <span className="font-mono text-emerald-600">⏱ {liveElapsed}'</span>
          )}
        </div>
      </div>
      <p className="text-xs opacity-70">
        {league}
        {kickoff && (
          <>
            {" "}
            •{" "}
            {new Date(kickoff).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </>
        )}
      </p>
    </>
  );
}
