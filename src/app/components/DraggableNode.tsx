import { GripVertical, Trash2 } from "lucide-react";
import { useEffect, useRef, useState, type PointerEvent } from "react";

interface DraggableNodeProps {
  id: string;
  label: string;
  x: number;
  y: number;
  variant?: "default" | "mapRow";
  width?: number;
  height?: number;
  dragBounds?: { top: number; left: number; right: number; bottom: number };
  onMove?: (id: string, x: number, y: number) => void;
  onDelete?: (id: string) => void;
  isConnected?: boolean;
  isSelected?: boolean;
  onClick?: (id: string) => void;
}

export function DraggableNode({
  id,
  label,
  x,
  y,
  variant = "default",
  width = 120,
  height = 120,
  dragBounds = { top: 0, left: 0, right: 800, bottom: 600 },
  onMove,
  onDelete,
  isConnected = false,
  isSelected = false,
  onClick,
}: DraggableNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x, y });
  const dragStartRef = useRef({ pointerX: 0, pointerY: 0, x: 0, y: 0 });
  const currentPositionRef = useRef({ x, y });
  const movedRef = useRef(false);
  const [mapKey, mapValue] = label.split(":");
  const displayPosition = isDragging ? dragPosition : { x, y };

  useEffect(() => {
    if (!isDragging) {
      setDragPosition({ x, y });
      currentPositionRef.current = { x, y };
    }
  }, [isDragging, x, y]);

  const clampPosition = (nextX: number, nextY: number) => ({
    x: Math.min(Math.max(nextX, dragBounds.left), dragBounds.right),
    y: Math.min(Math.max(nextY, dragBounds.top), dragBounds.bottom),
  });

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    movedRef.current = false;
    dragStartRef.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x,
      y,
    };
    currentPositionRef.current = { x, y };
    setDragPosition({ x, y });
    setIsDragging(true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }

    const deltaX = event.clientX - dragStartRef.current.pointerX;
    const deltaY = event.clientY - dragStartRef.current.pointerY;
    if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
      movedRef.current = true;
    }

    const nextPosition = clampPosition(
      dragStartRef.current.x + deltaX,
      dragStartRef.current.y + deltaY,
    );
    currentPositionRef.current = nextPosition;
    setDragPosition(nextPosition);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!isDragging) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);
    setIsDragging(false);
    onMove?.(id, currentPositionRef.current.x, currentPositionRef.current.y);
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onClick={() => {
        if (!movedRef.current) {
          onClick?.(id);
        }
      }}
      className={`absolute cursor-move group`}
      style={{
        width,
        height,
        transform: `translate(${displayPosition.x}px, ${displayPosition.y}px) scale(${isDragging ? 1.05 : 1})`,
        touchAction: "none",
      }}
    >
      <div
        className={`relative w-full h-full rounded-lg border-2 backdrop-blur-md
          flex flex-col items-center justify-center gap-2
          transition-all duration-300
          ${
            isSelected
              ? "border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/20 shadow-[0_0_30px_rgba(0,255,255,0.8)]"
              : isConnected
              ? "border-[var(--neon-green)] bg-[var(--neon-green)]/10 shadow-[0_0_20px_rgba(16,185,129,0.5)]"
              : "border-[var(--neon-purple)] bg-[var(--card)] shadow-[0_0_20px_rgba(168,85,247,0.3)]"
          }
        `}
        style={{
          background: isSelected
            ? "rgba(0, 255, 255, 0.2)"
            : "rgba(15, 22, 41, 0.8)",
        }}
      >
        <GripVertical className="w-5 h-5 text-muted-foreground opacity-50 group-hover:opacity-100 transition-opacity" />

        {variant === "mapRow" ? (
          <div className="w-full px-4">
            <div className="grid grid-cols-[1fr_1fr] rounded-md overflow-hidden border border-[var(--neon-cyan)]/20">
              <div className="px-3 py-2 text-center border-r border-[var(--neon-cyan)]/20">
                <span
                  className={`font-orbitron ${
                    isSelected ? "text-[var(--neon-cyan)]" : "text-foreground"
                  }`}
                >
                  {mapKey ?? label}
                </span>
              </div>
              <div className="px-3 py-2 text-center">
                <span
                  className={`font-orbitron ${
                    isSelected ? "text-[var(--neon-cyan)]" : "text-foreground"
                  }`}
                >
                  {mapValue ?? ""}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <span
              className={`font-orbitron ${
                isSelected ? "text-[var(--neon-cyan)]" : "text-foreground"
              }`}
            >
              {label}
            </span>
          </div>
        )}

        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(id);
            }}
            className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-[var(--neon-red)]
                     border-2 border-white/20 flex items-center justify-center opacity-100
                     transition-colors shadow-[0_0_14px_rgba(239,68,68,0.9)] z-20
                     hover:bg-[var(--neon-red)]/90"
            aria-label={`Delete node ${label}`}
          >
            <Trash2 className="w-4 h-4 text-white" />
          </button>
        )}

        {isSelected && (
          <div className="cyber-pulse absolute inset-0 rounded-lg border-2 border-[var(--neon-cyan)]" />
        )}
      </div>
    </div>
  );
}
