import { useEffect, useState } from "react";
import {
  fallbackCurrentQuiz,
  type CurrentQuiz,
} from "../config/currentQuiz";
import { fetchCurrentQuizFromFirestore } from "../lib/firebase/currentQuiz";

type CurrentQuizState = {
  currentQuiz: CurrentQuiz;
  isLoading: boolean;
  errorMessage: string | null;
};

export function useCurrentQuiz(): CurrentQuizState {
  const [currentQuiz, setCurrentQuiz] =
    useState<CurrentQuiz>(fallbackCurrentQuiz);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCurrentQuiz() {
      try {
        const firestoreCurrentQuiz = await fetchCurrentQuizFromFirestore();

        if (!isMounted) {
          return;
        }

        setCurrentQuiz(firestoreCurrentQuiz);
        setErrorMessage(null);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setCurrentQuiz(fallbackCurrentQuiz);
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Unable to load current quiz from Firestore"
        );
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadCurrentQuiz();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    currentQuiz,
    isLoading,
    errorMessage,
  };
}
