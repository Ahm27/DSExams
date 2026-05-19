import { Maximize, Minimize, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { useAudioManager } from "../lib/audio";

export function AudioControls() {
  const { enabled, volume, setVolume, toggleEnabled } = useAudioManager();
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    handleFullscreenChange();
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    if (document.fullscreenElement) {
      await document.exitFullscreen().catch(() => undefined);
      return;
    }

    await document.documentElement.requestFullscreen().catch(() => undefined);
  };

  return (
    <div className="fixed right-4 top-4 z-50 w-[88px] rounded-[1.15rem] border border-[var(--neon-purple)]/60 bg-black/80 px-3 py-3 backdrop-blur-md shadow-[0_0_24px_rgba(168,85,247,0.22)] before:absolute before:inset-0 before:-z-10 before:rounded-[1.15rem] before:border before:border-[var(--neon-cyan)]/15">
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={toggleFullscreen}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--neon-purple)]/60 bg-[var(--neon-purple)]/8 text-[var(--neon-purple)] hover:bg-[var(--neon-purple)]/14 transition-colors"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>

        <button
          onClick={toggleEnabled}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-[var(--neon-cyan)]/60 bg-[var(--neon-cyan)]/8 text-[var(--neon-cyan)] hover:bg-[var(--neon-cyan)]/14 transition-colors"
          aria-label={enabled ? "Mute audio" : "Enable audio"}
        >
          {enabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
        </button>

        <div className="w-full pt-1">
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {enabled ? `${Math.round(volume * 100)}%` : "Mute"}
          </p>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            onChange={(event) => setVolume(Number(event.target.value) / 100)}
            className="mt-3 h-20 w-full cursor-pointer appearance-none rounded-full bg-[var(--neon-cyan)]/20 accent-cyan-400 [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
            aria-label="Volume control"
          />
        </div>
      </div>
    </div>
  );
}
