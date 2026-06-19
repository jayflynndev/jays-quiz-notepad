import { useEffect, useState } from "react";
import type { Quiz } from "../config/currentQuiz";
import {
  fetchNextUpcomingQuiz,
  fetchRecentQuizWindow,
} from "../lib/firebase/quizzes";

type HomeQuizzesState = {
  nextQuiz: Quiz | null;
  recentQuizzes: Quiz[];
  isLoading: boolean;
  errorMessage: string | null;
};

const ukWeekdayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  timeZone: "Europe/London",
});

function getUkWeekday(quiz: Quiz) {
  const date = new Date(quiz.startTime);

  return Number.isNaN(date.getTime()) ? null : ukWeekdayFormatter.format(date);
}

export function selectRecentThursdayAndSaturday(quizzes: Quiz[]) {
  let thursdayQuiz: Quiz | null = null;
  let saturdayQuiz: Quiz | null = null;

  for (const quiz of quizzes) {
    if (quiz.status === "upcoming") {
      continue;
    }

    const weekday = getUkWeekday(quiz);

    if (weekday === "Thursday" && thursdayQuiz === null) {
      thursdayQuiz = quiz;
    }

    if (weekday === "Saturday" && saturdayQuiz === null) {
      saturdayQuiz = quiz;
    }

    if (thursdayQuiz !== null && saturdayQuiz !== null) {
      break;
    }
  }

  const selectedQuizIds = new Set(
    [thursdayQuiz?.id, saturdayQuiz?.id].filter(
      (quizId): quizId is string => quizId !== undefined
    )
  );

  return quizzes.filter((quiz) => selectedQuizIds.has(quiz.id));
}

export function useHomeQuizzes(): HomeQuizzesState {
  const [nextQuiz, setNextQuiz] = useState<Quiz | null>(null);
  const [recentQuizzes, setRecentQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeQuizzes() {
      try {
        const now = new Date();
        const [upcomingQuiz, recentQuizWindow] = await Promise.all([
          fetchNextUpcomingQuiz(now),
          fetchRecentQuizWindow(now),
        ]);

        if (!isMounted) {
          return;
        }

        setNextQuiz(upcomingQuiz);
        setRecentQuizzes(
          selectRecentThursdayAndSaturday(recentQuizWindow)
        );
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setNextQuiz(null);
        setRecentQuizzes([]);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load quizzes from Firestore"
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadHomeQuizzes();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    nextQuiz,
    recentQuizzes,
    isLoading,
    errorMessage,
  };
}
