/**
 * Utilidades estadísticas puras para el motor de recomendación.
 */

/** Media aritmética */
export function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/** Desviación estándar muestral (n > 1); 0 si n ≤ 1 */
export function stdDev(values: number[]): number {
  if (values.length <= 1) return 0;
  const m = mean(values);
  const variance =
    values.reduce((acc, x) => acc + (x - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

/** Z-Score: (x - mean) / stdDev; stdDev = 0 → 0 */
export function zScore(x: number, sampleMean: number, sampleStdDev: number): number {
  if (sampleStdDev === 0) return 0;
  return (x - sampleMean) / sampleStdDev;
}

/**
 * Promedio Bayesiano: ((v / (v + m)) * R) + ((m / (v + m)) * C)
 * v = conteo, m = umbral de confianza, R = media del ítem, C = media global (prior)
 */
export function bayesianAverage(
  v: number,
  m: number,
  R: number,
  C: number,
): number {
  if (v <= 0) return C;
  const weight = v / (v + m);
  return weight * R + (1 - weight) * C;
}

/**
 * Umbral de shrinkage según tamaño del historial (inspirado en priors jerárquicos:
 * más datos → menos arrastre hacia la media global).
 */
export function adaptiveShrinkageM(ratingCount: number, base: number): number {
  if (ratingCount < 25) return base + 2;
  if (ratingCount < 80) return base;
  return Math.min(base + 4, Math.round(base + Math.sqrt(ratingCount / 12)));
}

/**
 * Similitud del coseno entre dos vectores de igual longitud.
 * Retorna 0 si alguna norma es 0.
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;
  return dot / denom;
}

/** Normalización L2; vector cero permanece cero */
export function l2Normalize(vector: number[]): number[] {
  let norm = 0;
  for (const x of vector) norm += x * x;
  norm = Math.sqrt(norm);
  if (norm === 0) return vector.map(() => 0);
  return vector.map((x) => x / norm);
}

/** Distribución positiva que suma 1 (útil para % de afinidad a partir de Z). */
export function softmaxDistribution(values: number[]): number[] {
  if (values.length === 0) return [];
  const max = Math.max(...values);
  const exps = values.map((v) => Math.exp(v - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  if (sum === 0) return values.map(() => 1 / values.length);
  return exps.map((e) => e / sum);
}

export function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.floor((sorted.length - 1) * p);
  return sorted[Math.max(0, idx)];
}
