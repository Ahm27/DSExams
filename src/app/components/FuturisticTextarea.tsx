import { motion } from "motion/react";
import { Save } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface FuturisticTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}

export function FuturisticTextarea({
  value,
  onChange,
  placeholder = "Enter your analysis...",
  maxLength,
}: FuturisticTextareaProps) {
  const [showCursor, setShowCursor] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(interval);
  }, []);

  const wordCount = value.trim().split(/\s+/).filter(Boolean).length;
  const charCount = value.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-xs text-[var(--neon-cyan)] uppercase tracking-wider">
          CLASSIFIED REPORT ENTRY
        </span>
        <div className="font-mono text-xs text-muted-foreground space-x-4">
          <span>WORDS: <span className="text-[var(--neon-cyan)]">{wordCount}</span></span>
          <span>
            CHARS: <span className="text-[var(--neon-cyan)]">{charCount}</span>
            {maxLength && `/${maxLength}`}
          </span>
        </div>
      </div>

      <div
        className={`relative rounded-lg border-2 transition-all duration-300
          ${
            isFocused
              ? "border-[var(--neon-cyan)] shadow-[0_0_30px_rgba(0,255,255,0.4)]"
              : "border-[var(--neon-cyan)]/50"
          }
        `}
        style={{ background: "rgba(5, 8, 18, 0.9)" }}
      >
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-[var(--neon-cyan)]/10 to-transparent pointer-events-none" />

        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          maxLength={maxLength}
          className="w-full h-64 p-6 bg-transparent text-foreground font-mono text-sm resize-none
                   focus:outline-none relative z-10 leading-relaxed"
          style={{
            caretColor: "var(--neon-cyan)",
          }}
        />

        {isFocused && showCursor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-4 left-6 w-2 h-4 bg-[var(--neon-cyan)]"
            style={{
              boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
            }}
          />
        )}

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--neon-cyan)] to-transparent" />
      </div>

      <div className="flex items-center justify-between">
        <span className="font-mono text-xs text-muted-foreground">
          {'>'} TERMINAL MODE: ACTIVE
        </span>
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="flex items-center gap-2 text-[var(--neon-green)] font-mono text-xs"
        >
          <div className="w-2 h-2 rounded-full bg-[var(--neon-green)]" />
          LOGGING ENABLED
        </motion.div>
      </div>
    </div>
  );
}
