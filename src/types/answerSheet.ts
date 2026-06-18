export const ROUND_NUMBERS = [1, 2, 3, 4, 5] as const;

export const ANSWERS_PER_ROUND = 10;

export type RoundNumber = (typeof ROUND_NUMBERS)[number];

export type AnswerSheetState = {
  rounds: Record<RoundNumber, string[]>;
  tieBreaker: string;
};
