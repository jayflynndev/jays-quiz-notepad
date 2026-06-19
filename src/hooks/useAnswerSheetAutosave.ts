import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearSavedAnswerSheetForQuiz,
  saveAnswerSheetForQuiz,
  type SaveAnswerSheetRequest,
} from "../lib/storage/answerSheetStorage";

const AUTOSAVE_DELAY_MS = 350;

type PendingSave = {
  generation: number;
  request: SaveAnswerSheetRequest;
};

export function useAnswerSheetAutosave() {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingSaveRef = useRef<PendingSave | null>(null);
  const generationRef = useRef(0);
  const operationQueueRef = useRef<Promise<void>>(Promise.resolve());
  const isMountedRef = useRef(true);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);

  const queueOperation = useCallback((operation: () => Promise<void>) => {
    const result = operationQueueRef.current.then(operation, operation);

    operationQueueRef.current = result.catch(() => {
      if (isMountedRef.current) {
        setSaveErrorMessage("Answers could not be saved on this device.");
      }
    });

    return operationQueueRef.current;
  }, []);

  const takePendingSave = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    const pendingSave = pendingSaveRef.current;
    pendingSaveRef.current = null;

    return pendingSave;
  }, []);

  const persistPendingSave = useCallback(() => {
    const pendingSave = takePendingSave();

    if (pendingSave === null) {
      return operationQueueRef.current;
    }

    return queueOperation(async () => {
      if (pendingSave.generation !== generationRef.current) {
        return;
      }

      await saveAnswerSheetForQuiz(pendingSave.request);

      if (isMountedRef.current) {
        setSaveErrorMessage(null);
      }
    });
  }, [queueOperation, takePendingSave]);

  const scheduleSave = useCallback(
    (request: SaveAnswerSheetRequest) => {
      takePendingSave();
      pendingSaveRef.current = {
        generation: generationRef.current,
        request,
      };
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        void persistPendingSave();
      }, AUTOSAVE_DELAY_MS);
    },
    [persistPendingSave, takePendingSave]
  );

  const flushPendingSave = useCallback(
    () => persistPendingSave(),
    [persistPendingSave]
  );

  const clearSavedSheet = useCallback(
    (quizId: string) => {
      generationRef.current += 1;
      takePendingSave();

      return queueOperation(() => clearSavedAnswerSheetForQuiz(quizId));
    },
    [queueOperation, takePendingSave]
  );

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      void persistPendingSave();
    };
  }, [persistPendingSave]);

  return {
    clearSavedSheet,
    flushPendingSave,
    saveErrorMessage,
    scheduleSave,
  };
}
