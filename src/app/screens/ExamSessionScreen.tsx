import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle2,
  Eye,
  XCircle,
} from "lucide-react";
import { AnswerCard } from "../components/AnswerCard";
import { BinaryDecision } from "../components/BinaryDecision";
import { CodeOutputViewer } from "../components/CodeOutputViewer";
import { CyberButton } from "../components/CyberButton";
import { FuturisticTextarea } from "../components/FuturisticTextarea";
import { GraphWorkspace, type DiagramSubmitResult } from "../components/GraphWorkspace";
import { HealthBar } from "../components/HealthBar";
import { HolographicModal } from "../components/HolographicModal";
import { MatchingConnector } from "../components/MatchingConnector";
import { MultiSelectCard } from "../components/MultiSelectCard";
import { NeonCard } from "../components/NeonCard";
import { ParticleBackground } from "../components/ParticleBackground";
import { ProgressBar } from "../components/ProgressBar";
import { ReorderCard } from "../components/ReorderCard";
import { TerminalInput } from "../components/TerminalInput";
import { useAudioManager } from "../lib/audio";
import {
  clearStoredSession,
  loadProgressStore,
  loadStoredSession,
  saveProgressStore,
  saveStoredSession,
  type StoredSession,
} from "../lib/storage";
import {
  isObjectiveQuestion,
  type DrawDiagramQuestion,
  type CompoundQuestion,
  type EssayQuestion,
  type ExamFile,
  type ExamQuestion,
  type ExamResultSummary,
  type SelfReviewRating,
} from "../../data/examTypes";

interface ExamSessionScreenProps {
  exam: ExamFile;
  onBack: () => void;
  onComplete: (result: ExamResultSummary) => void;
}

interface SessionState {
  currentIndex: number;
  health: number;
  xp: number;
  score: number;
  objectiveAnswered: number;
}

interface ObjectiveEvaluation {
  questionId: string;
  correct: boolean;
  explanation?: string;
}

interface DiagramZone {
  id: string;
  labels: string[];
}

interface DiagramExpectedConnection {
  from: string;
  to: string;
}

interface CircularQueueExpectedState {
  front: number;
  back: number;
  slots: number;
}

const OBJECTIVE_XP = 100;
const HEALTH_PENALTY = 20;

function normalizeText(value: string) {
  return value.trim().replace(/\r\n/g, "\n");
}

function normalizeLooseText(value: string) {
  return normalizeText(value).toLowerCase();
}

function normalizeCodeComparison(value: string) {
  return normalizeText(value)
    .replace(/\s+/g, " ")
    .replace(/\s*([{}();,<>=:+\-*/[\]])\s*/g, "$1")
    .toLowerCase();
}

function normalizeDiagramLabel(value: string) {
  return value.replace(/\s+/g, "").toLowerCase();
}

function getInitialSession(exam: ExamFile): SessionState {
  const saved = loadStoredSession(exam.year);

  if (!saved || saved.totalQuestions !== exam.questions.length) {
    return {
      currentIndex: 0,
      health: 100,
      xp: 0,
      score: 0,
      objectiveAnswered: 0,
    };
  }

  return {
    currentIndex: Math.min(saved.currentIndex, exam.questions.length),
    health: saved.health,
    xp: saved.xp,
    score: saved.score,
    objectiveAnswered: saved.objectiveAnswered,
  };
}

function getQuestionLabel(question: ExamQuestion) {
  switch (question.type) {
    case "mcq":
      return "MULTIPLE CHOICE";
    case "trueFalse":
      return "TRUE / FALSE";
    case "multiSelect":
      return "MULTI-SELECT";
    case "fillBlank":
      return "FILL IN THE BLANK";
    case "codeOutput":
      return "CODE OUTPUT";
    case "matching":
      return "MATCHING";
    case "arrange":
      return "ARRANGE";
    case "essay":
      return "ESSAY";
    case "compoundQuestion":
      return "COMPOUND QUESTION";
    case "drawDiagram":
      return "SYSTEM RECONSTRUCTION MODE";
  }
}

function getQuestionColor(question: ExamQuestion) {
  return question.type === "essay" ||
    question.type === "compoundQuestion" ||
    question.type === "drawDiagram"
    ? "purple"
    : "cyan";
}

function getSelfReviewXp(review: SelfReviewRating) {
  if (review === "perfect") {
    return 150;
  }

  if (review === "partial") {
    return 75;
  }

  return 25;
}

function tokenizeStatements(code?: string) {
  if (!code) {
    return [];
  }

  return code
    .split(";")
    .map((statement) => statement.trim())
    .filter(Boolean);
}

function parseLiteral(token: string) {
  const cleaned = token.trim();

  if (/^'.*'$/.test(cleaned) || /^".*"$/.test(cleaned)) {
    return cleaned.slice(1, -1);
  }

  return cleaned;
}

function buildStackExpectedZones(question: DrawDiagramQuestion): DiagramZone[] {
  const stack: string[] = [];

  for (const statement of tokenizeStatements(question.code)) {
    const pushMatch = statement.match(/\.push\((.+)\)$/);
    if (pushMatch) {
      const token = pushMatch[1].trim();
      stack.push(token.endsWith(".top()") ? stack[stack.length - 1] ?? "" : parseLiteral(token));
      continue;
    }

    if (/\.pop\(\)$/.test(statement)) {
      stack.pop();
    }
  }

  return [{ id: "stack", labels: [...stack].reverse() }];
}

function buildQueueVectorExpectedZones(question: DrawDiagramQuestion): DiagramZone[] {
  const queue: string[] = [];
  const vector: string[] = [];

  for (const statement of tokenizeStatements(question.code)) {
    const queuePush = statement.match(/^x\.push\((.+)\)$/);
    if (queuePush) {
      queue.push(parseLiteral(queuePush[1]));
      continue;
    }

    const vectorPush = statement.match(/^y\.push_back\((.+)\)$/);
    if (vectorPush) {
      const token = vectorPush[1].trim();
      if (token === "x.empty()") {
        vector.push(queue.length === 0 ? "1" : "0");
      } else {
        vector.push(parseLiteral(token));
      }
    }
  }

  return [
    { id: "queue", labels: queue },
    { id: "vector", labels: vector },
  ];
}

function buildLinkedListExpectedZones(question: DrawDiagramQuestion): DiagramZone[] {
  const list: string[] = [];

  const readListValue = (token: string) => {
    const atMatch = token.trim().match(/^L\.At\((\d+)\)$/);
    if (atMatch) {
      return list[Number(atMatch[1])] ?? "";
    }

    return parseLiteral(token);
  };

  for (const statement of tokenizeStatements(question.code)) {
    const appendMatch = statement.match(/^L\.Append\((.+)\)$/);
    if (appendMatch) {
      list.push(readListValue(appendMatch[1]));
      continue;
    }

    const deleteMatch = statement.match(/^L\.DeleteAt\((\d+)\)$/);
    if (deleteMatch) {
      list.splice(Number(deleteMatch[1]), 1);
      continue;
    }

    const insertMatch = statement.match(/^L\.InsertAt\((\d+)\s*,\s*(.+)\)$/);
    if (insertMatch) {
      list.splice(Number(insertMatch[1]), 0, readListValue(insertMatch[2]));
    }
  }

  return [{ id: "list", labels: list }];
}

function buildMapExpectedZones(question: DrawDiagramQuestion): DiagramZone[] {
  const mapState = new Map<string, string>();

  for (const statement of tokenizeStatements(question.code)) {
    const insertMatch = statement.match(
      /^x\.insert\(make_pair\((['"][^'"]+['"])\s*,\s*([^)]+)\)\)$/,
    );
    if (insertMatch) {
      mapState.set(parseLiteral(insertMatch[1]), parseLiteral(insertMatch[2]));
      continue;
    }

    const assignMatch = statement.match(/^x\[['"](.+?)['"]\]\s*=\s*(.+)$/);
    if (assignMatch) {
      mapState.set(assignMatch[1], parseLiteral(assignMatch[2]));
      continue;
    }

    const eraseMatch = statement.match(/^x\.erase\((['"][^'"]+['"])\)$/);
    if (eraseMatch) {
      mapState.delete(parseLiteral(eraseMatch[1]));
    }
  }

  const labels = [...mapState.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}:${value}`);

  return [{ id: "map", labels }];
}

function compareBstValues(left: string, right: string) {
  const leftNum = Number(left);
  const rightNum = Number(right);

  if (Number.isFinite(leftNum) && Number.isFinite(rightNum)) {
    return leftNum - rightNum;
  }

  return left.localeCompare(right);
}

function buildBstExpectedZones(question: DrawDiagramQuestion): DiagramZone[] {
  type BstNode = { label: string; left: BstNode | null; right: BstNode | null };

  const insertNode = (root: BstNode | null, label: string): BstNode => {
    if (!root) {
      return { label, left: null, right: null };
    }

    if (compareBstValues(label, root.label) < 0) {
      root.left = insertNode(root.left, label);
    } else {
      root.right = insertNode(root.right, label);
    }

    return root;
  };

  const levels: string[][] = [];
  let root: BstNode | null = null;

  for (const value of question.initialNodes) {
    root = insertNode(root, value);
  }

  const walkLevels = (node: BstNode | null, depth: number) => {
    if (!node) {
      return;
    }

    if (!levels[depth]) {
      levels[depth] = [];
    }

    levels[depth].push(node.label);
    walkLevels(node.left, depth + 1);
    walkLevels(node.right, depth + 1);
  };

  walkLevels(root, 0);

  return levels.map((labels, index) => ({
    id: `level-${index}`,
    labels,
  }));
}

function buildCircularQueueExpectedZones(question: DrawDiagramQuestion): DiagramZone[] {
  const answer = question.answerText ?? "";
  const slotsMatch = answer.match(/\[([^\]]*)\]/);
  const values = slotsMatch
    ? slotsMatch[1]
        .split(",")
        .map((value) => value.trim())
    : [];

  return values.map((value, index) => ({
    id: `slot-${index}`,
    labels: value ? [value] : [],
  }));
}

function buildCircularQueueExpectedState(question: DrawDiagramQuestion): CircularQueueExpectedState | null {
  const answer = question.answerText ?? "";
  const frontMatch = answer.match(/Front\s*=\s*(\d+)/i);
  const backMatch = answer.match(/Back\s*=\s*(\d+)/i);
  const slots = buildCircularQueueExpectedZones(question).length;

  if (!frontMatch || !backMatch || slots === 0) {
    return null;
  }

  return {
    front: Number(frontMatch[1]),
    back: Number(backMatch[1]),
    slots,
  };
}

function buildExpectedDiagramZones(question: DrawDiagramQuestion): DiagramZone[] {
  switch (question.diagramType) {
    case "queueVector":
      return buildQueueVectorExpectedZones(question);
    case "linkedList":
      return buildLinkedListExpectedZones(question);
    case "map":
      return buildMapExpectedZones(question);
    case "bst":
      return buildBstExpectedZones(question);
    case "circularQueue":
      return buildCircularQueueExpectedZones(question);
    case "treeAnalysis":
      return [];
    default:
      return buildStackExpectedZones(question);
  }
}

function buildExpectedDiagramConnections(question: DrawDiagramQuestion): DiagramExpectedConnection[] {
  if (question.diagramType !== "linkedList") {
    return [];
  }

  const zones = buildLinkedListExpectedZones(question);
  const labels = zones[0]?.labels ?? [];

  return labels.slice(0, -1).map((label, index) => ({
    from: label,
    to: labels[index + 1],
  }));
}

function buildEssayDiff(answer: string, modelAnswer: string) {
  const answerLines = normalizeText(answer || "// No answer submitted").split("\n");
  const modelLines = normalizeText(modelAnswer).split("\n");
  const lineCount = Math.max(answerLines.length, modelLines.length);
  const exactMatch = normalizeCodeComparison(answer) === normalizeCodeComparison(modelAnswer);

  return (
    <div className="space-y-4">
      <div
        className={`rounded-lg border px-4 py-3 font-mono text-sm ${
          exactMatch
            ? "border-[var(--neon-green)]/50 bg-[var(--neon-green)]/10 text-[var(--neon-green)]"
            : "border-[var(--neon-cyan)]/30 bg-[var(--neon-cyan)]/5 text-[var(--neon-cyan)]"
        }`}
      >
        {exactMatch
          ? "EXACT MATCH DETECTED AFTER NORMALIZING CODE WHITESPACE."
          : "DIFFERENCES BELOW ARE WHITESPACE-TOLERANT, BUT REAL CODE CHANGES STILL HIGHLIGHT."}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <p
            className={`font-mono text-xs uppercase tracking-wider mb-3 ${
              exactMatch ? "text-[var(--neon-green)]" : "text-[var(--neon-red)]"
            }`}
          >
            Your Answer
          </p>
          <div
            className={`rounded-lg border overflow-hidden ${
              exactMatch
                ? "border-[var(--neon-green)]/40"
                : "border-[var(--neon-red)]/50"
            }`}
          >
            {Array.from({ length: lineCount }, (_, index) => {
              const answerLine = answerLines[index] ?? "";
              const modelLine = modelLines[index] ?? "";
              const matches =
                normalizeCodeComparison(answerLine) === normalizeCodeComparison(modelLine);

              return (
                <div
                  key={`answer-${index}`}
                  className={`grid grid-cols-[48px_1fr] border-b border-[var(--neon-red)]/10 ${
                    matches ? "bg-white/0" : "bg-[var(--neon-red)]/12"
                  }`}
                >
                  <div
                    className={`px-3 py-2 text-right font-mono text-xs text-muted-foreground border-r ${
                      exactMatch
                        ? "border-[var(--neon-green)]/10"
                        : "border-[var(--neon-red)]/10"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <pre className="px-4 py-2 font-mono text-sm whitespace-pre-wrap text-foreground">
                    {answerLine || " "}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <p className="font-mono text-xs text-[var(--neon-green)] uppercase tracking-wider mb-3">
            Model Answer
          </p>
          <div className="rounded-lg border border-[var(--neon-green)]/50 overflow-hidden">
            {Array.from({ length: lineCount }, (_, index) => {
              const answerLine = answerLines[index] ?? "";
              const modelLine = modelLines[index] ?? "";
              const matches =
                normalizeCodeComparison(answerLine) === normalizeCodeComparison(modelLine);

              return (
                <div
                  key={`model-${index}`}
                  className={`grid grid-cols-[48px_1fr] border-b border-[var(--neon-green)]/10 ${
                    matches ? "bg-white/0" : "bg-[var(--neon-green)]/12"
                  }`}
                >
                  <div className="px-3 py-2 text-right font-mono text-xs text-muted-foreground border-r border-[var(--neon-green)]/10">
                    {index + 1}
                  </div>
                  <pre className="px-4 py-2 font-mono text-sm whitespace-pre-wrap text-foreground">
                    {modelLine || " "}
                  </pre>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExamSessionScreen({ exam, onBack, onComplete }: ExamSessionScreenProps) {
  const { playSound } = useAudioManager();
  const objectiveTotal = useMemo(
    () => exam.questions.filter((question) => isObjectiveQuestion(question)).length,
    [exam.questions],
  );
  const [session, setSession] = useState<SessionState>(() => getInitialSession(exam));
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedBoolean, setSelectedBoolean] = useState<boolean | null>(null);
  const [selectedMulti, setSelectedMulti] = useState<number[]>([]);
  const [fillAnswers, setFillAnswers] = useState<string[]>([]);
  const [codeAnswer, setCodeAnswer] = useState("");
  const [arrangeItems, setArrangeItems] = useState<string[]>([]);
  const [essayAnswer, setEssayAnswer] = useState("");
  const [showModelAnswer, setShowModelAnswer] = useState(false);
  const [showCompoundImage, setShowCompoundImage] = useState(false);
  const [showDiagramAnswer, setShowDiagramAnswer] = useState(false);
  const [diagramAnswerRevealed, setDiagramAnswerRevealed] = useState(false);
  const [evaluation, setEvaluation] = useState<ObjectiveEvaluation | null>(null);
  const [diagramEvaluation, setDiagramEvaluation] = useState<DiagramSubmitResult | null>(null);

  const currentQuestion = exam.questions[session.currentIndex];
  const currentEvaluation =
    currentQuestion && evaluation?.questionId === currentQuestion.id ? evaluation : null;
  const isInteractiveDiagram =
    currentQuestion?.type === "drawDiagram"
      ? ["stack", "queueVector", "linkedList", "map", "bst", "circularQueue"].includes(currentQuestion.diagramType)
      : false;
  const expectedDiagramZones = useMemo(
    () =>
      currentQuestion?.type === "drawDiagram"
        ? buildExpectedDiagramZones(currentQuestion)
        : [],
    [currentQuestion],
  );
  const expectedDiagramConnections = useMemo(
    () =>
      currentQuestion?.type === "drawDiagram"
        ? buildExpectedDiagramConnections(currentQuestion)
        : [],
    [currentQuestion],
  );
  const expectedCircularQueueState = useMemo(
    () =>
      currentQuestion?.type === "drawDiagram" && currentQuestion.diagramType === "circularQueue"
        ? buildCircularQueueExpectedState(currentQuestion)
        : null,
    [currentQuestion],
  );

  useEffect(() => {
    if (!currentQuestion) {
      return;
    }

    setSelectedOption(null);
    setSelectedBoolean(null);
    setSelectedMulti([]);
    setFillAnswers(
      currentQuestion.type === "fillBlank"
        ? new Array(currentQuestion.correctAnswers.length).fill("")
        : [],
    );
    setCodeAnswer("");
    setArrangeItems(currentQuestion.type === "arrange" ? [...currentQuestion.items] : []);
    setEssayAnswer("");
    setShowModelAnswer(false);
    setShowCompoundImage(false);
    setShowDiagramAnswer(false);
    setDiagramAnswerRevealed(false);
    setEvaluation(null);
    setDiagramEvaluation(null);
  }, [currentQuestion]);

  useEffect(() => {
    if (session.currentIndex >= exam.questions.length) {
      return;
    }

    const payload: StoredSession = {
      year: exam.year,
      totalQuestions: exam.questions.length,
      currentIndex: session.currentIndex,
      health: session.health,
      xp: session.xp,
      score: session.score,
      objectiveAnswered: session.objectiveAnswered,
      updatedAt: new Date().toISOString(),
    };

    saveStoredSession(payload);

    const store = loadProgressStore();
    store.exams[String(exam.year)] = {
      progress: Math.round((session.currentIndex / exam.questions.length) * 100),
      completed: false,
      bestScore: store.exams[String(exam.year)]?.bestScore ?? 0,
      objectiveTotal,
      lastAccuracy: store.exams[String(exam.year)]?.lastAccuracy ?? 0,
      lastXp: session.xp,
      lastPlayedAt: payload.updatedAt,
    };
    saveProgressStore(store);
  }, [exam.questions.length, exam.year, objectiveTotal, session]);

  const finishExam = (nextSession: SessionState) => {
    clearStoredSession(exam.year);

    const accuracy =
      objectiveTotal === 0 ? 100 : Math.round((nextSession.score / objectiveTotal) * 100);

    const store = loadProgressStore();
    const previous = store.exams[String(exam.year)];
    store.totalXp += nextSession.xp;
    store.exams[String(exam.year)] = {
      progress: 100,
      completed: true,
      bestScore: Math.max(previous?.bestScore ?? 0, nextSession.score),
      objectiveTotal,
      lastAccuracy: accuracy,
      lastXp: nextSession.xp,
      lastPlayedAt: new Date().toISOString(),
    };
    saveProgressStore(store);

    onComplete({
      year: exam.year,
      score: nextSession.score,
      objectiveTotal,
      xp: nextSession.xp,
      accuracy,
    });
  };

  const advanceSession = (changes: Partial<SessionState>) => {
    const nextSession: SessionState = {
      ...session,
      ...changes,
      currentIndex: session.currentIndex + 1,
    };

    if (nextSession.currentIndex >= exam.questions.length) {
      setSession(nextSession);
      finishExam(nextSession);
      return;
    }

    setSession(nextSession);
  };

  const handleSubmitObjective = () => {
    if (!currentQuestion || currentEvaluation) {
      return;
    }

    let correct = false;

    switch (currentQuestion.type) {
      case "mcq":
        if (selectedOption === null) {
          return;
        }
        correct = selectedOption === currentQuestion.correctAnswer;
        break;
      case "trueFalse":
        if (selectedBoolean === null) {
          return;
        }
        correct = selectedBoolean === currentQuestion.correctAnswer;
        break;
      case "multiSelect": {
        const sortedSelected = [...selectedMulti].sort((left, right) => left - right);
        const sortedCorrect = [...currentQuestion.correctAnswers].sort(
          (left, right) => left - right,
        );
        correct = JSON.stringify(sortedSelected) === JSON.stringify(sortedCorrect);
        break;
      }
      case "fillBlank":
        correct = fillAnswers.every(
          (answer, index) =>
            normalizeLooseText(answer) ===
            normalizeLooseText(currentQuestion.correctAnswers[index]),
        );
        break;
      case "codeOutput":
        correct = normalizeText(codeAnswer) === normalizeText(currentQuestion.correctOutput);
        break;
      case "arrange":
        correct = JSON.stringify(arrangeItems) === JSON.stringify(currentQuestion.correctOrder);
        break;
      default:
        return;
    }

    setEvaluation({
      questionId: currentQuestion.id,
      correct,
      explanation: currentQuestion.explanation,
    });
    playSound(correct ? "correct" : "wrong");
  };

  const handleNextObjective = () => {
    if (!currentEvaluation || !currentQuestion || !isObjectiveQuestion(currentQuestion)) {
      return;
    }

    advanceSession({
      health: currentEvaluation.correct ? session.health : Math.max(0, session.health - HEALTH_PENALTY),
      xp: session.xp + (currentEvaluation.correct ? currentQuestion.xp ?? OBJECTIVE_XP : 0),
      score: session.score + (currentEvaluation.correct ? 1 : 0),
      objectiveAnswered: session.objectiveAnswered + 1,
    });
  };

  const handleSelfReview = (review: SelfReviewRating) => {
    advanceSession({
      xp: session.xp + getSelfReviewXp(review),
    });
  };

  const handleCorrectDiagramNext = () => {
    advanceSession({
      xp: session.xp + getSelfReviewXp("perfect"),
    });
  };

  const moveArrangeItem = (index: number, direction: "up" | "down") => {
    if (currentEvaluation) {
      return;
    }

    const nextIndex = direction === "up" ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= arrangeItems.length) {
      return;
    }

    const nextItems = [...arrangeItems];
    [nextItems[index], nextItems[nextIndex]] = [nextItems[nextIndex], nextItems[index]];
    setArrangeItems(nextItems);
  };

  const progressValue = Math.min(session.currentIndex + 1, exam.questions.length);

  if (!currentQuestion) {
    return null;
  }

  const color = getQuestionColor(currentQuestion);
  const fillTemplateParts =
    currentQuestion.type === "fillBlank" ? currentQuestion.template.split("___") : [];
  const canSubmitObjective =
    currentQuestion.type === "mcq"
      ? selectedOption !== null
      : currentQuestion.type === "trueFalse"
      ? selectedBoolean !== null
      : currentQuestion.type === "multiSelect"
      ? selectedMulti.length > 0
      : currentQuestion.type === "fillBlank"
      ? fillAnswers.length > 0 && fillAnswers.every((answer) => answer.trim())
      : currentQuestion.type === "codeOutput"
      ? Boolean(codeAnswer.trim())
      : currentQuestion.type === "arrange"
      ? arrangeItems.length > 0
      : false;

  return (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />

      {currentQuestion.type === "drawDiagram" && (
        <HolographicModal
          isOpen={showDiagramAnswer}
          onClose={() => setShowDiagramAnswer(false)}
          title={`${currentQuestion.diagramType} Answer`}
          type="image"
          content={currentQuestion.answerImage}
        />
      )}

      {currentQuestion.type === "essay" && (
        <HolographicModal
          isOpen={showModelAnswer}
          onClose={() => setShowModelAnswer(false)}
          title="Model Answer Review"
          type="text"
          content={buildEssayDiff(essayAnswer, currentQuestion.modelAnswer)}
          copyText={currentQuestion.modelAnswer}
        />
      )}

      {currentQuestion.type === "compoundQuestion" && (
        <>
          <HolographicModal
            isOpen={showModelAnswer}
            onClose={() => setShowModelAnswer(false)}
            title="Compound Answer Review"
            type="text"
            content={buildEssayDiff(essayAnswer, currentQuestion.modelAnswer)}
            copyText={currentQuestion.modelAnswer}
          />
          <HolographicModal
            isOpen={showCompoundImage}
            onClose={() => setShowCompoundImage(false)}
            title="Reference Image"
            type="image"
            content={currentQuestion.answerImage ?? ""}
          />
        </>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-[var(--neon-cyan)] transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-mono">RETURN TO ARCHIVES</span>
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <NeonCard glowColor="cyan">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 text-[var(--neon-cyan)]" />
                <div>
                  <p className="font-mono text-xs text-muted-foreground">XP</p>
                  <p className="font-orbitron text-2xl text-[var(--neon-cyan)]">{session.xp}</p>
                </div>
              </div>
            </NeonCard>

            <NeonCard glowColor={color}>
              <p className="font-mono text-xs text-muted-foreground mb-2">ARCHIVE {exam.year}</p>
              <p className="font-orbitron text-sm mb-1">
                QUESTION {progressValue}/{exam.questions.length}
              </p>
              {currentQuestion.section && (
                <p className="font-mono text-xs text-muted-foreground mb-1">
                  {currentQuestion.section}
                </p>
              )}
              <p
                className={`font-mono text-xs ${
                  color === "purple"
                    ? "text-[var(--neon-purple)]"
                    : "text-[var(--neon-cyan)]"
                }`}
              >
                {getQuestionLabel(currentQuestion)}
              </p>
            </NeonCard>

            <NeonCard glowColor="green">
              <p className="font-mono text-xs text-muted-foreground mb-2">SYSTEM HEALTH</p>
              <HealthBar current={session.health} max={100} />
            </NeonCard>
          </div>

          <ProgressBar
            value={progressValue}
            max={exam.questions.length}
            label="EXAM PROGRESS"
            color={color}
          />
        </div>

        <div key={currentQuestion.id}>
          <NeonCard glowColor={color} className="mb-6">
            <div className="mb-4">
              <span
                className={`font-mono text-xs uppercase tracking-wider ${
                  color === "purple"
                    ? "text-[var(--neon-purple)]"
                    : "text-[var(--neon-cyan)]"
                }`}
              >
                {getQuestionLabel(currentQuestion)}
              </span>
            </div>

            <h2 className="text-readable whitespace-pre-wrap text-3xl md:text-4xl font-semibold mb-6 text-foreground">
              {currentQuestion.question}
            </h2>

            {currentQuestion.type === "mcq" && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <AnswerCard
                    key={option}
                    text={option}
                    onClick={() => !currentEvaluation && setSelectedOption(index)}
                    selected={!currentEvaluation && selectedOption === index}
                    state={
                      currentEvaluation
                        ? index === currentQuestion.correctAnswer
                          ? "correct"
                          : selectedOption === index
                          ? "incorrect"
                          : "default"
                        : "default"
                    }
                    disabled={Boolean(currentEvaluation)}
                  />
                ))}
              </div>
            )}

            {currentQuestion.type === "trueFalse" && (
              <BinaryDecision
                onSelect={setSelectedBoolean}
                selected={selectedBoolean}
                isCorrect={currentEvaluation?.correct}
                correctAnswer={currentQuestion.correctAnswer}
                showValidation={Boolean(currentEvaluation)}
                disabled={Boolean(currentEvaluation)}
              />
            )}

            {currentQuestion.type === "multiSelect" && (
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = selectedMulti.includes(index);
                  return (
                    <MultiSelectCard
                      key={option}
                      id={String(index)}
                      content={option}
                      isSelected={isSelected}
                      onToggle={() => {
                        if (currentEvaluation) {
                          return;
                        }

                        setSelectedMulti((previous) =>
                          previous.includes(index)
                            ? previous.filter((value) => value !== index)
                            : [...previous, index],
                        );
                      }}
                      isCorrect={
                        currentEvaluation
                          ? currentQuestion.correctAnswers.includes(index) === isSelected
                          : undefined
                      }
                      showValidation={Boolean(currentEvaluation)}
                      disabled={Boolean(currentEvaluation)}
                    />
                  );
                })}
              </div>
            )}

            {currentQuestion.type === "fillBlank" && (
              <div
                className="p-6 rounded-lg border border-[var(--neon-cyan)]"
                style={{ background: "rgba(5, 8, 18, 0.6)" }}
              >
                <div className="text-readable text-xl leading-relaxed text-foreground">
                  {fillTemplateParts.map((part, index) => (
                    <span key={`${currentQuestion.id}-${index}`}>
                      {part}
                      {index < fillTemplateParts.length - 1 && (
                        <span className="inline-block mx-2 min-w-[220px] align-middle">
                          <TerminalInput
                            value={fillAnswers[index] ?? ""}
                            onChange={(value) => {
                              if (currentEvaluation) {
                                return;
                              }

                              setFillAnswers((previous) => {
                                const next = [...previous];
                                next[index] = value;
                                return next;
                              });
                            }}
                            placeholder="..."
                            prefix=""
                            isCorrect={
                              currentEvaluation
                                ? normalizeLooseText(fillAnswers[index] ?? "") ===
                                  normalizeLooseText(currentQuestion.correctAnswers[index])
                                : undefined
                            }
                            showValidation={Boolean(currentEvaluation)}
                          />
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {currentQuestion.type === "codeOutput" && (
              <div className="space-y-6">
                <CodeOutputViewer code={currentQuestion.code} language={currentQuestion.language ?? "cpp"} />
                <TerminalInput
                  value={codeAnswer}
                  onChange={setCodeAnswer}
                  placeholder="Enter expected output..."
                  isCorrect={currentEvaluation?.correct}
                  showValidation={Boolean(currentEvaluation)}
                />
              </div>
            )}

            {currentQuestion.type === "matching" && (
              <MatchingConnector
                key={currentQuestion.id}
                leftItems={currentQuestion.leftItems}
                rightItems={currentQuestion.rightItems}
                correctMatches={currentQuestion.correctMatches}
                onValidate={(correct) => {
                  setEvaluation({
                    questionId: currentQuestion.id,
                    correct,
                    explanation: currentQuestion.explanation,
                  });
                  playSound(correct ? "correct" : "wrong");
                }}
              />
            )}

            {currentQuestion.type === "arrange" && (
              <div className="space-y-3">
                {arrangeItems.map((item, index) => (
                  <ReorderCard
                    key={item}
                    id={item}
                    content={item}
                    index={index}
                    totalItems={arrangeItems.length}
                    onMoveUp={() => moveArrangeItem(index, "up")}
                    onMoveDown={() => moveArrangeItem(index, "down")}
                    isCorrect={currentEvaluation ? item === currentQuestion.correctOrder[index] : undefined}
                    showValidation={Boolean(currentEvaluation)}
                  />
                ))}
              </div>
            )}

            {currentQuestion.type === "essay" && (
              <div className="space-y-4">
                <FuturisticTextarea
                  value={essayAnswer}
                  onChange={setEssayAnswer}
                  placeholder="// Write your answer here..."
                  maxLength={5000}
                />

                <CyberButton onClick={() => setShowModelAnswer(true)} variant="secondary">
                  <Eye className="w-5 h-5 mr-2" />
                  Reveal Model Answer
                </CyberButton>
              </div>
            )}

            {currentQuestion.type === "compoundQuestion" && (
              <div className="space-y-5">
                <div className="rounded-lg border border-[var(--neon-purple)]/60 bg-[var(--cyber-darker)]/55 p-5">
                  <div className="space-y-4">
                    {currentQuestion.subQuestions.map((part) => (
                      <div key={`${currentQuestion.id}-${part.label}`} className="text-left">
                        <p className="font-mono text-xs uppercase tracking-wider text-[var(--neon-purple)]">
                          {part.label}
                        </p>
                        <p className="text-readable mt-1 text-lg text-foreground/90">
                          {part.prompt}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <FuturisticTextarea
                  value={essayAnswer}
                  onChange={setEssayAnswer}
                  placeholder="// Write your full answer here..."
                  maxLength={6000}
                />

                <div className="flex flex-wrap gap-3">
                  <CyberButton onClick={() => setShowModelAnswer(true)} variant="secondary">
                    <Eye className="w-5 h-5 mr-2" />
                    Reveal Model Answer
                  </CyberButton>
                  {currentQuestion.answerImage ? (
                    <CyberButton onClick={() => setShowCompoundImage(true)} variant="secondary">
                      <Eye className="w-5 h-5 mr-2" />
                      Reveal Reference Image
                    </CyberButton>
                  ) : null}
                </div>
              </div>
            )}

            {currentQuestion.type === "drawDiagram" && (
              <div className="space-y-6">
                {currentQuestion.code && (
                  <CodeOutputViewer code={currentQuestion.code} language="cpp" />
                )}
                {isInteractiveDiagram ? (
                  <GraphWorkspace
                    diagramType={currentQuestion.diagramType}
                    initialNodes={currentQuestion.initialNodes}
                    expectedZones={expectedDiagramZones}
                    expectedConnections={expectedDiagramConnections}
                    expectedCircularQueueState={expectedCircularQueueState ?? undefined}
                    onSubmit={(result) => {
                      setDiagramEvaluation(result);
                      setDiagramAnswerRevealed(true);
                      setShowDiagramAnswer(true);
                    }}
                  />
                ) : (
                  <NeonCard glowColor="purple">
                    <div className="space-y-4">
                      <p className="font-mono text-sm text-muted-foreground">
                        Analysis-based diagram prompt detected. Review the prompt, then reveal the official answer and self-grade.
                      </p>
                      <div className="flex justify-start">
                        <CyberButton
                          onClick={() => {
                            setDiagramAnswerRevealed(true);
                            setShowDiagramAnswer(true);
                          }}
                          variant="secondary"
                        >
                          <Eye className="w-5 h-5 mr-2" />
                          Reveal Answer
                        </CyberButton>
                      </div>
                    </div>
                  </NeonCard>
                )}
              </div>
            )}
          </NeonCard>

          {currentEvaluation?.explanation && (
            <NeonCard glowColor={currentEvaluation.correct ? "green" : "red"} className="mb-6">
              <div className="flex items-start gap-3">
                {currentEvaluation.correct ? (
                  <CheckCircle2 className="w-5 h-5 text-[var(--neon-green)] mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[var(--neon-red)] mt-0.5" />
                )}
                <div>
                  <p className="font-orbitron mb-2">
                    {currentEvaluation.correct ? "ACCESS GRANTED" : "ACCESS DENIED"}
                  </p>
                  <p className="font-mono text-sm text-muted-foreground">
                    {currentEvaluation.explanation}
                  </p>
                </div>
              </div>
            </NeonCard>
          )}

          {currentQuestion.type === "drawDiagram" && diagramEvaluation && (
            <NeonCard glowColor={diagramEvaluation.correct ? "green" : "red"} className="mb-6">
              <div className="flex items-start gap-3">
                {diagramEvaluation.correct ? (
                  <CheckCircle2 className="w-5 h-5 text-[var(--neon-green)] mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-[var(--neon-red)] mt-0.5" />
                )}
                <div>
                  <p className="font-orbitron mb-2">
                    {diagramEvaluation.correct
                      ? "RECONSTRUCTION DETECTED AS CORRECT"
                      : "RECONSTRUCTION DOES NOT MATCH EXPECTED STATE"}
                  </p>
                  <p className="font-mono text-sm text-muted-foreground">
                    {diagramEvaluation.summary}
                  </p>
                </div>
              </div>
            </NeonCard>
          )}

          {(currentQuestion.type === "essay" || currentQuestion.type === "compoundQuestion") && (
            <NeonCard glowColor="green" className="mb-6">
              <div className="mb-4">
                <span className="font-mono text-xs text-[var(--neon-green)] uppercase tracking-wider">
                  SELF-GRADE
                </span>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handleSelfReview("perfect")}
                  className="w-full p-4 border-2 border-[var(--neon-green)] rounded-lg bg-[var(--neon-green)]/10 hover:bg-[var(--neon-green)]/20 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-[var(--neon-green)]" />
                    <div>
                      <p className="font-orbitron text-[var(--neon-green)]">PERFECT MATCH</p>
                      <p className="font-mono text-xs text-muted-foreground">Strong answer</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleSelfReview("partial")}
                  className="w-full p-4 border-2 border-[var(--neon-cyan)] rounded-lg bg-[var(--neon-cyan)]/10 hover:bg-[var(--neon-cyan)]/20 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <AlertCircle className="w-6 h-6 text-[var(--neon-cyan)]" />
                    <div>
                      <p className="font-orbitron text-[var(--neon-cyan)]">PARTIAL CREDIT</p>
                      <p className="font-mono text-xs text-muted-foreground">Some gaps remain</p>
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleSelfReview("revision")}
                  className="w-full p-4 border-2 border-[var(--neon-red)] rounded-lg bg-[var(--neon-red)]/10 hover:bg-[var(--neon-red)]/20 transition-all text-left"
                >
                  <div className="flex items-center gap-3">
                    <XCircle className="w-6 h-6 text-[var(--neon-red)]" />
                    <div>
                      <p className="font-orbitron text-[var(--neon-red)]">NEED REVISION</p>
                      <p className="font-mono text-xs text-muted-foreground">Review the topic again</p>
                    </div>
                  </div>
                </button>
              </div>
            </NeonCard>
          )}

          {currentQuestion.type === "drawDiagram" &&
            diagramAnswerRevealed &&
            !diagramEvaluation?.correct && (
            <NeonCard glowColor="green" className="mb-6">
              <div className="mb-4">
                <span className="font-mono text-xs text-[var(--neon-green)] uppercase tracking-wider">
                  SELF-REVIEW
                </span>
              </div>
              <div className="space-y-3">
                <button
                  onClick={() => handleSelfReview("perfect")}
                  className="w-full p-4 border-2 border-[var(--neon-green)] rounded-lg bg-[var(--neon-green)]/10 hover:bg-[var(--neon-green)]/20 transition-all text-left"
                >
                  <p className="font-orbitron text-[var(--neon-green)]">PERFECT</p>
                </button>
                <button
                  onClick={() => handleSelfReview("partial")}
                  className="w-full p-4 border-2 border-[var(--neon-cyan)] rounded-lg bg-[var(--neon-cyan)]/10 hover:bg-[var(--neon-cyan)]/20 transition-all text-left"
                >
                  <p className="font-orbitron text-[var(--neon-cyan)]">PARTIAL</p>
                </button>
                <button
                  onClick={() => handleSelfReview("revision")}
                  className="w-full p-4 border-2 border-[var(--neon-red)] rounded-lg bg-[var(--neon-red)]/10 hover:bg-[var(--neon-red)]/20 transition-all text-left"
                >
                  <p className="font-orbitron text-[var(--neon-red)]">NEED REVISION</p>
                </button>
              </div>
            </NeonCard>
          )}

          {currentQuestion.type === "drawDiagram" && diagramEvaluation?.correct && (
            <div className="flex justify-end">
              <CyberButton onClick={handleCorrectDiagramNext}>
                Next Question
                <ArrowRight className="w-5 h-5 ml-2" />
              </CyberButton>
            </div>
          )}

          {isObjectiveQuestion(currentQuestion) && currentQuestion.type !== "matching" && (
            <div className="flex justify-end">
              <CyberButton
                onClick={currentEvaluation ? handleNextObjective : handleSubmitObjective}
                disabled={!currentEvaluation && !canSubmitObjective}
              >
                {currentEvaluation ? "Next Question" : "Submit Answer"}
                <ArrowRight className="w-5 h-5 ml-2" />
              </CyberButton>
            </div>
          )}

          {currentQuestion.type === "matching" && currentEvaluation && (
            <div className="flex justify-end">
              <CyberButton onClick={handleNextObjective}>
                Next Question
                <ArrowRight className="w-5 h-5 ml-2" />
              </CyberButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
