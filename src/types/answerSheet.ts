export const ROUND_NUMBERS = [1, 2, 3, 4, 5] as const;

export const ANSWERS_PER_ROUND = 10;

export type RoundNumber = (typeof ROUND_NUMBERS)[number];

export type AnswerMark = "unmarked" | "correct" | "incorrect";

export type AnswerSheetState = {
  rounds: Record<RoundNumber, string[]>;
  marks: Record<RoundNumber, AnswerMark[]>;
  tieBreaker: string;
};

function createEmptyRounds() {
  return {
    1: Array.from({ length: ANSWERS_PER_ROUND }, () => ""),
    2: Array.from({ length: ANSWERS_PER_ROUND }, () => ""),
    3: Array.from({ length: ANSWERS_PER_ROUND }, () => ""),
    4: Array.from({ length: ANSWERS_PER_ROUND }, () => ""),
    5: Array.from({ length: ANSWERS_PER_ROUND }, () => ""),
  };
}

function createEmptyMarks() {
  return {
    1: Array.from({ length: ANSWERS_PER_ROUND }, () => "unmarked" as const),
    2: Array.from({ length: ANSWERS_PER_ROUND }, () => "unmarked" as const),
    3: Array.from({ length: ANSWERS_PER_ROUND }, () => "unmarked" as const),
    4: Array.from({ length: ANSWERS_PER_ROUND }, () => "unmarked" as const),
    5: Array.from({ length: ANSWERS_PER_ROUND }, () => "unmarked" as const),
  };
}

export function createInitialAnswerSheet(): AnswerSheetState {
  return {
    rounds: createEmptyRounds(),
    marks: createEmptyMarks(),
    tieBreaker: "",
  };
}

export function calculateAnswerSheetScore(answerSheet: AnswerSheetState) {
  return ROUND_NUMBERS.reduce(
    (score, roundNumber) =>
      score +
      answerSheet.marks[roundNumber].filter((mark) => mark === "correct")
        .length,
    0
  );
}

export function hasMarkedAnswers(answerSheet: AnswerSheetState) {
  return ROUND_NUMBERS.some((roundNumber) =>
    answerSheet.marks[roundNumber].some((mark) => mark !== "unmarked")
  );
}

export function hasAnswerSheetProgress(answerSheet: AnswerSheetState) {
  return (
    answerSheet.tieBreaker.trim().length > 0 ||
    ROUND_NUMBERS.some((roundNumber) =>
      answerSheet.rounds[roundNumber].some(
        (answer) => answer.trim().length > 0
      )
    ) ||
    hasMarkedAnswers(answerSheet)
  );
}

export function isAnswerSheetCompleted(answerSheet: AnswerSheetState) {
  return ROUND_NUMBERS.every((roundNumber) =>
    answerSheet.marks[roundNumber].every((mark) => mark !== "unmarked")
  );
}

export const TOTAL_SCORABLE_ANSWERS =
  ROUND_NUMBERS.length * ANSWERS_PER_ROUND;
