"use client";

import { useEffect, useRef } from "react";
import { trackResultViewedAction } from "@/app/resultado/actions";

type ResultViewedTrackerProps = {
  resultId: string;
};

export function ResultViewedTracker({ resultId }: ResultViewedTrackerProps) {
  const trackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) {
      return;
    }

    trackedRef.current = true;
    void trackResultViewedAction(resultId);
  }, [resultId]);

  return null;
}
