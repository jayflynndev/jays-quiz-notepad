import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ANSWERS_PER_ROUND,
  ROUND_NUMBERS,
  type AnswerSheetState,
  type RoundNumber,
} from "../../types/answerSheet";

const ANSWER_SHEET_INDEX_STORAGE_KEY = "jays-quiz-notepad:answer-sheets:index";
const ANSWER_SHEET_STORAGE_KEY_PREFIX = "jays-quiz-notepad:answer-sheet:";

type StoredAnswerSheet = {
  rounds: Partial<Record<string, unknown>>;
  tieBreaker: unknown;
};

export type SavedAnswerSheetSummary = {
  quizId: string;
  quizTitle: string | null;
  youtubeVideoId: string | null;
  updatedAt: string;
};

type StoredAnswerSheetRecord = SavedAnswerSheetSummary & {
  youtubeVideoId: string | null;
  answerSheet: AnswerSheetState;
};

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

function getRoundAnswers(
  rounds: Partial<Record<string, unknown>>,
  roundNumber: RoundNumber
) {
  const answers = rounds[String(roundNumber)];

  return isRoundAnswers(answers) ? answers : null;
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

    if (rounds === null || typeof parsed.tieBreaker !== "string") {
      return null;
    }

    return {
      rounds,
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
      answerSheet,
    };
  } catch {
    return null;
  }
}

async function loadSavedAnswerSheetIndex() {
  const storedIndex = await AsyncStorage.getItem(ANSWER_SHEET_INDEX_STORAGE_KEY);

  if (storedIndex === null) {
    return [];
  }

  return parseSavedAnswerSheetIndex(storedIndex);
}

async function saveSavedAnswerSheetIndex(index: SavedAnswerSheetSummary[]) {
  await AsyncStorage.setItem(
    ANSWER_SHEET_INDEX_STORAGE_KEY,
    JSON.stringify(index)
  );
}

export async function listSavedAnswerSheets() {
  const index = await loadSavedAnswerSheetIndex();

  return index.sort((firstSheet, secondSheet) =>
    secondSheet.updatedAt.localeCompare(firstSheet.updatedAt)
  );
}

export async function loadAnswerSheetForQuiz(quizId: string) {
  const storedAnswerSheet = await AsyncStorage.getItem(
    getAnswerSheetStorageKey(quizId)
  );

  if (storedAnswerSheet === null) {
    return null;
  }

  const record = parseSavedAnswerSheetRecord(storedAnswerSheet);

  return record?.answerSheet ?? null;
}

export async function saveAnswerSheetForQuiz({
  quizId,
  quizTitle,
  youtubeVideoId,
  answerSheet,
}: {
  quizId: string;
  quizTitle: string | null;
  youtubeVideoId: string | null;
  answerSheet: AnswerSheetState;
}) {
  const updatedAt = new Date().toISOString();
  const record: StoredAnswerSheetRecord = {
    quizId,
    quizTitle,
    youtubeVideoId,
    updatedAt,
    answerSheet,
  };
  const index = await loadSavedAnswerSheetIndex();
  const nextIndex = [
    {
      quizId,
      quizTitle,
      youtubeVideoId,
      updatedAt,
    },
    ...index.filter((sheet) => sheet.quizId !== quizId),
  ];

  await AsyncStorage.setItem(
    getAnswerSheetStorageKey(quizId),
    JSON.stringify(record)
  );
  await saveSavedAnswerSheetIndex(nextIndex);
}

export async function clearSavedAnswerSheetForQuiz(quizId: string) {
  const index = await loadSavedAnswerSheetIndex();

  await AsyncStorage.removeItem(getAnswerSheetStorageKey(quizId));
  await saveSavedAnswerSheetIndex(
    index.filter((sheet) => sheet.quizId !== quizId)
  );
}
