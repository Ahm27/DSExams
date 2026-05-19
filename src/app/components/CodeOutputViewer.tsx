import { motion } from "motion/react";
import { Play, Terminal } from "lucide-react";

interface CodeOutputViewerProps {
  code: string;
  output?: string;
  language?: string;
  showRunButton?: boolean;
  onRun?: () => void;
}

export function CodeOutputViewer({
  code,
  output,
  language = "javascript",
  showRunButton = false,
  onRun,
}: CodeOutputViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal className="w-5 h-5 text-[var(--neon-cyan)]" />
          <span className="font-mono text-xs text-[var(--neon-cyan)] uppercase tracking-wider">
            CODE ANALYSIS PANEL
          </span>
        </div>
        {showRunButton && (
          <button
            onClick={onRun}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--neon-green)]/20
                     border border-[var(--neon-green)] rounded-md
                     hover:bg-[var(--neon-green)]/30 transition-colors font-mono text-sm"
          >
            <Play className="w-4 h-4" />
            RUN ANALYSIS
          </button>
        )}
      </div>

      <div
        className="rounded-lg border-2 border-[var(--neon-purple)] overflow-hidden"
        style={{ background: "rgba(5, 8, 18, 0.9)" }}
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-[var(--neon-purple)]/10 border-b border-[var(--neon-purple)]/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[var(--neon-red)]" />
            <div className="w-3 h-3 rounded-full bg-[var(--neon-cyan)]" />
            <div className="w-3 h-3 rounded-full bg-[var(--neon-green)]" />
          </div>
          <span className="font-mono text-xs text-muted-foreground ml-2">
            {language}.exe
          </span>
        </div>

        <div className="p-6 overflow-x-auto">
          <pre className="font-mono text-sm">
            <code className="text-[var(--neon-green)]">{code}</code>
          </pre>
        </div>
      </div>

      {output !== undefined && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border-2 border-[var(--neon-cyan)] overflow-hidden"
          style={{ background: "rgba(5, 8, 18, 0.9)" }}
        >
          <div className="flex items-center gap-2 px-4 py-2 bg-[var(--neon-cyan)]/10 border-b border-[var(--neon-cyan)]/30">
            <Terminal className="w-4 h-4 text-[var(--neon-cyan)]" />
            <span className="font-mono text-xs text-[var(--neon-cyan)]">
              TERMINAL OUTPUT
            </span>
          </div>

          <div className="p-6">
            <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
              {output}
            </pre>
          </div>
        </motion.div>
      )}
    </div>
  );
}
