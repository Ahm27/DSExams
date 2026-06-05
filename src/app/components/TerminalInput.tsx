import { useState } from "react";

interface TerminalInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isCorrect?: boolean;
  showValidation?: boolean;
  prefix?: string;
}

export function TerminalInput({
  value,
  onChange,
  placeholder = "Enter command...",
  isCorrect,
  showValidation = false,
  prefix = "$",
}: TerminalInputProps) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <div
        className={`relative flex items-center gap-3 p-4 rounded-lg border-2
          transition-all duration-300 font-mono
          ${
            showValidation
              ? isCorrect
                ? "border-[var(--neon-green)] bg-[var(--neon-green)]/10 shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                : "border-[var(--neon-red)] bg-[var(--neon-red)]/10 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
              : isFocused
              ? "border-[var(--neon-cyan)] bg-[var(--cyber-darker)] shadow-[0_0_20px_rgba(0,255,255,0.4)]"
              : "border-[var(--neon-cyan)]/50 bg-[var(--cyber-darker)]"
          }
        `}
      >
        <span
          className={`
          ${
            showValidation
              ? isCorrect
                ? "text-[var(--neon-green)]"
                : "text-[var(--neon-red)]"
              : "text-[var(--neon-cyan)]"
          }
        `}
        >
          {prefix}
        </span>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="text-readable flex-1 bg-transparent outline-none text-lg text-foreground placeholder:text-muted-foreground"
          style={{
            caretColor: "var(--neon-cyan)",
          }}
        />

        {isFocused && (
          <div
            className="cyber-caret w-2 h-5 bg-[var(--neon-cyan)]"
            style={{
              boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
            }}
          />
        )}

        {showValidation && (
          <div
            className={`px-3 py-1 rounded text-xs uppercase
              ${
                isCorrect
                  ? "bg-[var(--neon-green)] text-white"
                  : "bg-[var(--neon-red)] text-white"
              }
            `}
            style={{
              boxShadow: isCorrect
                ? "0 0 15px rgba(16, 185, 129, 0.8)"
                : "0 0 15px rgba(239, 68, 68, 0.8)",
            }}
          >
            {isCorrect ? "INPUT ACCEPTED" : "INVALID COMMAND"}
          </div>
        )}
      </div>

      {showValidation && !isCorrect && (
        <p
          className="font-mono text-xs text-[var(--neon-red)] pl-4"
        >
          {'>'} ERROR: COMMAND NOT RECOGNIZED
        </p>
      )}
    </div>
  );
}
