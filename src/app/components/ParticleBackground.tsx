import { memo, useMemo } from "react";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  duration: number;
}

export const ParticleBackground = memo(function ParticleBackground() {
  const particles = useMemo<Particle[]>(() => {
    const particleCount =
      typeof window !== "undefined" && window.innerWidth < 768 ? 6 : 10;

    return Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2 + 1,
      duration: Math.random() * 16 + 10,
    }));
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full bg-[var(--neon-cyan)]"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            opacity: 0.18,
            boxShadow: `0 0 ${particle.size * 2}px rgba(0, 255, 255, 0.28)`,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--neon-purple)]/4 to-transparent" />
    </div>
  );
});
