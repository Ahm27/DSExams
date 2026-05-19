import { motion } from "motion/react";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "INITIALIZING SYSTEM..." }: LoadingScreenProps) {
  return (
    <div className="min-h-screen bg-[var(--cyber-dark)] flex items-center justify-center">
      <div className="text-center space-y-6">
        <motion.div
          className="flex gap-2 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {[0, 1, 2, 3, 4].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-12 bg-[var(--neon-cyan)] rounded-full"
              animate={{
                scaleY: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                delay: index * 0.1,
              }}
              style={{
                boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
              }}
            />
          ))}
        </motion.div>

        <motion.p
          className="font-mono text-[var(--neon-cyan)]"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {message}
        </motion.p>

        <div className="font-mono text-xs text-muted-foreground space-y-1">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-1 bg-[var(--neon-cyan)] rounded-full mx-auto max-w-xs"
            style={{
              boxShadow: "0 0 10px rgba(0, 255, 255, 0.8)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
