import { motion } from "motion/react";
import { Trophy, Award, Star, Zap } from "lucide-react";

interface AchievementBadgeProps {
  title: string;
  description: string;
  icon?: "trophy" | "award" | "star" | "zap";
  unlocked?: boolean;
}

export function AchievementBadge({
  title,
  description,
  icon = "trophy",
  unlocked = true,
}: AchievementBadgeProps) {
  const icons = {
    trophy: Trophy,
    award: Award,
    star: Star,
    zap: Zap,
  };

  const Icon = icons[icon];

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: "spring", duration: 0.6 }}
      className={`
        p-4 rounded-lg border-2 backdrop-blur-md
        flex items-center gap-4
        ${
          unlocked
            ? "border-[var(--neon-cyan)] bg-[var(--card)] shadow-[0_0_20px_rgba(0,255,255,0.4)]"
            : "border-muted bg-muted/20 opacity-50"
        }
      `}
      style={
        unlocked
          ? {
              background: "rgba(15, 22, 41, 0.7)",
            }
          : undefined
      }
    >
      <div
        className={`
        p-3 rounded-full
        ${
          unlocked
            ? "bg-[var(--neon-cyan)]/20 text-[var(--neon-cyan)]"
            : "bg-muted text-muted-foreground"
        }
      `}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div className="flex-1">
        <h4 className="font-orbitron">{title}</h4>
        <p className="font-mono text-sm text-muted-foreground">{description}</p>
      </div>
    </motion.div>
  );
}
