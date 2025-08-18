interface TeamPair {
  home: any;
  away: any;
}
export interface MatchStats {
  [k: string]: TeamPair;
}

const PRIMARY: [string, string][] = [
  ["Possession", "possession"],
  ["Total Passes", "passesTotal"],
  ["Total Shots", "shotsTotal"],
  ["On Target", "shotsOn"],
  ["Saves", "saves"],
  ["Corners", "corners"],
  ["Fouls", "fouls"],
  ["Yellow", "yellow"],
  ["Red", "red"],
  ["Shots Off", "shotsOff"],
  ["Offsides", "offsides"],
  ["Shots Blocked", "shotsBlocked"],
];

const MORE: [string, string][] = [
  ["Shots Inside Box", "shotsInsideBox"],
  ["Shots Outside Box", "shotsOutsideBox"],
  ["Pass Acc %", "passAccuracy"],
  ["Acc Passes", "passesAccurate"],
  ["Tackles", "tackles"],
  ["Attacks", "attacks"],
  ["Dangerous Attacks", "dangerousAttacks"],
  ["Throw Ins", "throwIns"],
  ["Free Kicks", "freeKicks"],
];

export function StatsGrid({ stats }: { stats: MatchStats }) {
  const cell = (label: string, key: string) => {
    const s = stats?.[key] ?? { home: "0", away: "0" };
    return (
      <div
        key={key}
        className="p-2 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/40 dark:border-neutral-700/50"
      >
        <p className="uppercase tracking-wide font-medium opacity-60 text-[10px]">
          {label}
        </p>
        <p className="font-semibold text-[12px]">
          {s.home ?? "0"} / {s.away ?? "0"}
        </p>
      </div>
    );
  };
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3 text-[11px]">
        {PRIMARY.map(([l, k]) => cell(l, k))}
      </div>
      <details className="text-[11px]">
        <summary className="cursor-pointer select-none opacity-80 hover:opacity-100">
          More stats
        </summary>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {MORE.map(([l, k]) => cell(l, k))}
        </div>
      </details>
    </div>
  );
}
