interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "INITIALIZING SYSTEM..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-[var(--cyber-dark)] flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex gap-2 justify-center">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={index}
              className="loading-bar w-3 h-12 bg-[var(--neon-cyan)] rounded-full"
              style={{
                animationDelay: `${index * 0.1}s`,
                boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
              }}
            />
          ))}
        </div>

        <p className="cyber-soft-blink font-mono text-[var(--neon-cyan)]">
          {message}
        </p>

        <div className="font-mono text-xs text-muted-foreground space-y-1">
          <div
            className="loading-progress h-1 bg-[var(--neon-cyan)] rounded-full mx-auto max-w-xs"
            style={{
              boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
