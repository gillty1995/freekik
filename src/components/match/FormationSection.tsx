"use client";

import { FormationPitch } from "@/components/formation-pitch";

export interface Lineup {
  team: string;
  formation: string;
  startXI: {
    id: number;
    name: string;
    number: number;
    pos: string;
  }[];
}

export function FormationSection({ lineups }: { lineups: Lineup[] }) {
  if (!Array.isArray(lineups) || lineups.length === 0) {
    return (
      <div className="text-xs opacity-60 p-4 border rounded">
        Lineups not available.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {lineups.slice(0, 2).map((lu, i) => (
        <FormationPitch
          key={lu.team}
          team={lu.team}
          formation={lu.formation}
          players={lu.startXI.map((p) => ({
            id: p.id,
            name: p.name,
            number: p.number,
            pos: p.pos,
          }))}
          side={i === 0 ? "away" : "home"}
        />
      ))}
    </div>
  );
}
