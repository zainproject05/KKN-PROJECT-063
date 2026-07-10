-- ==================================================
-- SUPABASE MIGRATION FOR KKN TEMPLATE LINKS
-- ==================================================

-- 1. Create table if not exists
CREATE TABLE IF NOT EXISTS public.kkn_template_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    division TEXT NOT NULL,
    drive_url TEXT,
    description TEXT,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_by_member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    updated_by_member_id UUID REFERENCES public.members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.kkn_template_links ENABLE ROW LEVEL SECURITY;

-- 3. Allow authenticated users full access (consistent with shared KKN workspace pattern)
CREATE POLICY "Allow authenticated users full access to kkn_template_links"
ON public.kkn_template_links
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. Add updated_at trigger if kkn_set_updated_at function exists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc 
        WHERE proname = 'kkn_set_updated_at' 
        AND pronamespace = 'public'::regnamespace
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'set_updated_at_kkn_template_links'
        ) THEN
            CREATE TRIGGER set_updated_at_kkn_template_links
            BEFORE UPDATE ON public.kkn_template_links
            FOR EACH ROW
            EXECUTE FUNCTION public.kkn_set_updated_at();
        END IF;
    END IF;
END $$;

-- 5. Remove 'Ketua' and 'PDD' divisions if they exist (safe cleanup)
DELETE FROM public.kkn_template_links
WHERE division IN ('Ketua', 'PDD');

-- 6. Seed/Upsert real Google Drive links (avoid duplicating if division already exists)
-- This query uses a unique constraint check or updates existing rows based on division.
-- To ensure safe upsert without a unique index on division, we can do a standard check:

INSERT INTO public.kkn_template_links (title, division, drive_url, description, display_order, is_active)
SELECT 'File Lengkap Template KKN', 'File Lengkap', 'https://drive.google.com/drive/folders/1gkO0_gx_WNnCo1MoWi6p-_OxL2HoEi2F?usp=sharing', 'Pusat semua template administrasi KKN dalam satu folder utama.', 1, true
WHERE NOT EXISTS (SELECT 1 FROM public.kkn_template_links WHERE division = 'File Lengkap');

INSERT INTO public.kkn_template_links (title, division, drive_url, description, display_order, is_active)
SELECT 'Template Sekretaris', 'Sekretaris', 'https://drive.google.com/drive/folders/1gmIDMerzqFGjY_yJzPx_TxnaxRtAR7v2?usp=sharing', 'Template surat, absensi, notulensi, dan administrasi kelompok.', 2, true
WHERE NOT EXISTS (SELECT 1 FROM public.kkn_template_links WHERE division = 'Sekretaris');

INSERT INTO public.kkn_template_links (title, division, drive_url, description, display_order, is_active)
SELECT 'Template Bendahara', 'Bendahara', 'https://drive.google.com/drive/folders/1dpjiNYpc-yJIO_pPpu3JO66P3IVkSPXq?usp=sharing', 'Template keuangan, kas, nota, dan rekap pengeluaran.', 3, true
WHERE NOT EXISTS (SELECT 1 FROM public.kkn_template_links WHERE division = 'Bendahara');

INSERT INTO public.kkn_template_links (title, division, drive_url, description, display_order, is_active)
SELECT 'Template Acara', 'Acara', 'https://drive.google.com/drive/folders/1Z0Z1R2i5IhNlKB9VtBRwOaZLe3VPAag0?usp=sharing', 'Template rundown, program kegiatan, dan teknis pelaksanaan acara.', 4, true
WHERE NOT EXISTS (SELECT 1 FROM public.kkn_template_links WHERE division = 'Acara');

INSERT INTO public.kkn_template_links (title, division, drive_url, description, display_order, is_active)
SELECT 'Template Humas', 'Humas', 'https://drive.google.com/drive/folders/1jLEtDgqFTuzL4tbcaHNNzaAz2K6vsHHq?usp=sharing', 'Template publikasi, caption, komunikasi eksternal, dan informasi kegiatan.', 5, true
WHERE NOT EXISTS (SELECT 1 FROM public.kkn_template_links WHERE division = 'Humas');

INSERT INTO public.kkn_template_links (title, division, drive_url, description, display_order, is_active)
SELECT 'Template Perlengkapan', 'Perlengkapan', 'https://drive.google.com/drive/folders/1LRWHPqH5DwA-sGOLQmK7vIkD2u9owt3G?usp=sharing', 'Template inventaris, kebutuhan barang, dan checklist perlengkapan.', 6, true
WHERE NOT EXISTS (SELECT 1 FROM public.kkn_template_links WHERE division = 'Perlengkapan');

INSERT INTO public.kkn_template_links (title, division, drive_url, description, display_order, is_active)
SELECT 'Template Konsumsi', 'Konsumsi', 'https://drive.google.com/drive/folders/1sMv33LOwg6h4wYf_aS03U7r9ZMFOn0Bi?usp=sharing', 'Template kebutuhan konsumsi, jadwal konsumsi, dan daftar belanja.', 7, true
WHERE NOT EXISTS (SELECT 1 FROM public.kkn_template_links WHERE division = 'Konsumsi');
