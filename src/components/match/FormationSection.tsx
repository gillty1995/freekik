"use client";
import React from "react";
import {
  FormationPitch,
  FormationPlayer,
  Sub,
  getCurrentXI,
} from "@/components/formation-pitch";

export interface Lineup {
  team: string;
  formation: string;
  startXI: FormationPlayer[];
  subs?: FormationPlayer[];
}

export function FormationSection({
  lineups,
  subsByTeam,
}: {
  lineups: Lineup[];
  subsByTeam?: Record<string, Sub[]>;
}) {
  const hasLineups = Array.isArray(lineups) && lineups.length > 0;
  const away = hasLineups ? lineups[0] : null;
  const home = hasLineups && lineups.length > 1 ? lineups[1] : null;

  const awayTeam = away?.team ?? "";
  const homeTeam = home?.team ?? "";

  const awayXI = away ? getCurrentXI(away.startXI, subsByTeam?.[awayTeam]) : [];
  const homeXI = home ? getCurrentXI(home.startXI, subsByTeam?.[homeTeam]) : [];

  return (
    <>
      <details
        className="block md:hidden text-[11px] max-md:text-[13px]"
        open={hasLineups}
      >
        <summary className="cursor-pointer select-none opacity-80 hover:opacity-100">
          Formation / Lineups
        </summary>
        <div className="space-y-4 mt-2">
          <FormationPitch
            team={away?.team ?? "Away"}
            formation={away?.formation ?? ""}
            players={awayXI}
            side="away"
            fallback={!away}
            substitutions={subsByTeam?.[awayTeam]}
          />
          <FormationPitch
            team={home?.team ?? "Home"}
            formation={home?.formation ?? ""}
            players={homeXI}
            side="home"
            fallback={!home}
            substitutions={subsByTeam?.[homeTeam]}
          />
        </div>
      </details>

      {!hasLineups && (
        <div className="text-xs opacity-60 p-4 border rounded text-center">
          Lineups not available.
        </div>
      )}

      <div className="hidden md:block text-[11px]">
        <div className="space-y-4">
          <FormationPitch
            team={away?.team ?? "Away"}
            formation={away?.formation ?? ""}
            players={awayXI}
            side="away"
            fallback={!away}
            substitutions={subsByTeam?.[awayTeam]}
          />
          <FormationPitch
            team={home?.team ?? "Home"}
            formation={home?.formation ?? ""}
            players={homeXI}
            side="home"
            fallback={!home}
            substitutions={subsByTeam?.[homeTeam]}
          />
        </div>
      </div>
    </>
  );
}
