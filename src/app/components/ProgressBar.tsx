import { motion } from "motion/react";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: "cyan" | "purple" | "green" | "red";
  showPercentage?: boolean;
}

export function ProgressBar({
  value,
  max,
  label,
  color = "cyan",
  showPercentage = true,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  const colors = {
    cyan: "bg-[var(--neon-cyan)] shadow-[0_0_10px_rgba(0,255,255,0.8)]",
    purple: "bg-[var(--neon-purple)] shadow-[0_0_10px_rgba(168,85,247,0.8)]",
    green: "bg-[var(--neon-green)] shadow-[0_0_10px_rgba(16,185,129,0.8)]",
    red: "bg-[var(--neon-red)] shadow-[0_0_10px_rgba(239,68,68,0.8)]",
  };

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <span className="font-mono text-sm text-muted-foreground">{label}</span>
          {showPercentage && (
            <span className="font-mono text-sm text-[var(--neon-cyan)]">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className="h-3 bg-muted rounded-full overflow-hidden border border-border">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={`h-full ${colors[color]}`}
        />
      </div>
    </div>
  );
}
