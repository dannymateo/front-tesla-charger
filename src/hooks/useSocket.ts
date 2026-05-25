"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { WS_URL } from "@/lib/constants";

type UseSocketOptions = {
  enabled?: boolean;
  onConnect?: (socket: Socket) => void;
};

export function useSocket(options: UseSocketOptions = {}) {
  const { enabled = true } = options;
  const onConnectRef = useRef(options.onConnect);
  onConnectRef.current = options.onConnect;

  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    fetch("/api/auth/session")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.token) {
          setToken(data.token);
        }
      })
      .catch(() => {
        if (!cancelled) setToken(null);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !token) return;

    const socket = io(WS_URL, {
      path: "/ws",
      transports: ["websocket", "polling"],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    const handleConnect = () => {
      setConnected(true);
      onConnectRef.current?.(socket);
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [enabled, token]);

  return { socket: socketRef.current, connected, token };
}

export function useMapSocket(
  onStationStateChanged: (payload: unknown) => void,
  isAdmin = false,
) {
  const handlerRef = useRef(onStationStateChanged);
  handlerRef.current = onStationStateChanged;

  const isAdminRef = useRef(isAdmin);
  isAdminRef.current = isAdmin;

  const { socket, connected } = useSocket({
    onConnect: (s) => {
      s.emit("map.join");
      if (isAdminRef.current) {
        s.emit("admin.join");
      }
    },
  });

  useEffect(() => {
    if (!socket) return;

    const handler = (payload: unknown) => handlerRef.current(payload);
    socket.on("station.state.changed", handler);

    return () => {
      socket.off("station.state.changed", handler);
    };
  }, [socket, connected]);

  return { socket, connected };
}

export function useSessionSocket(
  sessionId: string | null,
  onProgress: (payload: unknown) => void,
) {
  const handlerRef = useRef(onProgress);
  handlerRef.current = onProgress;

  const sessionIdRef = useRef(sessionId);
  sessionIdRef.current = sessionId;

  const { socket, connected } = useSocket({
    enabled: Boolean(sessionId),
    onConnect: (s) => {
      const id = sessionIdRef.current;
      if (id) {
        s.emit("session.join", { sessionId: id });
      }
    },
  });

  useEffect(() => {
    if (!socket || !sessionId) return;

    socket.emit("session.join", { sessionId });

    const handler = (payload: unknown) => handlerRef.current(payload);
    socket.on("session.progress.updated", handler);

    return () => {
      socket.off("session.progress.updated", handler);
    };
  }, [socket, sessionId, connected]);

  return { socket, connected };
}
