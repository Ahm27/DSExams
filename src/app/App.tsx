import { useEffect, useMemo, useState } from "react";
import { LandingPage } from "./screens/LandingPage";
import { LevelSelection } from "./screens/LevelSelection";
import { LoadingScreen } from "./components/LoadingScreen";
import { NeonCard } from "./components/NeonCard";
import { CyberButton } from "./components/CyberButton";
import { ParticleBackground } from "./components/ParticleBackground";
import { ExamSessionScreen } from "./screens/ExamSessionScreen";
import { ResultScreen } from "./screens/ResultScreen";
import { AudioControls } from "./components/AudioControls";
import { AudioManagerProvider } from "./lib/audio";
import { loadProgressStore } from "./lib/storage";
import type { ExamFile, ExamQuestion, ExamResultSummary } from "../data/examTypes";

const examCatalogModules = import.meta.glob<{ default: unknown }>("../../20*.json", {
  eager: true,
});

type Screen = "landing" | "levels" | "exam" | "results";

type RawRecord = Record<string, unknown>;

function isRecord(value: unknown): value is RawRecord {
  return typeof value === "object" && value !== null;
}

function toStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => String(item)) : [];
}

function toCompoundParts(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item, index) =>
      isRecord(item)
        ? {
            label: String(item.label ?? `${index + 1}`),
            prompt: String(item.prompt ?? ""),
          }
        : null,
    )
    .filter((item): item is { label: string; prompt: string } => Boolean(item?.prompt));
}

function toDifficultyLabel(value: unknown): "Easy" | "Medium" | "Hard" {
  const normalized = String(value ?? "").toLowerCase();

  if (normalized === "easy") {
    return "Easy";
  }

  if (normalized === "hard") {
    return "Hard";
  }

  return "Medium";
}

function buildDiagramPlaceholder(diagramType: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
      <rect width="900" height="560" fill="#050812"/>
      <rect x="24" y="24" width="852" height="512" rx="18" fill="#0f1629" stroke="#00ffff" stroke-width="3"/>
      <text x="450" y="220" fill="#00ffff" font-size="44" font-family="monospace" text-anchor="middle">${diagramType} Answer</text>
      <text x="450" y="290" fill="#94a3b8" font-size="24" font-family="monospace" text-anchor="middle">answerImage missing in 2024.json</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function normalizeQuestion(rawQuestion: unknown, examYear: number, index: number): ExamQuestion | null {
  if (!isRecord(rawQuestion)) {
    return null;
  }

  const type = String(rawQuestion.type ?? "");
  const id = String(rawQuestion.id ?? `${examYear}-${type}-${index + 1}`);
  const question = String(rawQuestion.question ?? "").trim();
  const explanation =
    typeof rawQuestion.explanation === "string" ? rawQuestion.explanation : undefined;
  const section = typeof rawQuestion.section === "string" ? rawQuestion.section : undefined;

  if (!question) {
    return null;
  }

  switch (type) {
    case "mcq": {
      const options = toStringArray(rawQuestion.options);
      const rawAnswer = rawQuestion.correctAnswer;
      const correctAnswer =
        typeof rawAnswer === "number"
          ? rawAnswer
          : options.findIndex((option) => option === String(rawAnswer ?? ""));

      return {
        id,
        type: "mcq",
        question,
        section,
        options,
        correctAnswer: correctAnswer >= 0 ? correctAnswer : 0,
        explanation,
      };
    }

    case "trueFalse": {
      const rawAnswer = rawQuestion.correctAnswer ?? rawQuestion.answer;
      const normalized =
        typeof rawAnswer === "boolean"
          ? rawAnswer
          : String(rawAnswer ?? "").toLowerCase() === "true";

      return {
        id,
        type: "trueFalse",
        question,
        section,
        correctAnswer: normalized,
        explanation,
      };
    }

    case "multiSelect": {
      const options = toStringArray(rawQuestion.options);
      const rawAnswers = Array.isArray(rawQuestion.correctAnswers)
        ? rawQuestion.correctAnswers
        : Array.isArray(rawQuestion.answer)
        ? rawQuestion.answer
        : [];
      const correctAnswers = rawAnswers
        .map((answer) =>
          typeof answer === "number" ? answer : options.findIndex((option) => option === String(answer)),
        )
        .filter((answer) => answer >= 0);

      return {
        id,
        type: "multiSelect",
        question,
        section,
        options,
        correctAnswers,
        explanation,
      };
    }

    case "fillBlank": {
      const template = String(rawQuestion.template ?? rawQuestion.question ?? "");
      const answers = Array.isArray(rawQuestion.correctAnswers)
        ? toStringArray(rawQuestion.correctAnswers)
        : Array.isArray(rawQuestion.answers)
        ? toStringArray(rawQuestion.answers)
        : rawQuestion.answer !== undefined
        ? [String(rawQuestion.answer)]
        : [];

      return {
        id,
        type: "fillBlank",
        question,
        section,
        template,
        correctAnswers: answers,
        explanation,
      };
    }

    case "codeOutput":
      return {
        id,
        type: "codeOutput",
        question,
        section,
        code:
          typeof rawQuestion.code === "string" && rawQuestion.code.trim()
            ? rawQuestion.code
            : "// No code snippet provided in 2024.json",
        language: typeof rawQuestion.language === "string" ? rawQuestion.language : "cpp",
        correctOutput: String(rawQuestion.correctOutput ?? rawQuestion.answer ?? ""),
        explanation,
      };

    case "matching": {
      const pairItems = Array.isArray(rawQuestion.pairs)
        ? rawQuestion.pairs.filter(isRecord)
        : [];
      const leftItems = Array.isArray(rawQuestion.leftItems)
        ? rawQuestion.leftItems.map((item, itemIndex) =>
            isRecord(item)
              ? {
                  id: String(item.id ?? `left-${itemIndex}`),
                  content: String(item.content ?? item.label ?? item.value ?? ""),
                }
              : { id: `left-${itemIndex}`, content: String(item) },
          )
        : pairItems.length > 0
        ? pairItems.map((item, itemIndex) => ({
            id: `left-${itemIndex}`,
            content: String(item.left ?? ""),
          }))
        : [];
      const rightItems = Array.isArray(rawQuestion.rightItems)
        ? rawQuestion.rightItems.map((item, itemIndex) =>
            isRecord(item)
              ? {
                  id: String(item.id ?? `right-${itemIndex}`),
                  content: String(item.content ?? item.label ?? item.value ?? ""),
                }
              : { id: `right-${itemIndex}`, content: String(item) },
          )
        : pairItems.length > 0
        ? pairItems.map((item, itemIndex) => ({
            id: `right-${itemIndex}`,
            content: String(item.right ?? ""),
          }))
        : [];
      const rawMatches = isRecord(rawQuestion.correctMatches)
        ? rawQuestion.correctMatches
        : isRecord(rawQuestion.answer)
        ? rawQuestion.answer
        : {};
      const correctMatches =
        pairItems.length > 0
          ? Object.fromEntries(
              pairItems.map((item, itemIndex) => [`left-${itemIndex}`, `right-${itemIndex}`]),
            )
          : Object.fromEntries(
              Object.entries(rawMatches).map(([key, value]) => [String(key), String(value)]),
            );

      return {
        id,
        type: "matching",
        question,
        section,
        leftItems,
        rightItems,
        correctMatches,
        explanation,
      };
    }

    case "arrange": {
      const items = toStringArray(rawQuestion.items);
      const correctOrder = Array.isArray(rawQuestion.correctOrder)
        ? toStringArray(rawQuestion.correctOrder)
        : Array.isArray(rawQuestion.answer)
        ? toStringArray(rawQuestion.answer)
        : [];

      return {
        id,
        type: "arrange",
        question,
        section,
        items,
        correctOrder,
        explanation,
      };
    }

    case "essay":
      return {
        id,
        type: "essay",
        question,
        section,
        modelAnswer: String(
          rawQuestion.modelAnswer ??
            rawQuestion.answer ??
            "Model answer not provided in 2024.json.",
        ),
        explanation,
      };

    case "compoundQuestion":
      return {
        id,
        type: "compoundQuestion",
        question,
        section,
        subQuestions: toCompoundParts(rawQuestion.subQuestions),
        modelAnswer: String(
          rawQuestion.modelAnswer ??
            rawQuestion.answer ??
            "Model answer not provided in this archive.",
        ),
        answerImage:
          typeof rawQuestion.answerImage === "string" && rawQuestion.answerImage.trim()
            ? rawQuestion.answerImage
            : undefined,
        explanation,
      };

    case "drawDiagram": {
      const diagramType = String(rawQuestion.diagramType ?? "stack") as
        | "stack"
        | "queueVector"
        | "linkedList"
        | "map"
        | "treeAnalysis";

      return {
        id,
        type: "drawDiagram",
        question,
        section,
        diagramType,
        code: typeof rawQuestion.code === "string" ? rawQuestion.code : undefined,
        initialNodes: toStringArray(rawQuestion.initialNodes),
        answerImage:
          typeof rawQuestion.answerImage === "string" && rawQuestion.answerImage.trim()
            ? rawQuestion.answerImage
            : buildDiagramPlaceholder(diagramType),
        explanation,
      };
    }

    default:
      return null;
  }
}

function normalizeExam(rawExam: unknown, fallbackIndex: number): ExamFile | null {
  if (!isRecord(rawExam)) {
    return null;
  }

  const year = Number(rawExam.year);
  if (!Number.isFinite(year)) {
    return null;
  }

  const rawQuestions = Array.isArray(rawExam.questions) ? rawExam.questions : [];
  const questions = rawQuestions
    .map((question, index) => normalizeQuestion(question, year, index))
    .filter((question): question is ExamQuestion => Boolean(question));

  return {
    year,
    title: String(rawExam.title ?? `Data Structures Exam ${year}`),
    difficulty: String(rawExam.difficulty ?? (fallbackIndex === 0 ? "easy" : "medium")),
    questions,
  };
}

function normalizeExamCatalog(rawData: unknown) {
  if (Array.isArray(rawData)) {
    return rawData
      .map((exam, index) => normalizeExam(exam, index))
      .filter((exam): exam is ExamFile => Boolean(exam));
  }

  if (isRecord(rawData) && Array.isArray(rawData.exams)) {
    return rawData.exams
      .map((exam, index) => normalizeExam(exam, index))
      .filter((exam): exam is ExamFile => Boolean(exam));
  }

  const singleExam = normalizeExam(rawData, 0);
  return singleExam ? [singleExam] : [];
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [catalog, setCatalog] = useState<ExamFile[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedExam, setSelectedExam] = useState<ExamFile | null>(null);
  const [result, setResult] = useState<ExamResultSummary | null>(null);
  const [loadError, setLoadError] = useState("");
  const [progressVersion, setProgressVersion] = useState(0);
  const [examRunKey, setExamRunKey] = useState(0);

  useEffect(() => {
    setProgressVersion((value) => value + 1);
  }, []);

  useEffect(() => {
    setCatalogLoading(true);
    setLoadError("");

    try {
      const normalizedCatalog = Object.values(examCatalogModules)
        .flatMap((module) => normalizeExamCatalog(module.default))
        .sort((left, right) => left.year - right.year);

      if (normalizedCatalog.length === 0) {
        throw new Error("No valid exam archives were found.");
      }

      setCatalog(normalizedCatalog);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "Failed to load exam archives.");
    } finally {
      setCatalogLoading(false);
    }
  }, []);

  const levels = useMemo(() => {
    const store = loadProgressStore();
    return catalog.map((exam) => ({
      year: exam.year,
      isLocked: false,
      progress: store.exams[String(exam.year)]?.progress ?? 0,
      difficulty: toDifficultyLabel(exam.difficulty),
    }));
  }, [catalog, progressVersion]);

  const loadExam = (year: number) => {
    const exam = catalog.find((item) => item.year === year);
    if (!exam) {
      setLoadError(`Archive ${year} was not found.`);
      return;
    }

    setLoadError("");
    setSelectedYear(year);
    setSelectedExam(exam);
    setResult(null);
    setCurrentScreen("exam");
    setExamRunKey((value) => value + 1);
  };

  const renderLoadError = () => (
    <div className="relative min-h-screen overflow-hidden">
      <ParticleBackground />
      <div className="relative z-10 container mx-auto px-4 py-16 max-w-2xl">
        <NeonCard glowColor="red" className="text-center">
          <h2 className="font-orbitron text-3xl text-[var(--neon-red)] mb-4">ARCHIVE LOAD FAILED</h2>
          <p className="font-mono text-muted-foreground mb-6">{loadError}</p>
          <CyberButton onClick={() => setCurrentScreen("levels")}>Return to Archives</CyberButton>
        </NeonCard>
      </div>
    </div>
  );

  const renderScreen = () => {
    if (loadError) {
      return renderLoadError();
    }

    if (catalogLoading && currentScreen !== "landing") {
      return <LoadingScreen message="LOADING EXAM ARCHIVES..." />;
    }

    switch (currentScreen) {
      case "landing":
        return <LandingPage onStart={() => setCurrentScreen("levels")} />;

      case "levels":
        return (
          <LevelSelection
            levels={levels}
            onBack={() => {
              setLoadError("");
              setCurrentScreen("landing");
            }}
            onSelectLevel={loadExam}
          />
        );

      case "exam":
        if (!selectedExam) {
          return <LoadingScreen message="PREPARING SESSION..." />;
        }

        return (
          <ExamSessionScreen
            key={`${selectedExam.year}-${examRunKey}`}
            exam={selectedExam}
            onBack={() => {
              setProgressVersion((value) => value + 1);
              setCurrentScreen("levels");
            }}
            onComplete={(nextResult) => {
              setResult(nextResult);
              setProgressVersion((value) => value + 1);
              setCurrentScreen("results");
            }}
          />
        );

      case "results":
        if (!result || !selectedYear) {
          return <LoadingScreen message="PROCESSING RESULTS..." />;
        }

        return (
          <ResultScreen
            year={selectedYear}
            score={result.score}
            totalQuestions={result.objectiveTotal}
            xp={result.xp}
            accuracy={result.accuracy}
            onReplay={() => {
              if (!selectedExam) {
                return;
              }

              setResult(null);
              setCurrentScreen("exam");
              setExamRunKey((value) => value + 1);
            }}
            onBackToLevels={() => {
              setProgressVersion((value) => value + 1);
              setCurrentScreen("levels");
            }}
          />
        );

      default:
        return <LandingPage onStart={() => setCurrentScreen("levels")} />;
    }
  };

  return (
    <AudioManagerProvider>
      <div className="min-h-screen bg-[var(--cyber-dark)]">
        <AudioControls />
        {renderScreen()}
      </div>
    </AudioManagerProvider>
  );
}
