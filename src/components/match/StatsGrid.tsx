interface TeamPair {
  home: any;
  away: any;
}
export interface MatchStats {
  [k: string]: TeamPair;
}

const PRIMARY: [string, string][] = [
  ["Possession", "possession"],
  ["On Target", "shotsOn"],
  ["Shots Off", "shotsOff"],
  ["Blocked", "shotsBlocked"],
  ["Total Shots", "shotsTotal"],
  ["Saves", "saves"],
  ["Pass Acc", "passAccuracy"],
  ["Total Passes", "passesTotal"],
  ["Corners", "corners"],
  ["Offsides", "offsides"],
  ["Fouls", "fouls"],
  ["Yellow", "yellow"],
  ["Red", "red"],
];

const MORE: [string, string][] = [
  ["Acc Passes", "passesAccurate"],
  ["In Box", "shotsInsideBox"],
  ["Out Box", "shotsOutsideBox"],
  ["Tackles", "tackles"],
  ["Attacks", "attacks"],
  ["Dangerous", "dangerousAttacks"],
  ["Throw Ins", "throwIns"],
  ["Free Kicks", "freeKicks"],
];

export function StatsGrid({ stats }: { stats: MatchStats }) {
  const cell = (label: string, key: string) => {
    const s = stats?.[key];
    if (!s || (s.home == null && s.away == null)) return null;
    return (
      <div
        key={key}
        className="p-2 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/40 dark:border-neutral-700/50"
      >
        <p className="uppercase tracking-wide font-medium opacity-60 text-[10px]">
          {label}
        </p>
        <p className="font-semibold text-[12px]">
          {s.home ?? "-"} / {s.away ?? "-"}
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
