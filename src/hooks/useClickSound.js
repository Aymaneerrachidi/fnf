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
    const panner = context.createStereoPanner?.();
    master.gain.value = 1.08;
    compressor.threshold.value = -12;
    compressor.knee.value = 10;
    compressor.ratio.value = 8;
    compressor.attack.value = 0.001;
    compressor.release.value = 0.055;
    if (panner) {
      panner.pan.value = (Math.random() - 0.5) * 0.12;
      master.connect(panner).connect(compressor).connect(context.destination);
    } else {
      master.connect(compressor).connect(context.destination);
    }

    // One short physical impulse feeds two resonances: switch contact and case.
    // Avoiding a pitched oscillator keeps this in mechanical-key territory.
    const duration = 0.06;
    const samples = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, samples, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let sample = 0; sample < samples; sample += 1) {
      const progress = sample / samples;
      const envelope = Math.pow(1 - progress, 3.6);
      const bottomOut = Math.exp(-Math.pow((progress - 0.11) / 0.028, 2));
      channel[sample] = (Math.random() * 2 - 1) * (envelope + bottomOut * 0.72);
    }

    const source = context.createBufferSource();
    const contact = context.createBiquadFilter();
    const contactGain = context.createGain();
    const caseFilter = context.createBiquadFilter();
    const caseGain = context.createGain();
    const pitchJitter = 0.96 + Math.random() * 0.08;

    source.buffer = buffer;
    source.playbackRate.value = pitchJitter;

    contact.type = "highpass";
    contact.frequency.value = 2150 + Math.random() * 420;
    contact.Q.value = 0.72;
    contactGain.gain.setValueAtTime(0.34, now);
    contactGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.022);

    caseFilter.type = "bandpass";
    caseFilter.frequency.value = 620 + Math.random() * 95;
    caseFilter.Q.value = 0.95;
    caseGain.gain.setValueAtTime(0.23, now);
    caseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.058);

    source.connect(contact).connect(contactGain).connect(master);
    source.connect(caseFilter).connect(caseGain).connect(master);
    source.start(now);
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
