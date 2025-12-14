"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import type { NotificationResponseDto } from "@/infrastructure/web/controllers/dashboard/notifications.actions";

interface NotificationContextType {
  onNotificationClick: (notification: NotificationResponseDto) => void;
  setNotificationHandler: (handler: (notification: NotificationResponseDto) => void) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [handler, setHandler] = useState<((notification: NotificationResponseDto) => void) | null>(null);

  const setNotificationHandler = useCallback(
    (newHandler: (notification: NotificationResponseDto) => void) => {
      setHandler(() => newHandler);
    },
    []
  );

  const onNotificationClick = useCallback(
    (notification: NotificationResponseDto) => {
      if (handler) {
        handler(notification);
      }
    },
    [handler]
  );

  return (
    <NotificationContext.Provider value={{ onNotificationClick, setNotificationHandler }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotificationContext() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotificationContext must be used within NotificationProvider");
  }
  return context;
}

export function useNotificationContextOptional() {
  const context = useContext(NotificationContext);
  return context;
}
