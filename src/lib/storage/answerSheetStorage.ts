import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ANSWERS_PER_ROUND,
  ROUND_NUMBERS,
  TOTAL_SCORABLE_ANSWERS,
  calculateAnswerSheetScore,
  hasMarkedAnswers,
  type AnswerMark,
  type AnswerSheetState,
  type RoundNumber,
} from "../../types/answerSheet";

const ANSWER_SHEET_INDEX_STORAGE_KEY = "jays-quiz-notepad:answer-sheets:index";
const ANSWER_SHEET_STORAGE_KEY_PREFIX = "jays-quiz-notepad:answer-sheet:";

let storageOperationQueue: Promise<void> = Promise.resolve();

type StoredAnswerSheet = {
  rounds: Partial<Record<string, unknown>>;
  marks?: Partial<Record<string, unknown>>;
  tieBreaker: unknown;
};

export type SavedAnswerSheetSummary = {
  quizId: string;
  quizTitle: string | null;
  youtubeVideoId: string | null;
  updatedAt: string;
  score: number;
  total: number;
  hasMarkedAnswers: boolean;
};

type StoredAnswerSheetRecord = SavedAnswerSheetSummary & {
  answerSheet: AnswerSheetState;
};

export type SaveAnswerSheetRequest = {
  quizId: string;
  quizTitle: string | null;
  youtubeVideoId: string | null;
  answerSheet: AnswerSheetState;
};

function enqueueStorageOperation<Result>(
  operation: () => Promise<Result>
): Promise<Result> {
  const result = storageOperationQueue.then(operation, operation);

  storageOperationQueue = result.then(
    () => undefined,
    () => undefined
  );

  return result;
}

function isStoredAnswerSheet(value: unknown): value is StoredAnswerSheet {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.rounds === "object" &&
    candidate.rounds !== null &&
    "tieBreaker" in candidate
  );
}

function isRoundAnswers(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.length === ANSWERS_PER_ROUND &&
    value.every((answer) => typeof answer === "string")
  );
}

function isAnswerMark(value: unknown): value is AnswerMark {
  return value === "unmarked" || value === "correct" || value === "incorrect";
}

function isRoundMarks(value: unknown): value is AnswerMark[] {
  return (
    Array.isArray(value) &&
    value.length === ANSWERS_PER_ROUND &&
    value.every(isAnswerMark)
  );
}

function getRoundAnswers(
  rounds: Partial<Record<string, unknown>>,
  roundNumber: RoundNumber
) {
  const answers = rounds[String(roundNumber)];

  return isRoundAnswers(answers) ? answers : null;
}

function getRoundMarks(
  marks: Partial<Record<string, unknown>> | undefined,
  roundNumber: RoundNumber
) {
  const roundMarks = marks?.[String(roundNumber)];

  return isRoundMarks(roundMarks)
    ? roundMarks
    : Array.from({ length: ANSWERS_PER_ROUND }, () => "unmarked" as const);
}

function parseAnswerSheet(value: string): AnswerSheetState | null {
  try {
    const parsed: unknown = JSON.parse(value);

    if (!isStoredAnswerSheet(parsed)) {
      return null;
    }

    const rounds = ROUND_NUMBERS.reduce<AnswerSheetState["rounds"] | null>(
      (currentRounds, roundNumber) => {
        if (currentRounds === null) {
          return null;
        }

        const answers = getRoundAnswers(parsed.rounds, roundNumber);

        if (answers === null) {
          return null;
        }

        return {
          ...currentRounds,
          [roundNumber]: answers,
        };
      },
      {} as AnswerSheetState["rounds"]
    );
    const marks = ROUND_NUMBERS.reduce<AnswerSheetState["marks"]>(
      (currentMarks, roundNumber) => ({
        ...currentMarks,
        [roundNumber]: getRoundMarks(parsed.marks, roundNumber),
      }),
      {} as AnswerSheetState["marks"]
    );

    if (rounds === null || typeof parsed.tieBreaker !== "string") {
      return null;
    }

    return {
      rounds,
      marks,
      tieBreaker: parsed.tieBreaker,
    };
  } catch {
    return null;
  }
}

function getAnswerSheetStorageKey(quizId: string) {
  return `${ANSWER_SHEET_STORAGE_KEY_PREFIX}${quizId}`;
}

function parseSavedAnswerSheetSummary(
  value: unknown
): SavedAnswerSheetSummary | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.quizId !== "string" ||
    (typeof candidate.quizTitle !== "string" && candidate.quizTitle !== null) ||
    typeof candidate.updatedAt !== "string"
  ) {
    return null;
  }

  return {
    quizId: candidate.quizId,
    quizTitle: candidate.quizTitle,
    youtubeVideoId:
      typeof candidate.youtubeVideoId === "string"
        ? candidate.youtubeVideoId
        : null,
    updatedAt: candidate.updatedAt,
    score: typeof candidate.score === "number" ? candidate.score : 0,
    total:
      typeof candidate.total === "number"
        ? candidate.total
        : TOTAL_SCORABLE_ANSWERS,
    hasMarkedAnswers:
      typeof candidate.hasMarkedAnswers === "boolean"
        ? candidate.hasMarkedAnswers
        : false,
  };
}

function parseSavedAnswerSheetIndex(value: string): SavedAnswerSheetSummary[] {
  try {
    const parsed: unknown = JSON.parse(value);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.flatMap((sheet) => {
      const summary = parseSavedAnswerSheetSummary(sheet);

      return summary === null ? [] : [summary];
    });
  } catch {
    return [];
  }
}

function parseSavedAnswerSheetRecord(
  value: string
): StoredAnswerSheetRecord | null {
  try {
    const parsed: unknown = JSON.parse(value);

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    const candidate = parsed as Record<string, unknown>;

    if (
      typeof candidate.quizId !== "string" ||
      (typeof candidate.quizTitle !== "string" && candidate.quizTitle !== null) ||
      (typeof candidate.youtubeVideoId !== "string" &&
        candidate.youtubeVideoId !== null) ||
      typeof candidate.updatedAt !== "string"
    ) {
      return null;
    }

    const answerSheet = parseAnswerSheet(JSON.stringify(candidate.answerSheet));

    if (answerSheet === null) {
      return null;
    }

    return {
      quizId: candidate.quizId,
      quizTitle: candidate.quizTitle,
      youtubeVideoId: candidate.youtubeVideoId,
      updatedAt: candidate.updatedAt,
      score:
        typeof candidate.score === "number"
          ? candidate.score
          : calculateAnswerSheetScore(answerSheet),
      total:
        typeof candidate.total === "number"
          ? candidate.total
          : TOTAL_SCORABLE_ANSWERS,
      hasMarkedAnswers:
        typeof candidate.hasMarkedAnswers === "boolean"
          ? candidate.hasMarkedAnswers
          : hasMarkedAnswers(answerSheet),
      answerSheet,
    };
  } catch {
    return null;
  }
}

function getSummary(record: StoredAnswerSheetRecord): SavedAnswerSheetSummary {
  const { answerSheet: _answerSheet, ...summary } = record;

  return summary;
}

function sortSavedAnswerSheets(index: SavedAnswerSheetSummary[]) {
  return [...index].sort((firstSheet, secondSheet) =>
    secondSheet.updatedAt.localeCompare(firstSheet.updatedAt)
  );
}

function areIndexesEqual(
  firstIndex: SavedAnswerSheetSummary[],
  secondIndex: SavedAnswerSheetSummary[]
) {
  return (
    JSON.stringify(sortSavedAnswerSheets(firstIndex)) ===
    JSON.stringify(sortSavedAnswerSheets(secondIndex))
  );
}

async function loadStoredIndex() {
  const storedIndex = await AsyncStorage.getItem(ANSWER_SHEET_INDEX_STORAGE_KEY);

  return storedIndex === null ? [] : parseSavedAnswerSheetIndex(storedIndex);
}

async function loadRecords() {
  const storageKeys = await AsyncStorage.getAllKeys();
  const recordKeys = storageKeys.filter((key) =>
    key.startsWith(ANSWER_SHEET_STORAGE_KEY_PREFIX)
  );

  if (recordKeys.length === 0) {
    return [];
  }

  const storedRecords = await AsyncStorage.multiGet(recordKeys);

  return storedRecords.flatMap(([, value]) => {
    if (value === null) {
      return [];
    }

    const record = parseSavedAnswerSheetRecord(value);

    return record === null ? [] : [record];
  });
}

async function recoverSavedAnswerSheetIndex() {
  const [storedIndex, records] = await Promise.all([
    loadStoredIndex(),
    loadRecords(),
  ]);
  const recoveredIndex = sortSavedAnswerSheets(records.map(getSummary));

  if (!areIndexesEqual(storedIndex, recoveredIndex)) {
    await AsyncStorage.setItem(
      ANSWER_SHEET_INDEX_STORAGE_KEY,
      JSON.stringify(recoveredIndex)
    );
  }

  return recoveredIndex;
}

export async function listSavedAnswerSheets() {
  return enqueueStorageOperation(() => recoverSavedAnswerSheetIndex());
}

export async function loadSavedAnswerSheetForQuiz(quizId: string) {
  return enqueueStorageOperation(async () => {
    const storedAnswerSheet = await AsyncStorage.getItem(
      getAnswerSheetStorageKey(quizId)
    );

    return storedAnswerSheet === null
      ? null
      : parseSavedAnswerSheetRecord(storedAnswerSheet);
  });
}

export async function loadAnswerSheetForQuiz(quizId: string) {
  const record = await loadSavedAnswerSheetForQuiz(quizId);

  return record?.answerSheet ?? null;
}

export async function saveAnswerSheetForQuiz({
  quizId,
  quizTitle,
  youtubeVideoId,
  answerSheet,
}: SaveAnswerSheetRequest) {
  return enqueueStorageOperation(async () => {
    const updatedAt = new Date().toISOString();
    const score = calculateAnswerSheetScore(answerSheet);
    const sheetHasMarkedAnswers = hasMarkedAnswers(answerSheet);
    const record: StoredAnswerSheetRecord = {
      quizId,
      quizTitle,
      youtubeVideoId,
      updatedAt,
      score,
      total: TOTAL_SCORABLE_ANSWERS,
      hasMarkedAnswers: sheetHasMarkedAnswers,
      answerSheet,
    };
    const index = await recoverSavedAnswerSheetIndex();
    const nextIndex = sortSavedAnswerSheets([
      getSummary(record),
      ...index.filter((sheet) => sheet.quizId !== quizId),
    ]);

    await AsyncStorage.multiSet([
      [getAnswerSheetStorageKey(quizId), JSON.stringify(record)],
      [ANSWER_SHEET_INDEX_STORAGE_KEY, JSON.stringify(nextIndex)],
    ]);
  });
}

export async function clearSavedAnswerSheetForQuiz(quizId: string) {
  return enqueueStorageOperation(async () => {
    await AsyncStorage.multiRemove([
      getAnswerSheetStorageKey(quizId),
      ANSWER_SHEET_INDEX_STORAGE_KEY,
    ]);
    await recoverSavedAnswerSheetIndex();
  });
}

export async function clearAllSavedAnswerSheets() {
  return enqueueStorageOperation(async () => {
    const storageKeys = await AsyncStorage.getAllKeys();
    const answerSheetKeys = storageKeys.filter(
      (key) =>
        key === ANSWER_SHEET_INDEX_STORAGE_KEY ||
        key.startsWith(ANSWER_SHEET_STORAGE_KEY_PREFIX)
    );

    if (answerSheetKeys.length > 0) {
      await AsyncStorage.multiRemove(answerSheetKeys);
    }
  });
}
