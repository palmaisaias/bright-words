// src/lib/Confetti.ts
declare global {
  interface Window {
    tsParticles?: any
    confetti?: any
  }
}

const getConfetti = () =>
  window.confetti || window.tsParticles?.confetti;

export function fireConfettiFor(durationMs = 5000) {
  const fn = getConfetti();
  if (!fn) {
    console.warn('Confetti bundle not loaded');
    return;
  }

  const targetId = 'tsparticles'; // matches <div id="tsparticles"> in index.html
  const end = Date.now() + durationMs;

  const tick = () => {
    // left burst
    fn(targetId, {
      particleCount: 4,
      angle: 60,
      spread: 75,
      startVelocity: 52,
      gravity: 1.1,
      decay: 0.92,
      scalar: 0.9,
      shapes: ['circle', 'square'],
      origin: { x: 0, y: 0.6 }
    });
    // right burst
    fn(targetId, {
      particleCount: 4,
      angle: 120,
      spread: 75,
      startVelocity: 52,
      gravity: 1.1,
      decay: 0.92,
      scalar: 0.9,
      shapes: ['circle', 'square'],
      origin: { x: 1, y: 0.6 }
    });

    if (Date.now() < end) requestAnimationFrame(tick);
  };

  tick();
}
