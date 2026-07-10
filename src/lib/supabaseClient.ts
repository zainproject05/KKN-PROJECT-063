import { createClient } from "@supabase/supabase-js";

// Check if Supabase environment variables are real and valid
const rawUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const rawKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

const isValidUrl = (url: any): boolean => {
  if (typeof url !== "string") return false;
  return url.startsWith("http://") || url.startsWith("https://");
};

export const isSupabaseConfigured = isValidUrl(rawUrl) && !!rawKey && rawUrl !== "YOUR_SUPABASE_URL";

const supabaseUrl = isSupabaseConfigured ? rawUrl : "https://placeholder-project.supabase.co";
const supabaseAnonKey = isSupabaseConfigured ? rawKey : "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder";

// Real Supabase Client
const realSupabase = createClient(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: "kkn-project-auth"
    }
  }
);

// ==========================================
// SEED DATA FOR OFFLINE MOCK MODE
// ==========================================
const SEED_DATA: Record<string, any[]> = {
  members: [
    {
      id: "m-01",
      full_name: "Ananda Nur Daffa Zain",
      nim: "20230130001",
      whatsapp_number: "+6281220010205",
      gender: "Laki-laki",
      faculty: "Fakultas Teknik",
      study_program: "Teknik Mesin",
      photo_url: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Ananda_Nur_Daffa_Zain_bjqskz.jpg",
      is_active: true,
      is_public_profile: true,
      kkn_role: "Ketua",
      created_at: new Date("2026-07-01T08:00:00Z").toISOString()
    },
    {
      id: "m-02",
      full_name: "Syafito Denova",
      nim: "20230130002",
      whatsapp_number: "+6281200000001",
      gender: "Laki-laki",
      faculty: "Fakultas Teknik",
      study_program: "Teknologi Informasi",
      photo_url: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250975/Syafito_Denova_v7hg3i.jpg",
      is_active: true,
      is_public_profile: true,
      kkn_role: "Sekretaris",
      created_at: new Date("2026-07-01T08:05:00Z").toISOString()
    },
    {
      id: "m-03",
      full_name: "Reyval Filzah Padatu",
      nim: "20230130003",
      whatsapp_number: "+6281200000002",
      gender: "Laki-laki",
      faculty: "Fakultas Teknik",
      study_program: "Teknik Elektro",
      photo_url: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Reyval_Filzah_Padatu_tgx2es.jpg",
      is_active: true,
      is_public_profile: true,
      kkn_role: "Bendahara",
      created_at: new Date("2026-07-01T08:10:00Z").toISOString()
    },
    {
      id: "m-04",
      full_name: "Praditha Ameliya Syaharani",
      nim: "20230130004",
      whatsapp_number: "+6281200000003",
      gender: "Perempuan",
      faculty: "Fakultas Kedokteran dan Ilmu Kesehatan",
      study_program: "Pendidikan Dokter",
      photo_url: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Praditha_Ameliya_Syaharani_s3sr6i.jpg",
      is_active: true,
      is_public_profile: true,
      kkn_role: "Acara",
      created_at: new Date("2026-07-01T08:15:00Z").toISOString()
    },
    {
      id: "m-05",
      full_name: "Himawan Panuntun",
      nim: "20230130005",
      whatsapp_number: "+6281200000004",
      gender: "Laki-laki",
      faculty: "Fakultas Teknik",
      study_program: "Teknik Sipil",
      photo_url: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250975/Himawan_Panuntun_zsqmmq.jpg",
      is_active: true,
      is_public_profile: true,
      kkn_role: "Perlengkapan",
      created_at: new Date("2026-07-01T08:20:00Z").toISOString()
    },
    {
      id: "m-06",
      full_name: "Zafirotut Thoyyibah",
      nim: "20230130006",
      whatsapp_number: "+6281200000005",
      gender: "Perempuan",
      faculty: "Fakultas Agama Islam",
      study_program: "Pendidikan Agama Islam",
      photo_url: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Zafirotut_Thoyyibah_svrusn.jpg",
      is_active: true,
      is_public_profile: true,
      kkn_role: "Konsumsi",
      created_at: new Date("2026-07-01T08:25:00Z").toISOString()
    },
    {
      id: "m-07",
      full_name: "Dian Wahyu Saputro",
      nim: "20230130007",
      whatsapp_number: "+6281200000006",
      gender: "Laki-laki",
      faculty: "Fakultas Hukum",
      study_program: "Hukum",
      photo_url: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Dian_Wahyu_Saputro_tpjoag.jpg",
      is_active: true,
      is_public_profile: true,
      kkn_role: "Humas",
      created_at: new Date("2026-07-01T08:30:00Z").toISOString()
    },
    {
      id: "m-08",
      full_name: "Diana Puspita Sari",
      nim: "20230130008",
      whatsapp_number: "+6281200000007",
      gender: "Perempuan",
      faculty: "Fakultas Ekonomi dan Bisnis",
      study_program: "Manajemen",
      photo_url: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Diana_Puspita_Sari_ly75za.jpg",
      is_active: true,
      is_public_profile: true,
      kkn_role: "PDD",
      created_at: new Date("2026-07-01T08:35:00Z").toISOString()
    },
    {
      id: "m-09",
      full_name: "Muhammad Damar Hasta Putra",
      nim: "20230130009",
      whatsapp_number: "+6281200000008",
      gender: "Laki-laki",
      faculty: "Fakultas Ilmu Sosial dan Politik",
      study_program: "Hubungan Internasional",
      photo_url: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Muhammad_Damar_Hasta_Putra_l04kzh.jpg",
      is_active: true,
      is_public_profile: true,
      kkn_role: "Anggota",
      created_at: new Date("2026-07-01T08:40:00Z").toISOString()
    },
    {
      id: "m-10",
      full_name: "Olivia Salsabila Zahra",
      nim: "20230130010",
      whatsapp_number: "+6281200000009",
      gender: "Perempuan",
      faculty: "Fakultas Pendidikan Bahasa",
      study_program: "Pendidikan Bahasa Inggris",
      photo_url: "https://res.cloudinary.com/df0razmlr/image/upload/v1783250974/Olivia_Salsabila_Zahra_pqsuus.jpg",
      is_active: true,
      is_public_profile: true,
      kkn_role: "Anggota",
      created_at: new Date("2026-07-01T08:45:00Z").toISOString()
    }
  ],
  attendance_sessions: [],
  attendance_records: [],
  financial_transactions: [],
  programs: [],
  program_tasks: [],
  activity_logs: [],
  whatsapp_templates: [],
  report_templates: [],
  reports: [],
  kkn_template_links: [
    {
      id: "tpl-1",
      title: "File Lengkap Template KKN",
      division: "File Lengkap",
      drive_url: "https://drive.google.com/drive/folders/1gkO0_gx_WNnCo1MoWi6p-_OxL2HoEi2F?usp=sharing",
      description: "Pusat semua template administrasi KKN dalam satu folder utama.",
      display_order: 1,
      is_active: true,
      created_at: new Date("2026-07-01T00:00:00Z").toISOString(),
      updated_at: new Date("2026-07-01T00:00:00Z").toISOString()
    },
    {
      id: "tpl-2",
      title: "Template Sekretaris",
      division: "Sekretaris",
      drive_url: "https://drive.google.com/drive/folders/1gmIDMerzqFGjY_yJzPx_TxnaxRtAR7v2?usp=sharing",
      description: "Template surat, absensi, notulensi, dan administrasi kelompok.",
      display_order: 2,
      is_active: true,
      created_at: new Date("2026-07-01T00:00:00Z").toISOString(),
      updated_at: new Date("2026-07-01T00:00:00Z").toISOString()
    },
    {
      id: "tpl-3",
      title: "Template Bendahara",
      division: "Bendahara",
      drive_url: "https://drive.google.com/drive/folders/1dpjiNYpc-yJIO_pPpu3JO66P3IVkSPXq?usp=sharing",
      description: "Template keuangan, kas, nota, dan rekap pengeluaran.",
      display_order: 3,
      is_active: true,
      created_at: new Date("2026-07-01T00:00:00Z").toISOString(),
      updated_at: new Date("2026-07-01T00:00:00Z").toISOString()
    },
    {
      id: "tpl-4",
      title: "Template Acara",
      division: "Acara",
      drive_url: "https://drive.google.com/drive/folders/1Z0Z1R2i5IhNlKB9VtBRwOaZLe3VPAag0?usp=sharing",
      description: "Template rundown, program kegiatan, dan teknis pelaksanaan acara.",
      display_order: 4,
      is_active: true,
      created_at: new Date("2026-07-01T00:00:00Z").toISOString(),
      updated_at: new Date("2026-07-01T00:00:00Z").toISOString()
    },
    {
      id: "tpl-5",
      title: "Template Humas",
      division: "Humas",
      drive_url: "https://drive.google.com/drive/folders/1jLEtDgqFTuzL4tbcaHNNzaAz2K6vsHHq?usp=sharing",
      description: "Template publikasi, caption, komunikasi eksternal, dan informasi kegiatan.",
      display_order: 5,
      is_active: true,
      created_at: new Date("2026-07-01T00:00:00Z").toISOString(),
      updated_at: new Date("2026-07-01T00:00:00Z").toISOString()
    },
    {
      id: "tpl-6",
      title: "Template Perlengkapan",
      division: "Perlengkapan",
      drive_url: "https://drive.google.com/drive/folders/1LRWHPqH5DwA-sGOLQmK7vIkD2u9owt3G?usp=sharing",
      description: "Template inventaris, kebutuhan barang, dan checklist perlengkapan.",
      display_order: 6,
      is_active: true,
      created_at: new Date("2026-07-01T00:00:00Z").toISOString(),
      updated_at: new Date("2026-07-01T00:00:00Z").toISOString()
    },
    {
      id: "tpl-7",
      title: "Template Konsumsi",
      division: "Konsumsi",
      drive_url: "https://drive.google.com/drive/folders/1sMv33LOwg6h4wYf_aS03U7r9ZMFOn0Bi?usp=sharing",
      description: "Template kebutuhan konsumsi, jadwal konsumsi, dan daftar belanja.",
      display_order: 7,
      is_active: true,
      created_at: new Date("2026-07-01T00:00:00Z").toISOString(),
      updated_at: new Date("2026-07-01T00:00:00Z").toISOString()
    }
  ]
};

// Clean slate localStorage check: if we updated the templates or members, reset that specific local key to ensure it picks up the latest seed data
const currentSeedVersion = "kkn_seed_v6_reset_members_real_ten";
if (!localStorage.getItem(currentSeedVersion)) {
  localStorage.removeItem("kkn_local_kkn_template_links");
  localStorage.removeItem("kkn_local_attendance_sessions");
  localStorage.removeItem("kkn_local_attendance_records");
  localStorage.removeItem("kkn_local_members");
  localStorage.removeItem("kkn_local_programs");
  localStorage.removeItem("kkn_local_program_tasks");
  localStorage.removeItem("kkn_local_activity_logs");
  localStorage.setItem(currentSeedVersion, "true");
}

// ==========================================
// MOCK SUPABASE CLIENT QUERY BUILDER
// ==========================================
// Registry for mock realtime listeners
const mockListeners: Array<{
  table: string;
  callback: (payload: any) => void;
}> = [];

const mockChannel = {
  on: (type: string, filter: any, callback: any) => {
    if (type === "postgres_changes" && filter?.table) {
      mockListeners.push({ table: filter.table, callback });
    }
    return mockChannel;
  },
  subscribe: (callback?: (status: string) => void) => {
    if (callback) {
      setTimeout(() => callback("SUBSCRIBED"), 10);
    }
    return mockChannel;
  },
  unsubscribe: () => {
    return Promise.resolve();
  }
};

function makeChainedResult(result: any): any {
  const promise = Promise.resolve(result);
  return {
    data: result.data,
    error: result.error,
    count: result.count,
    then: (onfulfilled?: any, onrejected?: any) => promise.then(onfulfilled, onrejected),
    catch: (onrejected?: any) => promise.catch(onrejected),
    finally: (onfinally?: any) => promise.finally(onfinally),
    select: () => makeChainedResult(result),
    eq: () => makeChainedResult(result),
    single: () => makeChainedResult({ data: Array.isArray(result.data) ? result.data[0] : result.data, error: result.error })
  };
}

class MockSupabaseQueryBuilder {
  private tableName: string;
  private filters: Array<(item: any) => boolean> = [];
  private orderCol: string | null = null;
  private orderAscending: boolean = true;
  private limitCount: number | null = null;
  private countOption: string | null = null;
  private headOption: boolean = false;
  private isInsert = false;
  private isUpdate = false;
  private isDelete = false;
  private isSingle = false;
  private insertPayloads: any = null;
  private updatePayload: any = null;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  private triggerListeners(event: "INSERT" | "UPDATE" | "DELETE", oldRow: any, newRow: any) {
    const table = this.tableName;
    const payload = {
      eventType: event,
      new: newRow,
      old: oldRow
    };
    mockListeners.forEach(listener => {
      if (listener.table === table) {
        try {
          listener.callback(payload);
        } catch (e) {
          console.error("Error in mock realtime listener:", e);
        }
      }
    });
  }

  private getData(): any[] {
    const key = `kkn_local_${this.tableName}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to parse local storage key:", key, e);
      }
    }
    const seed = SEED_DATA[this.tableName] || [];
    localStorage.setItem(key, JSON.stringify(seed));
    return seed;
  }

  private saveData(data: any[]) {
    const key = `kkn_local_${this.tableName}`;
    localStorage.setItem(key, JSON.stringify(data));
  }

  select(columns?: string, options?: { count?: string; head?: boolean }) {
    if (options?.count) {
      this.countOption = options.count;
    }
    if (options?.head) {
      this.headOption = options.head;
    }
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push((item) => {
      return item[column] === value;
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderCol = column;
    this.orderAscending = options?.ascending !== false;
    return this;
  }

  limit(count: number) {
    this.limitCount = count;
    return this;
  }

  insert(payloads: any | any[]) {
    this.isInsert = true;
    this.insertPayloads = payloads;
    return this;
  }

  update(payload: any) {
    this.isUpdate = true;
    this.updatePayload = payload;
    return this;
  }

  delete() {
    this.isDelete = true;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  private executeQueries(): any[] {
    let data = this.getData();
    for (const filter of this.filters) {
      data = data.filter(filter);
    }
    if (this.orderCol) {
      const col = this.orderCol;
      const asc = this.orderAscending;
      data.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA == null) return asc ? 1 : -1;
        if (valB == null) return asc ? -1 : 1;
        if (valA < valB) return asc ? -1 : 1;
        if (valA > valB) return asc ? 1 : -1;
        return 0;
      });
    }
    if (this.limitCount !== null) {
      data = data.slice(0, this.limitCount);
    }
    return data;
  }

  then(onfulfilled: (value: any) => void) {
    let resultPromise: Promise<any>;

    if (this.isInsert) {
      const data = this.getData();
      const arr = Array.isArray(this.insertPayloads) ? this.insertPayloads : [this.insertPayloads];
      const newItems = arr.map(item => {
        return {
          id: item.id || crypto.randomUUID(),
          created_at: item.created_at || new Date().toISOString(),
          updated_at: item.updated_at || new Date().toISOString(),
          ...item
        };
      });
      const updated = [...data, ...newItems];
      this.saveData(updated);

      newItems.forEach(item => {
        this.triggerListeners("INSERT", null, item);
      });

      const res = { data: newItems, error: null };
      if (this.isSingle) {
        res.data = Array.isArray(res.data) ? res.data[0] : res.data;
      }
      resultPromise = Promise.resolve(res);

    } else if (this.isUpdate) {
      const data = this.getData();
      let updatedCount = 0;
      const oldRows: any[] = [];
      const newRows: any[] = [];
      const updated = data.map(item => {
        const matches = this.filters.every(filter => filter(item));
        if (matches) {
          updatedCount++;
          const updatedItem = {
            ...item,
            ...this.updatePayload,
            updated_at: this.updatePayload.updated_at || new Date().toISOString()
          };
          oldRows.push(item);
          newRows.push(updatedItem);
          return updatedItem;
        }
        return item;
      });
      this.saveData(updated);

      for (let i = 0; i < newRows.length; i++) {
        this.triggerListeners("UPDATE", oldRows[i], newRows[i]);
      }

      const res = { data: newRows, error: null, count: updatedCount };
      if (this.isSingle) {
        res.data = Array.isArray(res.data) ? res.data[0] : res.data;
      }
      resultPromise = Promise.resolve(res);

    } else if (this.isDelete) {
      const data = this.getData();
      const oldRows: any[] = [];
      const remaining = data.filter(item => {
        const matches = this.filters.every(filter => filter(item));
        if (matches) {
          oldRows.push(item);
        }
        return !matches;
      });
      this.saveData(remaining);

      oldRows.forEach(item => {
        this.triggerListeners("DELETE", item, null);
      });

      const res = { data: oldRows, error: null };
      if (this.isSingle) {
        res.data = Array.isArray(res.data) ? res.data[0] : res.data;
      }
      resultPromise = Promise.resolve(res);

    } else {
      const result = this.executeQueries();
      const data = this.headOption ? null : result;
      const count = this.countOption ? result.length : (this.headOption ? result.length : undefined);
      const res = { data, error: null, count };
      if (this.isSingle) {
        res.data = Array.isArray(res.data) ? res.data[0] : res.data;
      }
      resultPromise = Promise.resolve(res);
    }

    resultPromise.then(onfulfilled);
  }
}

// ==========================================
// MOCK STORAGE IMPLEMENTATION
// ==========================================
const mockStorage = {
  from: (bucketId: string) => {
    return {
      getPublicUrl: (filePath: string) => {
        const url = filePath?.startsWith("http") 
          ? filePath 
          : `https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=300`;
        return { data: { publicUrl: url } };
      },
      upload: async (filePath: string, file: File, options?: any) => {
        return { data: { path: filePath }, error: null };
      },
      remove: async (paths: string[]) => {
        return { data: paths, error: null };
      },
      createSignedUrl: async (path: string, expiry: number) => {
        return { data: { signedUrl: `https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&q=80&w=300` }, error: null };
      }
    };
  }
};

// ==========================================
// MOCK AUTH IMPLEMENTATION
// ==========================================
const mockAuth = {
  getSession: async () => ({ data: { session: null }, error: null }),
  signInWithPassword: async (credentials: any) => ({ data: { user: { email: credentials.email } }, error: null }),
  signOut: async () => ({ error: null }),
  onAuthStateChange: (callback: any) => {
    return { data: { subscription: { unsubscribe: () => {} } } };
  }
};

// Complete Mock Supabase Client definitions
const mockSupabaseClient: any = {
  auth: mockAuth,
  storage: mockStorage,
  from: (tableName: string) => new MockSupabaseQueryBuilder(tableName),
  channel: (channelId: string) => mockChannel,
  rpc: async (fnName: string, args?: any) => {
    if (fnName === "close_expired_attendance_sessions") {
      return { data: null, error: null };
    }
    if (fnName === "register_public_attendance") {
      // Simulate success
      return { data: { ok: true, message: "Mock attendance submitted successfully" }, error: null };
    }
    return { data: null, error: null };
  }
};

export const supabase = isSupabaseConfigured ? realSupabase : mockSupabaseClient;

export async function signInWithPassword(email: string, password: string) {
  if (isSupabaseConfigured) {
    return supabase.auth.signInWithPassword({ email, password });
  }
  return mockAuth.signInWithPassword({ email, password });
}

export async function signOut() {
  if (isSupabaseConfigured) {
    return supabase.auth.signOut();
  }
  return mockAuth.signOut();
}

export async function getCurrentSession() {
  if (isSupabaseConfigured) {
    return supabase.auth.getSession();
  }
  return mockAuth.getSession();
}
