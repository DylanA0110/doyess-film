const DOYESS_COLORS = ['#8A0201', '#C80000', '#F4F6F3', '#5B1E31', '#D97706'];

/** Ráfaga única centrada (estilo “¡pam!” al revelar). */
export async function fireDoyessConfetti(): Promise<void> {
  const { default: confetti } = await import('canvas-confetti');
  const defaults = {
    origin: { y: 0.52, x: 0.5 },
    colors: DOYESS_COLORS,
    ticks: 200,
    gravity: 1.02,
    scalar: 1,
    disableForReducedMotion: true,
    zIndex: 90,
  };

  confetti({
    ...defaults,
    particleCount: 55,
    spread: 75,
    startVelocity: 42,
  });
  confetti({
    ...defaults,
    particleCount: 35,
    spread: 100,
    startVelocity: 32,
    origin: { y: 0.48, x: 0.5 },
  });
}
