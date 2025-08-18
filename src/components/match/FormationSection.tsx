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
  // Always render two FormationPitch components, fallback if missing
  const hasLineups = Array.isArray(lineups) && lineups.length > 0;
  const away = hasLineups ? lineups[0] : null;
  const home = hasLineups && lineups.length > 1 ? lineups[1] : null;

  return (
    <div className="space-y-4">
      <FormationPitch
        team={away?.team ?? "Away"}
        formation={away?.formation ?? ""}
        players={away?.startXI ?? []}
        side="away"
        fallback={!away}
      />
      <FormationPitch
        team={home?.team ?? "Home"}
        formation={home?.formation ?? ""}
        players={home?.startXI ?? []}
        side="home"
        fallback={!home}
      />
      {!hasLineups && (
        <div className="text-xs opacity-60 p-4 border rounded text-center">
          Lineups not available.
        </div>
      )}
    </div>
  );
}
