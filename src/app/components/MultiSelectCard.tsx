import { motion } from "motion/react";
import { CheckSquare, Square } from "lucide-react";

interface MultiSelectCardProps {
  id: string;
  content: string;
  isSelected: boolean;
  onToggle: () => void;
  isCorrect?: boolean;
  showValidation?: boolean;
  disabled?: boolean;
}

export function MultiSelectCard({
  content,
  isSelected,
  onToggle,
  isCorrect,
  showValidation = false,
  disabled = false,
}: MultiSelectCardProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, x: 5 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onToggle : undefined}
      disabled={disabled}
      className={`w-full p-4 rounded-lg border-2 text-left transition-all duration-300
        flex items-center gap-4
        ${
          showValidation
            ? isCorrect
              ? "border-[var(--neon-green)] bg-[var(--neon-green)]/20 shadow-[0_0_30px_rgba(16,185,129,0.6)]"
              : "border-[var(--neon-red)] bg-[var(--neon-red)]/20 shadow-[0_0_30px_rgba(239,68,68,0.6)]"
            : isSelected
            ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/20 shadow-[0_0_30px_rgba(0,255,255,0.5)]"
            : "border-[var(--neon-cyan)]/50 bg-[var(--card)] hover:border-[var(--neon-cyan)]"
        }
        ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
      `}
      style={{
        background: showValidation
          ? isCorrect
            ? "rgba(16, 185, 129, 0.15)"
            : "rgba(239, 68, 68, 0.15)"
          : isSelected
          ? "rgba(0, 255, 255, 0.15)"
          : "rgba(15, 22, 41, 0.7)",
      }}
    >
      <motion.div
        animate={
          isSelected
            ? {
                scale: [1, 1.1, 1],
              }
            : {}
        }
        transition={{ duration: 0.3 }}
      >
        {isSelected ? (
          <CheckSquare
            className={`w-6 h-6 ${
              showValidation
                ? isCorrect
                  ? "text-[var(--neon-green)]"
                  : "text-[var(--neon-red)]"
                : "text-[var(--neon-cyan)]"
            }`}
          />
        ) : (
          <Square className="w-6 h-6 text-muted-foreground" />
        )}
      </motion.div>

      <span className="text-readable flex-1 text-lg font-semibold text-foreground">{content}</span>

      {showValidation && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`px-3 py-1 rounded-full font-mono text-xs uppercase
            ${isCorrect ? "bg-[var(--neon-green)]" : "bg-[var(--neon-red)]"}
            text-white
          `}
          style={{
            boxShadow: isCorrect
              ? "0 0 15px rgba(16, 185, 129, 0.8)"
              : "0 0 15px rgba(239, 68, 68, 0.8)",
          }}
        >
          {isCorrect ? "VALID" : "INVALID"}
        </motion.div>
      )}
    </motion.button>
  );
}
