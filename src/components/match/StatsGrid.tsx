interface TeamPair {
  home: any;
  away: any;
}
export interface MatchStats {
  [k: string]: TeamPair;
}

const PRIMARY: [string, string][] = [
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
  ["Shots Inside Box", "shotsInsideBox"],
  ["Shots Outside Box", "shotsOutsideBox"],
];

const DONUT_RADIUS = 42;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

function parseStatValue(value: any) {
  if (value == null || value === "-") return null;

  const normalized =
    typeof value === "string" ? value.replace("%", "").replace(/,/g, "") : value;
  const parsed = Number.parseFloat(String(normalized));

  return Number.isFinite(parsed) ? parsed : null;
}

function displayStatValue(value: any, suffix = "") {
  const parsed = parseStatValue(value);
  if (parsed == null) return "-";

  return `${Math.round(parsed).toLocaleString()}${suffix}`;
}

function splitShare(homeValue: number | null, awayValue: number | null) {
  if (homeValue == null || awayValue == null) return null;

  const total = homeValue + awayValue;
  if (total <= 0) return null;

  return {
    home: (homeValue / total) * 100,
    away: (awayValue / total) * 100,
  };
}

function PossessionDonut({
  home,
  away,
  homeName,
  awayName,
}: {
  home: any;
  away: any;
  homeName: string;
  awayName: string;
}) {
  const homePossession = parseStatValue(home);
  const awayPossession = parseStatValue(away);
  const share = splitShare(homePossession, awayPossession);
  const homeArc = share ? (share.home / 100) * DONUT_CIRCUMFERENCE : 0;
  const awayArc = share ? (share.away / 100) * DONUT_CIRCUMFERENCE : 0;
  const leadingShare =
    share == null ? null : share.home >= share.away ? share.home : share.away;
  const leadingShareClass =
    share == null
      ? "text-slate-500 dark:text-slate-400"
      : share.home >= share.away
        ? "text-[#6ee7a8]"
        : "text-sky-300";

  return (
    <div className="overflow-hidden rounded-md border border-slate-200/70 bg-slate-50 p-3 shadow-sm dark:border-[#6ee7a8]/15 dark:bg-[#101923]/85">
      <div className="mb-3 flex items-center gap-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Possession
        </p>
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)_5.5rem_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_6rem_minmax(0,1fr)]">
        <div className="min-w-0">
          <div className="mb-2 h-1.5 w-8 rounded-full bg-[#6ee7a8]" />
          <p className="truncate text-[11px] font-semibold">{homeName}</p>
          <p className="font-mono text-sm font-semibold">
            {displayStatValue(home, "%")}
          </p>
        </div>

        <div className="relative h-20 w-20 shrink-0 justify-self-center sm:h-24 sm:w-24">
          <svg viewBox="0 0 100 100" className="h-full w-full rotate-90">
            <circle
              cx="50"
              cy="50"
              r={DONUT_RADIUS}
              fill="none"
              className="stroke-slate-200 dark:stroke-slate-800"
              strokeWidth="12"
            />
            {share && (
              <>
                <circle
                  cx="50"
                  cy="50"
                  r={DONUT_RADIUS}
                  fill="none"
                  className="stroke-[#6ee7a8]"
                  strokeLinecap="round"
                  strokeWidth="12"
                  strokeDasharray={`${homeArc} ${DONUT_CIRCUMFERENCE}`}
                />
                <circle
                  cx="50"
                  cy="50"
                  r={DONUT_RADIUS}
                  fill="none"
                  className="stroke-sky-300"
                  strokeLinecap="round"
                  strokeWidth="12"
                  strokeDasharray={`${awayArc} ${DONUT_CIRCUMFERENCE}`}
                  strokeDashoffset={-homeArc}
                />
              </>
            )}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`font-mono text-lg font-semibold ${leadingShareClass}`}>
              {leadingShare == null ? "-" : `${Math.round(leadingShare)}%`}
            </span>
          </div>
        </div>

        <div className="min-w-0 text-right">
          <div className="mb-2 ml-auto h-1.5 w-8 rounded-full bg-sky-300" />
          <p className="truncate text-[11px] font-semibold">{awayName}</p>
          <p className="font-mono text-sm font-semibold">
            {displayStatValue(away, "%")}
          </p>
        </div>
      </div>
    </div>
  );
}

function PassesComparison({
  home,
  away,
  homeName,
  awayName,
}: {
  home: any;
  away: any;
  homeName: string;
  awayName: string;
}) {
  const homePasses = parseStatValue(home);
  const awayPasses = parseStatValue(away);
  const share = splitShare(homePasses, awayPasses);

  return (
    <div className="overflow-hidden rounded-md border border-slate-200/70 bg-slate-50 p-3 shadow-sm dark:border-[#6ee7a8]/15 dark:bg-[#101923]/85">
      <p className="mb-3 text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Total Passes
      </p>
      <div className="mb-3 grid grid-cols-2 gap-3 text-[10px]">
        <div className="min-w-0">
          <div className="mb-1 h-1.5 w-7 rounded-full bg-[#6ee7a8]" />
          <p className="truncate font-semibold">{homeName}</p>
          <p className="font-mono text-sm font-semibold">
            {displayStatValue(home)}
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            {share ? `${Math.round(share.home)}% of passes` : "No pass data"}
          </p>
        </div>
        <div className="min-w-0 text-right">
          <div className="mb-1 ml-auto h-1.5 w-7 rounded-full bg-sky-300" />
          <p className="truncate font-semibold">{awayName}</p>
          <p className="font-mono text-sm font-semibold">
            {displayStatValue(away)}
          </p>
          <p className="text-slate-500 dark:text-slate-400">
            {share ? `${Math.round(share.away)}% of passes` : "No pass data"}
          </p>
        </div>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        {share ? (
          <div className="flex h-full w-full">
            <div
              className="h-full bg-[#6ee7a8]"
              style={{ width: `${share.home}%` }}
            />
            <div
              className="h-full bg-sky-300"
              style={{ width: `${share.away}%` }}
            />
          </div>
        ) : (
          <div className="h-full w-full bg-slate-400/30" />
        )}
      </div>
    </div>
  );
}

export function StatsGrid({
  stats,
  home = "Home",
  away = "Away",
}: {
  stats: MatchStats;
  home?: string;
  away?: string;
}) {
  const cell = (label: string, key: string) => {
    const s = stats?.[key] ?? { home: "-", away: "-" };
    return (
      <div
        key={key}
        className="p-2 rounded-md bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/40 dark:border-neutral-700/50"
      >
        <p className="uppercase tracking-wide font-medium opacity-60 text-[10px]">
          {label}
        </p>
        <p className="font-semibold text-[12px]">
          {displayStatValue(s.home)} / {displayStatValue(s.away)}
        </p>
      </div>
    );
  };

  const possession = stats?.possession ?? { home: "-", away: "-" };
  const passesTotal = stats?.passesTotal ?? { home: "-", away: "-" };

  return (
    <div className="space-y-4">
      <details open className="text-[11px] max-md:text-[13px]">
        <summary className="cursor-pointer select-none opacity-80 hover:opacity-100">
          Primary Stats
        </summary>
        <div className="mt-2 grid grid-cols-3 gap-3">
          {PRIMARY.map(([l, k]) => cell(l, k))}
        </div>
      </details>
      <details className="text-[11px] max-md:text-[13px]">
        <summary className="cursor-pointer select-none opacity-80 hover:opacity-100">
          Possession Stats
        </summary>
        <div className="mt-2 grid gap-3">
          <PossessionDonut
            home={possession.home}
            away={possession.away}
            homeName={home}
            awayName={away}
          />
          <PassesComparison
            home={passesTotal.home}
            away={passesTotal.away}
            homeName={home}
            awayName={away}
          />
        </div>
      </details>
    </div>
  );
}
