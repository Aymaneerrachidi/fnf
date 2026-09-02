import { useCallback, useEffect, useRef, useState } from "react";

const INTERACTIVE = "button, a, input, select, textarea, [role='button']";

export default function useClickSound() {
  const [enabled, setEnabled] = useState(() => {
    try {
      return localStorage.getItem("fnf-click-sound") !== "off";
    } catch {
      return true;
    }
  });
  const contextRef = useRef(null);

  const play = useCallback(() => {
    if (!enabled) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = contextRef.current || new AudioContext();
    contextRef.current = context;
    if (context.state === "suspended") context.resume();

    const now = context.currentTime;
    const master = context.createGain();
    const compressor = context.createDynamicsCompressor();
    master.gain.value = 0.82;
    compressor.threshold.value = -18;
    compressor.knee.value = 8;
    compressor.ratio.value = 5;
    master.connect(compressor).connect(context.destination);

    // Bright switch contact: the short upper-frequency snap of a mechanical key.
    const click = context.createOscillator();
    const clickGain = context.createGain();
    click.type = "triangle";
    click.frequency.setValueAtTime(2350, now);
    click.frequency.exponentialRampToValueAtTime(860, now + 0.012);
    clickGain.gain.setValueAtTime(0.0001, now);
    clickGain.gain.exponentialRampToValueAtTime(0.052, now + 0.0015);
    clickGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.018);
    click.connect(clickGain).connect(master);

    // A tiny lower body keeps the sound physical instead of becoming a UI beep.
    const body = context.createOscillator();
    const bodyGain = context.createGain();
    body.type = "sine";
    body.frequency.setValueAtTime(310, now);
    body.frequency.exponentialRampToValueAtTime(175, now + 0.034);
    bodyGain.gain.setValueAtTime(0.0001, now);
    bodyGain.gain.exponentialRampToValueAtTime(0.026, now + 0.002);
    bodyGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);
    body.connect(bodyGain).connect(master);

    const samples = Math.max(1, Math.floor(context.sampleRate * 0.032));
    const buffer = context.createBuffer(1, samples, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let sample = 0; sample < samples; sample += 1) {
      const envelope = Math.pow(1 - sample / samples, 2.4);
      channel[sample] = (Math.random() * 2 - 1) * envelope;
    }
    const noise = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const noiseGain = context.createGain();
    noise.buffer = buffer;
    filter.type = "bandpass";
    filter.frequency.value = 3400;
    filter.Q.value = 0.75;
    noiseGain.gain.setValueAtTime(0.062, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.031);
    noise.connect(filter).connect(noiseGain).connect(master);

    click.start(now);
    body.start(now);
    noise.start(now);
    click.stop(now + 0.02);
    body.stop(now + 0.05);
  }, [enabled]);

  useEffect(() => {
    const handlePointer = (event) => {
      if (event.target.closest(INTERACTIVE)) play();
    };
    document.addEventListener("pointerdown", handlePointer, true);
    return () => document.removeEventListener("pointerdown", handlePointer, true);
  }, [play]);

  const toggle = useCallback(() => {
    setEnabled((current) => {
      const next = !current;
      try {
        localStorage.setItem("fnf-click-sound", next ? "on" : "off");
      } catch {
        // Browsers with restricted storage can still use the control for this visit.
      }
      return next;
    });
  }, []);

  return { soundEnabled: enabled, toggleSound: toggle };
}
