export function actorCompositeScore(avgRating: number, count: number): number {
  return avgRating * 0.75 + Math.min(count, 8) * 0.25;
}

export function directorCompositeScore(avgRating: number, count: number): number {
  return avgRating * (1 + Math.min(count, 6) * 0.12);
}
