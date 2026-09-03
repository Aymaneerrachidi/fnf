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

  const play = useCallback((phase = "down") => {
    if (!enabled) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const context = contextRef.current || new AudioContext();
    contextRef.current = context;
    if (context.state === "suspended") context.resume();

    const now = context.currentTime;
    const isRelease = phase === "up";
    const master = context.createGain();
    const compressor = context.createDynamicsCompressor();
    const panner = context.createStereoPanner?.();
    master.gain.value = isRelease ? 1.08 : 1.62;
    compressor.threshold.value = -15;
    compressor.knee.value = 12;
    compressor.ratio.value = 10;
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
    const duration = isRelease ? 0.038 : 0.072;
    const samples = Math.max(1, Math.floor(context.sampleRate * duration));
    const buffer = context.createBuffer(1, samples, context.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let sample = 0; sample < samples; sample += 1) {
      const progress = sample / samples;
      const envelope = Math.pow(1 - progress, isRelease ? 5.2 : 3.4);
      const impactAt = isRelease ? 0.045 : 0.105;
      const impactWidth = isRelease ? 0.022 : 0.03;
      const impact = Math.exp(-Math.pow((progress - impactAt) / impactWidth, 2));
      channel[sample] = (Math.random() * 2 - 1) * (envelope + impact * (isRelease ? 0.38 : 0.86));
    }

    const source = context.createBufferSource();
    const contact = context.createBiquadFilter();
    const contactGain = context.createGain();
    const caseFilter = context.createBiquadFilter();
    const caseGain = context.createGain();
    const pitchJitter = 0.94 + Math.random() * 0.12;

    source.buffer = buffer;
    source.playbackRate.value = pitchJitter;

    contact.type = "highpass";
    contact.frequency.value = (isRelease ? 3150 : 1950) + Math.random() * 520;
    contact.Q.value = isRelease ? 0.9 : 0.68;
    contactGain.gain.setValueAtTime(isRelease ? 0.3 : 0.52, now);
    contactGain.gain.exponentialRampToValueAtTime(0.0001, now + (isRelease ? 0.017 : 0.027));

    caseFilter.type = "bandpass";
    caseFilter.frequency.value = (isRelease ? 980 : 510) + Math.random() * 115;
    caseFilter.Q.value = isRelease ? 1.2 : 0.88;
    caseGain.gain.setValueAtTime(isRelease ? 0.12 : 0.36, now);
    caseGain.gain.exponentialRampToValueAtTime(0.0001, now + (isRelease ? 0.031 : 0.07));

    source.connect(contact).connect(contactGain).connect(master);
    source.connect(caseFilter).connect(caseGain).connect(master);

    // Short damped case modes add the wood/plastic body heard in a real board.
    const modes = isRelease
      ? [[910, 0.022, 0.028], [1710, 0.014, 0.018]]
      : [[118, 0.055, 0.065], [690, 0.034, 0.043], [1320, 0.018, 0.026]];
    modes.forEach(([frequency, level, decay]) => {
      const mode = context.createOscillator();
      const modeGain = context.createGain();
      mode.type = "sine";
      mode.frequency.value = frequency * pitchJitter;
      modeGain.gain.setValueAtTime(level, now);
      modeGain.gain.exponentialRampToValueAtTime(0.0001, now + decay);
      mode.connect(modeGain).connect(master);
      mode.start(now);
      mode.stop(now + decay + 0.004);
    });

    source.start(now);
  }, [enabled]);

  useEffect(() => {
    const getControl = (event) => event.target.closest?.(INTERACTIVE);
    const handlePointerDown = (event) => {
      const control = getControl(event);
      if (control && !control.matches(":disabled, [aria-disabled='true']")) play("down");
    };
    const handlePointerUp = (event) => {
      const control = getControl(event);
      if (control && !control.matches(":disabled, [aria-disabled='true']")) play("up");
    };
    const handleKeyDown = (event) => {
      if (event.repeat || !["Enter", " "].includes(event.key)) return;
      const control = getControl(event);
      if (control && !control.matches(":disabled, [aria-disabled='true']")) play("down");
    };
    const handleKeyUp = (event) => {
      if (!["Enter", " "].includes(event.key)) return;
      const control = getControl(event);
      if (control && !control.matches(":disabled, [aria-disabled='true']")) play("up");
    };
    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("pointerup", handlePointerUp, true);
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("keyup", handleKeyUp, true);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("pointerup", handlePointerUp, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("keyup", handleKeyUp, true);
    };
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
