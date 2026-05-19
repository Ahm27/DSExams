import { ChevronLeft, Maximize, Minimize, SlidersVertical, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";
import { useAudioManager } from "../lib/audio";

export function AudioControls() {
  const { enabled, volume, setVolume, toggleEnabled } = useAudioManager();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [expanded, setExpanded] = useState(false);

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
    <div className="fixed right-3 top-3 z-50">
      <div className="flex items-start gap-2">
        <button
          onClick={() => setExpanded((current) => !current)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--neon-purple)]/60 bg-black/80 text-[var(--neon-cyan)] backdrop-blur-md shadow-[0_0_18px_rgba(168,85,247,0.18)] transition-colors hover:bg-black/90"
          aria-label={expanded ? "Collapse controls" : "Expand controls"}
        >
          {expanded ? <ChevronLeft className="h-4 w-4" /> : <SlidersVertical className="h-4 w-4" />}
        </button>

        <div
          className={`overflow-hidden rounded-[1rem] border border-[var(--neon-purple)]/60 bg-black/80 backdrop-blur-md shadow-[0_0_24px_rgba(168,85,247,0.22)] transition-all duration-200 before:absolute before:inset-0 before:-z-10 before:rounded-[1rem] before:border before:border-[var(--neon-cyan)]/15 ${
            expanded ? "pointer-events-auto max-h-64 w-[76px] px-2 py-2 opacity-100" : "pointer-events-none max-h-0 w-0 px-0 py-0 opacity-0"
          }`}
        >
          <div className="flex flex-col items-center gap-2">
            <button
              onClick={toggleFullscreen}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--neon-purple)]/60 bg-[var(--neon-purple)]/8 text-[var(--neon-purple)] transition-colors hover:bg-[var(--neon-purple)]/14"
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>

            <button
              onClick={toggleEnabled}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-[var(--neon-cyan)]/60 bg-[var(--neon-cyan)]/8 text-[var(--neon-cyan)] transition-colors hover:bg-[var(--neon-cyan)]/14"
              aria-label={enabled ? "Mute audio" : "Enable audio"}
            >
              {enabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>

            <div className="w-full pt-1">
              <p className="text-center font-mono text-[9px] uppercase tracking-[0.16em] text-muted-foreground">
                {enabled ? `${Math.round(volume * 100)}%` : "Mute"}
              </p>
              <input
                type="range"
                min="0"
                max="100"
                value={Math.round(volume * 100)}
                onChange={(event) => setVolume(Number(event.target.value) / 100)}
                className="mt-2 h-16 w-full cursor-pointer appearance-none rounded-full bg-[var(--neon-cyan)]/20 accent-cyan-400 [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]"
                aria-label="Volume control"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
