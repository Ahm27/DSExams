import { useEffect, useMemo, useState } from "react";

interface MatchingItem {
  id: string;
  content: string;
}

interface MatchingConnectorProps {
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
  correctMatches: Record<string, string>;
  onValidate?: (isCorrect: boolean) => void;
}

export function MatchingConnector({
  leftItems,
  rightItems,
  correctMatches,
  onValidate,
}: MatchingConnectorProps) {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, string>>({});
  const [validated, setValidated] = useState(false);

  useEffect(() => {
    setSelectedLeft(null);
    setMatches({});
    setValidated(false);
  }, [leftItems, rightItems, correctMatches]);

  const rightIds = useMemo(() => new Set(rightItems.map((item) => item.id)), [rightItems]);

  const handleLeftClick = (id: string) => {
    if (validated) {
      return;
    }

    setSelectedLeft((current) => (current === id ? null : id));
  };

  const handleRightClick = (id: string) => {
    if (validated || !selectedLeft || !rightIds.has(id)) {
      return;
    }

    setMatches((current) => {
      const nextMatches = { ...current };

      for (const [leftId, rightId] of Object.entries(nextMatches)) {
        if (rightId === id) {
          delete nextMatches[leftId];
        }
      }

      nextMatches[selectedLeft] = id;
      return nextMatches;
    });
    setSelectedLeft(null);
  };

  const handleValidate = () => {
    if (validated || leftItems.length === 0 || Object.keys(matches).length !== leftItems.length) {
      return;
    }

    setValidated(true);
    const isCorrect = leftItems.every((item) => matches[item.id] === correctMatches[item.id]);
    onValidate?.(isCorrect);
  };

  const handleReset = () => {
    setMatches({});
    setValidated(false);
    setSelectedLeft(null);
  };

  const isMatchCorrect = (leftId: string) => {
    if (!validated) {
      return null;
    }

    return matches[leftId] === correctMatches[leftId];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-xs uppercase tracking-wider text-[var(--neon-purple)]">
          NODE-LINK MATCHING PROTOCOL
        </span>
        {!validated ? (
          <button
            onClick={handleValidate}
            disabled={Object.keys(matches).length !== leftItems.length || leftItems.length === 0}
            className="rounded-md border border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/20 px-4 py-2 font-mono text-sm transition-colors hover:bg-[var(--neon-cyan)]/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            VALIDATE LINKS
          </button>
        ) : (
          <button
            onClick={handleReset}
            className="rounded-md border border-[var(--neon-purple)] bg-[var(--neon-purple)]/20 px-4 py-2 font-mono text-sm transition-colors hover:bg-[var(--neon-purple)]/30"
          >
            RESET NETWORK
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-3">
          <p className="mb-4 font-mono text-xs text-muted-foreground">SOURCE NODES</p>
          {leftItems.map((item) => {
            const matchCorrect = isMatchCorrect(item.id);
            const isMatched = matches[item.id] !== undefined;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLeftClick(item.id)}
                className={`relative w-full rounded-lg border-2 p-4 text-left transition-all ${
                  selectedLeft === item.id
                    ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/20 shadow-[0_0_18px_rgba(0,255,255,0.35)]"
                    : validated && matchCorrect === true
                    ? "border-[var(--neon-green)] bg-[var(--neon-green)]/15"
                    : validated && matchCorrect === false
                    ? "border-[var(--neon-red)] bg-[var(--neon-red)]/15"
                    : isMatched
                    ? "border-[var(--neon-cyan)] bg-[var(--card)]"
                    : "border-[var(--neon-cyan)]/50 bg-[var(--card)] hover:border-[var(--neon-cyan)]"
                } ${validated ? "cursor-default" : "cursor-pointer"}`}
                disabled={validated}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      validated && matchCorrect === true
                        ? "bg-[var(--neon-green)]"
                        : validated && matchCorrect === false
                        ? "bg-[var(--neon-red)]"
                        : isMatched
                        ? "bg-[var(--neon-cyan)]"
                        : "bg-muted"
                    }`}
                  />
                  <span className="flex-1 font-mono">{item.content}</span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="space-y-3">
          <p className="mb-4 font-mono text-xs text-muted-foreground">DESTINATION NODES</p>
          {rightItems.map((item) => {
            const isLinked = Object.values(matches).includes(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleRightClick(item.id)}
                disabled={validated || !selectedLeft}
                className={`w-full rounded-lg border-2 p-4 text-left transition-all ${
                  selectedLeft && !validated
                    ? "border-[var(--neon-purple)] bg-[var(--card)] hover:bg-[var(--neon-purple)]/20"
                    : isLinked
                    ? "border-[var(--neon-purple)] bg-[var(--card)]"
                    : "border-[var(--neon-purple)]/30 bg-muted/20"
                } ${validated || !selectedLeft ? "cursor-not-allowed opacity-80" : "cursor-pointer"}`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-3 w-3 rounded-full ${
                      isLinked ? "bg-[var(--neon-purple)]" : "bg-muted"
                    }`}
                  />
                  <span className="flex-1 font-mono">{item.content}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {Object.keys(matches).length > 0 && (
        <div className="rounded-lg border border-[var(--neon-cyan)]/30 bg-muted/20 p-4">
          <p className="mb-3 font-mono text-xs uppercase tracking-wider text-[var(--neon-cyan)]">
            Active Links
          </p>
          <div className="space-y-2">
            {leftItems
              .filter((item) => matches[item.id])
              .map((item) => {
                const rightItem = rightItems.find((candidate) => candidate.id === matches[item.id]);
                return (
                  <div
                    key={`link-${item.id}`}
                    className="font-mono text-sm text-foreground/85"
                  >
                    {item.content} {"->"} {rightItem?.content ?? "Unknown target"}
                  </div>
                );
              })}
          </div>
        </div>
      )}

      <div className="rounded-lg border border-[var(--neon-cyan)]/30 bg-muted/20 p-4">
        <p className="font-mono text-xs text-muted-foreground">
          {">"} CLICK A SOURCE NODE, THEN CLICK ITS MATCH
          <br />
          {">"} CLICK THE SAME SOURCE AGAIN TO CANCEL SELECTION
          <br />
          {">"} COMPLETE ALL LINKS BEFORE VALIDATION
        </p>
      </div>
    </div>
  );
}
