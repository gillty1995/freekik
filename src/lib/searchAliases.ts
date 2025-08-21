export function normalizeSearchQuery(query: string): string {
  const q = query.trim().toLowerCase();

  const aliasMap: Record<string, string> = {
    "st. louis city": "louis city",
    "st louis city": "louis city",
    "st. louis": "louis city",
    "st louis": "louis city",
  };

  return aliasMap[q] || q;
}