import React from "react";

export interface FormationPlayer {
  id: number;
  name: string;
  number: number;
  pos: string;
}

interface Props {
  formation: string;
  players: FormationPlayer[];
  team: string;
  side: "home" | "away";
  fallback?: boolean; // <-- add fallback prop
}

/**
 * Half-pitch view per team (they face each other).
 * Away (top): goal line at top, half-way at bottom. Home (bottom): goal line at bottom.
 */
export const FormationPitch: React.FC<Props> = ({
  formation,
  players,
  team,
  side,
  fallback,
}) => {
  const nums = formation
    .split(/[-–]/)
    .map((n) => parseInt(n.trim(), 10))
    .filter(Boolean);

  // Fallback: show pitch with "Lineup not available" message
  if (fallback || !players.length) {
    return (
      <div
        className="relative w-full aspect-[7/8] rounded-xl overflow-hidden ring-1 ring-emerald-400/20 shadow-md
        bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900 flex items-center justify-center"
      >
        <span className="absolute inset-0 flex items-center justify-center text-xs opacity-70 pointer-events-none">
          Lineup not available
        </span>
        {/* Team label */}
        <div
          className={`absolute ${
            side === "away" ? "bottom-1" : "top-1"
          } left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/35 backdrop-blur text-[10px] font-semibold tracking-wide uppercase`}
        >
          {team} {formation}
        </div>
      </div>
    );
  }

  const gk = players[0];
  const outfield = players.slice(1);

  // Build row slices (defense->midfield->attack)
  const rows = nums.map((count, idx) => {
    const offset = nums.slice(0, idx).reduce((a, b) => a + b, 0);
    return outfield.slice(offset, offset + count);
  });
  const totalRows = rows.length;

  // Vertical layout inside half
  const gkY = side === "away" ? 8 : 92;
  const nearHalfY = side === "away" ? 92 : 8;
  const step = Math.abs(nearHalfY - gkY) / (totalRows + 1);

  const rowY = (i: number) =>
    side === "away" ? gkY + step * (i + 1) : gkY - step * (i + 1);

  const short = (n: string) => {
    if (n.length <= 14) return n;
    const parts = n.split(" ");
    return parts[parts.length - 1];
  };

  return (
    <div
      className={`relative w-full aspect-[7/8] rounded-xl overflow-hidden ring-1 ring-emerald-400/20 shadow-md
       bg-gradient-to-b ${
         side === "away"
           ? "from-emerald-900 via-emerald-800 to-emerald-900"
           : "from-emerald-900 via-emerald-800 to-emerald-900"
       }`}
    >
      {/* Pattern + subtle vignette */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,#ffffff_0.35px,transparent_0.35px)] [background-size:26px_26px]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.35))]" />
      </div>

      {/* Field markings (half only) */}
      {/* Goal line & goal box */}
      {side === "away" && (
        <>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/70" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-10 border-2 border-white/60 rounded-b-md" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-5 border-2 border-white/60 rounded-b-sm" />
          {/* Penalty arc (bottom of penalty area) */}
          <div className="absolute top-[10.75rem] left-1/2 -translate-x-1/2 w-16 h-8 border-t-2 border-white/50 rounded-b-full [clip-path:inset(0_0_50%_0)] opacity-70" />
          {/* Halfway boundary */}
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/60" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border border-white/50 translate-y-1/2 bg-emerald-900/40 backdrop-blur-sm" />
        </>
      )}
      {side === "home" && (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/70" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-10 border-2 border-white/60 rounded-t-md" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-5 border-2 border-white/60 rounded-t-sm" />
          {/* Penalty arc */}
          <div className="absolute bottom-[10.75rem] left-1/2 -translate-x-1/2 w-16 h-8 border-b-2 border-white/50 rounded-t-full [clip-path:inset(50%_0_0_0)] opacity-70" />
          {/* Halfway boundary */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/60" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border border-white/50 -translate-y-1/2 bg-emerald-900/40 backdrop-blur-sm" />
        </>
      )}

      {/* GK */}
      <PlayerBadge
        player={gk}
        gk
        style={{
          top: `${gkY}%`,
          left: "50%",
          transform: "translate(-50%, -50%)",
          position: "absolute",
        }}
        side={side}
        short={short}
      />

      {/* Rows */}
      {rows.map((row, i) => {
        const y = rowY(i);
        return (
          <div
            key={i}
            style={{
              top: `${y}%`,
              left: "50%",
              transform: "translate(-50%, -50%)",
              position: "absolute",
            }}
            className="flex gap-2"
          >
            {row.map((p) => (
              <PlayerBadge key={p.id} player={p} side={side} short={short} />
            ))}
          </div>
        );
      })}

      {/* Team label (bottom of top half / top of bottom half, centered) */}
      {side === "away" ? (
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/35 backdrop-blur text-[10px] font-semibold tracking-wide uppercase">
          {team} {formation}
        </div>
      ) : (
        <div className="absolute top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/35 backdrop-blur text-[10px] font-semibold tracking-wide uppercase">
          {team} {formation}
        </div>
      )}
    </div>
  );
};

interface BadgeProps {
  player: FormationPlayer;
  gk?: boolean;
  style?: React.CSSProperties;
  side: "home" | "away";
  short: (n: string) => string;
}

const PlayerBadge: React.FC<BadgeProps> = ({ player, gk, style, short }) => (
  <div style={style} className="group flex flex-col items-center">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ring-2 ring-white/40 shadow-md transition
      ${
        gk
          ? "bg-amber-400 text-black"
          : "bg-emerald-600/90 group-hover:bg-emerald-500"
      }`}
      title={player.name}
    >
      {player.number ?? "?"}
    </div>
    <span className="mt-0.5 max-w-[64px] px-1 text-center leading-tight text-[9px] line-clamp-2 drop-shadow">
      {short(player.name)}
    </span>
  </div>
);
