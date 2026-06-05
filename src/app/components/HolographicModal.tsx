import { X, ZoomIn, ZoomOut, Copy, Check } from "lucide-react";
import { useState } from "react";

interface HolographicModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  type: "text" | "image" | "code" | "diagram";
  content: string | React.ReactNode;
  copyText?: string;
}

export function HolographicModal({
  isOpen,
  onClose,
  title,
  type,
  content,
  copyText,
}: HolographicModalProps) {
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!copyText || typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }

    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
      />

      <div className="fixed inset-8 md:inset-16 z-50 flex items-center justify-center">
            <div
              className="w-full h-full max-w-5xl relative rounded-lg border-2 border-[var(--neon-cyan)] overflow-hidden"
              style={{
                background: "rgba(10, 14, 39, 0.95)",
                boxShadow: "0 0 60px rgba(0, 255, 255, 0.6), inset 0 0 40px rgba(0, 255, 255, 0.1)",
              }}
            >
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 255, 0.1) 2px, rgba(0, 255, 255, 0.1) 4px)",
                }}
              />

              <div className="relative h-full flex flex-col">
                <div className="flex items-center justify-between p-6 border-b-2 border-[var(--neon-cyan)]/30">
                  <div>
                    <span className="cyber-soft-blink font-mono text-xs text-[var(--neon-cyan)] uppercase tracking-wider">
                      {'>'} DECRYPTED ARCHIVE VISUAL
                    </span>
                    <h2 className="font-orbitron text-2xl text-[var(--neon-cyan)] mt-1">
                      {title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3">
                    {copyText ? (
                      <button
                        onClick={handleCopy}
                        className="p-2 rounded bg-[var(--neon-purple)]/20 hover:bg-[var(--neon-purple)]/30 transition-colors"
                        title="Copy code"
                      >
                        {copied ? (
                          <Check className="w-5 h-5 text-[var(--neon-green)]" />
                        ) : (
                          <Copy className="w-5 h-5 text-[var(--neon-purple)]" />
                        )}
                      </button>
                    ) : null}

                    {type === "image" || type === "diagram" ? (
                      <>
                        <button
                          onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
                          className="p-2 rounded bg-[var(--neon-cyan)]/20 hover:bg-[var(--neon-cyan)]/30 transition-colors"
                        >
                          <ZoomOut className="w-5 h-5 text-[var(--neon-cyan)]" />
                        </button>
                        <span className="font-mono text-sm text-[var(--neon-cyan)]">
                          {Math.round(zoom * 100)}%
                        </span>
                        <button
                          onClick={() => setZoom(Math.min(2, zoom + 0.25))}
                          className="p-2 rounded bg-[var(--neon-cyan)]/20 hover:bg-[var(--neon-cyan)]/30 transition-colors"
                        >
                          <ZoomIn className="w-5 h-5 text-[var(--neon-cyan)]" />
                        </button>
                      </>
                    ) : null}

                    <button
                      onClick={onClose}
                      className="p-2 rounded bg-[var(--neon-red)]/20 hover:bg-[var(--neon-red)]/30 transition-colors"
                    >
                      <X className="w-5 h-5 text-[var(--neon-red)]" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-auto p-8">
                  <div
                    style={
                      type === "image" || type === "diagram"
                        ? { transform: `scale(${zoom})`, transformOrigin: "center" }
                        : undefined
                    }
                    className="transition-transform duration-300"
                  >
                    {type === "code" ? (
                      <pre className="bg-[var(--cyber-darker)] p-6 rounded-lg border border-[var(--neon-purple)] overflow-x-auto">
                        <code className="font-mono text-sm text-[var(--neon-green)]">
                          {content}
                        </code>
                      </pre>
                    ) : type === "image" || type === "diagram" ? (
                      <div className="flex items-center justify-center">
                        {typeof content === "string" ? (
                          <img
                            src={content}
                            alt={title}
                            className="max-w-full h-auto rounded-lg border-2 border-[var(--neon-cyan)]"
                          />
                        ) : (
                          content
                        )}
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none font-mono text-foreground">
                        {content}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-4 border-t-2 border-[var(--neon-cyan)]/30 bg-[var(--cyber-darker)]/50">
                  <p className="font-mono text-xs text-muted-foreground text-center">
                    CLASSIFIED MATERIAL • AUTHORIZED ACCESS ONLY • DS.EXE ARCHIVE SYSTEM
                  </p>
                </div>
              </div>
            </div>
      </div>
    </>
  );
}
