import { Check, X } from "lucide-react";

interface AnswerCardProps {
  text: string;
  onClick?: () => void;
  state?: "default" | "correct" | "incorrect";
  disabled?: boolean;
  selected?: boolean;
}

export function AnswerCard({
  text,
  onClick,
  state = "default",
  disabled = false,
  selected = false,
}: AnswerCardProps) {
  const stateStyles = {
    default: "border-[var(--neon-cyan)] bg-[var(--card)] hover:shadow-[0_0_30px_rgba(0,255,255,0.5)]",
    correct: "border-[var(--neon-green)] bg-[var(--neon-green)]/20 shadow-[0_0_30px_rgba(16,185,129,0.8)]",
    incorrect: "border-[var(--neon-red)] bg-[var(--neon-red)]/20 shadow-[0_0_30px_rgba(239,68,68,0.8)]",
  };

  return (
    <button
      onClick={!disabled ? onClick : undefined}
      disabled={disabled}
      className={`
        w-full p-4 rounded-lg border-2 backdrop-blur-md
        transition-colors duration-150 text-left
        flex items-center justify-between
        ${state === "default" && selected
          ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/20 shadow-[0_0_30px_rgba(0,255,255,0.4)]"
          : stateStyles[state]}
        ${disabled || state !== "default" ? "cursor-default" : "cursor-pointer"}
      `}
      style={{
        background:
          state === "default" && !selected ? "rgba(15, 22, 41, 0.7)" : undefined,
      }}
    >
      <span className="text-readable text-lg font-semibold text-foreground">{text}</span>
      {state === "correct" && (
        <div className="flex items-center gap-2 text-[var(--neon-green)]">
          <Check className="w-6 h-6" />
          <span className="font-orbitron text-sm">ACCESS GRANTED</span>
        </div>
      )}
      {state === "incorrect" && (
        <div className="flex items-center gap-2 text-[var(--neon-red)]">
          <X className="w-6 h-6" />
          <span className="font-orbitron text-sm">ACCESS DENIED</span>
        </div>
      )}
    </button>
  );
}
