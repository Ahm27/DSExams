import { Plus, RotateCcw, Send } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { DraggableNode } from "./DraggableNode";
import { CyberButton } from "./CyberButton";

interface Node {
  id: string;
  label: string;
  x: number;
  y: number;
}

interface Connection {
  from: string;
  to: string;
}

interface DiagramZone {
  id: string;
  labels: string[];
}

interface DiagramConnection {
  from: string;
  to: string;
}

interface MapRow {
  id: string;
  key: string;
  value: string;
}

export interface DiagramSubmitResult {
  correct: boolean;
  summary: string;
  actualByZone: Record<string, string[]>;
  expectedByZone: Record<string, string[]>;
}

interface GraphWorkspaceProps {
  diagramType?: "stack" | "queueVector" | "linkedList" | "map" | "bst" | "circularQueue";
  initialNodes?: string[];
  expectedZones?: DiagramZone[];
  expectedConnections?: DiagramConnection[];
  expectedCircularQueueState?: {
    front: number;
    back: number;
    slots: number;
  };
  onSubmit?: (result: DiagramSubmitResult) => void;
}

interface ZoneRect {
  id: string;
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const WORKSPACE_WIDTH = 860;
const WORKSPACE_HEIGHT = 500;
const DEFAULT_NODE_WIDTH = 120;
const DEFAULT_NODE_HEIGHT = 72;
const MAP_NODE_WIDTH = 240;
const MAP_NODE_HEIGHT = 72;

function normalizeLabel(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function createNode(id: string, label: string, index: number): Node {
  const offset = index % 4;

  return {
    id,
    label,
    x: 40 + offset * 28,
    y: 400 - Math.floor(index / 4) * 84,
  };
}

function createMapRow(id: string, raw = ""): MapRow {
  const [key = "", value = ""] = raw.split(":");
  return { id, key: key.trim(), value: value.trim() };
}

function getNodeDimensions(diagramType: GraphWorkspaceProps["diagramType"]) {
  if (diagramType === "map") {
    return { width: MAP_NODE_WIDTH, height: MAP_NODE_HEIGHT };
  }

  return { width: DEFAULT_NODE_WIDTH, height: DEFAULT_NODE_HEIGHT };
}

function getModeCopy(diagramType: GraphWorkspaceProps["diagramType"]) {
  switch (diagramType) {
    case "queueVector":
      return {
        title: "QUEUE / VECTOR MODE",
        hints: [
          "1. CLICK A SOURCE BOX TO DEPLOY A NODE",
          "2. DRAG NODES INTO THE QUEUE OR VECTOR AREA",
          "3. ADD A NEW VALUE WITH THE INPUT IF NEEDED",
          "4. USE THE RED DELETE BUTTON TO REMOVE A NODE",
          "5. SUBMIT TO AUTO-CHECK AND REVEAL",
        ],
      };
    case "linkedList":
      return {
        title: "LINKED LIST MODE",
        hints: [
          "1. CLICK A SOURCE BOX OR ADD A NEW NODE VALUE",
          "2. DRAG NODES INTO LIST ORDER FROM LEFT TO RIGHT",
          "3. CLICK THE CURRENT NODE, THEN CLICK ITS NEXT NODE",
          "4. EACH NODE ALLOWS ONLY ONE NEXT POINTER",
          "5. USE THE RED DELETE BUTTON TO REMOVE A NODE",
          "6. SUBMIT TO AUTO-CHECK AND REVEAL",
        ],
      };
    case "map":
      return {
        title: "MAP MODE",
        hints: [
          "1. FORMAT NEW ENTRIES AS key:value",
          "2. CLICK A CHIP TO FILL THE NEXT EMPTY TABLE ROW",
          "3. OR TYPE DIRECTLY IN THE KEY/VALUE TABLE CELLS",
          "4. USE THE RED DELETE BUTTON TO CLEAR A ROW",
          "5. SUBMIT TO AUTO-CHECK AND REVEAL",
        ],
      };
    default:
      return {
        title: "STACK MODE",
        hints: [
          "1. STACK STARTS EMPTY",
          "2. CLICK A SOURCE BOX OR ADD A NEW VALUE",
          "3. DRAG NODES INTO THE STACK AREA FROM TOP TO BOTTOM",
          "4. USE THE RED DELETE BUTTON TO REMOVE A NODE",
          "5. SUBMIT TO AUTO-CHECK AND REVEAL",
        ],
      };
  }
}

function getZoneRects(diagramType: GraphWorkspaceProps["diagramType"]): ZoneRect[] {
  switch (diagramType) {
    case "queueVector":
      return [
        { id: "queue", left: 130, top: 72, right: 520, bottom: 192 },
        { id: "vector", left: 130, top: 252, right: 690, bottom: 372 },
      ];
    case "linkedList":
      return [{ id: "list", left: 68, top: 140, right: 810, bottom: 320 }];
    case "map":
      return [{ id: "map", left: 98, top: 76, right: 620, bottom: 420 }];
    default:
      return [{ id: "stack", left: 340, top: 60, right: 520, bottom: 420 }];
  }
}

function sortLabelsForZone(zoneId: string, zoneNodes: Node[]) {
  return sortNodesForZone(zoneId, zoneNodes).map((node) => node.label);
}

function sortNodesForZone(zoneId: string, zoneNodes: Node[]) {
  const nodes = [...zoneNodes];

  if (zoneId === "stack") {
    return nodes.sort((left, right) => left.y - right.y);
  }

  if (zoneId === "map") {
    return nodes.sort((left, right) => (left.y === right.y ? left.x - right.x : left.y - right.y));
  }

  return nodes.sort((left, right) => left.x - right.x);
}

function ModeGuides({ diagramType }: { diagramType?: GraphWorkspaceProps["diagramType"] }) {
  if (diagramType === "stack") {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[340px] top-[60px] h-[360px] w-[180px] rounded-2xl border-2 border-[var(--neon-cyan)]/30" />
        <div className="absolute left-[395px] top-[24px] font-mono text-xs text-[var(--neon-cyan)]">TOP</div>
      </div>
    );
  }

  if (diagramType === "queueVector") {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[130px] top-[72px] h-[120px] w-[390px] rounded-2xl border-2 border-[var(--neon-cyan)]/30" />
        <div className="absolute left-[130px] top-[252px] h-[120px] w-[560px] rounded-2xl border-2 border-[var(--neon-purple)]/30" />
        <div className="absolute left-[146px] top-[44px] font-mono text-xs text-[var(--neon-cyan)]">QUEUE X</div>
        <div className="absolute left-[146px] top-[224px] font-mono text-xs text-[var(--neon-purple)]">VECTOR Y</div>
      </div>
    );
  }

  if (diagramType === "linkedList") {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[68px] top-[240px] right-[70px] border-t-2 border-dashed border-[var(--neon-cyan)]/30" />
        <div className="absolute left-[70px] top-[200px] font-mono text-xs text-[var(--neon-cyan)]">HEAD</div>
      </div>
    );
  }

  if (diagramType === "map") {
    return (
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[98px] top-[76px] h-[344px] w-[522px] rounded-2xl border-2 border-[var(--neon-green)]/20" />
        <div className="absolute left-[359px] top-[76px] h-[344px] border-l-2 border-[var(--neon-green)]/15" />
        {[145, 214, 283, 352].map((top) => (
          <div
            key={top}
            className="absolute left-[98px] w-[522px] border-t border-[var(--neon-green)]/10"
            style={{ top }}
          />
        ))}
        <div className="absolute left-[128px] top-[48px] font-mono text-xs text-[var(--neon-green)]">HASH TABLE</div>
        <div className="absolute left-[180px] top-[94px] font-mono text-xs text-[var(--neon-green)]">KEY</div>
        <div className="absolute left-[440px] top-[94px] font-mono text-xs text-[var(--neon-green)]">VALUE</div>
      </div>
    );
  }

  return null;
}

function formatZoneValues(values: string[]) {
  return values.length === 0 ? "empty" : values.join(" | ");
}

export function GraphWorkspace({
  diagramType = "stack",
  initialNodes = [],
  expectedZones = [],
  expectedConnections = [],
  onSubmit,
}: GraphWorkspaceProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [customNodeValue, setCustomNodeValue] = useState("");
  const [nextNodeNum, setNextNodeNum] = useState(1);
  const [mapRows, setMapRows] = useState<MapRow[]>([]);
  const modeCopy = getModeCopy(diagramType);
  const zoneRects = useMemo(() => getZoneRects(diagramType), [diagramType]);
  const allowConnections = diagramType === "linkedList";
  const nodeSize = useMemo(() => getNodeDimensions(diagramType), [diagramType]);
  const isMapMode = diagramType === "map";

  useEffect(() => {
    setNodes([]);
    setConnections([]);
    setSelectedNode(null);
    setCustomNodeValue("");
    setNextNodeNum(1);
    setMapRows(Array.from({ length: Math.max(initialNodes.length, 5) }, (_, index) => createMapRow(`row-${index + 1}`)));
  }, [diagramType, initialNodes, expectedZones]);

  const deployNode = (label: string) => {
    const value = label.trim();
    if (!value) {
      return;
    }

    if (isMapMode) {
      setMapRows((previous) => {
        const [key = "", rowValue = ""] = value.split(":");
        const next = [...previous];
        const emptyIndex = next.findIndex((row) => row.key.trim() === "" && row.value.trim() === "");

        if (emptyIndex >= 0) {
          next[emptyIndex] = {
            ...next[emptyIndex],
            key: key.trim(),
            value: rowValue.trim(),
          };
          return next;
        }

        return [...next, createMapRow(`row-${next.length + 1}`, value)];
      });
      return;
    }

    const nodeId = `node-${nextNodeNum}`;
    setNodes((previous) => [...previous, createNode(nodeId, value, previous.length)]);
    setNextNodeNum((current) => current + 1);
  };

  const handleDeleteNode = (id: string) => {
    setNodes((previous) => previous.filter((node) => node.id !== id));
    setConnections((previous) =>
      previous.filter((connection) => connection.from !== id && connection.to !== id),
    );
  };

  const handleNodeMove = (id: string, x: number, y: number) => {
    setNodes((previous) => previous.map((node) => (node.id === id ? { ...node, x, y } : node)));
  };

  const handleNodeClick = (id: string) => {
    if (!allowConnections) {
      return;
    }

    if (selectedNode === null) {
      setSelectedNode(id);
      return;
    }

    if (selectedNode === id) {
      setSelectedNode(null);
      return;
    }

    setConnections((previous) => {
      const withoutSourceOutgoing = previous.filter((connection) => connection.from !== selectedNode);
      const withoutTargetIncoming = withoutSourceOutgoing.filter((connection) => connection.to !== id);
      const withoutReverse = withoutTargetIncoming.filter(
        (connection) => !(connection.from === id && connection.to === selectedNode),
      );

      return [...withoutReverse, { from: selectedNode, to: id }];
    });

    setSelectedNode(null);
  };

  const handleReset = () => {
    setNodes([]);
    setConnections([]);
    setSelectedNode(null);
    setCustomNodeValue("");
    setNextNodeNum(1);
    setMapRows(Array.from({ length: Math.max(initialNodes.length, 5) }, (_, index) => createMapRow(`row-${index + 1}`)));
  };

  const getNodePosition = (id: string) => {
    const node = nodes.find((item) => item.id === id);
    return node
      ? { x: node.x + nodeSize.width / 2, y: node.y + nodeSize.height / 2 }
      : { x: 0, y: 0 };
  };

  const handleSubmit = () => {
    const actualByZone: Record<string, string[]> = {};
    const expectedByZone: Record<string, string[]> = {};

    if (isMapMode) {
      const actualRows = mapRows
        .map((row) => `${row.key.trim()}:${row.value.trim()}`)
        .filter((row) => row !== ":")
        .map(normalizeLabel)
        .sort();
      const expectedRows = (expectedZones[0]?.labels ?? []).map(normalizeLabel).sort();
      const correct = JSON.stringify(actualRows) === JSON.stringify(expectedRows);

      actualByZone.map = mapRows
        .map((row) => `${row.key.trim()}:${row.value.trim()}`)
        .filter((row) => row !== ":");
      expectedByZone.map = expectedZones[0]?.labels ?? [];

      onSubmit?.({
        correct,
        summary: correct
          ? "Reconstruction matches the expected final structure."
          : `MAP: ${formatZoneValues(actualByZone.map)} / EXPECTED: ${formatZoneValues(expectedByZone.map)}`,
        actualByZone,
        expectedByZone,
      });
      return;
    }

    const zoneNodes = new Map<string, Node[]>();
    const outsideNodes: string[] = [];

    for (const zone of zoneRects) {
      zoneNodes.set(zone.id, []);
    }

    for (const node of nodes) {
      const centerY = node.y + nodeSize.height / 2;
      const centerAdjustedX = node.x + nodeSize.width / 2;
      const zone = zoneRects.find(
        (item) =>
          centerAdjustedX >= item.left &&
          centerAdjustedX <= item.right &&
          centerY >= item.top &&
          centerY <= item.bottom,
      );

      if (!zone) {
        outsideNodes.push(node.label);
        continue;
      }

      zoneNodes.get(zone.id)?.push(node);
    }

    let correct = outsideNodes.length === 0;
    let connectionSummary = "";

    for (const zone of expectedZones) {
      const actualLabels = sortLabelsForZone(zone.id, zoneNodes.get(zone.id) ?? []);
      const expectedLabels = zone.labels;
      actualByZone[zone.id] = actualLabels;
      expectedByZone[zone.id] = expectedLabels;

      const actualSignature = actualLabels.map(normalizeLabel);
      const expectedSignature = expectedLabels.map(normalizeLabel);
      if (JSON.stringify(actualSignature) !== JSON.stringify(expectedSignature)) {
        correct = false;
      }
    }

    if (allowConnections && expectedConnections.length > 0) {
      const linkedListNodes = sortNodesForZone("list", zoneNodes.get("list") ?? []);
      const expectedConnectionCount = expectedConnections.length;
      const actualConnections = linkedListNodes.slice(0, -1).map((node, index) => {
        const nextNode = linkedListNodes[index + 1];
        const connected = connections.some(
          (connection) =>
            connection.from === node.id && connection.to === nextNode.id,
        );

        return {
          from: node.label,
          to: nextNode.label,
          connected,
        };
      });
      const expected = expectedConnections
        .map((connection) => ({
          from: connection.from,
          to: connection.to,
        }))
        .map((connection) => `${connection.from}->${connection.to}`);
      const allExpectedLinksPresent = actualConnections.every((connection) => connection.connected);
      const noExtraLinks = connections.length === expectedConnectionCount;

      if (!allExpectedLinksPresent || !noExtraLinks) {
        correct = false;
        connectionSummary = `LINKS: ${actualConnections
          .map((connection) => `${connection.from}->${connection.to}${connection.connected ? "" : " (missing)"}`)
          .join(" | ") || "empty"} / EXPECTED: ${expected.join(" | ")}`;
      }
    }

    const summaryParts = expectedZones.map((zone) => {
      const actual = formatZoneValues(actualByZone[zone.id] ?? []);
      const expected = formatZoneValues(expectedByZone[zone.id] ?? []);
      return `${zone.id.toUpperCase()}: ${actual} / EXPECTED: ${expected}`;
    });

    if (outsideNodes.length > 0) {
      summaryParts.push(`OUTSIDE TARGET: ${outsideNodes.join(" | ")}`);
    }

    if (connectionSummary) {
      summaryParts.push(connectionSummary);
    }

    onSubmit?.({
      correct,
      summary: correct
        ? "Reconstruction matches the expected final structure."
        : summaryParts.join(" • "),
      actualByZone,
      expectedByZone,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="flex-1">
          <span className="font-mono text-xs text-[var(--neon-purple)] uppercase tracking-wider">
            {modeCopy.title}
          </span>
          <div className="mt-3 flex flex-wrap gap-2">
            {initialNodes.map((value, index) => (
              <button
                key={`${value}-${index}`}
                onClick={() => deployNode(value)}
                className="px-3 py-2 rounded-md border border-[var(--neon-cyan)]/60 bg-[var(--neon-cyan)]/10 hover:bg-[var(--neon-cyan)]/20 transition-colors font-mono text-sm"
              >
                {value}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3 w-full xl:max-w-sm">
          <div className="flex gap-2">
            <input
              value={customNodeValue}
              onChange={(event) => setCustomNodeValue(event.target.value)}
              placeholder="New node value"
              className="flex-1 rounded-md border border-[var(--neon-purple)]/60 bg-[var(--cyber-darker)] px-3 py-2 font-mono text-sm outline-none focus:border-[var(--neon-cyan)]"
            />
            <button
              onClick={() => {
                deployNode(customNodeValue);
                setCustomNodeValue("");
              }}
              disabled={!customNodeValue.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-md border border-[var(--neon-green)] bg-[var(--neon-green)]/15 disabled:opacity-40 disabled:cursor-not-allowed font-mono text-sm"
            >
              <Plus className="w-4 h-4" />
              ADD
            </button>
          </div>

          <div className="flex gap-2 justify-end">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--neon-purple)]/20 border border-[var(--neon-purple)] rounded-md hover:bg-[var(--neon-purple)]/30 transition-colors font-mono text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              RESET
            </button>
          </div>
        </div>
      </div>

      <div
        className="relative rounded-lg border-2 border-[var(--neon-purple)] overflow-hidden"
        style={{
          height: WORKSPACE_HEIGHT,
          background: "rgba(5, 8, 18, 0.9)",
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(168, 85, 247, 0.1) 19px, rgba(168, 85, 247, 0.1) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(168, 85, 247, 0.1) 19px, rgba(168, 85, 247, 0.1) 20px)",
        }}
      >
        <ModeGuides diagramType={diagramType} />

        {!isMapMode && <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {allowConnections && (
            <defs>
              <marker
                id="linked-list-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="8"
                markerHeight="8"
                orient="auto"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--neon-cyan)" />
              </marker>
            </defs>
          )}
          {connections.map((connection, index) => {
            const from = getNodePosition(connection.from);
            const to = getNodePosition(connection.to);

            return (
              <line
                key={`${connection.from}-${connection.to}-${index}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke="var(--neon-cyan)"
                strokeWidth="2"
                markerEnd={allowConnections ? "url(#linked-list-arrow)" : undefined}
                style={{ filter: "drop-shadow(0 0 5px rgba(0, 255, 255, 0.6))" }}
              />
            );
          })}
        </svg>}

        {!isMapMode && nodes.map((node) => (
          <DraggableNode
            key={node.id}
            id={node.id}
            label={node.label}
            x={node.x}
            y={node.y}
            variant={diagramType === "map" ? "mapRow" : "default"}
            width={nodeSize.width}
            height={nodeSize.height}
            dragBounds={{
              top: 0,
              left: 0,
              right: WORKSPACE_WIDTH - nodeSize.width,
              bottom: WORKSPACE_HEIGHT - nodeSize.height,
            }}
            onMove={handleNodeMove}
            onDelete={handleDeleteNode}
            isSelected={allowConnections && selectedNode === node.id}
            isConnected={allowConnections && connections.some(
              (connection) => connection.from === node.id || connection.to === node.id,
            )}
            onClick={allowConnections ? handleNodeClick : undefined}
          />
        ))}

        {isMapMode && (
          <div className="absolute left-[110px] top-[120px] w-[500px] rounded-xl border border-[var(--neon-green)]/20 overflow-hidden bg-[rgba(15,22,41,0.55)]">
            <div className="grid grid-cols-[1fr_1fr_64px] border-b border-[var(--neon-green)]/20 bg-[var(--neon-green)]/8">
              <div className="px-4 py-3 font-mono text-xs text-[var(--neon-green)]">KEY</div>
              <div className="px-4 py-3 font-mono text-xs text-[var(--neon-green)] border-l border-[var(--neon-green)]/20">VALUE</div>
              <div className="px-4 py-3 font-mono text-xs text-[var(--neon-green)] border-l border-[var(--neon-green)]/20">CLR</div>
            </div>

            {mapRows.map((row, index) => (
              <div
                key={row.id}
                className="grid grid-cols-[1fr_1fr_64px] border-b border-[var(--neon-green)]/10 last:border-b-0"
              >
                <input
                  value={row.key}
                  onChange={(event) =>
                    setMapRows((previous) =>
                      previous.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, key: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="key"
                  className="px-4 py-3 bg-transparent font-mono text-sm outline-none"
                />
                <input
                  value={row.value}
                  onChange={(event) =>
                    setMapRows((previous) =>
                      previous.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, value: event.target.value } : item,
                      ),
                    )
                  }
                  placeholder="value"
                  className="px-4 py-3 bg-transparent font-mono text-sm outline-none border-l border-[var(--neon-green)]/10"
                />
                <button
                  onClick={() =>
                    setMapRows((previous) =>
                      previous.map((item, itemIndex) =>
                        itemIndex === index ? { ...item, key: "", value: "" } : item,
                      ),
                    )
                  }
                  className="px-3 py-3 font-mono text-xs text-[var(--neon-red)] border-l border-[var(--neon-green)]/10 hover:bg-[var(--neon-red)]/10"
                >
                  DEL
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="absolute top-4 left-4 font-mono text-xs text-muted-foreground bg-[var(--cyber-darker)]/80 p-3 rounded border border-[var(--neon-purple)]/50">
          {modeCopy.hints.map((hint) => (
            <p key={hint}>{'>'} {hint}</p>
          ))}
          {allowConnections && (
            <p className="mt-2 text-[var(--neon-cyan)]">{'>'} NEW LINK REPLACES OLD NEXT/INCOMING POINTERS</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <CyberButton onClick={handleSubmit}>
          <Send className="w-5 h-5 mr-2" />
          Submit Reconstruction
        </CyberButton>
      </div>
    </div>
  );
}
