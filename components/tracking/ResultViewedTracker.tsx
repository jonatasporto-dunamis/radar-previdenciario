"use client";

import { useEffect, useRef } from "react";
import { trackResultViewedAction } from "@/app/resultado/actions";
import { dispatchBrowserExternalEvent } from "@/lib/tracking";
import { useTrackingConfig } from "./TrackingProvider";

type ResultViewedTrackerProps = {
  resultId: string;
  qualifiedLeadExternalEventId?: string | null;
};

export function ResultViewedTracker({
  resultId,
  qualifiedLeadExternalEventId,
}: ResultViewedTrackerProps) {
  const trackingConfig = useTrackingConfig();
  const trackedRef = useRef(false);
  const qualifiedLeadTrackedRef = useRef(false);

  useEffect(() => {
    if (trackedRef.current) {
      return;
    }

    trackedRef.current = true;
    void trackResultViewedAction(resultId).then((result) => {
      if (!result.success || !result.externalEventId) {
        return;
      }

      dispatchBrowserExternalEvent({
        config: trackingConfig,
        eventName: "ResultViewed",
        eventId: result.externalEventId,
        resultId,
        metadata: {
          source: "result_page",
        },
        scope: resultId,
      });
    });
  }, [resultId, trackingConfig]);

  useEffect(() => {
    if (qualifiedLeadTrackedRef.current || !qualifiedLeadExternalEventId) {
      return;
    }

    qualifiedLeadTrackedRef.current = true;
    dispatchBrowserExternalEvent({
      config: trackingConfig,
      eventName: "QualifiedLead",
      eventId: qualifiedLeadExternalEventId,
      resultId,
      metadata: {
        source: "qualification_pipeline",
        qualified: true,
      },
      scope: qualifiedLeadExternalEventId,
    });
  }, [qualifiedLeadExternalEventId, resultId, trackingConfig]);

  return null;
}
