import confetti from "canvas-confetti";

function playSuccessChime() {
  try {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;
    // Cheerful ascending major triad — C5, E5, G5.
    const notes = [523.25, 659.25, 783.99];

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;

      const start = now + i * 0.09;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.55);
    });

    setTimeout(() => ctx.close(), 900);
  } catch {
    // Audio unavailable or blocked by the browser — confetti still shows.
  }
}

export function celebrateApplied() {
  if (typeof window === "undefined") return;

  confetti({
    particleCount: 90,
    spread: 75,
    startVelocity: 45,
    origin: { y: 0.6 },
    colors: ["#3b82f6", "#10b981", "#f59e0b", "#2dd4bf"],
    zIndex: 9999,
  });

  playSuccessChime();
}
