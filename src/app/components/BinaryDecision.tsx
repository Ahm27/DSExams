import { motion } from "motion/react";
import { Check, X } from "lucide-react";

interface BinaryDecisionProps {
  onSelect: (value: boolean) => void;
  selected?: boolean | null;
  isCorrect?: boolean;
  showValidation?: boolean;
  disabled?: boolean;
}

export function BinaryDecision({
  onSelect,
  selected = null,
  isCorrect,
  showValidation = false,
  disabled = false,
}: BinaryDecisionProps) {
  return (
    <div className="space-y-4">
      <p className="font-mono text-xs text-[var(--neon-purple)] uppercase tracking-wider text-center">
        BINARY DECISION PROTOCOL
      </p>

      <div className="grid grid-cols-2 gap-6">
        <motion.button
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          onClick={() => !disabled && onSelect(true)}
          disabled={disabled}
          className={`relative p-8 rounded-lg border-2 backdrop-blur-md
            transition-all duration-300
            ${
              showValidation
                ? selected === true && isCorrect
                  ? "border-[var(--neon-green)] bg-[var(--neon-green)]/20 shadow-[0_0_50px_rgba(16,185,129,0.8)]"
                  : selected === true && !isCorrect
                  ? "border-[var(--neon-red)] bg-[var(--neon-red)]/20 shadow-[0_0_50px_rgba(239,68,68,0.8)]"
                  : "border-[var(--neon-green)]/30 bg-muted/20"
                : selected === true
                ? "border-[var(--neon-green)] bg-[var(--neon-green)]/20 shadow-[0_0_40px_rgba(16,185,129,0.6)]"
                : "border-[var(--neon-green)]/50 bg-[var(--card)] hover:border-[var(--neon-green)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            }
            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          `}
          style={{
            background:
              selected === true
                ? showValidation && !isCorrect
                  ? "rgba(239, 68, 68, 0.15)"
                  : "rgba(16, 185, 129, 0.15)"
                : "rgba(15, 22, 41, 0.7)",
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={
                selected === true
                  ? {
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }
                  : {}
              }
              transition={{ duration: 0.5 }}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center
                ${
                  showValidation && selected === true
                    ? isCorrect
                      ? "border-[var(--neon-green)] bg-[var(--neon-green)]/20"
                      : "border-[var(--neon-red)] bg-[var(--neon-red)]/20"
                    : "border-[var(--neon-green)] bg-[var(--neon-green)]/10"
                }
              `}
            >
              <Check className="w-10 h-10 text-[var(--neon-green)]" />
            </motion.div>

            <div className="text-center">
              <h3 className="font-orbitron text-2xl text-[var(--neon-green)] mb-2">
                TRUE
              </h3>
              <p className="font-mono text-xs text-muted-foreground">
                SYSTEM STATE: VALID
              </p>
            </div>
          </div>

          {selected === true && (
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-[var(--neon-green)]"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>

        <motion.button
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          onClick={() => !disabled && onSelect(false)}
          disabled={disabled}
          className={`relative p-8 rounded-lg border-2 backdrop-blur-md
            transition-all duration-300
            ${
              showValidation
                ? selected === false && isCorrect
                  ? "border-[var(--neon-green)] bg-[var(--neon-green)]/20 shadow-[0_0_50px_rgba(16,185,129,0.8)]"
                  : selected === false && !isCorrect
                  ? "border-[var(--neon-red)] bg-[var(--neon-red)]/20 shadow-[0_0_50px_rgba(239,68,68,0.8)]"
                  : "border-[var(--neon-red)]/30 bg-muted/20"
                : selected === false
                ? "border-[var(--neon-red)] bg-[var(--neon-red)]/20 shadow-[0_0_40px_rgba(239,68,68,0.6)]"
                : "border-[var(--neon-red)]/50 bg-[var(--card)] hover:border-[var(--neon-red)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]"
            }
            ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
          `}
          style={{
            background:
              selected === false
                ? showValidation && !isCorrect
                  ? "rgba(239, 68, 68, 0.15)"
                  : showValidation && isCorrect
                  ? "rgba(16, 185, 129, 0.15)"
                  : "rgba(239, 68, 68, 0.15)"
                : "rgba(15, 22, 41, 0.7)",
          }}
        >
          <div className="flex flex-col items-center gap-4">
            <motion.div
              animate={
                selected === false
                  ? {
                      rotate: [0, 360],
                      scale: [1, 1.2, 1],
                    }
                  : {}
              }
              transition={{ duration: 0.5 }}
              className={`w-20 h-20 rounded-full border-4 flex items-center justify-center
                ${
                  showValidation && selected === false
                    ? isCorrect
                      ? "border-[var(--neon-green)] bg-[var(--neon-green)]/20"
                      : "border-[var(--neon-red)] bg-[var(--neon-red)]/20"
                    : "border-[var(--neon-red)] bg-[var(--neon-red)]/10"
                }
              `}
            >
              <X className="w-10 h-10 text-[var(--neon-red)]" />
            </motion.div>

            <div className="text-center">
              <h3 className="font-orbitron text-2xl text-[var(--neon-red)] mb-2">
                FALSE
              </h3>
              <p className="font-mono text-xs text-muted-foreground">
                SYSTEM STATE: INVALID
              </p>
            </div>
          </div>

          {selected === false && (
            <motion.div
              className="absolute inset-0 rounded-lg border-2 border-[var(--neon-red)]"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.02, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          )}
        </motion.button>
      </div>
    </div>
  );
}
