import { doc, getDoc } from "firebase/firestore";
import { getFirebaseDb } from "../../config/firebase";
import type { CurrentQuiz, QuizStatus } from "../../config/currentQuiz";

const CURRENT_QUIZ_COLLECTION = "appConfig";
const CURRENT_QUIZ_DOCUMENT = "currentQuiz";
const CURRENT_QUIZ_PATH = `${CURRENT_QUIZ_COLLECTION}/${CURRENT_QUIZ_DOCUMENT}`;

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

function parseCurrentQuiz(value: unknown): CurrentQuiz | null {
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
    title: candidate.title,
    youtubeVideoId: candidate.youtubeVideoId,
    status: candidate.status,
    startTime: candidate.startTime,
  };
}

export async function fetchCurrentQuizFromFirestore() {
  const db = getFirebaseDb();

  if (db === null) {
    throw new Error("Firebase is not configured");
  }

  console.info(`[Firestore] Reading path: ${CURRENT_QUIZ_PATH}`);

  try {
    const currentQuizSnapshot = await getDoc(
      doc(db, CURRENT_QUIZ_COLLECTION, CURRENT_QUIZ_DOCUMENT)
    );

    if (!currentQuizSnapshot.exists()) {
      throw new Error("Firestore current quiz document was not found");
    }

    const currentQuiz = parseCurrentQuiz(currentQuizSnapshot.data());

    if (currentQuiz === null) {
      console.warn(
        "[Firestore] Expected currentQuiz fields: title, youtubeVideoId, status, startTime"
      );
      throw new Error("Firestore current quiz document has an invalid shape");
    }

    console.info("[Firestore] Current quiz loaded successfully");

    return currentQuiz;
  } catch (error) {
    const { code, message } = getErrorDetails(error);
    console.warn(`[Firestore] Current quiz error code: ${code}`);
    console.warn(`[Firestore] Current quiz error message: ${message}`);
    throw error;
  }
}
