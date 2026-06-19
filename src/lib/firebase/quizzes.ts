import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  where,
  type Query,
} from "firebase/firestore";
import { getFirebaseDb } from "../../config/firebase";
import type { Quiz, QuizStatus } from "../../config/currentQuiz";

const QUIZZES_COLLECTION = "quizzes";

function getErrorDetails(error: unknown) {
  if (typeof error !== "object" || error === null) {
    return {
      code: "unknown",
      message: "Unknown Firestore error",
    };
  }

  const candidate = error as Record<string, unknown>;

  return {
    code: typeof candidate.code === "string" ? candidate.code : "unknown",
    message:
      typeof candidate.message === "string"
        ? candidate.message
        : "Unknown Firestore error",
  };
}

function isQuizStatus(value: unknown): value is QuizStatus {
  return value === "upcoming" || value === "live" || value === "ended";
}

function parseQuiz(value: unknown, quizId: string): Quiz | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    typeof candidate.title !== "string" ||
    typeof candidate.youtubeVideoId !== "string" ||
    !isQuizStatus(candidate.status) ||
    typeof candidate.startTime !== "string"
  ) {
    return null;
  }

  return {
    id: quizId,
    title: candidate.title,
    youtubeVideoId: candidate.youtubeVideoId,
    status: candidate.status,
    startTime: candidate.startTime,
  };
}

async function fetchQuizQuery(
  quizzesQuery: Query,
  queryDescription: string
) {
  const db = getFirebaseDb();

  if (db === null) {
    throw new Error("Firebase is not configured");
  }

  console.info(`[Firestore] Reading quizzes: ${queryDescription}`);

  try {
    const quizzesSnapshot = await getDocs(quizzesQuery);

    return quizzesSnapshot.docs.map((quizDocument) => {
      const quiz = parseQuiz(quizDocument.data(), quizDocument.id);

      if (quiz === null) {
        console.warn(
          `[Firestore] Invalid quiz shape: ${QUIZZES_COLLECTION}/${quizDocument.id}`
        );
        throw new Error("Firestore quiz document has an invalid shape");
      }

      return quiz;
    });
  } catch (error) {
    const { code, message } = getErrorDetails(error);
    console.warn(`[Firestore] Quizzes error code: ${code}`);
    console.warn(`[Firestore] Quizzes error message: ${message}`);
    throw error;
  }
}

export async function fetchNextUpcomingQuiz(now: Date) {
  const db = getFirebaseDb();

  if (db === null) {
    throw new Error("Firebase is not configured");
  }

  const upcomingQuizQuery = query(
    collection(db, QUIZZES_COLLECTION),
    where("status", "==", "upcoming"),
    where("startTime", ">=", now.toISOString()),
    orderBy("startTime", "asc"),
    limit(1)
  );
  const quizzes = await fetchQuizQuery(
    upcomingQuizQuery,
    "next upcoming quiz"
  );

  return quizzes[0] ?? null;
}

export async function fetchRecentQuizWindow(now: Date) {
  const db = getFirebaseDb();

  if (db === null) {
    throw new Error("Firebase is not configured");
  }

  const recentQuizQuery = query(
    collection(db, QUIZZES_COLLECTION),
    where("startTime", "<=", now.toISOString()),
    orderBy("startTime", "desc"),
    limit(12)
  );

  return fetchQuizQuery(recentQuizQuery, "12 most recent quizzes");
}
