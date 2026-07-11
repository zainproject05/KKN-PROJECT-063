import fs from 'fs';
let content = fs.readFileSync('src/components/kkn/Attendance.tsx', 'utf-8');

const startIdx = content.indexOf('  const handlePrintPDFReport = (session: any) => {');
const endStr = '};\n          </script>\n        </body>\n      </html>\n    `;\n    printWindow.document.write(htmlContent);\n    printWindow.document.close();\n  };';
let endIdx = content.indexOf(endStr, startIdx);

if (endIdx === -1) {
    const backupEndStr = 'printWindow.document.close();\n  };';
    endIdx = content.indexOf(backupEndStr, startIdx);
    if (endIdx !== -1) endIdx += backupEndStr.length;
} else {
    endIdx += endStr.length;
}

const replacement = `
  const generateAttendanceHTML = (session: any, membersList: any[], recordsList: any[], revStatusMap: Record<string, string>) => {
    const list = membersList.map((member, i) => {
      const rec = recordsList.find(r => r.member_id === member.id);
      const rawStatus = rec?.status || "Absent";
      const indStatus = revStatusMap[rawStatus] || "Alfa";
      
      return {
        index: i + 1,
        name: member.full_name,
        nim: member.nim,
        status: rec ? indStatus.toUpperCase() : "BELUM DICATAT",
        timeIn: rec?.check_in_at ? new Date(rec.check_in_at).toLocaleTimeString("id-ID") : "-"
      };
    });

    return \`
      <html>
        <head>
          <title>Laporan Kehadiran KKN - \${session.activity_name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #0f172a; padding: 50px; line-height: 1.5; background: #ffffff; }
            .header-table { width: 100%; border-bottom: 3px double #020617; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-text { font-size: 24px; font-weight: 900; color: #020617; letter-spacing: 1px; margin: 0; }
            .sub-logo { font-size: 11px; font-weight: bold; text-transform: uppercase; color: #475569; letter-spacing: 2px; margin-top: 5px; }
            .report-title { text-align: center; font-size: 16px; font-weight: bold; text-transform: uppercase; margin-bottom: 25px; letter-spacing: 1px; }
            .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; font-size: 11px; }
            .meta-item { line-height: 1.8; }
            .meta-item strong { color: #020617; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 11px; }
            th { background-color: #0f172a; color: #ffffff; text-align: left; padding: 12px; font-weight: bold; text-transform: uppercase; border: 1px solid #0f172a; }
            td { padding: 12px; border: 1px solid #e2e8f0; color: #334155; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .badge-hadir { background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 100px; font-weight: bold; font-size: 9px; }
            .badge-izin { background: #fef3c7; color: #92400e; padding: 4px 10px; border-radius: 100px; font-weight: bold; font-size: 9px; }
            .badge-sakit { background: #f3e8ff; color: #6b21a8; padding: 4px 10px; border-radius: 100px; font-weight: bold; font-size: 9px; }
            .badge-alfa { background: #fee2e2; color: #991b1b; padding: 4px 10px; border-radius: 100px; font-weight: bold; font-size: 9px; }
            .footer-info { margin-top: 50px; text-align: right; font-size: 10px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 15px; }
            .signature-container { display: flex; justify-content: space-between; margin-top: 50px; page-break-inside: avoid; }
            .sig-box { text-align: center; width: 28%; }
            .sig-title { font-size: 10px; font-weight: 600; color: #64748b; margin-bottom: 60px; }
            .sig-line { border-bottom: 1.5px solid #0f172a; width: 80%; margin: 0 auto 6px; }
            .sig-name { font-size: 9.5px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 0.5px; }
            .sig-sub { font-size: 8px; color: #64748b; margin: 2px 0 0; font-weight: 600; text-transform: uppercase; }
            @media print { body { padding: 10px; } }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <div class="logo-text">KKN PERSYARIKATAN MUHAMMADIYAH</div>
                <div class="sub-logo">Kelompok 063 &bull; Universitas Muhammadiyah Yogyakarta</div>
              </td>
            </tr>
          </table>
          <div class="report-title">LAPORAN REKAPITULASI PRESENSI KEHADIRAN</div>
          <div class="meta-grid">
            <div class="meta-item">
              <strong>Nama Aktivitas:</strong> \${session.activity_name}<br>
              <strong>Program Kerja:</strong> \${session.programs?.title || "Umum / Non-Proker"}<br>
              <strong>Tanggal Sesi:</strong> \${new Date(session.date).toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </div>
            <div class="meta-item">
              <strong>Jam Presensi:</strong> \${session.opens_at} - \${session.closes_at} WIB<br>
              <strong>Lokasi / Posko:</strong> \${session.location_name}<br>
              <strong>Status Sesi:</strong> \${session.status === "open" ? "AKTIF" : "SELESAI"}
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th style="width: 5%">No</th>
                <th style="width: 45%">Nama Lengkap Anggota</th>
                <th style="width: 20%">NIM</th>
                <th style="width: 15%">Waktu</th>
                <th style="width: 15%">Status</th>
              </tr>
            </thead>
            <tbody>
              \${list.map(item => \`
                <tr>
                  <td style="text-align: center">\${item.index}</td>
                  <td><strong>\${item.name}</strong></td>
                  <td style="font-family: monospace">\${item.nim || "-"}</td>
                  <td style="text-align: center">\${item.timeIn}</td>
                  <td style="text-align: center">
                    <span class="badge-\${item.status.toLowerCase().replace("belum dicatat", "alfa")} ">\${item.status}</span>
                  </td>
                </tr>
              \`).join('')}
            </tbody>
          </table>
          
          <div class="signature-container">
            <div class="sig-box">
              <p class="sig-title">Mengetahui,</p>
              <div class="sig-line"></div>
              <p class="sig-name">KETUA KELOMPOK KKN</p>
              <p class="sig-sub">Kordinator Lapangan 063</p>
            </div>
            
            <div class="sig-box">
              <p class="sig-title">Disetujui Oleh,</p>
              <div class="sig-line"></div>
              <p class="sig-name">DOSEN PEMBIMBING</p>
              <p class="sig-sub">DPL KKN UMY Yogyakarta</p>
            </div>
          </div>
          
          <div class="footer-info">
            Dicetak pada: \${new Date().toLocaleString("id-ID")} melalui Sistem KKN Workspace Kelompok 063
          </div>
        </body>
      </html>
    \`;
  };
`;

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + replacement + content.substring(endIdx);
  fs.writeFileSync('src/components/kkn/Attendance.tsx', content);
  console.log("Successfully replaced");
} else {
  console.log("Did not find boundaries: start=" + startIdx + ", end=" + endIdx);
}
