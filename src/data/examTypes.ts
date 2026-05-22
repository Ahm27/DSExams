export type QuestionType =
  | "mcq"
  | "trueFalse"
  | "multiSelect"
  | "fillBlank"
  | "codeOutput"
  | "matching"
  | "arrange"
  | "essay"
  | "compoundQuestion"
  | "drawDiagram";

export type SelfReviewRating = "perfect" | "partial" | "revision";

export interface BaseQuestion {
  id: string;
  type: QuestionType;
  question: string;
  section?: string;
  explanation?: string;
  xp?: number;
}

export interface McqQuestion extends BaseQuestion {
  type: "mcq";
  options: string[];
  correctAnswer: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
  type: "trueFalse";
  correctAnswer: boolean;
}

export interface MultiSelectQuestion extends BaseQuestion {
  type: "multiSelect";
  options: string[];
  correctAnswers: number[];
}

export interface FillBlankQuestion extends BaseQuestion {
  type: "fillBlank";
  template: string;
  correctAnswers: string[];
}

export interface CodeOutputQuestion extends BaseQuestion {
  type: "codeOutput";
  code: string;
  language?: string;
  correctOutput: string;
}

export interface MatchingItem {
  id: string;
  content: string;
}

export interface MatchingQuestion extends BaseQuestion {
  type: "matching";
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
  correctMatches: Record<string, string>;
}

export interface ArrangeQuestion extends BaseQuestion {
  type: "arrange";
  items: string[];
  correctOrder: string[];
}

export interface EssayQuestion extends BaseQuestion {
  type: "essay";
  modelAnswer: string;
}

export interface CompoundQuestionPart {
  label: string;
  prompt: string;
}

export interface CompoundQuestion extends BaseQuestion {
  type: "compoundQuestion";
  subQuestions: CompoundQuestionPart[];
  modelAnswer: string;
  answerImage?: string;
}

export interface DrawDiagramQuestion extends BaseQuestion {
  type: "drawDiagram";
  diagramType:
    | "stack"
    | "queueVector"
    | "linkedList"
    | "map"
    | "treeAnalysis"
    | "bst"
    | "circularQueue";
  code?: string;
  initialNodes: string[];
  answerText?: string;
  answerImage: string;
}

export type ExamQuestion =
  | McqQuestion
  | TrueFalseQuestion
  | MultiSelectQuestion
  | FillBlankQuestion
  | CodeOutputQuestion
  | MatchingQuestion
  | ArrangeQuestion
  | EssayQuestion
  | CompoundQuestion
  | DrawDiagramQuestion;

export interface ExamFile {
  year: number;
  title: string;
  difficulty?: string;
  questions: ExamQuestion[];
}

export interface ExamResultSummary {
  year: number;
  score: number;
  objectiveTotal: number;
  xp: number;
  accuracy: number;
}

export function isObjectiveQuestion(question: ExamQuestion) {
  return (
    question.type !== "essay" &&
    question.type !== "compoundQuestion" &&
    question.type !== "drawDiagram"
  );
}
