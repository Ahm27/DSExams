import { Lock, CheckCircle2 } from "lucide-react";

interface LevelCardProps {
  year: number;
  isLocked: boolean;
  progress: number;
  difficulty: "Easy" | "Medium" | "Hard";
  onClick?: () => void;
}

export function LevelCard({
  year,
  isLocked,
  progress,
  difficulty,
  onClick,
}: LevelCardProps) {
  const difficultyColors = {
    Easy: "text-[var(--neon-green)]",
    Medium: "text-[var(--neon-cyan)]",
    Hard: "text-[var(--neon-red)]",
  };

  return (
    <div
      onClick={!isLocked ? onClick : undefined}
      className={`
        relative p-6 rounded-lg border-2 backdrop-blur-md
        transition-all duration-300
        ${
          isLocked
            ? "border-muted bg-muted/20 cursor-not-allowed opacity-50"
            : "border-[var(--neon-cyan)] bg-[var(--card)] shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] cursor-pointer"
        }
      `}
      style={
        !isLocked
          ? {
              background: "rgba(15, 22, 41, 0.7)",
            }
          : undefined
      }
    >
      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg backdrop-blur-sm">
          <Lock className="w-12 h-12 text-muted-foreground" />
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-orbitron text-[var(--neon-cyan)] uppercase tracking-wider">
            [{year} Archive]
          </h3>
          {progress === 100 && !isLocked && (
            <CheckCircle2 className="w-6 h-6 text-[var(--neon-green)]" />
          )}
        </div>

        <div className="space-y-2">
          <p className="font-mono text-sm text-muted-foreground">
            STATUS: {isLocked ? "LOCKED" : progress === 100 ? "COMPLETE" : "CORRUPTED"}
          </p>
          <p className="font-mono text-sm">
            DIFFICULTY:{" "}
            <span className={difficultyColors[difficulty]}>{difficulty}</span>
          </p>
        </div>

        {!isLocked && (
          <div className="pt-2">
            <div className="flex justify-between mb-2">
              <span className="font-mono text-xs text-muted-foreground">
                PROGRESS
              </span>
              <span className="font-mono text-xs text-[var(--neon-cyan)]">
                {progress}%
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--neon-cyan)] shadow-[0_0_10px_rgba(0,255,255,0.8)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
