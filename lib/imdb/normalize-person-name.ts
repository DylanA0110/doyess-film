/** Comparación laxa entre nombres IMDb CSV y TMDB credits. */
export function normalizePersonName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ');
}

export function personNamesMatch(a: string, b: string): boolean {
  const na = normalizePersonName(a);
  const nb = normalizePersonName(b);
  if (na === nb) return true;
  if (na.includes(nb) || nb.includes(na)) return true;
  const aParts = na.split(' ').filter(Boolean);
  const bParts = nb.split(' ').filter(Boolean);
  if (aParts.length >= 2 && bParts.length >= 2) {
    const aLast = aParts.at(-1);
    const bLast = bParts.at(-1);
    const aFirst = aParts[0];
    const bFirst = bParts[0];
    if (aLast === bLast && aFirst === bFirst) return true;
  }
  return false;
}
