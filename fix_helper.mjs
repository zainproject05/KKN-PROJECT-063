import fs from 'fs';
let content = fs.readFileSync('src/utils/attendanceHelper.ts', 'utf-8');

const newHelper = `
export interface ParsedSession {
  id: string;
  activity_name: string;
  date: string;
  opens_at: string;
  closes_at: string;
  starts_at?: string | null;
  ends_at?: string | null;
  status: string;
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
  status: string;
  notes: string;
  check_in_at?: string;
  latitude?: number;
  longitude?: number;
  gps_accuracy_meters?: number;
  selfie_path?: string;
  source?: string;
  created_at?: string;
  updated_at?: string;
}

export const DEFAULT_POSKO_LAT = -8.034789;
export const DEFAULT_POSKO_LNG = 110.406740;

export function parseGpsInput(input: string) { return null; }

export function parseSession(session: any): ParsedSession {
  if (!session) return session;
  // Convert standard timestamp to HH:mm for opens_at/closes_at
  let opens = "00:00";
  let closes = "23:59";
  let date = new Date().toISOString().split("T")[0];
  
  if (session.starts_at) {
    const d = new Date(session.starts_at);
    date = d.toISOString().split("T")[0];
    opens = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  }
  if (session.ends_at) {
    const d = new Date(session.ends_at);
    closes = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.', ':');
  }

  return {
    id: session.id,
    activity_name: session.activity_name || "Aktivitas Tanpa Nama",
    date: date,
    opens_at: opens,
    closes_at: closes,
    starts_at: session.starts_at,
    ends_at: session.ends_at,
    status: session.status || "open",
    location_name: session.location || "Posko",
    latitude: DEFAULT_POSKO_LAT,
    longitude: DEFAULT_POSKO_LNG,
    gps_posko_input: "",
    program_id: null,
    created_by_member_id: session.created_by_member_id || null,
    updated_by_member_id: session.updated_by_member_id || null,
    session_token: session.id,
    is_public: session.is_public ?? true,
    require_gps: session.require_gps ?? true,
    require_selfie: session.require_selfie ?? true,
    require_photo_face_check: session.require_photo_face_check ?? true,
    auto_close_enabled: session.auto_close_enabled ?? true,
    created_at: session.created_at,
    updated_at: session.updated_at,
    programs: session.programs
  };
}

export function parseRecord(record: any): ParsedRecord {
  if (!record) return record;
  return {
    id: record.id,
    member_id: record.member_id || "",
    session_id: record.attendance_session_id || "",
    status: record.attendance_status || "present",
    notes: record.notes || "",
    latitude: record.latitude,
    longitude: record.longitude,
    gps_accuracy_meters: record.gps_accuracy_meters,
    selfie_path: record.selfie_path,
    source: record.attendance_source,
    created_at: record.created_at,
    updated_at: record.updated_at
  };
}

export function serializeSession(data: any): string {
  return "";
}

export function serializeRecord(meta: any, userNotes: string): string {
  return userNotes;
}

export function formatDistance(distanceInMeters: number | undefined | null): string {
  if (distanceInMeters === undefined || distanceInMeters === null) return "-";
  if (distanceInMeters < 1000) {
    return \`\${Math.round(distanceInMeters)} meter\`;
  }
  const km = distanceInMeters / 1000;
  return \`\${km.toFixed(2)} km\`;
}

export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  return 0;
}
`;

content = newHelper;

fs.writeFileSync('src/utils/attendanceHelper.ts', content);
