import { useEffect, useState, useRef } from "react";
import { supabase } from "../lib/supabaseClient";

// Global cache for realtime sync
const callbacks = new Set<() => void>();
let globalChannel: any = null;
let globalStatus: "connecting" | "active" | "error" = "connecting";
const statusCallbacks = new Set<(status: "connecting" | "active" | "error") => void>();

function initGlobalChannel() {
  if (globalChannel || !supabase) return;

  const tables = [
    "members",
    "workspace_settings",
    "programs",
    "program_members",
    "program_tasks",
    "attendance_sessions",
    "attendance_records",
    "financial_transactions",
    "reports",
    "report_templates",
    "whatsapp_templates",
    "documents",
    "announcements",
    "agendas",
    "activity_logs"
  ];

  const channelId = "realtime-refresh-global";
  globalChannel = supabase.channel(channelId);

  tables.forEach((table) => {
    globalChannel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: table },
      (payload: any) => {
        // Ignore payloads where new and old do not contain an id.
        const row = payload?.new || payload?.old;
        if (!row || typeof row !== "object" || !row.id) {
          return;
        }

        // Notify all registered callbacks
        callbacks.forEach((cb) => {
          try {
            cb();
          } catch (e) {
            // Silently handle error in individual callback to prevent crash
          }
        });
      }
    );
  });

  globalChannel.subscribe((subStatus: string) => {
    let nextStatus: "connecting" | "active" | "error" = "connecting";
    if (subStatus === "SUBSCRIBED") {
      nextStatus = "active";
    } else if (subStatus === "CHANNEL_ERROR") {
      nextStatus = "error";
    }
    globalStatus = nextStatus;
    statusCallbacks.forEach((cb) => {
      try {
        cb(nextStatus);
      } catch (e) {
        // Safe fail
      }
    });
  });
}

export function useRealtimeRefresh(onUpdate?: () => void) {
  const [status, setStatus] = useState<"connecting" | "active" | "error">(globalStatus);
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    initGlobalChannel();

    // Sync status state immediately
    setStatus(globalStatus);

    const handleStatusChange = (newStatus: "connecting" | "active" | "error") => {
      setStatus(newStatus);
    };
    statusCallbacks.add(handleStatusChange);

    const handleUpdate = () => {
      if (onUpdateRef.current) {
        onUpdateRef.current();
      }
    };
    callbacks.add(handleUpdate);

    return () => {
      statusCallbacks.delete(handleStatusChange);
      callbacks.delete(handleUpdate);
    };
  }, []);

  return status;
}
