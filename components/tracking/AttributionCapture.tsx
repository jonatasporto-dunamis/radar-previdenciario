"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  getAttributionFromSession,
  parseAttributionFromSearchParams,
  saveAttributionToSession,
} from "@/lib/attribution";

export function AttributionCapture() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const attribution = parseAttributionFromSearchParams(
      new URLSearchParams(searchParams.toString()),
    );
    const storedAttribution = getAttributionFromSession();

    saveAttributionToSession({
      ...attribution,
      referrer: storedAttribution.referrer ?? document.referrer ?? undefined,
      landingPage: storedAttribution.landingPage ?? window.location.href,
    });
  }, [searchParams]);

  return null;
}
