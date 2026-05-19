import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface GlitchTextProps {
  text: string;
  className?: string;
}

export function GlitchText({ text, className = "" }: GlitchTextProps) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitching(true);
      setTimeout(() => setGlitching(false), 100);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative inline-block ${className}`}>
      <motion.h1
        className="font-orbitron relative z-10"
        animate={
          glitching
            ? {
                x: [0, -2, 2, -2, 0],
                textShadow: [
                  "0 0 0 transparent",
                  "2px 0 #00ffff, -2px 0 #ff00ff",
                  "-2px 0 #00ffff, 2px 0 #ff00ff",
                  "0 0 0 transparent",
                ],
              }
            : {}
        }
        transition={{ duration: 0.3 }}
      >
        {text}
      </motion.h1>
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
