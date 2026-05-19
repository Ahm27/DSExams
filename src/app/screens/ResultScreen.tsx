import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { Trophy, Target, Zap, RotateCcw, ArrowLeft } from "lucide-react";
import { CyberButton } from "../components/CyberButton";
import { NeonCard } from "../components/NeonCard";
import { AchievementBadge } from "../components/AchievementBadge";
import { ParticleBackground } from "../components/ParticleBackground";
import { useAudioManager } from "../lib/audio";

interface ResultScreenProps {
  year: number;
  score: number;
  totalQuestions: number;
  xp: number;
  accuracy: number;
  onReplay: () => void;
  onBackToLevels: () => void;
}

export function ResultScreen({
  year,
  score,
  totalQuestions,
  xp,
  accuracy,
  onReplay,
  onBackToLevels,
}: ResultScreenProps) {
  const { playSound } = useAudioManager();
  const playedResultSoundRef = useRef(false);

  useEffect(() => {
    if (playedResultSoundRef.current) {
      return;
    }

    playedResultSoundRef.current = true;
    playSound(accuracy > 50 ? "win" : "fail");
  }, [accuracy, playSound]);

  const getRank = () => {
    if (accuracy >= 90) return {
      title: "ROOT ACCESS ENGINEER",
      color: "cyan",
      description: "Elite performance. System compromised.",
    };
    if (accuracy >= 70) return {
      title: "ALGORITHM HACKER",
      color: "purple",
      description: "Strong execution. Protocols breached.",
    };
    if (accuracy >= 50) return {
      title: "JUNIOR DEBUGGER",
      color: "green",
      description: "Moderate success. Access partial.",
    };
    return {
      title: "SYSTEM CORRUPTED",
      color: "red",
      description: "Mission failed. Retry recommended.",
    };
  };

  const rank = getRank();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="font-orbitron text-6xl text-[var(--neon-cyan)] mb-4">
              MISSION COMPLETE
            </h1>
            <p className="font-mono text-xl text-muted-foreground">
              ARCHIVE {year} DECRYPTED
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <NeonCard glowColor={rank.color as any} className="text-center">
            <div className="mb-4">
              <Trophy className={`w-16 h-16 mx-auto text-[var(--neon-${rank.color})]`} />
            </div>
            <h2 className="font-orbitron text-3xl mb-2" style={{ color: `var(--neon-${rank.color})` }}>
              {rank.title}
            </h2>
            <p className="font-mono text-sm text-muted-foreground">{rank.description}</p>
          </NeonCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          <NeonCard glowColor="cyan">
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-3 text-[var(--neon-cyan)]" />
              <p className="font-mono text-xs text-muted-foreground mb-1">FINAL SCORE</p>
              <p className="font-orbitron text-3xl text-[var(--neon-cyan)]">
                {score}/{totalQuestions}
              </p>
            </div>
          </NeonCard>

          <NeonCard glowColor="purple">
            <div className="text-center">
              <Zap className="w-8 h-8 mx-auto mb-3 text-[var(--neon-purple)]" />
              <p className="font-mono text-xs text-muted-foreground mb-1">XP EARNED</p>
              <p className="font-orbitron text-3xl text-[var(--neon-purple)]">+{xp}</p>
            </div>
          </NeonCard>

          <NeonCard glowColor="green">
            <div className="text-center">
              <Trophy className="w-8 h-8 mx-auto mb-3 text-[var(--neon-green)]" />
              <p className="font-mono text-xs text-muted-foreground mb-1">ACCURACY</p>
              <p className="font-orbitron text-3xl text-[var(--neon-green)]">{accuracy}%</p>
            </div>
          </NeonCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mb-8"
        >
          <h3 className="font-orbitron text-2xl text-[var(--neon-cyan)] mb-4">
            ACHIEVEMENTS UNLOCKED
          </h3>
          <div className="space-y-3">
            <AchievementBadge
              title="First Blood"
              description="Complete your first exam archive"
              icon="trophy"
              unlocked={true}
            />
            {accuracy >= 90 && (
              <AchievementBadge
                title="Perfect Execution"
                description="Achieve 90%+ accuracy"
                icon="star"
                unlocked={true}
              />
            )}
            {xp >= 300 && (
              <AchievementBadge
                title="XP Hunter"
                description="Earn 300+ XP in a single mission"
                icon="zap"
                unlocked={true}
              />
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex gap-4 justify-center"
        >
          <CyberButton onClick={onReplay} variant="secondary">
            <RotateCcw className="w-5 h-5 mr-2" />
            Replay Mission
          </CyberButton>
          <CyberButton onClick={onBackToLevels}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Archives
          </CyberButton>
        </motion.div>
      </div>
    </div>
  );
}
