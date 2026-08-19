import React from "react";

export interface FormationPlayer {
  id: number;
  name: string;
  number: number;
  pos: string;
}

export interface Sub {
  outId: number;
  in: FormationPlayer;
  minute?: number | null;
}

interface PitchProps {
  formation: string;
  players: (FormationPlayer & { substituted?: boolean })[];
  team: string;
  side: "home" | "away";
  fallback?: boolean;
  substitutions?: Sub[];
  redCardedIds?: Set<number>;
}

export function getCurrentXI(
  startingXI: FormationPlayer[],
  substitutions?: Sub[]
): (FormationPlayer & { substituted?: boolean })[] {
  if (!Array.isArray(startingXI) || startingXI.length === 0) return [];
  if (!substitutions || substitutions.length === 0) return startingXI;

  const lineup: (FormationPlayer & { substituted?: boolean })[] = [
    ...startingXI,
  ];
  const idxById = new Map<number, number>();
  lineup.forEach((p, i) => idxById.set(p.id, i));

  const ordered = [...substitutions].sort((a, b) => {
    const am = a.minute ?? Number.MAX_SAFE_INTEGER;
    const bm = b.minute ?? Number.MAX_SAFE_INTEGER;
    return am - bm;
  });

  const cameOn = new Set<number>();

  for (const sub of ordered) {
    const outIdx = idxById.get(sub.outId);
    if (outIdx == null) continue;

    const inIdx = idxById.get(sub.in.id);
    if (inIdx != null && inIdx !== outIdx) {
      lineup[inIdx] = {
        ...lineup[inIdx],
        id: -1,
        name: "—",
        number: 0,
        pos: "",
      };
      idxById.delete(sub.in.id);
    }

    lineup[outIdx] = { ...sub.in, substituted: true };
    idxById.delete(sub.outId);
    idxById.set(sub.in.id, outIdx);
    cameOn.add(sub.in.id);
  }

  return lineup.map((p) => ({
    ...p,
    substituted: cameOn.has(p.id) || p.substituted,
  }));
}

export const FormationPitch: React.FC<PitchProps> = ({
  formation,
  players,
  team,
  side,
  fallback,
  substitutions,
  redCardedIds,
}) => {
  const nums = formation
    .split(/[-–]/)
    .map((n) => parseInt(n.trim(), 10))
    .filter(Boolean);

  if (fallback || !players.length) {
    return (
      <div
        className={`relative w-full aspect-[7/8] rounded-xl overflow-hidden ring-1 ring-emerald-400/20 shadow-md
        ${
          side === "away"
            ? "bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900"
            : "bg-gradient-to-t from-emerald-900 via-emerald-800 to-emerald-900"
        } flex items-center justify-center`}
      >
        <span className="absolute inset-0 flex items-center justify-center text-xs opacity-70 pointer-events-none">
          Lineup not available
        </span>
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

  const cameOnIds = new Set((substitutions ?? []).map((s) => s.in.id));
  const gk = players[0];
  const outfield = players.slice(1);

  const rows = nums.map((count, idx) => {
    const offset = nums.slice(0, idx).reduce((a, b) => a + b, 0);
    return outfield.slice(offset, offset + count);
  });
  const totalRows = rows.length;

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
      ${
        side === "away"
          ? "bg-gradient-to-b from-emerald-900 via-emerald-800 to-emerald-900"
          : "bg-gradient-to-t from-emerald-900 via-emerald-800 to-emerald-900"
      }`}
    >
      {/* Turf texture */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(circle_at_center,#ffffff_0.35px,transparent_0.35px)] [background-size:26px_26px]" />
        {side === "away" ? (
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(0,0,0,0.35))]" />
        ) : (
          <div className="absolute inset-0 bg-[linear-gradient(to_top,transparent,rgba(0,0,0,0.35))]" />
        )}
      </div>

      {/* Markings */}
      {side === "away" ? (
        <>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/70" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-10 border-2 border-white/60 rounded-b-md" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-5 border-2 border-white/60 rounded-b-sm" />
          <div className="absolute top-[10.75rem] left-1/2 -translate-x-1/2 w-16 h-8 border-t-2 border-white/50 rounded-b-full [clip-path:inset(0_0_50%_0)] opacity-70" />
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/60" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border border-white/50 translate-y-1/2 bg-emerald-900/40 backdrop-blur-sm" />
        </>
      ) : (
        <>
          <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/70" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-10 border-2 border-white/60 rounded-t-md" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-14 h-5 border-2 border-white/60 rounded-t-sm" />
          <div className="absolute bottom-[10.75rem] left-1/2 -translate-x-1/2 w-16 h-8 border-b-2 border-white/50 rounded-t-full [clip-path:inset(50%_0_0_0)] opacity-70" />
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-white/60" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full border border-white/50 -translate-y-1/2 bg-emerald-900/40 backdrop-blur-sm" />
        </>
      )}

      {/* GK */}
      {!redCardedIds?.has(gk.id) && (
        <PlayerBadge
          player={{
            ...gk,
            substituted: cameOnIds.has(gk.id) || gk.substituted,
          }}
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
      )}

      {/* Outfield rows */}
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
            {row.map((p) =>
              redCardedIds?.has(p.id) ? null : (
                <PlayerBadge
                  key={p.id}
                  player={{
                    ...p,
                    substituted: cameOnIds.has(p.id) || p.substituted,
                  }}
                  side={side}
                  short={short}
                  substituted={cameOnIds.has(p.id) || p.substituted}
                />
              )
            )}
          </div>
        );
      })}

      {/* Team label */}
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
  player: FormationPlayer & { substituted?: boolean };
  gk?: boolean;
  style?: React.CSSProperties;
  side: "home" | "away";
  short: (n: string) => string;
  substituted?: boolean;
}

const PlayerBadge: React.FC<BadgeProps> = ({
  player,
  gk,
  style,
  short,
  substituted,
}) => (
  <div style={style} className="group flex flex-col items-center">
    <div
      className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold ring-2 ring-white/40 shadow-md transition
      ${
        substituted
          ? "bg-blue-500 text-white"
          : gk
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
