import { useEffect, useState } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
}

export function GlitchText({ text, className = "" }: GlitchTextProps) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    let timeout: number | undefined;
    const interval = setInterval(() => {
      setGlitching(true);
      timeout = window.setTimeout(() => setGlitching(false), 100);
    }, 3000);

    return () => {
      clearInterval(interval);
      if (timeout) {
        window.clearTimeout(timeout);
      }
    };
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      <h1
        className="font-orbitron relative z-10"
      >
        {text}
      </h1>
      {glitching && (
        <>
          <span
            className="absolute top-0 left-0 font-orbitron text-[var(--neon-cyan)] opacity-70"
            style={{ transform: "translate(-2px, 0)" }}
          >
            {text}
          </span>
          <span
            className="absolute top-0 left-0 font-orbitron text-[var(--neon-purple)] opacity-70"
            style={{ transform: "translate(2px, 0)" }}
          >
            {text}
          </span>
        </>
      )}
    </div>
  );
}
