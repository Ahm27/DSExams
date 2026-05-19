import { motion } from "motion/react";
import { Heart } from "lucide-react";

interface HealthBarProps {
  current: number;
  max: number;
}

export function HealthBar({ current, max }: HealthBarProps) {
  const percentage = Math.max((current / max) * 100, 0);
  const color =
    percentage > 50
      ? "var(--neon-green)"
      : percentage > 25
      ? "var(--neon-cyan)"
      : "var(--neon-red)";

  return (
    <div className="flex items-center gap-3">
      <Heart className="w-5 h-5" style={{ color }} />
      <div className="flex-1">
        <div className="h-3 bg-muted rounded-full overflow-hidden border border-border">
          <motion.div
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.3 }}
            className="h-full shadow-[0_0_10px]"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 10px ${color}`,
            }}
          />
        </div>
      </div>
      <span className="font-mono text-sm min-w-[60px]">
        {current}/{max}
      </span>
    </div>
  );
}
