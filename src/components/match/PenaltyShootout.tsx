import React from "react";

export interface PenaltyEvent {
  team: string;
  player: string;
  scored: boolean;
  order: number;
}

export interface PenaltyShootoutProps {
  penalties: PenaltyEvent[];
  home: string;
  away: string;
}

export const PenaltyShootout: React.FC<PenaltyShootoutProps> = ({
  penalties,
  home,
  away,
}) => {
  const homePens = penalties.filter((p) => p.team === home);
  const awayPens = penalties.filter((p) => p.team === away);

  // Find max rounds
  const maxRounds = Math.max(homePens.length, awayPens.length);

  return (
    <div className="my-4 p-4 rounded bg-neutral-100 dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700">
      <h3 className="font-semibold text-base mb-2">Penalty Shootout</h3>
      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="font-bold text-center">{away}</div>
        <div className="font-bold text-center">Round</div>
        <div className="font-bold text-center">{home}</div>
        {Array.from({ length: maxRounds }).map((_, i) => (
          <React.Fragment key={i}>
            <div className="text-center">
              {awayPens[i] ? (
                <span
                  className={
                    awayPens[i].scored
                      ? "text-emerald-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                  title={awayPens[i].player}
                >
                  {awayPens[i].scored ? "●" : "○"}
                </span>
              ) : (
                "-"
              )}
            </div>
            <div className="text-center">{i + 1}</div>
            <div className="text-center">
              {homePens[i] ? (
                <span
                  className={
                    homePens[i].scored
                      ? "text-emerald-600 font-bold"
                      : "text-red-600 font-bold"
                  }
                  title={homePens[i].player}
                >
                  {homePens[i].scored ? "●" : "○"}
                </span>
              ) : (
                "-"
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-xs">
        <span>
          {away}: {awayPens.filter((p) => p.scored).length}
        </span>
        <span>
          {home}: {homePens.filter((p) => p.scored).length}
        </span>
      </div>
    </div>
  );
};
