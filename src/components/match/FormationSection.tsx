"use client";

import { FormationPitch, FormationPlayer } from "@/components/formation-pitch";

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

export function FormationSection({
  lineups,
  substitutions,
}: {
  lineups: Lineup[];
  substitutions?: { outId: number; in: FormationPlayer }[];
}) {
  // Always render two FormationPitch components, fallback if missing
  const hasLineups = Array.isArray(lineups) && lineups.length > 0;
  const away = hasLineups ? lineups[0] : null;
  const home = hasLineups && lineups.length > 1 ? lineups[1] : null;

  return (
    <>
      {/* Mobile: show details */}
      <details className="block md:hidden text-[11px] max-md:text-[13px]">
        <summary className="cursor-pointer select-none opacity-80 hover:opacity-100">
          Formation / Lineups
        </summary>
        <div className="space-y-4 mt-2">
          <FormationPitch
            team={away?.team ?? "Away"}
            formation={away?.formation ?? ""}
            players={away?.startXI ?? []}
            side="away"
            fallback={!away}
            substitutions={substitutions}
          />
          <FormationPitch
            team={home?.team ?? "Home"}
            formation={home?.formation ?? ""}
            players={home?.startXI ?? []}
            side="home"
            fallback={!home}
            substitutions={substitutions}
          />
        </div>
      </details>
      {!hasLineups && (
        <div className="text-xs opacity-60 p-4 border rounded text-center">
          Lineups not available.
        </div>
      )}

      {/* Desktop: show always expanded */}
      <div className="hidden md:block text-[11px]">
        <div className="space-y-4">
          <FormationPitch
            team={away?.team ?? "Away"}
            formation={away?.formation ?? ""}
            players={away?.startXI ?? []}
            side="away"
            fallback={!away}
            substitutions={substitutions}
          />
          <FormationPitch
            team={home?.team ?? "Home"}
            formation={home?.formation ?? ""}
            players={home?.startXI ?? []}
            side="home"
            fallback={!home}
            substitutions={substitutions}
          />
        </div>
      </div>
    </>
  );
}
