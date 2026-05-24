import { FormationPlayer } from "@/components/formation-pitch";
import { findPlayerByLooseName, makeRosterIndex } from "./playerNameMatch";

type DetailsEvent = {
  team?: string | null;
  type: string;
  detail?: string | null;
  player?: string | null;
};

type DetailsLineup = {
  team: string;
  startXI: FormationPlayer[];
  subs?: FormationPlayer[];
};

export function buildTeamRedCardsFromResponse(
  events: DetailsEvent[] | undefined,
  lineups: DetailsLineup[] | undefined
): Record<string, Set<number>> {
  const redCardsByTeam: Record<string, Set<number>> = {};
  if (!Array.isArray(events) || !Array.isArray(lineups)) return redCardsByTeam;

  const rosterByTeam = new Map<string, ReturnType<typeof makeRosterIndex>>();
  for (const lineup of lineups) {
    const roster = [...(lineup.startXI ?? []), ...(lineup.subs ?? [])];
    rosterByTeam.set(lineup.team, makeRosterIndex(roster));
  }

  for (const event of events) {
    const isRedCard =
      event.type === "Card" && /Red|Second Yellow/i.test(event.detail ?? "");
    if (!isRedCard || !event.team || !event.player) continue;

    const roster = rosterByTeam.get(event.team);
    if (!roster) continue;

    const player = findPlayerByLooseName(roster, event.player);
    if (!player) continue;

    if (!redCardsByTeam[event.team]) redCardsByTeam[event.team] = new Set();
    redCardsByTeam[event.team].add(player.id);
  }

  return redCardsByTeam;
}
