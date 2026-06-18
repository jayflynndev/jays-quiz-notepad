import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  ANSWERS_PER_ROUND,
  ROUND_NUMBERS,
  type AnswerSheetState,
  type RoundNumber,
} from "../../types/answerSheet";

const ANSWER_SHEET_STORAGE_KEY = "jays-quiz-notepad:answer-sheet";

type StoredAnswerSheet = {
  rounds: Partial<Record<string, unknown>>;
  tieBreaker: unknown;
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

export async function loadAnswerSheet() {
  const storedAnswerSheet = await AsyncStorage.getItem(ANSWER_SHEET_STORAGE_KEY);

  if (storedAnswerSheet === null) {
    return null;
  }

  return parseAnswerSheet(storedAnswerSheet);
}

export async function saveAnswerSheet(answerSheet: AnswerSheetState) {
  await AsyncStorage.setItem(
    ANSWER_SHEET_STORAGE_KEY,
    JSON.stringify(answerSheet)
  );
}

export async function clearSavedAnswerSheet() {
  await AsyncStorage.removeItem(ANSWER_SHEET_STORAGE_KEY);
}
