import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type SoundType = "home" | "correct" | "wrong" | "win" | "fail";

interface AudioPreferences {
  enabled: boolean;
  volume: number;
}

interface AudioManagerValue {
  enabled: boolean;
  unlocked: boolean;
  volume: number;
  setEnabled: (enabled: boolean) => void;
  setVolume: (volume: number) => void;
  toggleEnabled: () => void;
  playSound: (type: SoundType) => void;
  startLoop: (type: SoundType) => void;
  stopSound: (type: SoundType) => void;
  unlock: () => void;
}

const AUDIO_KEY = "ds-exe-audio-v1";
const AudioManagerContext = createContext<AudioManagerValue | null>(null);
const SOUND_FILES: Record<SoundType, string> = {
  home: new URL("../../../sounds/home.mp3", import.meta.url).href,
  correct: new URL("../../../sounds/right.mp3", import.meta.url).href,
  wrong: new URL("../../../sounds/wrong.mp3", import.meta.url).href,
  win: new URL("../../../sounds/win.mp3", import.meta.url).href,
  fail: new URL("../../../sounds/fail.mp3", import.meta.url).href,
};

function isBrowser() {
  return typeof window !== "undefined";
}

function loadPreferences(): AudioPreferences {
  if (!isBrowser()) {
    return { enabled: true, volume: 0.6 };
  }

  const raw = window.localStorage.getItem(AUDIO_KEY);
  if (!raw) {
    return { enabled: true, volume: 0.6 };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<AudioPreferences>;
    return {
      enabled: parsed.enabled ?? true,
      volume: typeof parsed.volume === "number" ? Math.min(1, Math.max(0, parsed.volume)) : 0.6,
    };
  } catch {
    return { enabled: true, volume: 0.6 };
  }
}

function savePreferences(preferences: AudioPreferences) {
  if (!isBrowser()) {
    return;
  }

  try {
    window.localStorage.setItem(AUDIO_KEY, JSON.stringify(preferences));
  } catch {
    // Ignore storage failures.
  }
}

interface ToneStep {
  frequency: number;
  duration: number;
  type?: OscillatorType;
}

const SOUND_PATTERNS: Record<SoundType, ToneStep[]> = {
  home: [
    { frequency: 392, duration: 0.14, type: "triangle" },
    { frequency: 523.25, duration: 0.18, type: "triangle" },
    { frequency: 659.25, duration: 0.2, type: "sine" },
  ],
  correct: [
    { frequency: 660, duration: 0.08, type: "triangle" },
    { frequency: 880, duration: 0.12, type: "triangle" },
  ],
  wrong: [
    { frequency: 240, duration: 0.12, type: "sawtooth" },
    { frequency: 180, duration: 0.18, type: "sawtooth" },
  ],
  win: [
    { frequency: 523.25, duration: 0.1, type: "triangle" },
    { frequency: 659.25, duration: 0.1, type: "triangle" },
    { frequency: 783.99, duration: 0.14, type: "triangle" },
    { frequency: 1046.5, duration: 0.24, type: "triangle" },
  ],
  fail: [
    { frequency: 392, duration: 0.12, type: "sine" },
    { frequency: 330, duration: 0.12, type: "sine" },
    { frequency: 262, duration: 0.16, type: "sine" },
    { frequency: 196, duration: 0.22, type: "sine" },
  ],
};

export function AudioManagerProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AudioPreferences>(() => loadPreferences());
  const [unlocked, setUnlocked] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const loopAudioRef = useRef<Partial<Record<SoundType, HTMLAudioElement>>>({});
  const activeLoopsRef = useRef<Set<SoundType>>(new Set());

  const getAudioContext = () => {
    if (!isBrowser()) {
      return null;
    }

    if (!audioContextRef.current) {
      const ContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!ContextCtor) {
        return null;
      }
      audioContextRef.current = new ContextCtor();
    }

    return audioContextRef.current;
  };

  const scheduleSound = (context: AudioContext, type: SoundType) => {
    const now = context.currentTime;
    let offset = 0;

    for (const step of SOUND_PATTERNS[type]) {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const startTime = now + offset;
      const endTime = startTime + step.duration;
      const peak =
        preferences.volume * (type === "win" ? 0.22 : type === "home" ? 0.2 : 0.18);

      oscillator.type = step.type ?? "sine";
      oscillator.frequency.setValueAtTime(step.frequency, startTime);

      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(peak, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(startTime);
      oscillator.stop(endTime);

      offset += step.duration + 0.025;
    }
  };

  const playAudioFile = (type: SoundType) => {
    const audio = new Audio(SOUND_FILES[type]);
    audio.volume = preferences.enabled ? preferences.volume : 0;
    audio.currentTime = 0;
    void audio.play().catch(() => {
      const context = getAudioContext();
      if (!context) {
        return;
      }

      if (context.state === "suspended") {
        void context.resume().then(() => {
          setUnlocked(true);
          scheduleSound(context, type);
        });
        return;
      }

      scheduleSound(context, type);
    });
  };

  const startLoop = (type: SoundType) => {
    const source = SOUND_FILES[type];
    if (!source || !preferences.enabled || preferences.volume <= 0) {
      return;
    }

    let audio = loopAudioRef.current[type];
    if (!audio) {
      audio = new Audio(source);
      audio.loop = true;
      audio.preload = "auto";
      (audio as any).playsInline = true;
      audio.load();
      loopAudioRef.current[type] = audio;
    }

    activeLoopsRef.current.add(type);
    audio.volume = preferences.volume;
    audio.muted = false;
    void audio.play().catch(() => {
      // Prime the loop muted so it can become audible as soon as the page is interacted with.
      audio!.muted = true;
      audio!.volume = 0;
      void audio!.play().catch(() => {
        // Ignore autoplay rejection until the next user interaction.
      });
    });
  };

  const stopSound = (type: SoundType) => {
    const audio = loopAudioRef.current[type];
    if (!audio) {
      return;
    }

    activeLoopsRef.current.delete(type);
    audio.pause();
    audio.currentTime = 0;
  };

  const unlock = () => {
    const context = getAudioContext();
    const retryLoops = () => {
      for (const type of activeLoopsRef.current) {
        const audio = loopAudioRef.current[type];
        if (!audio || !preferences.enabled || preferences.volume <= 0) {
          continue;
        }

        audio.muted = false;
        audio.volume = preferences.volume;
        if (audio.paused) {
          void audio.play().catch(() => {
            // Ignore playback failure until the next interaction.
          });
        }
      }
    };

    if (!context) {
      setUnlocked(true);
      retryLoops();
      return;
    }

    if (context.state === "suspended") {
      void context.resume().then(() => {
        setUnlocked(true);
        retryLoops();
      });
      return;
    }

    setUnlocked(true);
    retryLoops();
  };

  useEffect(() => {
    savePreferences(preferences);
  }, [preferences]);

  useEffect(() => {
    for (const type of activeLoopsRef.current) {
      const audio = loopAudioRef.current[type];
      if (!audio) {
        continue;
      }

      audio.volume = preferences.enabled ? preferences.volume : 0;
      audio.muted = !preferences.enabled || preferences.volume <= 0;

      if (!preferences.enabled || preferences.volume <= 0) {
        audio.pause();
        continue;
      }

      if (audio.paused) {
        void audio.play().catch(() => {
          // Ignore playback failure until the next user interaction.
        });
      }
    }
  }, [preferences]);

  useEffect(() => {
    if (!isBrowser()) {
      return;
    }

    const handleUnlock = () => unlock();
    window.addEventListener("pointerdown", handleUnlock, { passive: true });
    window.addEventListener("keydown", handleUnlock);

    return () => {
      window.removeEventListener("pointerdown", handleUnlock);
      window.removeEventListener("keydown", handleUnlock);
    };
  }, []);

  const value = useMemo<AudioManagerValue>(
    () => ({
      enabled: preferences.enabled,
      unlocked,
      volume: preferences.volume,
      setEnabled: (enabled) => setPreferences((current) => ({ ...current, enabled })),
      setVolume: (volume) =>
        setPreferences((current) => ({
          ...current,
          volume: Math.min(1, Math.max(0, volume)),
        })),
      toggleEnabled: () =>
        setPreferences((current) => ({ ...current, enabled: !current.enabled })),
      playSound: (type) => {
        if (!preferences.enabled || preferences.volume <= 0) {
          return;
        }

        playAudioFile(type);
      },
      startLoop,
      stopSound,
      unlock,
    }),
    [preferences, unlocked],
  );

  return <AudioManagerContext.Provider value={value}>{children}</AudioManagerContext.Provider>;
}

export function useAudioManager() {
  const context = useContext(AudioManagerContext);
  if (!context) {
    throw new Error("useAudioManager must be used within AudioManagerProvider");
  }

  return context;
}
