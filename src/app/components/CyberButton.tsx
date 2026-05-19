import { ReactNode } from "react";

interface CyberButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "success" | "danger";
  disabled?: boolean;
  className?: string;
}

export function CyberButton({
  children,
  onClick,
  variant = "primary",
  disabled = false,
  className = "",
}: CyberButtonProps) {
  const variants = {
    primary: "bg-[var(--neon-cyan)] text-[var(--cyber-dark)] shadow-[0_0_20px_rgba(0,255,255,0.5)] hover:shadow-[0_0_30px_rgba(0,255,255,0.8)]",
    secondary: "bg-[var(--neon-purple)] text-white shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.8)]",
    success: "bg-[var(--neon-green)] text-white shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.8)]",
    danger: "bg-[var(--neon-red)] text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8)]",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        px-8 py-3 rounded-md font-orbitron uppercase tracking-wider
        transition-colors duration-150 relative overflow-hidden
        ${variants[variant]}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${className}
      `}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
