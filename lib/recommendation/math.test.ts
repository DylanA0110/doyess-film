import { describe, expect, it } from 'vitest';
import {
  adaptiveShrinkageM,
  bayesianAverage,
  cosineSimilarity,
  mean,
  softmaxDistribution,
  stdDev,
  zScore,
} from './math';

describe('math', () => {
  it('bayesianAverage with v=0 returns prior C', () => {
    expect(bayesianAverage(0, 3, 9, 7)).toBe(7);
  });

  it('cosineSimilarity orthogonal vectors', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0, 5);
  });

  it('cosineSimilarity identical vectors', () => {
    expect(cosineSimilarity([1, 2], [1, 2])).toBeCloseTo(1, 5);
  });

  it('zScore centers at mean', () => {
    expect(zScore(5, 5, 2)).toBe(0);
    expect(zScore(7, 5, 2)).toBe(1);
  });

  it('stdDev of constant is 0', () => {
    expect(stdDev([8, 8, 8])).toBe(0);
  });

  it('mean', () => {
    expect(mean([2, 4, 6])).toBe(4);
  });

  it('softmaxDistribution sums to 1', () => {
    const w = softmaxDistribution([1, 2, 0]);
    expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 5);
  });

  it('adaptiveShrinkageM is looser with more ratings', () => {
    expect(adaptiveShrinkageM(10, 3)).toBe(5);
    expect(adaptiveShrinkageM(50, 3)).toBe(3);
  });
});
