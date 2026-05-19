export interface StoredSession {
  year: number;
  totalQuestions: number;
  currentIndex: number;
  health: number;
  xp: number;
  score: number;
  objectiveAnswered: number;
  updatedAt: string;
}

export interface StoredExamProgress {
  progress: number;
  completed: boolean;
  bestScore: number;
  objectiveTotal: number;
  lastAccuracy: number;
  lastXp: number;
  lastPlayedAt: string;
}

export interface ProgressStore {
  totalXp: number;
  exams: Record<string, StoredExamProgress>;
}

const PROGRESS_KEY = "ds-exe-progress-v1";
const SESSION_KEY_PREFIX = "ds-exe-session-v1";
const pendingWrites = new Map<string, string>();
let flushTimer: number | null = null;

function isBrowser() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function getSessionKey(year: number) {
  return `${SESSION_KEY_PREFIX}-${year}`;
}

export function loadProgressStore(): ProgressStore {
  if (!isBrowser()) {
    return { totalXp: 0, exams: {} };
  }

  const raw = window.localStorage.getItem(PROGRESS_KEY);
  if (!raw) {
    return { totalXp: 0, exams: {} };
  }

  try {
    return JSON.parse(raw) as ProgressStore;
  } catch {
    return { totalXp: 0, exams: {} };
  }
}

export function saveProgressStore(store: ProgressStore) {
  if (!isBrowser()) {
    return;
  }

  queueStorageWrite(PROGRESS_KEY, JSON.stringify(store));
}

export function loadStoredSession(year: number) {
  if (!isBrowser()) {
    return null;
  }

  const raw = window.localStorage.getItem(getSessionKey(year));
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function saveStoredSession(session: StoredSession) {
  if (!isBrowser()) {
    return;
  }

  queueStorageWrite(getSessionKey(session.year), JSON.stringify(session));
}

export function clearStoredSession(year: number) {
  if (!isBrowser()) {
    return;
  }

  const key = getSessionKey(year);
  pendingWrites.delete(key);
  window.localStorage.removeItem(key);
}

function flushStorageQueue() {
  if (!isBrowser()) {
    return;
  }

  flushTimer = null;

  for (const [key, value] of pendingWrites.entries()) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore write failures to avoid blocking UI updates.
    }
  }

  pendingWrites.clear();
}

function queueStorageWrite(key: string, value: string) {
  if (!isBrowser()) {
    return;
  }

  pendingWrites.set(key, value);

  if (flushTimer !== null) {
    window.clearTimeout(flushTimer);
  }

  flushTimer = window.setTimeout(flushStorageQueue, 120);
}
