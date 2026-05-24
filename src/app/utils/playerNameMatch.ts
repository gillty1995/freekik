import { FormationPlayer } from "@/components/formation-pitch";

export function normalizeName(s: string): string {
  return s
    .replace(/[łŁ]/g, "l")
    .replace(/[đĐ]/g, "d")
    .replace(/[øØ]/g, "o")
    .replace(/[æÆ]/g, "ae")
    .replace(/[œŒ]/g, "oe")
    .replace(/[ß]/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[.'’]/g, "")
    .replace(/[-‐‑‒–—]/g, " ")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

export function splitInitialAndLast(normalized: string): {
  initial?: string;
  last?: string;
} {
  const parts = normalized.split(" ");
  if (parts.length === 1) return { last: parts[0] };
  if (parts.length === 2 && parts[0].length === 1) {
    return { initial: parts[0], last: parts[1] };
  }
  return { last: parts[parts.length - 1] };
}

export function makeRosterIndex(players: FormationPlayer[]) {
  return players.map((p) => {
    const norm = normalizeName(p.name);
    const { initial, last } = splitInitialAndLast(norm);
    return {
      ...p,
      _norm: norm,
      _last: last,
      _initial: initial,
    };
  });
}

export function findPlayerByLooseName(
  teamRoster: ReturnType<typeof makeRosterIndex>,
  incomingName: string
) {
  const incNorm = normalizeName(incomingName);
  const { initial: incInit, last: incLast } = splitInitialAndLast(incNorm);

  const exact = teamRoster.find((p) => p._norm === incNorm);
  if (exact) return exact;

  if (!incLast) return undefined;

  const sameLast = teamRoster.filter((p) => p._last === incLast);
  if (sameLast.length === 1) return sameLast[0];

  if (sameLast.length > 1 && incInit) {
    const byInit = sameLast.find(
      (p) => normalizeName(p.name).charAt(0) === incInit
    );
    if (byInit) return byInit;
  }

  const containsLast = teamRoster.find(
    (p) => p._norm.endsWith(" " + incLast) || p._norm === incLast
  );
  if (containsLast) return containsLast;

  return undefined;
}
