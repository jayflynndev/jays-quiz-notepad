export type QuizStatus = "upcoming" | "live" | "ended";

export type Quiz = {
  id: string;
  title: string;
  youtubeVideoId: string;
  status: QuizStatus;
  startTime: string;
};

export const fallbackCurrentQuiz: Quiz = {
  id: "local-fallback",
  title: "Jay's Virtual Pub Quiz",
  youtubeVideoId: "dQw4w9WgXcQ",
  status: "live",
  startTime: "2026-06-18T20:00:00+01:00",
};
