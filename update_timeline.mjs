import fs from 'fs';

let content = fs.readFileSync('src/components/KKNRoadmap.tsx', 'utf-8');

const newMilestones = `
  const phases = [
    { id: "All", name: "Semua" },
    { id: "Administrasi", name: "Administrasi" },
    { id: "Persiapan", name: "Persiapan" },
    { id: "Pembekalan", name: "Pembekalan" },
    { id: "Persiapan Lapangan", name: "Persiapan Lapangan" },
    { id: "Penerjunan", name: "Penerjunan" },
    { id: "Pelaksanaan Lapangan", name: "Pelaksanaan Lapangan" },
    { id: "Evaluasi", name: "Evaluasi" },
    { id: "Pelaporan", name: "Pelaporan" }
  ];

  const milestones = [
    {
      id: 1,
      title: "Pendaftaran Mahasiswa",
      date: "6 Mei - 26 Juni 2026",
      phase: "Administrasi",
      description: "Periode pendaftaran mahasiswa melalui sistem resmi KKN."
    },
    {
      id: 2,
      title: "Validasi",
      date: "27 Juni - 3 Juli 2026",
      phase: "Administrasi",
      description: "Validasi data mahasiswa dan kelengkapan administrasi peserta KKN."
    },
    {
      id: 3,
      title: "Pembagian Kelompok",
      date: "04 Juli 2026",
      phase: "Persiapan",
      description: "Pengumuman pembagian kelompok mahasiswa KKN."
    },
    {
      id: 4,
      title: "Pembagian Lokasi + DPL",
      date: "11 Juli 2026",
      phase: "Persiapan",
      description: "Pengumuman lokasi KKN dan Dosen Pembimbing Lapangan."
    },
    {
      id: 5,
      title: "Pembekalan Materi Khusus Mahasiswa",
      date: "13 Juli 2026",
      phase: "Pembekalan",
      description: "Pembekalan materi khusus bagi mahasiswa peserta KKN."
    },
    {
      id: 6,
      title: "Pembekalan Mahasiswa",
      date: "14 - 26 Juli 2026",
      phase: "Pembekalan",
      description: "Pembekalan umum mahasiswa sebelum pelaksanaan KKN di lapangan."
    },
    {
      id: 7,
      title: "Observasi",
      date: "11 - 26 Juli 2026",
      phase: "Persiapan Lapangan",
      description: "Observasi lokasi, identifikasi kebutuhan masyarakat, dan pengumpulan data awal."
    },
    {
      id: 8,
      title: "Penyusunan Proposal",
      date: "11 - 26 Juli 2026",
      phase: "Persiapan Lapangan",
      description: "Penyusunan proposal program kerja berdasarkan hasil observasi lapangan."
    },
    {
      id: 9,
      title: "Pembagian Logistik",
      date: "24 - 25 Juli 2026",
      phase: "Persiapan Lapangan",
      description: "Pembagian kebutuhan logistik untuk mendukung pelaksanaan KKN."
    },
    {
      id: 10,
      title: "Seremoni Penerjunan",
      date: "28 Juli 2026",
      phase: "Penerjunan",
      description: "Seremoni resmi penerjunan mahasiswa KKN."
    },
    {
      id: 11,
      title: "Penerjunan Lapangan",
      date: "29 Juli 2026",
      phase: "Penerjunan",
      description: "Mahasiswa mulai diterjunkan ke lokasi KKN masing-masing."
    },
    {
      id: 12,
      title: "Pelaksanaan",
      date: "29 Juli - 27 Agustus 2026",
      phase: "Pelaksanaan Lapangan",
      description: "Pelaksanaan program kerja dan kegiatan pengabdian masyarakat di lokasi KKN."
    },
    {
      id: 13,
      title: "Monitoring dan Evaluasi Lapangan",
      date: "10 - 20 Agustus 2026",
      phase: "Evaluasi",
      description: "Monitoring dan evaluasi kegiatan KKN oleh pihak terkait."
    },
    {
      id: 14,
      title: "Penarikan",
      date: "27 Agustus 2026",
      phase: "Penarikan",
      description: "Penarikan mahasiswa dari lokasi KKN."
    },
    {
      id: 15,
      title: "Pengumpulan Laporan dan Nilai Mahasiswa",
      date: "27 Agustus - 11 September 2026",
      phase: "Pelaporan",
      description: "Pengumpulan laporan akhir dan proses penilaian mahasiswa."
    },
    {
      id: 16,
      title: "Responsi",
      date: "27 Agustus - 11 September 2026",
      phase: "Pelaporan",
      description: "Pelaksanaan responsi dan evaluasi akhir kegiatan KKN."
    }
  ];

  const getMilestoneStatus = (dateStr) => {
    const months = {
      "Mei": 4, "Juni": 5, "Juli": 6, "Agustus": 7, "September": 8
    };
    const current = new Date(); // Actual system time

    const parseDate = (dStr, year) => {
      const parts = dStr.trim().split(" ");
      const day = parseInt(parts[0], 10);
      const month = months[parts[1]];
      return new Date(year, month, day);
    };

    try {
      const yearMatch = dateStr.match(/\\d{4}$/);
      const year = yearMatch ? parseInt(yearMatch[0], 10) : new Date().getFullYear();
      const withoutYear = dateStr.replace(/\\d{4}$/, "").trim();

      if (withoutYear.includes("-")) {
        const parts = withoutYear.split("-");
        let startStr = parts[0].trim();
        let endStr = parts[1].trim();

        if (startStr.split(" ").length === 1) {
            const endMonth = endStr.split(" ")[1];
            startStr = \`\${startStr} \${endMonth}\`;
        }
        
        const start = parseDate(startStr, year);
        start.setHours(0,0,0,0);
        const end = parseDate(endStr, year);
        end.setHours(23, 59, 59, 999);

        if (current > end) return "Selesai";
        if (current >= start && current <= end) return "Berjalan";
        return "Belum Dimulai";
      } else {
        const date = parseDate(withoutYear, year);
        const start = new Date(date);
        start.setHours(0,0,0,0);
        const end = new Date(date);
        end.setHours(23,59,59,999);
        
        if (current > end) return "Selesai";
        if (current >= start && current <= end) return "Berjalan";
        return "Belum Dimulai";
      }
    } catch (e) {
      return "Belum Dimulai";
    }
  };
`;

const interfaceReplacement = `interface Milestone {
  id: number;
  title: string;
  date: string;
  phase: string;
  description: string;
}`;

content = content.replace(/interface Milestone \{[\s\S]*?description: string;\n\}/, interfaceReplacement);

content = content.replace(/const phases = \[[\s\S]*?  \];\n/, '');
content = content.replace(/const milestones: Milestone\[\] = \[[\s\S]*?  \];\n/, newMilestones);

content = content.replace(/const getStatusStyle = \(status: "Completed" \| "Ongoing" \| "Scheduled"\) => \{/, 'const getStatusStyle = (status: string) => {');

content = content.replace('case "Completed":', 'case "Selesai":');
content = content.replace('case "Ongoing":', 'case "Berjalan":');
content = content.replace('case "Scheduled":', 'case "Belum Dimulai":');

content = content.replace('const style = getStatusStyle(milestone.status);', 'const calculatedStatus = getMilestoneStatus(milestone.date);\n                const style = getStatusStyle(calculatedStatus);');

content = content.replace(/<span>\{milestone\.status\}<\/span>/, '<span>{calculatedStatus}</span>');

content = content.replace('7 MAY 2026', '6 MEI 2026');
content = content.replace('29 JULY 2026', '29 JULI 2026');
content = content.replace('11 SEPT 2026', '11 SEPTEMBER 2026');
content = content.replace('START', 'START');
content = content.replace('DEPLOYMENT', 'PENERJUNAN');
content = content.replace('COMPLETION', 'SELESAI');

content = content.replace('TIMELINE PELAKSANAAN KKN 2026', 'TIMELINE PELAKSANAAN KKN 2026'); // Make sure it's correct
content = content.replace('KKN IMPLEMENTATION TIMELINE 2026', 'TIMELINE PELAKSANAAN KKN 2026');
content = content.replace('A structured roadmap of the KKN Persyarikatan Muhammadiyah implementation process, covering preparation, field deployment, execution, evaluation, and reporting phases.', 'Roadmap resmi pelaksanaan KKN PersyarikatanMu 2026, mulai dari pendaftaran, validasi, pembagian kelompok, pembekalan, observasi, pelaksanaan lapangan, hingga pengumpulan laporan dan responsi.');

fs.writeFileSync('src/components/KKNRoadmap.tsx', content);
