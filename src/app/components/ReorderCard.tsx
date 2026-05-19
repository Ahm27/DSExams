import { motion } from "motion/react";
import { GripVertical, ArrowUp, ArrowDown } from "lucide-react";

interface ReorderCardProps {
  id: string;
  content: string;
  index: number;
  totalItems: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  isCorrect?: boolean;
  showValidation?: boolean;
}

export function ReorderCard({
  content,
  index,
  totalItems,
  onMoveUp,
  onMoveDown,
  isCorrect,
  showValidation = false,
}: ReorderCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`relative group`}
    >
      <div
        className={`flex items-center gap-4 p-4 rounded-lg border-2 backdrop-blur-md
          transition-all duration-300
          ${
            showValidation
              ? isCorrect
                ? "border-[var(--neon-green)] bg-[var(--neon-green)]/20 shadow-[0_0_30px_rgba(16,185,129,0.6)]"
                : "border-[var(--neon-red)] bg-[var(--neon-red)]/20 shadow-[0_0_30px_rgba(239,68,68,0.6)]"
              : "border-[var(--neon-cyan)] bg-[var(--card)] shadow-[0_0_20px_rgba(0,255,255,0.3)]"
          }
        `}
        style={{
          background: showValidation
            ? isCorrect
              ? "rgba(16, 185, 129, 0.15)"
              : "rgba(239, 68, 68, 0.15)"
            : "rgba(15, 22, 41, 0.7)",
        }}
      >
        <div
          className={`flex items-center justify-center w-10 h-10 rounded-md border-2
            ${
              showValidation
                ? isCorrect
                  ? "border-[var(--neon-green)] text-[var(--neon-green)]"
                  : "border-[var(--neon-red)] text-[var(--neon-red)]"
                : "border-[var(--neon-cyan)] text-[var(--neon-cyan)]"
            }
          `}
        >
          <span className="font-orbitron">{index + 1}</span>
        </div>

        <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />

        <div className="flex-1 font-mono">{content}</div>

        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-2 rounded bg-[var(--neon-cyan)]/20 hover:bg-[var(--neon-cyan)]/30
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowUp className="w-4 h-4 text-[var(--neon-cyan)]" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === totalItems - 1}
            className="p-2 rounded bg-[var(--neon-cyan)]/20 hover:bg-[var(--neon-cyan)]/30
                     disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ArrowDown className="w-4 h-4 text-[var(--neon-cyan)]" />
          </button>
        </div>

        {showValidation && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -right-3 -top-3"
          >
            <div
              className={`px-3 py-1 rounded-full font-mono text-xs uppercase
                ${
                  isCorrect
                    ? "bg-[var(--neon-green)] text-white"
                    : "bg-[var(--neon-red)] text-white"
                }
              `}
              style={{
                boxShadow: isCorrect
                  ? "0 0 20px rgba(16, 185, 129, 0.8)"
                  : "0 0 20px rgba(239, 68, 68, 0.8)",
              }}
            >
              {isCorrect ? "✓" : "✗"}
            </div>
          </motion.div>
        )}
      </div>

      {showValidation && !isCorrect && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute inset-0 rounded-lg border-2 border-[var(--neon-red)] pointer-events-none"
        />
      )}
    </motion.div>
  );
}
