import { ReactNode } from "react";

interface NeonCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "cyan" | "purple" | "green" | "red";
  onClick?: () => void;
}

export function NeonCard({
  children,
  className = "",
  glowColor = "cyan",
  onClick,
}: NeonCardProps) {
  const glowColors = {
    cyan: "shadow-[0_0_30px_rgba(0,255,255,0.3)] hover:shadow-[0_0_50px_rgba(0,255,255,0.5)] border-[var(--neon-cyan)]",
    purple: "shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_50px_rgba(168,85,247,0.5)] border-[var(--neon-purple)]",
    green: "shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:shadow-[0_0_50px_rgba(16,185,129,0.5)] border-[var(--neon-green)]",
    red: "shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_50px_rgba(239,68,68,0.5)] border-[var(--neon-red)]",
  };

  return (
    <div
      onClick={onClick}
      className={`
        bg-[var(--card)] backdrop-blur-md border-2 rounded-lg p-6
        transition-colors duration-150
        ${glowColors[glowColor]}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      style={{
        background: "rgba(15, 22, 41, 0.7)",
      }}
    >
      {children}
    </div>
  );
}
