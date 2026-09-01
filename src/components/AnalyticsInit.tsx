"use client";

import { useEffect } from "react";
import { getFirebaseAnalytics } from "@/lib/firebase";

/** Renders nothing — just lazily boots Firebase Analytics in the browser. */
export function AnalyticsInit() {
  useEffect(() => {
    void getFirebaseAnalytics();
  }, []);

  return null;
}
