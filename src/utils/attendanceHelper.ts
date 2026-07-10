/**
 * Helper utilities for KKN Attendance Tracking & Location Calculations.
 * Bypasses database constraints by serializing extended data structures into
 * existing string columns (activity_name for sessions, notes for records).
 */

export interface ParsedSession {
  id: string;
  activity_name: string;
  activity_type: string;
  date: string;
  opens_at: string;
  closes_at: string;
  status: string; // "open" | "closed" | "draft"
  location_name: string;
  latitude: number;
  longitude: number;
  gps_posko_input: string;
  program_id: string | null;
  created_by_member_id: string | null;
  updated_by_member_id: string | null;
  session_token: string;
  is_public?: boolean;
  require_gps?: boolean;
  require_selfie?: boolean;
  require_photo_face_check?: boolean;
  auto_close_enabled?: boolean;
  created_at?: string;
  updated_at?: string;
  programs?: { title: string };
}

export interface ParsedRecord {
  id: string;
  member_id: string;
  session_id: string;
  status: string; // "Present" | "Permission" | "Sick" | "Absent"
  notes: string; // Pure text note shown in UI
  check_in_at?: string;
  check_out_time?: string;
  latitude?: number;
  longitude?: number;
  gps_accuracy_meters?: number;
  selfie_path?: string;
  face_detected?: boolean;
  person_detected?: boolean;
  source?: string;
  distance_m?: number;
  device_info?: string;
  validation_method?: string;
  manual_override?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Fallback Default Coordinate: Group 063 Posko (Yogyakarta area / UMY area)
export const DEFAULT_POSKO_LAT = -7.821008;
export const DEFAULT_POSKO_LNG = 110.370001;

/**
 * Parses GPS coordinates from a string that can be raw coordinates or a Google Maps URL.
 */
export function parseGpsInput(input: string): { latitude: number; longitude: number } | null {
  if (!input) return null;
  const str = input.trim();

  // 1. Try to find coordinates in @lat,lng (common in Google Maps URLs)
  const atMatch = str.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (atMatch) {
    return {
      latitude: parseFloat(atMatch[1]),
      longitude: parseFloat(atMatch[2])
    };
  }

  // 2. Try to find query parameters like q=lat,lng or daddr=lat,lng or query=lat,lng
  const queryMatch = str.match(/[?&](q|daddr|ll|query)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (queryMatch) {
    return {
      latitude: parseFloat(queryMatch[2]),
      longitude: parseFloat(queryMatch[3])
    };
  }

  // 3. Try to find coordinates in Google Maps !3dlat!4dlng pattern
  const bangMatch3d = str.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (bangMatch3d) {
    return {
      latitude: parseFloat(bangMatch3d[1]),
      longitude: parseFloat(bangMatch3d[2])
    };
  }

  // 4. Try matching raw coords like "-7.821008, 110.370001" or "-7.821008 110.370001"
  const rawMatch = str.match(/(-?\d+\.\d+)\s*[\s,;]\s*(-?\d+\.\d+)/);
  if (rawMatch) {
    return {
      latitude: parseFloat(rawMatch[1]),
      longitude: parseFloat(rawMatch[2])
    };
  }

  return null;
}

/**
 * Merges JSON metadata serialized in the `activity_name` column to recreate the full session object.
 */
export function parseSession(session: any): ParsedSession {
  if (!session) return session;
  const parsed: ParsedSession = {
    id: session.id,
    activity_name: session.activity_name || "Aktivitas Tanpa Nama",
    activity_type: "Program Kerja",
    date: new Date().toISOString().split("T")[0],
    opens_at: "00:00",
    closes_at: "23:59",
    status: "open",
    location_name: "Posko KKN Kelompok 063",
    latitude: DEFAULT_POSKO_LAT,
    longitude: DEFAULT_POSKO_LNG,
    gps_posko_input: "",
    program_id: session.program_id || null,
    created_by_member_id: session.created_by_member_id || null,
    updated_by_member_id: session.updated_by_member_id || null,
    session_token: session.id,
    is_public: false,
    require_gps: false,
    require_selfie: false,
    require_photo_face_check: false,
    auto_close_enabled: true,
    created_at: session.created_at,
    updated_at: session.updated_at,
    programs: session.programs
  };

  if (session.activity_name && session.activity_name.startsWith("JSON_METADATA:")) {
    try {
      const metaStr = session.activity_name.substring("JSON_METADATA:".length);
      const meta = JSON.parse(metaStr);
      Object.assign(parsed, meta);
    } catch (e) {
      console.error("Failed to parse JSON session metadata inside activity_name:", e);
    }
  }

  return parsed;
}

/**
 * Serializes all session data into a JSON string prefixed with a key for storage in the `activity_name` column.
 */
export function serializeSession(data: Omit<ParsedSession, "id" | "created_at" | "updated_at" | "programs">): string {
  return "JSON_METADATA:" + JSON.stringify(data);
}

/**
 * Merges JSON metadata serialized in the `notes` column of `attendance_records` to recreate the full record object.
 */
export function parseRecord(record: any): ParsedRecord {
  if (!record) return record;
  const parsed: ParsedRecord = {
    id: record.id,
    member_id: record.member_id || "",
    session_id: record.attendance_session_id || "",
    status: record.attendance_status || "Present",
    notes: record.notes || "",
    latitude: record.latitude,
    longitude: record.longitude,
    gps_accuracy_meters: record.gps_accuracy_meters,
    selfie_path: record.selfie_path,
    face_detected: record.face_detected,
    person_detected: record.person_detected,
    source: record.source,
    created_at: record.created_at,
    updated_at: record.updated_at
  };

  if (record.notes && record.notes.startsWith("JSON_RECORD_METADATA:")) {
    try {
      const metaStr = record.notes.substring("JSON_RECORD_METADATA:".length);
      const meta = JSON.parse(metaStr);
      Object.assign(parsed, meta);
      // Replace notes with the real user_notes field
      parsed.notes = meta.user_notes || "";
    } catch (e) {
      console.error("Failed to parse JSON record metadata inside notes:", e);
    }
  }

  return parsed;
}

/**
 * Serializes all record metadata into a JSON string prefixed with a key for storage in the `notes` column.
 */
export function serializeRecord(meta: Omit<ParsedRecord, "id" | "created_at" | "updated_at">, userNotes: string): string {
  const payload = {
    ...meta,
    user_notes: userNotes
  };
  return "JSON_RECORD_METADATA:" + JSON.stringify(payload);
}

/**
 * Formats a distance in meters into a readable string (e.g. "150m" or "2.4 km").
 */
export function formatDistance(distanceInMeters: number | undefined | null): string {
  if (distanceInMeters === undefined || distanceInMeters === null) return "-";
  if (distanceInMeters < 1000) {
    return `${Math.round(distanceInMeters)} meter`;
  }
  const km = distanceInMeters / 1000;
  return `${km.toFixed(2)} km`;
}

/**
 * Calculates the Haversine distance in meters between two coordinates.
 */
export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}
