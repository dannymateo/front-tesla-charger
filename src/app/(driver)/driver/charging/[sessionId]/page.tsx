"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChargingSessionView } from "@/components/charging/ChargingSessionView";
import { useSessionSocket } from "@/hooks/useSocket";
import { clientApi } from "@/lib/client-api";
import type { SessionProgressEvent, SessionView } from "@/lib/types";

export default function ChargingSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;
  const [session, setSession] = useState<SessionView | null>(null);
  const [progress, setProgress] = useState<SessionProgressEvent | null>(null);
  const [stopping, setStopping] = useState(false);

  useSessionSocket(sessionId, (payload) => {
    const event = payload as SessionProgressEvent;
    setProgress(event);
    if (event.percentComplete >= 100) {
      void refreshSession();
    }
  });

  async function refreshSession() {
    const data = await clientApi<SessionView>(`/sessions/${sessionId}`);
    setSession(data);
    if (data.status !== "IN_PROGRESS") {
      router.refresh();
      setTimeout(() => router.push("/driver/billing?refresh=1"), 2000);
    }
  }

  useEffect(() => {
    void refreshSession();
    const interval = setInterval(() => {
      void refreshSession();
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  async function stopSession() {
    setStopping(true);
    await clientApi(`/sessions/${sessionId}/stop`, { method: "POST" });
    await refreshSession();
    setStopping(false);
  }

  return (
    <ChargingSessionView
      session={session}
      progress={progress}
      stopping={stopping}
      onStop={stopSession}
    />
  );
}
