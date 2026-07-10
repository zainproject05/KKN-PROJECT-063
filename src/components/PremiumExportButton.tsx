import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, FileSpreadsheet, FileText, Printer, FileJson, ChevronDown } from "lucide-react";
import * as XLSX from "xlsx";
import { audio } from "../utils/audioService";

interface ExportColumn {
  key: string;
  label: string;
  formatter?: (val: any, row: any) => string;
}

interface PremiumExportButtonProps {
  data: any[];
  columns: ExportColumn[];
  filename: string;
  title: string;
  id?: string;
}

export function PremiumExportButton({
  data,
  columns,
  filename,
  title,
  id = "premium-export-btn"
}: PremiumExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const prepareData = () => {
    return data.map(row => {
      const exportRow: any = {};
      columns.forEach(col => {
        const val = row[col.key];
        exportRow[col.label] = col.formatter ? col.formatter(val, row) : (val !== null && val !== undefined ? String(val) : "-");
      });
      return exportRow;
    });
  };

  const handleExportCSV = () => {
    audio.playPrimaryClick();
    const formatted = prepareData();
    if (formatted.length === 0) return;

    const headers = Object.keys(formatted[0]);
    const csvContent = [
      headers.join(","),
      ...formatted.map(row => 
        headers.map(header => {
          let cell = row[header] === null || row[header] === undefined ? "" : String(row[header]);
          cell = cell.replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(",")
      )
    ].join("\n");

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const handleExportExcel = () => {
    audio.playPrimaryClick();
    try {
      const formatted = prepareData();
      const worksheet = XLSX.utils.json_to_sheet(formatted);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
      
      // Generate buffer
      XLSX.writeFile(workbook, `${filename}_${new Date().toISOString().slice(0,10)}.xlsx`);
    } catch (error) {
      console.error("Excel export error:", error);
    }
    setIsOpen(false);
  };

  const handleExportJSON = () => {
    audio.playPrimaryClick();
    const formatted = prepareData();
    const jsonString = JSON.stringify(formatted, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  const generatePremiumHTML = (isWord = false) => {
    const isFinance = filename === "keuangan_kkn";
    
    // Day of the week helper
    const getIndonesianDay = (dateStr: string) => {
      if (!dateStr) return "-";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "-";
        const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
        return days[d.getDay()];
      } catch (e) {
        return "-";
      }
    };

    // Format Date helper
    const formatIndonesianDate = (dateStr: string) => {
      if (!dateStr) return "-";
      try {
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleDateString("id-ID", { year: "numeric", month: "long", day: "numeric" });
      } catch (e) {
        return dateStr;
      }
    };

    // Format Time helper
    const formatIndonesianTime = (row: any) => {
      if (row.created_at) {
        try {
          const d = new Date(row.created_at);
          if (!isNaN(d.getTime())) {
            return d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";
          }
        } catch (e) {}
      }
      return "12:00 WIB";
    };

    let totalIncome = 0;
    let totalExpense = 0;

    data.forEach((row: any) => {
      const amt = Number(row.amount) || 0;
      if (row.transaction_type === "income") {
        totalIncome += amt;
      } else if (row.transaction_type === "expense") {
        totalExpense += amt;
      }
    });
    const netBalance = totalIncome - totalExpense;

    const formattedDate = new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = new Date().toLocaleTimeString("id-ID") + " WIB";

    let contentHtml = "";

    if (isFinance) {
      contentHtml = `
        <div class="report-container">
          <!-- Outer border trim for luxury look -->
          <div class="luxury-trim"></div>

          <!-- Header -->
          <div class="header">
            <div class="logo-box">
              <div class="logo-main">KKN 063</div>
              <div class="logo-sub">GROUP WORKSPACE</div>
            </div>
            <div class="header-text">
              <h1 class="main-title">LAPORAN ARUS KAS & PERTANGGUNGJAWABAN KEUANGAN</h1>
              <h2 class="sub-title">KELOMPOK KKN 063 PERSYARIKATAN - UNIVERSITAS MUHAMMADIYAH YOGYAKARTA</h2>
              <p class="meta-desc">Lokasi Pengabdian: Kabupaten Sleman, Daerah Istimewa Yogyakarta</p>
            </div>
          </div>

          <!-- Divider with diamond ornament -->
          <div class="ornament-divider">
            <div class="line"></div>
            <div class="diamond">◆</div>
            <div class="line"></div>
          </div>

          <!-- Document Info Metadata Block -->
          <div class="meta-block">
            <table class="meta-table">
              <tr>
                <td class="meta-label">ID DOKUMEN:</td>
                <td class="meta-value font-mono">KKN063-FIN-${new Date().getFullYear()}${String(new Date().getMonth()+1).padStart(2,'0')}</td>
                <td class="meta-label">HARI / TANGGAL CETAK:</td>
                <td class="meta-value">${formattedDate}</td>
              </tr>
              <tr>
                <td class="meta-label">STATUS DATA:</td>
                <td class="meta-value"><span class="badge badge-success">TERVERIFIKASI REAL-TIME</span></td>
                <td class="meta-label">WAKTU GENERATE:</td>
                <td class="meta-value font-mono">${formattedTime}</td>
              </tr>
              <tr>
                <td class="meta-label">JUMLAH TRANSAKSI:</td>
                <td class="meta-value font-bold">${data.length} Rekam Mutasi</td>
                <td class="meta-label">OTORISASI:</td>
                <td class="meta-value">Sistem Ledger Kas Kelompok 063</td>
              </tr>
            </table>
          </div>

          <!-- Luxury Bento Balance Cards -->
          <div class="bento-container">
            <div class="bento-card card-income">
              <span class="bento-label">TOTAL PENERIMAAN (PEMASUKAN)</span>
              <h3 class="bento-amount">Rp ${totalIncome.toLocaleString("id-ID")}</h3>
              <p class="bento-sub text-success">◆ Spons, Iuran, Donasi</p>
            </div>
            <div class="bento-card card-expense">
              <span class="bento-label">TOTAL PENGELUARAN (BELANJA)</span>
              <h3 class="bento-amount">Rp ${totalExpense.toLocaleString("id-ID")}</h3>
              <p class="bento-sub text-danger">◆ Belanja & Proker KKN</p>
            </div>
            <div class="bento-card card-balance">
              <span class="bento-label">SALDO AKHIR KAS BERSIH</span>
              <h3 class="bento-amount ${netBalance >= 0 ? 'text-success' : 'text-danger'}">Rp ${netBalance.toLocaleString("id-ID")}</h3>
              <p class="bento-sub">◆ Sisa Anggaran Sesi Ini</p>
            </div>
          </div>

          <!-- Main Table Ledger -->
          <h3 class="section-title">RINCIAN JURNAL TRANSAKSI KEUANGAN</h3>
          <table class="ledger-table">
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">NO.</th>
                <th style="width: 15%; text-align: left;">HARI & WAKTU</th>
                <th style="width: 15%; text-align: left;">TANGGAL</th>
                <th style="width: 15%; text-align: left;">KATEGORI</th>
                <th style="width: 30%; text-align: left;">DESKRIPSI KETERANGAN</th>
                <th style="width: 10%; text-align: center;">TIPE</th>
                <th style="width: 15%; text-align: right;">NOMINAL</th>
              </tr>
            </thead>
            <tbody>
              ${data.map((row: any, index: number) => {
                const isInc = row.transaction_type === "income";
                return `
                  <tr>
                    <td class="font-mono" style="text-align: center; color: #64748b;">${index + 1}</td>
                    <td>
                      <div class="font-bold text-slate-800" style="font-weight: bold; color: #1e293b;">${getIndonesianDay(row.transaction_date)}</div>
                      <div class="font-mono text-slate-500" style="font-size: 9px; color: #64748b;">${formatIndonesianTime(row)}</div>
                    </td>
                    <td class="font-mono font-bold" style="font-weight: bold;">${formatIndonesianDate(row.transaction_date)}</td>
                    <td>
                      <span class="category-badge">${row.category || "Lain-lain"}</span>
                    </td>
                    <td>
                      <div class="font-bold text-slate-900 uppercase" style="font-weight: bold; color: #0f172a;">${row.description || "-"}</div>
                    </td>
                    <td style="text-align: center;">
                      <span class="type-badge ${isInc ? 'badge-income' : 'badge-expense'}">
                        ${isInc ? 'INCOME' : 'EXPENSE'}
                      </span>
                    </td>
                    <td class="font-mono font-bold text-right ${isInc ? 'val-income' : 'val-expense'}" style="white-space: nowrap; text-align: right;">
                      ${isInc ? '+' : '-'} Rp ${Number(row.amount || 0).toLocaleString("id-ID")}
                    </td>
                  </tr>
                `;
              }).join("")}
            </tbody>
          </table>

          <!-- Signature Block -->
          <div class="signature-container">
            <div class="sig-box">
              <p class="sig-title">Dibuat Oleh,</p>
              <div class="sig-line"></div>
              <p class="sig-name">BENDAHARA KELOMPOK</p>
              <p class="sig-sub">Div. Administrasi & Keuangan</p>
            </div>
            
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

          <!-- Document Footer Notes -->
          <div class="notes-footer">
            <p><strong>Catatan Hukum & Keuangan:</strong> Laporan ini dicetak secara sah melalui KKN Workspace digital Kelompok 063. Segala mutasi yang tercatat telah divalidasi dengan melampirkan bukti nota fisik otentik dan mematuhi asas transparansi akuntansi publik.</p>
            <p style="text-align: center; margin-top: 15px; color: #94a3b8; font-size: 8px;">© ${new Date().getFullYear()} KKN Kelompok 063 Universitas Muhammadiyah Yogyakarta. All Rights Reserved.</p>
          </div>
        </div>
      `;
    } else {
      // General Fallback for other tables
      const headers = columns.map(c => c.label);
      contentHtml = `
        <div class="report-container">
          <div class="header">
            <h1 class="main-title">${title}</h1>
            <p class="meta-desc">Daftar Rekam Data Workspace KKN Kelompok 063</p>
            <p class="font-mono" style="font-size: 10px; color: #64748b; margin-top: 5px;">Dicetak pada: ${formattedDate} - ${formattedTime}</p>
          </div>
          <table class="ledger-table">
            <thead>
              <tr>
                <th style="width: 5%; text-align: center;">NO.</th>
                ${headers.map(h => `<th style="text-align: left;">${h}</th>`).join("")}
              </tr>
            </thead>
            <tbody>
              ${data.map((row: any, idx: number) => `
                <tr>
                  <td style="text-align: center; color: #64748b;" class="font-mono">${idx + 1}</td>
                  ${columns.map(col => {
                    const val = row[col.key];
                    const fVal = col.formatter ? col.formatter(val, row) : (val !== null && val !== undefined ? String(val) : "-");
                    return `<td>${fVal}</td>`;
                  }).join("")}
                </tr>
              `).join("")}
            </tbody>
          </table>
          <div class="notes-footer" style="text-align: center; margin-top: 50px;">
            <p>© ${new Date().getFullYear()} KKN Kelompok 063 Universitas Muhammadiyah Yogyakarta.</p>
          </div>
        </div>
      `;
    }

    return `
      <html>
        <head>
          <title>${title}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Montserrat:wght@400;500;600;700;800&family=Fira+Code:wght@400;700&display=swap');
            
            body {
              font-family: 'Montserrat', sans-serif;
              color: #1e293b;
              background-color: #ffffff;
              padding: 0;
              margin: 0;
              line-height: 1.6;
              font-size: 11px;
            }
            .report-container {
              max-width: 900px;
              margin: 0 auto;
              padding: 40px;
              position: relative;
              background: #fff;
            }
            .luxury-trim {
              position: absolute;
              top: 15px;
              left: 15px;
              right: 15px;
              bottom: 15px;
              border: 1px solid rgba(197, 160, 89, 0.25);
              pointer-events: none;
            }
            .header {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 25px;
              gap: 20px;
            }
            .logo-box {
              border: 2.5px double #c5a059;
              padding: 10px 15px;
              text-align: center;
              background-color: #0f172a;
              color: #fff;
              min-width: 110px;
            }
            .logo-main {
              font-family: 'Cinzel', serif;
              font-size: 18px;
              font-weight: 900;
              letter-spacing: 2px;
              color: #c5a059;
            }
            .logo-sub {
              font-size: 7px;
              font-weight: 700;
              letter-spacing: 3px;
              color: #94a3b8;
              margin-top: 2px;
            }
            .header-text {
              text-align: right;
              flex-grow: 1;
            }
            .main-title {
              font-family: 'Cinzel', serif;
              font-size: 19px;
              font-weight: 900;
              margin: 0;
              color: #0f172a;
              letter-spacing: 1px;
            }
            .sub-title {
              font-size: 11px;
              font-weight: 700;
              margin: 6px 0 0;
              color: #c5a059;
              letter-spacing: 0.5px;
            }
            .meta-desc {
              margin: 4px 0 0;
              font-size: 10px;
              color: #64748b;
              font-weight: 500;
            }
            .ornament-divider {
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 20px 0 30px;
            }
            .ornament-divider .line {
              height: 1px;
              background: linear-gradient(to right, transparent, #c5a059, transparent);
              flex-grow: 1;
            }
            .ornament-divider .diamond {
              color: #c5a059;
              font-size: 12px;
              margin: 0 15px;
            }
            
            /* Meta Information */
            .meta-block {
              background-color: #f8fafc;
              border: 1px solid #e2e8f0;
              border-left: 4px solid #c5a059;
              border-radius: 8px;
              padding: 15px 20px;
              margin-bottom: 30px;
            }
            .meta-table {
              width: 100%;
              border-collapse: collapse;
            }
            .meta-table td {
              padding: 5px 10px;
              border: none;
              font-size: 10px;
            }
            .meta-label {
              font-weight: 800;
              color: #64748b;
              width: 18%;
              letter-spacing: 0.5px;
            }
            .meta-value {
              color: #0f172a;
              font-weight: 600;
              width: 32%;
            }
            
            /* Bento Cards styling */
            .bento-container {
              display: flex;
              gap: 20px;
              margin-bottom: 35px;
            }
            .bento-card {
              flex: 1;
              border-radius: 12px;
              padding: 20px;
              box-shadow: 0 4px 15px rgba(0,0,0,0.03);
              border: 1px solid #e2e8f0;
              position: relative;
              overflow: hidden;
            }
            .bento-card::before {
              content: '';
              position: absolute;
              left: 0;
              top: 0;
              bottom: 0;
              width: 4px;
            }
            .card-income {
              background-color: #f0fdf4;
              border-color: #bbf7d0;
            }
            .card-income::before {
              background-color: #22c55e;
            }
            .card-expense {
              background-color: #fef2f2;
              border-color: #fecaca;
            }
            .card-expense::before {
              background-color: #ef4444;
            }
            .card-balance {
              background-color: #f8fafc;
              border-color: #cbd5e1;
            }
            .card-balance::before {
              background-color: #64748b;
            }
            .bento-label {
              display: block;
              font-size: 8px;
              font-weight: 800;
              letter-spacing: 1px;
              color: #64748b;
              margin-bottom: 6px;
            }
            .bento-amount {
              font-size: 18px;
              font-weight: 800;
              margin: 0;
              color: #0f172a;
              letter-spacing: -0.5px;
            }
            .bento-sub {
              font-size: 9px;
              font-weight: 600;
              margin: 5px 0 0 0;
              color: #64748b;
            }
            
            /* Ledger Table */
            .section-title {
              font-family: 'Cinzel', serif;
              font-size: 13px;
              font-weight: 800;
              color: #0f172a;
              letter-spacing: 1px;
              border-bottom: 1px solid #e2e8f0;
              padding-bottom: 8px;
              margin-bottom: 15px;
            }
            .ledger-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 40px;
              font-size: 10px;
            }
            .ledger-table th {
              background-color: #0f172a;
              color: #ffffff;
              font-weight: 700;
              padding: 12px 14px;
              font-size: 9px;
              text-transform: uppercase;
              letter-spacing: 0.8px;
              border: none;
            }
            .ledger-table th:first-child {
              border-radius: 6px 0 0 0;
            }
            .ledger-table th:last-child {
              border-radius: 0 6px 0 0;
              text-align: right;
            }
            .ledger-table td {
              padding: 12px 14px;
              border-bottom: 1px solid #e2e8f0;
              vertical-align: middle;
            }
            .ledger-table tr:nth-child(even) {
              background-color: #f8fafc;
            }
            .ledger-table tr:hover {
              background-color: #f1f5f9;
            }
            
            /* Badges & Classes */
            .badge {
              display: inline-block;
              padding: 3px 8px;
              border-radius: 999px;
              font-size: 7.5px;
              font-weight: 800;
              letter-spacing: 0.5px;
              text-transform: uppercase;
            }
            .badge-success {
              background-color: #dcfce7;
              color: #166534;
            }
            .category-badge {
              display: inline-block;
              background-color: #f1f5f9;
              border: 1px solid #cbd5e1;
              color: #334155;
              padding: 2.5px 8px;
              border-radius: 4px;
              font-size: 8px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.3px;
            }
            .type-badge {
              display: inline-block;
              padding: 2.5px 7px;
              border-radius: 4px;
              font-size: 7.5px;
              font-weight: 800;
              letter-spacing: 0.5px;
            }
            .badge-income {
              background-color: #dcfce7;
              color: #15803d;
            }
            .badge-expense {
              background-color: #fee2e2;
              color: #b91c1c;
            }
            
            .text-success { color: #16a34a !important; }
            .text-danger { color: #dc2626 !important; }
            .val-income { color: #16a34a; font-weight: 800; }
            .val-expense { color: #dc2626; font-weight: 800; }
            .font-mono { font-family: 'Fira Code', monospace; }
            .font-bold { font-weight: 700; }
            
            /* Signature Box */
            .signature-container {
              display: flex;
              justify-content: space-between;
              margin-top: 50px;
              page-break-inside: avoid;
            }
            .sig-box {
              text-align: center;
              width: 28%;
            }
            .sig-title {
              font-size: 10px;
              font-weight: 600;
              color: #64748b;
              margin-bottom: 60px;
            }
            .sig-line {
              border-bottom: 1.5px solid #0f172a;
              width: 80%;
              margin: 0 auto 6px;
            }
            .sig-name {
              font-size: 9.5px;
              font-weight: 800;
              color: #0f172a;
              margin: 0;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .sig-sub {
              font-size: 8px;
              color: #64748b;
              margin: 2px 0 0;
              font-weight: 600;
              text-transform: uppercase;
            }
            
            /* Footer */
            .notes-footer {
              margin-top: 60px;
              border-top: 1px solid #cbd5e1;
              padding-top: 20px;
              font-size: 8.5px;
              color: #64748b;
              line-height: 1.6;
              text-align: justify;
              page-break-inside: avoid;
            }
            
            @media print {
              body {
                background: #fff;
                color: #000;
              }
              .report-container {
                padding: 10px;
              }
              .luxury-trim {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          ${contentHtml}
          ${!isWord ? `
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
          ` : ""}
        </body>
      </html>
    `;
  };

  const handlePrintPDF = () => {
    audio.playPrimaryClick();
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    const htmlContent = generatePremiumHTML(false);
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setIsOpen(false);
  };

  const handleExportWord = () => {
    audio.playPrimaryClick();
    const htmlContent = generatePremiumHTML(true);
    const blob = new Blob(['\ufeff' + htmlContent], {
      type: 'application/msword'
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}_${new Date().toISOString().slice(0,10)}.doc`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef} id={id}>
      <motion.button
        whileHover={{ scale: 1.02, y: -0.5 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          audio.playSecondaryClick();
          setIsOpen(!isOpen);
        }}
        className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-slate-900 to-slate-950 hover:from-slate-850 hover:to-slate-900 border border-white/[0.08] hover:border-cyan-500/30 text-xs font-sans font-black uppercase tracking-wider text-slate-200 transition-all cursor-pointer flex items-center gap-2 shadow-[2px_4px_12px_rgba(0,0,0,0.4)]"
      >
        <Download size={13} className="text-cyan-400" />
        <span>Unduh Data</span>
        <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2.5 w-52 rounded-2xl bg-[#030406]/95 border border-white/[0.08] p-1.5 shadow-[10px_10px_30px_rgba(0,0,0,0.8)] backdrop-blur-xl z-50 overflow-hidden"
          >
            {/* Background micro glow */}
            <div className="absolute inset-x-0 -top-12 h-16 bg-cyan-500/10 rounded-full blur-xl pointer-events-none" />

            <button
              onClick={handleExportExcel}
              className="w-full text-left cursor-pointer text-[10px] font-black uppercase tracking-widest px-3.5 py-2.5 rounded-xl hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors flex items-center gap-2.5 font-sans"
            >
              <FileSpreadsheet size={13} className="text-emerald-500" />
              <span>Microsoft Excel</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="w-full text-left cursor-pointer text-[10px] font-black uppercase tracking-widest px-3.5 py-2.5 rounded-xl hover:bg-cyan-500/10 hover:text-cyan-400 transition-colors flex items-center gap-2.5 font-sans"
            >
              <FileText size={13} className="text-cyan-400" />
              <span>Format CSV</span>
            </button>

            <button
              onClick={handlePrintPDF}
              className="w-full text-left cursor-pointer text-[10px] font-black uppercase tracking-widest px-3.5 py-2.5 rounded-xl hover:bg-rose-500/10 hover:text-rose-400 transition-colors flex items-center gap-2.5 font-sans"
            >
              <Printer size={13} className="text-rose-400" />
              <span>Cetak / PDF</span>
            </button>

            <button
              onClick={handleExportWord}
              className="w-full text-left cursor-pointer text-[10px] font-black uppercase tracking-widest px-3.5 py-2.5 rounded-xl hover:bg-blue-500/10 hover:text-blue-400 transition-colors flex items-center gap-2.5 font-sans"
            >
              <FileText size={13} className="text-blue-450" />
              <span>Format MS Word</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="w-full text-left cursor-pointer text-[10px] font-black uppercase tracking-widest px-3.5 py-2.5 rounded-xl hover:bg-violet-500/10 hover:text-violet-400 transition-colors flex items-center gap-2.5 font-sans"
            >
              <FileJson size={13} className="text-violet-400" />
              <span>Format JSON</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
