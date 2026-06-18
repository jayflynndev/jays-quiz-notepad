export type QuizStatus = "upcoming" | "live" | "ended";

export type CurrentQuiz = {
  title: string;
  youtubeVideoId: string;
  status: QuizStatus;
  startTime: string;
};

export const currentQuiz: CurrentQuiz = {
  title: "Jay's Virtual Pub Quiz",
  youtubeVideoId: "dQw4w9WgXcQ",
  status: "live",
  startTime: "2026-06-18T20:00:00+01:00",
};
