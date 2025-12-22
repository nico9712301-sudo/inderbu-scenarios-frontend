"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale/es";
import {
  getAllNotificationsAction,
  getUnreadNotificationsCountAction,
  markNotificationAsReadAction,
  type NotificationResponseDto,
} from "@/infrastructure/web/controllers/dashboard/notifications.actions";
import { useNotificationContextOptional } from "@/shared/providers/notification-context.provider";

interface NotificationBellProps {
  onNotificationClick?: (notification: NotificationResponseDto) => void;
}

export function NotificationBell({ onNotificationClick: propOnNotificationClick }: NotificationBellProps) {
  // Get context optionally (won't throw if not available)
  const context = useNotificationContextOptional();
  const contextOnNotificationClick = context?.onNotificationClick;
  const [notifications, setNotifications] = useState<NotificationResponseDto[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      // Load ALL notifications (read and unread), ordered by most recent first
      const result = await getAllNotificationsAction(1, 50);
      if (result.success) {
        // result.data contains { data: NotificationResponseDto[], total: number, page: number, limit: number }
        const notificationsData = result.data?.data || [];
        setNotifications(notificationsData);
        // Update unread count based on loaded notifications
        const unreadCount = notificationsData.filter((n) => !n.isRead).length;
        setUnreadCount(unreadCount);
      }
    } catch (error) {
      console.error("Error loading notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const result = await getUnreadNotificationsCountAction();
      if (result.success) {
        // result.data is already the number (extracted in server action)
        const count = typeof result.data === 'number' ? result.data : 0;
        setUnreadCount(count);
      }
    } catch (error) {
      console.error("Error loading unread count:", error);
      setUnreadCount(0);
    }
  };

  // Load notifications when dropdown opens
  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(() => {
      loadUnreadCount();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: NotificationResponseDto) => {
    // Mark as read if not already read
    if (!notification.isRead) {
      try {
        const result = await markNotificationAsReadAction(notification.id);
        if (result.success) {
          // Update local state - mark as read but keep the notification visible
          // result.data is already the NotificationResponseDto with updated isRead status
          const updatedNotification = result.data;
          
          setNotifications((prev) =>
            prev.map((n) => 
              n.id === notification.id 
                ? { ...n, isRead: true, readAt: updatedNotification?.readAt || new Date() }
                : n
            )
          );
          // Update unread count
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    // Call callback (prop takes precedence over context)
    const handler = propOnNotificationClick || contextOnNotificationClick;
    if (handler) {
      handler(notification);
    }
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative text-gray-100 hover:!text-gray-100 hover:!bg-transparent [&_svg]:text-gray-100 [&_svg]:hover:!text-gray-100"
        >
          <Bell className="h-5 w-5 text-gray-100" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Notificaciones</h4>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {unreadCount} sin leer
              </Badge>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="ml-2 text-sm text-muted-foreground">Cargando...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No hay notificaciones</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`cursor-pointer p-3 rounded-lg ${
                    !notification.isRead
                      ? "bg-blue-50 border border-blue-200"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex flex-col gap-1 w-full">
                    <div className="flex items-start justify-between">
                      <p
                        className={`text-sm font-medium ${
                          !notification.isRead ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {notification.title}
                      </p>
                      {!notification.isRead && (
                        <div className="h-2 w-2 bg-blue-600 rounded-full mt-1" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(notification.createdAt), "dd MMM yyyy, HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
