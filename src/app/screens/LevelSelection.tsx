import { ArrowLeft } from "lucide-react";
import { LevelCard } from "../components/LevelCard";
import { ParticleBackground } from "../components/ParticleBackground";

interface Level {
  year: number;
  isLocked: boolean;
  progress: number;
  difficulty: "Easy" | "Medium" | "Hard";
}

interface LevelSelectionProps {
  onBack: () => void;
  onSelectLevel: (year: number) => void;
  levels: Level[];
}

export function LevelSelection({ onBack, onSelectLevel, levels }: LevelSelectionProps) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-[var(--neon-cyan)] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-mono">RETURN TO MAIN TERMINAL</span>
          </button>

          <h1 className="font-orbitron text-5xl text-[var(--neon-cyan)] mb-4">
            EXAM ARCHIVES
          </h1>
          <p className="font-mono text-muted-foreground">
            {'>'} SELECT TARGET ARCHIVE TO INFILTRATE
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <div
              key={level.year}
            >
              <LevelCard
                year={level.year}
                isLocked={level.isLocked}
                progress={level.progress}
                difficulty={level.difficulty}
                onClick={() => !level.isLocked && onSelectLevel(level.year)}
              />
            </div>
          ))}
        </div>

        <div
          className="mt-12 p-6 border-2 border-[var(--neon-purple)] rounded-lg backdrop-blur-md"
          style={{ background: "rgba(15, 22, 41, 0.7)" }}
        >
          <h3 className="font-orbitron text-[var(--neon-purple)] mb-4">
            MISSION BRIEFING
          </h3>
          <div className="font-mono text-sm text-muted-foreground space-y-2">
            <p>{'>'} Each archive contains corrupted exam data from previous years</p>
            <p>{'>'} Successfully decrypt all questions to unlock the next archive</p>
            <p>{'>'} XP and achievements are awarded for accuracy and speed</p>
            <p>{'>'} System health decreases with incorrect answers</p>
          </div>
        </div>
      </div>
    </div>
  );
}
