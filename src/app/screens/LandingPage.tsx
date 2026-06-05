import { useEffect, useState } from "react";
import { CalendarDays, FolderOpen } from "lucide-react";
import { CyberButton } from "../components/CyberButton";
import { GlitchText } from "../components/GlitchText";
import { ParticleBackground } from "../components/ParticleBackground";
import { useAudioManager } from "../lib/audio";

interface LandingPageProps {
  onStart: () => void;
}

export function LandingPage({ onStart }: LandingPageProps) {
  const { enabled, startLoop, stopSound, unlock } = useAudioManager();
  const [creditGlitch, setCreditGlitch] = useState(false);
  const [homeAudioStarted, setHomeAudioStarted] = useState(false);

  useEffect(() => {
    return () => {
      stopSound("home");
    };
  }, [stopSound]);

  useEffect(() => {
    if (enabled && homeAudioStarted) {
      startLoop("home");
    } else {
      stopSound("home");
    }
  }, [enabled, homeAudioStarted, startLoop, stopSound]);

  useEffect(() => {
    let timeout: number | undefined;
    const interval = window.setInterval(() => {
      setCreditGlitch(true);
      timeout = window.setTimeout(() => setCreditGlitch(false), 160);
    }, 12000);

    return () => {
      window.clearInterval(interval);
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, []);

  const handleUserGesture = () => {
    unlock();
    setHomeAudioStarted(true);
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      onPointerDownCapture={handleUserGesture}
      onKeyDownCapture={handleUserGesture}
      onTouchStartCapture={handleUserGesture}
    >
      <ParticleBackground />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_28%,rgba(0,189,255,0.18),transparent_18%),radial-gradient(circle_at_50%_42%,rgba(168,85,247,0.15),transparent_28%),linear-gradient(180deg,rgba(5,8,18,0.72),rgba(5,8,18,0.35)_38%,rgba(3,5,12,0.92))]" />
      <div className="absolute inset-x-0 bottom-0 h-[38vh] bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(130,30,255,0.08)_35%,rgba(0,238,255,0.16)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[28vh] bg-[repeating-linear-gradient(90deg,rgba(0,255,255,0.09)_0,rgba(0,255,255,0.09)_1px,transparent_1px,transparent_90px),linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.64))] opacity-70" />
      <div className="absolute inset-y-[7%] left-[1.1%] w-[calc(100%-2.2%)] rounded-[2rem] border border-[var(--neon-purple)]/45 shadow-[inset_0_0_40px_rgba(168,85,247,0.08)]" />
      <div className="absolute left-4 top-4 h-16 w-24 border-l-2 border-t-2 border-[var(--neon-purple)]/85 bg-[linear-gradient(135deg,rgba(168,85,247,0.28),transparent_72%)]" />
      <div className="absolute right-4 top-4 h-16 w-24 border-r-2 border-t-2 border-[var(--neon-purple)]/85" />
      <div className="absolute left-4 bottom-4 h-16 w-24 border-b-2 border-l-2 border-[var(--neon-cyan)]/85 bg-[linear-gradient(315deg,rgba(0,255,255,0.16),transparent_72%)]" />
      <div className="absolute right-4 bottom-4 h-16 w-24 border-b-2 border-r-2 border-[var(--neon-cyan)]/85" />
      <div className="absolute left-0 bottom-0 h-[48vh] w-[22vw] bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.24)_20%,rgba(101,31,255,0.22))] [clip-path:polygon(0_100%,0_42%,8%_42%,8%_72%,16%_72%,16%_28%,28%_28%,28%_82%,38%_82%,38%_55%,48%_55%,48%_66%,58%_66%,58%_20%,66%_20%,66%_100%)] opacity-80" />
      <div className="absolute right-0 bottom-0 h-[48vh] w-[22vw] bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.24)_20%,rgba(0,255,255,0.18))] [clip-path:polygon(34%_100%,34%_24%,42%_24%,42%_68%,52%_68%,52%_34%,62%_34%,62%_74%,72%_74%,72%_18%,84%_18%,84%_62%,92%_62%,92%_100%)] opacity-80" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_31%,transparent_0,transparent_16%,rgba(0,170,255,0.14)_16.4%,transparent_17.1%,transparent_23%,rgba(168,85,247,0.08)_23.5%,transparent_24.3%,transparent_100%)] opacity-90" />

      <div className="relative z-10 w-full max-w-6xl px-4 pb-14 pt-24 text-center">
        <div className="mb-4">
          <GlitchText text="DS.EXE" className="text-6xl sm:text-7xl md:text-8xl text-[var(--neon-cyan)]" />
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="font-mono text-xl text-cyan-100 tracking-[0.35em] uppercase">
            DATA STRUCTURES EXAM TRAINER
          </div>
          <div className="mx-auto mt-6 max-w-2xl rounded-[1.75rem] border border-[var(--neon-purple)]/70 bg-[linear-gradient(180deg,rgba(7,10,20,0.94),rgba(9,12,24,0.84))] px-6 py-7 text-left shadow-[0_0_35px_rgba(168,85,247,0.12)]">
            <div className="space-y-5">
              <div className="flex items-center gap-4 border-b border-[var(--neon-purple)]/35 pb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--neon-purple)]/45 bg-[var(--neon-purple)]/8 text-[var(--neon-purple)]">
                  <FolderOpen className="h-6 w-6" />
                </div>
                <p className="font-mono text-xl tracking-[0.16em] text-[var(--neon-cyan)] uppercase">
                  Archives Loaded
                </p>
              </div>
              <div className="flex items-center gap-4 border-b border-[var(--neon-purple)]/35 pb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--neon-purple)]/45 bg-[var(--neon-purple)]/8 text-[var(--neon-purple)]">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <p className="font-mono text-xl tracking-[0.16em] text-[var(--neon-cyan)] uppercase">
                  Year-Based Quiz Mode Active
                </p>
              </div>
              <p className="text-readable text-2xl text-foreground/84">
                Practice previous data structures exams by year.
              </p>
            </div>
          </div>
        </div>

        <div className="pt-10 space-y-6">
          <CyberButton
            className="min-w-[320px] px-10 py-5 text-2xl shadow-[0_0_28px_rgba(0,255,255,0.55),0_0_0_4px_rgba(168,85,247,0.35)] border-2 border-[var(--neon-cyan)] rounded-[1.4rem] bg-[linear-gradient(180deg,#43f3ff,#0fe3ff)]"
            onClick={onStart}
          >
            Press Start To Begin
          </CyberButton>

          <div className="font-mono text-xl tracking-[0.18em] uppercase text-zinc-200">
            AUDIO:
            <span className={`${enabled ? "text-[var(--neon-cyan)]" : "text-muted-foreground"} ml-3`}>
              {enabled ? "ENABLED" : "MUTED"}
            </span>
          </div>
        </div>

        <div className="pt-16">
          <div className="mx-auto mt-6 inline-flex flex-col rounded-t-[1.3rem] border border-[var(--neon-purple)]/45 bg-black/35 px-10 py-4 font-mono text-sm tracking-[0.22em] text-[var(--neon-purple)] uppercase">
            <div className="relative">
              <span
                className="relative z-10 block"
              >
                Made By Project Zero
              </span>
              {creditGlitch && (
                <>
                  <span
                    className="absolute left-0 top-0 text-[var(--neon-cyan)] opacity-60"
                    style={{ transform: "translate(-1px, 0)" }}
                  >
                    Made By Project Zero
                  </span>
                  <span
                    className="absolute left-0 top-0 text-[var(--neon-purple)] opacity-70"
                    style={{ transform: "translate(1px, 0)" }}
                  >
                    Made By Project Zero
                  </span>
                </>
              )}
            </div>
            <div className="relative mt-2">
              <span
                className="relative z-10 block"
              >
                President: Ahmed Amr
              </span>
              {creditGlitch && (
                <>
                  <span
                    className="absolute left-0 top-0 text-[var(--neon-cyan)] opacity-60"
                    style={{ transform: "translate(-1px, 0)" }}
                  >
                    President: Ahmed Amr
                  </span>
                  <span
                    className="absolute left-0 top-0 text-[var(--neon-purple)] opacity-70"
                    style={{ transform: "translate(1px, 0)" }}
                  >
                    President: Ahmed Amr
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--neon-cyan)] to-transparent" />
    </div>
  );
}
