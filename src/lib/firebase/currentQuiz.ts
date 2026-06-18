import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "../../config/firebase";
import type { Quiz, QuizStatus } from "../../config/currentQuiz";

const APP_CONFIG_COLLECTION = "appConfig";
const CURRENT_QUIZ_DOCUMENT = "currentQuiz";
const QUIZZES_COLLECTION = "quizzes";
const CURRENT_QUIZ_PATH = `${APP_CONFIG_COLLECTION}/${CURRENT_QUIZ_DOCUMENT}`;

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

function parseCurrentQuizId(value: unknown) {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  return typeof candidate.quizId === "string" && candidate.quizId.length > 0
    ? candidate.quizId
    : null;
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

export async function getCurrentQuizId() {
  const db = getFirebaseDb();

  if (db === null) {
    throw new Error("Firebase is not configured");
  }

  console.info(`[Firestore] Reading path: ${CURRENT_QUIZ_PATH}`);

  try {
    const currentQuizSnapshot = await getDoc(
      doc(db, APP_CONFIG_COLLECTION, CURRENT_QUIZ_DOCUMENT)
    );

    if (!currentQuizSnapshot.exists()) {
      throw new Error("Firestore current quiz reference was not found");
    }

    const quizId = parseCurrentQuizId(currentQuizSnapshot.data());

    if (quizId === null) {
      console.warn(
        "[Firestore] Expected appConfig/currentQuiz fields: quizId"
      );
      throw new Error("Firestore current quiz reference has an invalid shape");
    }

    console.info(`[Firestore] Current quiz ID loaded: ${quizId}`);

    return quizId;
  } catch (error) {
    const { code, message } = getErrorDetails(error);
    console.warn(`[Firestore] Current quiz ID error code: ${code}`);
    console.warn(`[Firestore] Current quiz ID error message: ${message}`);
    throw error;
  }
}

export async function getQuizById(quizId: string) {
  const db = getFirebaseDb();

  if (db === null) {
    throw new Error("Firebase is not configured");
  }

  const quizPath = `${QUIZZES_COLLECTION}/${quizId}`;
  console.info(`[Firestore] Reading path: ${quizPath}`);

  try {
    const quizSnapshot = await getDoc(doc(db, QUIZZES_COLLECTION, quizId));

    if (!quizSnapshot.exists()) {
      throw new Error(`Firestore quiz document was not found: ${quizId}`);
    }

    const quiz = parseQuiz(quizSnapshot.data(), quizId);

    if (quiz === null) {
      console.warn(
        "[Firestore] Expected quiz fields: title, youtubeVideoId, status, startTime"
      );
      throw new Error("Firestore quiz document has an invalid shape");
    }

    console.info(`[Firestore] Quiz loaded successfully: ${quizId}`);

    return quiz;
  } catch (error) {
    const { code, message } = getErrorDetails(error);
    console.warn(`[Firestore] Quiz error code: ${code}`);
    console.warn(`[Firestore] Quiz error message: ${message}`);
    throw error;
  }
}

export async function fetchCurrentQuizFromFirestore() {
  const quizId = await getCurrentQuizId();

  return getQuizById(quizId);
}
