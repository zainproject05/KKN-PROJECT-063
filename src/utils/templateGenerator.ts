/**
 * UMY KKN Academic Resource Centre - Document & Spreadsheet Generator
 * Generates highly professional, standard-compliant templates for Word (.doc) and Excel (.xls).
 * These open perfectly in Microsoft Office, Google Docs, and WPS Office, maintaining all rich formatting.
 */

const wordHeader = `
<html xmlns:o='urn:schemas-microsoft-com:office:office' 
      xmlns:w='urn:schemas-microsoft-com:office:word' 
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>KKN UMY Template</title>
  <!--[if gte mso 9]>
  <xml>
    <w:WordDocument>
      <w:View>Print</w:View>
      <w:Zoom>100</w:Zoom>
      <w:DoNotOptimizeForBrowser/>
    </w:WordDocument>
  </xml>
  <![endif]-->
  <style>
    @page {
      size: 21.0cm 29.7cm; /* A4 */
      margin: 3.0cm 3.0cm 3.0cm 4.0cm; /* Standard Indonesian Skripsi/Report Margins: Top 3, Bottom 3, Right 3, Left 4 */
    }
    body {
      font-family: 'Times New Roman', Times, serif;
      font-size: 12pt;
      line-height: 1.5;
      color: #000000;
    }
    .kop-surat {
      border-bottom: 3px double #000000;
      padding-bottom: 12px;
      margin-bottom: 30px;
      text-align: center;
    }
    .kop-logo-text {
      font-family: 'Arial', sans-serif;
      font-size: 14pt;
      font-weight: bold;
      color: #0c1c3c;
      letter-spacing: 1px;
    }
    .kop-sub {
      font-family: 'Arial', sans-serif;
      font-size: 9pt;
      color: #475569;
      margin-top: 4px;
    }
    h1 {
      font-family: 'Arial', sans-serif;
      font-size: 14pt;
      font-weight: bold;
      color: #0c1c3c;
      text-align: center;
      margin-top: 20px;
      margin-bottom: 8px;
      text-transform: uppercase;
    }
    .subtitle {
      font-family: 'Arial', sans-serif;
      font-size: 10pt;
      text-align: center;
      margin-bottom: 30px;
      font-weight: bold;
      color: #4b5563;
      text-transform: uppercase;
    }
    h2 {
      font-family: 'Arial', sans-serif;
      font-size: 12pt;
      font-weight: bold;
      color: #0c1c3c;
      border-bottom: 1.5px solid #0c1c3c;
      padding-bottom: 2px;
      margin-top: 24px;
      margin-bottom: 10px;
      text-transform: uppercase;
    }
    h3 {
      font-family: 'Arial', sans-serif;
      font-size: 11pt;
      font-weight: bold;
      color: #1f2937;
      margin-top: 16px;
      margin-bottom: 6px;
    }
    p {
      margin-bottom: 12px;
      text-align: justify;
      text-indent: 1.25cm;
    }
    .no-indent {
      text-indent: 0;
    }
    .text-center {
      text-align: center;
    }
    .text-right {
      text-align: right;
    }
    .font-bold {
      font-weight: bold;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      margin-bottom: 18px;
    }
    th {
      background-color: #f1f5f9;
      color: #000000;
      font-family: 'Arial', sans-serif;
      font-weight: bold;
      font-size: 10pt;
      padding: 8px;
      border: 1px solid #000000;
      text-align: center;
      text-transform: uppercase;
    }
    td {
      padding: 8px;
      border: 1px solid #000000;
      font-size: 10pt;
      vertical-align: top;
    }
    .page-break {
      page-break-before: always;
    }
    .signature-table {
      width: 100%;
      border: none !important;
      margin-top: 40px;
    }
    .signature-table td {
      border: none !important;
      width: 50%;
      text-align: center;
      font-size: 11pt;
    }
  </style>
</head>
<body>
`;

const wordFooter = `
</body>
</html>
`;

const excelHeader = `
<html xmlns:o="urn:schemas-microsoft-com:office:office" 
      xmlns:x="urn:schemas-microsoft-com:office:excel" 
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta charset="utf-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>KKN UMY Spreadsheet</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
    }
    table {
      border-collapse: collapse;
    }
    th {
      background-color: #0c1c3c;
      color: #ffffff;
      font-weight: bold;
      border: 1px solid #94a3b8;
      padding: 10px;
      text-align: center;
      font-size: 10pt;
    }
    td {
      border: 1px solid #cbd5e1;
      padding: 8px;
      font-size: 10pt;
    }
    .title-cell {
      font-size: 16pt;
      font-weight: bold;
      color: #0c1c3c;
      text-align: center;
    }
    .subtitle-cell {
      font-size: 10pt;
      color: #475569;
      text-align: center;
    }
    .currency-cell {
      text-align: right;
      mso-number-format: "Rp\\ #\\,\\#\\#0";
    }
    .number-cell {
      text-align: center;
      mso-number-format: "0";
    }
    .total-row {
      background-color: #f1f5f9;
      font-weight: bold;
      border-top: 2px solid #0c1c3c;
    }
  </style>
</head>
<body>
`;

const excelFooter = `
</body>
</html>
`;

export function generateTemplate(id: string, title: string, description?: string): { blob: Blob; filename: string } {
  let content = "";
  let filename = `${title.replace(/[^a-zA-Z0-9]/g, "_")}`;
  let mimeType = "application/msword";

  if (id === "proposal") {
    filename += ".doc";
    content = `${wordHeader}
      <div class="kop-surat">
        <div class="kop-logo-text">UNIVERSITAS MUHAMMADIYAH YOGYAKARTA</div>
        <div class="kop-logo-text" style="font-size: 11pt; color: #475569;">LEMBAGA PENGABDIAN MASYARAKAT (LPM)</div>
        <div class="kop-sub">Alamat: Jl. Brawijaya, Kasihan, Bantul, Yogyakarta 55183 | Telp: (0274) 387656</div>
      </div>

      <h1>PROPOSAL PROGRAM KERJA KKN</h1>
      <div class="subtitle">KULIAH KERJA NYATA (KKN) REGULER / PERSYARIKATAN<br>UNIVERSITAS MUHAMMADIYAH YOGYAKARTA</div>

      <div style="margin-top: 40px; text-align: center;">
        <p class="no-indent font-bold" style="font-size: 13pt;">KELOMPOK KKN: [NOMOR_KELOMPOK / Kelompok 063]</p>
        <p class="no-indent" style="font-size: 11pt; margin-top: 8px;">LOKASI DESA: [NAMA DESA, KECAMATAN, KABUPATEN]</p>
        <p class="no-indent" style="font-size: 11pt; margin-top: 4px;">DOSEN PEMBIMBING LAPANGAN: [NAMA DPL & GELAR]</p>
      </div>

      <div class="page-break"></div>

      <h2>LEMBAR PENGESAHAN PROPOSAL</h2>
      <p class="no-indent">Setelah memperhatikan, meneliti, dan mengevaluasi rancangan program kerja yang diajukan, maka Proposal Kegiatan Kuliah Kerja Nyata (KKN) Universitas Muhammadiyah Yogyakarta Kelompok [NOMOR KELOMPOK] dinyatakan disetujui dan disahkan untuk dilaksanakan.</p>
      
      <p class="no-indent" style="margin-top: 15px;">Disahkan di: Yogyakarta<br>Pada Tanggal: [TANGGAL PENGESAHAN]</p>

      <table class="signature-table">
        <tr>
          <td>
            Mengetahui,<br>
            <strong>Dosen Pembimbing Lapangan (DPL)</strong>
            <br><br><br><br>
            <u>( [NAMA DPL & GELAR] )</u><br>
            NIDN. [NIDN_DPL]
          </td>
          <td>
            Yogyakarta, [TANGGAL]<br>
            <strong>Ketua Kelompok KKN</strong>
            <br><br><br><br>
            <u>( [NAMA KETUA KELOMPOK] )</u><br>
            NIM. [NIM_KETUA]
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-top: 30px;">
            Menyetujui / Mengesahkan,<br>
            <strong>Kepala Desa / Lurah [NAMA DESA]</strong>
            <br><br><br><br>
            <u>( [NAMA LURAH/KEPALA DESA] )</u><br>
            NIP. [NIP_LURAH]
          </td>
        </tr>
      </table>

      <div class="page-break"></div>

      <h2>BAB I: PENDAHULUAN</h2>
      <h3>1.1 Latar Belakang & Analisis Situasi Desa</h3>
      <p>Kuliah Kerja Nyata (KKN) merupakan salah satu perwujudan dari Catur Dharma Perguruan Tinggi Universitas Muhammadiyah Yogyakarta, khususnya dalam bidang pengabdian kepada masyarakat. Melalui KKN, mahasiswa diharapkan mampu mengaplikasikan ilmu pengetahuan, teknologi, dan nilai-nilai Al-Islam Kemuhammadiyahan secara langsung untuk membantu memecahkan permasalahan yang dihadapi oleh masyarakat di tingkat pedesaan.</p>
      <p>Berdasarkan observasi lapangan awal yang dilakukan oleh Kelompok KKN [NOMOR KELOMPOK] di Desa [NAMA DESA], terdapat beberapa potensi wilayah yang dapat dikembangkan serta kendala sosial, ekonomi, maupun keagamaan yang memerlukan perhatian. Di antaranya adalah minimnya digitalisasi administrasi desa, kurangnya bimbingan belajar keagamaan bagi anak-anak pasca-pandemi, serta perlunya edukasi kesehatan keluarga di tingkat dusun. Atas dasar tersebut, disusunlah proposal program kerja ini.</p>

      <h3>1.2 Rumusan Masalah</h3>
      <p class="no-indent" style="margin-bottom: 4px;">Berdasarkan analisis situasi di atas, rumusan masalah dalam KKN ini adalah:</p>
      <ol style="font-family: 'Times New Roman'; font-size: 12pt; line-height: 1.5; margin-left: 20px;">
        <li>Bagaimana meningkatkan literasi digital dan administrasi di tingkat perangkat desa?</li>
        <li>Bagaimana mengoptimalkan kegiatan keagamaan TPA/TPQ bagi anak-anak usia sekolah dasar?</li>
        <li>Bagaimana mengedukasi masyarakat terkait pola hidup bersih sehat dan mitigasi stunting?</li>
      </ol>

      <h3>1.3 Tujuan Kegiatan</h3>
      <p>Tujuan utama dari kegiatan KKN reguler ini adalah mengabdikan ilmu pengetahuan untuk memecahkan kendala sosial dan keagamaan di Desa [NAMA DESA] secara kolaboratif, serta mencetak mahasiswa yang berkarakter islami dan peduli sosial tinggi.</p>

      <h2>BAB II: RENCANA PROGRAM KERJA</h2>
      <h3>2.1 Program Kerja Pokok (Keagamaan & Keilmuan)</h3>
      <p>Program Pokok merupakan program kerja wajib yang diampu oleh masing-masing individu mahasiswa sesuai dengan bidang keilmuan dan keagamaan. Contoh program yang direncanakan adalah:</p>
      <ul>
        <li><strong>Revitalisasi TPA dan Pengajaran Al-Qur'an:</strong> Pendampingan guru ngaji, pengadaan media belajar interaktif, serta Festival Anak Sholeh tingkat dusun.</li>
        <li><strong>Bimbingan Belajar Tematik:</strong> Pembelajaran tambahan matematika, bahasa inggris dasar, dan pengenalan sains sederhana berbasis eksperimen menyenangkan.</li>
      </ul>

      <h3>2.2 Program Kerja Bantu (Kemitraan & Kemasyarakatan)</h3>
      <p>Program Bantu dirancang untuk mendukung kebutuhan insidental masyarakat serta kolaborasi lintas kelompok. Di antaranya:</p>
      <ul>
        <li><strong>Penyuluhan Gizi & Posyandu Sehat:</strong> Mengadakan demonstrasi memasak PMT (Pemberian Makanan Tambahan) sehat guna mencegah stunting pada balita.</li>
        <li><strong>Kerja Bakti Lingkungan dan Plangisasi:</strong> Penataan ulang papan petunjuk arah dusun dan tempat pembuangan sampah ramah lingkungan.</li>
      </ul>

      <h3>2.3 Matriks Rencana Kerja (Timeline)</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 35%;">Nama Kegiatan / Program</th>
            <th style="width: 25%;">Target Sasaran</th>
            <th style="width: 15%;">Penanggung Jawab</th>
            <th style="width: 20%;">Estimasi Waktu</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">1</td>
            <td>Pendampingan Belajar TPA Masjid Al-Ikhlas</td>
            <td>Anak-anak dusun I & II</td>
            <td>Divisi Keagamaan</td>
            <td class="text-center">Minggu ke-1 s.d ke-4</td>
          </tr>
          <tr>
            <td class="text-center">2</td>
            <td>Workshop UMKM Go Digital (Shopee/TikTok Shop)</td>
            <td>Ibu-ibu kader PKK & Karang Taruna</td>
            <td>Divisi Keilmuan Ekonomi</td>
            <td class="text-center">Minggu ke-2</td>
          </tr>
          <tr>
            <td class="text-center">3</td>
            <td>Penyuluhan Pencegahan Stunting Balita</td>
            <td>Ibu hamil & ibu menyusui</td>
            <td>Divisi Kesehatan</td>
            <td class="text-center">Minggu ke-3</td>
          </tr>
        </tbody>
      </table>

      <h2>BAB III: METODE PELAKSANAAN</h2>
      <p>Metode pelaksanaan program dilakukan secara partisipatif (Participatory Action Research), di mana mahasiswa bertindak sebagai fasilitator dan motivator, sementara masyarakat desa menjadi pelaku aktif utama dalam keberlanjutan program kerja.</p>

      <h2>BAB IV: RENCANA ANGGARAN BIAYA (RAB)</h2>
      <p>Berikut adalah rincian estimasi pembiayaan untuk kelancaran program KKN Kelompok [NOMOR]:</p>
      <table>
        <thead>
          <tr>
            <th style="width: 8%;">No</th>
            <th style="width: 42%;">Deskripsi Keperluan</th>
            <th style="width: 15%;">Volume</th>
            <th style="width: 18%;">Harga Satuan</th>
            <th style="width: 17%;">Jumlah Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">1</td>
            <td>Buku Iqra', Juz Amma, dan Al-Qur'an untuk TPA</td>
            <td class="text-center">15 Pcs</td>
            <td class="text-right">Rp 35.000</td>
            <td class="text-right">Rp 525.000</td>
          </tr>
          <tr>
            <td class="text-center">2</td>
            <td>Bahan Demo Masak PMT Sehat Balita Stunting</td>
            <td class="text-center">1 Paket</td>
            <td class="text-right">Rp 300.000</td>
            <td class="text-right">Rp 300.000</td>
          </tr>
          <tr>
            <td class="text-center">3</td>
            <td>Sewa Proyektor & sound system seminar UMKM</td>
            <td class="text-center">1 Hari</td>
            <td class="text-right">Rp 150.000</td>
            <td class="text-right">Rp 150.000</td>
          </tr>
          <tr class="font-bold" style="background-color: #f8fafc;">
            <td colspan="4" class="text-right">TOTAL RENCANA ANGGARAN BIYAYA</td>
            <td class="text-right">Rp 975.000</td>
          </tr>
        </tbody>
      </table>

      <h2>BAB V: PENUTUP</h2>
      <p>Demikian proposal program kerja KKN Universitas Muhammadiyah Yogyakarta Kelompok [NOMOR KELOMPOK] ini disusun. Dukungan moril maupun materiil dari pihak LPPM, Pemerintah Desa, DPL, dan warga setempat sangat kami harapkan demi tercapainya KKN yang berkemajuan, islami, dan berdaya guna bagi masyarakat luas.</p>
    ${wordFooter}`;
  } else if (id === "logbook") {
    filename += ".doc";
    content = `${wordHeader}
      <div class="kop-surat">
        <div class="kop-logo-text">UNIVERSITAS MUHAMMADIYAH YOGYAKARTA</div>
        <div class="kop-logo-text" style="font-size: 11pt; color: #475569;">PENGISIAN LOGBOOK AKTIVITAS HARIAN MAHASISWA</div>
        <div class="kop-sub">Sistem Monitoring KKN Terintegrasi LPM UMY</div>
      </div>

      <h1>LOGBOOK HARIAN ANGGOTA KELOMPOK KKN</h1>
      <div class="subtitle">LAPORAN KINERJA HARIAN INDIVIDU MAHASISWA KKN UMY</div>

      <div style="border: 1px solid #000000; padding: 12px; margin-bottom: 20px; font-family: 'Arial'; font-size: 10pt; line-height: 1.4;">
        <strong>IDENTITAS MAHASISWA KKN:</strong><br>
        Nama Lengkap Mahasiswa: [NAMA MAHASISWA INDIVIDU]<br>
        Nomor Induk Mahasiswa (NIM): [NIM MAHASISWA]<br>
        Kelompok KKN: KKN Kelompok [NOMOR_KELOMPOK]<br>
        Lokasi Posko / Basecamp: [ALAMAT LENGKAP BASECAMP KKN]<br>
        DPL Pembimbing: [NAMA DOSEN PEMBIMBING LAPANGAN]<br>
      </div>

      <h2>PANDUAN STANDAR PENGISIAN:</h2>
      <p class="no-indent" style="font-size: 10pt; color: #333333;">
        1. Logbook wajib diisi secara harian oleh setiap anggota kelompok KKN secara jujur, objektif, dan terperinci.<br>
        2. Pengisian mencakup jam mulai dan selesai untuk memantau akumulasi Target Minimum Jam Kerja Efektif Mahasiswa (JKEM) sebesar 120 Jam.<br>
        3. Berkas cetak fisik logbook ini wajib dilampirkan dalam berkas pertanggungjawaban akhir KKN ke DPL pada akhir periode penerjunanan.
      </p>

      <h2>TABEL REKAPITULASI AKTIVITAS HARIAN</h2>
      <table>
        <thead>
          <tr>
            <th style="width: 5%;">No</th>
            <th style="width: 15%;">Hari / Tanggal</th>
            <th style="width: 15%;">Waktu & Durasi</th>
            <th style="width: 35%;">Detail Aktivitas & Kegiatan</th>
            <th style="width: 15%;">Sifat Program</th>
            <th style="width: 15%;">Paraf Ketua</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="text-center">1</td>
            <td class="text-center">Senin, 06 Juli 2026</td>
            <td class="text-center">08:00 - 10:00<br>(2 Jam)</td>
            <td>Melakukan silaturahmi dengan Kepala Dusun I, Ketua RT, dan tokoh agama setempat untuk sosialisasi agenda KKN.</td>
            <td class="text-center">Bantu (Humas)</td>
            <td></td>
          </tr>
          <tr>
            <td class="text-center">2</td>
            <td class="text-center">Senin, 06 Juli 2026</td>
            <td class="text-center">15:30 - 17:30<br>(2 Jam)</td>
            <td>Mengajar mengaji tajwid dan kisah nabi di TPA Masjid Jami' Al-Muhajirin dusun setempat.</td>
            <td class="text-center">Pokok (Keagamaan)</td>
            <td></td>
          </tr>
          <tr>
            <td class="text-center">3</td>
            <td class="text-center">Selasa, 07 Juli 2026</td>
            <td class="text-center">09:00 - 12:00<br>(3 Jam)</td>
            <td>Mengadakan bimbingan belajar tambahan gratis untuk anak SD kelas 4-6 mengenai materi matematika pembagian.</td>
            <td class="text-center">Pokok (Pendidikan)</td>
            <td></td>
          </tr>
          <tr>
            <td class="text-center">4</td>
            <td class="text-center">Rabu, 08 Juli 2026</td>
            <td class="text-center">08:00 - 12:00<br>(4 Jam)</td>
            <td>Membantu persiapan administrasi pendataan Posyandu Balita dan Ibu Hamil di Balai Pertemuan Desa.</td>
            <td class="text-center">Bantu (Kesehatan)</td>
            <td></td>
          </tr>
          <tr>
            <td class="text-center">5</td>
            <td class="text-center">Kamis, 09 Juli 2026</td>
            <td class="text-center">19:30 - 21:30<br>(2 Jam)</td>
            <td>Menghadiri pertemuan rutin warga / rembug dusun untuk mendiskusikan agenda kerja bakti massal.</td>
            <td class="text-center">Bantu (Sosial)</td>
            <td></td>
          </tr>
          <tr class="font-bold" style="background-color: #f8fafc;">
            <td colspan="2" class="text-right">TOTAL AKUMULASI WAKTU</td>
            <td class="text-center">13 Jam</td>
            <td colspan="3">Target Minimum: 120 Jam Kerja Efektif Mahasiswa (JKEM)</td>
          </tr>
        </tbody>
      </table>

      <table class="signature-table" style="margin-top: 50px;">
        <tr>
          <td>
            Mengetahui,<br>
            <strong>Ketua Kelompok KKN UMY</strong>
            <br><br><br><br>
            <u>( [NAMA KETUA KELOMPOK] )</u><br>
            NIM. [NIM_KETUA]
          </td>
          <td>
            Yogyakarta, [TANGGAL]<br>
            <strong>Mahasiswa KKN Bersangkutan</strong>
            <br><br><br><br>
            <u>( [NAMA MAHASISWA INDIVIDU] )</u><br>
            NIM. [NIM_MAHASISWA]
          </td>
        </tr>
      </table>
    ${wordFooter}`;
  } else if (id === "lpj") {
    mimeType = "application/vnd.ms-excel";
    filename += ".xls";
    content = `${excelHeader}
      <table>
        <tr>
          <td colspan="8" class="title-cell">LAPORAN PERTANGGUNGJAWABAN (LPJ) KEUANGAN KAS KELOMPOK</td>
        </tr>
        <tr>
          <td colspan="8" class="subtitle-cell">KULIAH KERJA NYATA (KKN) UNIVERSITAS MUHAMMADIYAH YOGYAKARTA</td>
        </tr>
        <tr>
          <td colspan="8" class="subtitle-cell" style="font-weight: bold;">KELOMPOK KKN: Kelompok 063 Persyarikatan | LOKASI: Desa Sendangtirto, Berbah, Sleman</td>
        </tr>
        <tr><td colspan="8" style="border: none;"></td></tr>
        
        <!-- SECTION 1: RINGKASAN REKAPITULASI DANA -->
        <tr>
          <td colspan="4" style="background-color: #0f172a; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8;">SUMBER PENERIMAAN KAS (PEMASUKAN)</td>
          <td colspan="4" style="background-color: #0f172a; color: #ffffff; font-weight: bold; border: 1px solid #94a3b8;">REALISASI PENGELUARAN KAS KELOMPOK</td>
        </tr>
        <tr>
          <td colspan="3">1. Iuran Wajib Anggota (9 Mahasiswa x Rp 150.000)</td>
          <td class="currency-cell">1350000</td>
          <td colspan="3">1. Divisi Keagamaan & TPA</td>
          <td class="currency-cell">525000</td>
        </tr>
        <tr>
          <td colspan="3">2. Bantuan Dana Stimulan LPM UMY</td>
          <td class="currency-cell">500000</td>
          <td colspan="3">2. Divisi Pendidikan & Bimbingan Belajar</td>
          <td class="currency-cell">150000</td>
        </tr>
        <tr>
          <td colspan="3">3. Donatur Syariah & Sponsor Eksternal</td>
          <td class="currency-cell">350000</td>
          <td colspan="3">3. Divisi Kesehatan & PMT Stunting</td>
          <td class="currency-cell">300000</td>
        </tr>
        <tr>
          <td colspan="3">4. Lain-lain / Subsidi Desa</td>
          <td class="currency-cell">100000</td>
          <td colspan="3">4. Divisi Humas & Perlengkapan Operasional</td>
          <td class="currency-cell">120000</td>
        </tr>
        <tr class="total-row">
          <td colspan="3">TOTAL PEMASUKAN</td>
          <td class="currency-cell">2300000</td>
          <td colspan="3">TOTAL PENGELUARAN</td>
          <td class="currency-cell">1095000</td>
        </tr>
        <tr class="total-row" style="background-color: #f0fdf4;">
          <td colspan="6" style="text-align: right; color: #166534;">SALDO SISA KAS AKHIR KELOMPOK KKN (Pemasukan - Pengeluaran)</td>
          <td colspan="2" class="currency-cell" style="color: #166534; font-size: 11pt;">1205000</td>
        </tr>
        
        <tr><td colspan="8" style="border: none;"></td></tr>
        <tr><td colspan="8" style="border: none;"></td></tr>

        <!-- SECTION 2: JURNAL RINCIAN TRANSAKSI -->
        <tr>
          <td colspan="8" style="background-color: #0c1c3c; color: #ffffff; font-weight: bold; font-size: 11pt; text-align: center; border: 1px solid #94a3b8; text-transform: uppercase;">JURNAL RINCIAN PEMASUKAN & PENGELUARAN KAS KKN</td>
        </tr>
        <tr>
          <th style="width: 5%;">No Bukti</th>
          <th style="width: 12%;">Tanggal</th>
          <th style="width: 15%;">Jenis Transaksi</th>
          <th style="width: 30%;">Uraian Keperluan Transaksi</th>
          <th style="width: 8%;">Volume</th>
          <th style="width: 12%;">Harga Satuan</th>
          <th style="width: 12%;">Jumlah Nominal</th>
          <th style="width: 10%;">Penanggung Jawab</th>
        </tr>
        <tr>
          <td class="number-cell">B-01</td>
          <td class="number-cell">06/07/2026</td>
          <td style="color: #16a34a; font-weight: bold;">PEMASUKAN</td>
          <td>Penerimaan Iuran Anggota Kelompok KKN 9 Mahasiswa</td>
          <td class="number-cell">9 Org</td>
          <td class="currency-cell">150000</td>
          <td class="currency-cell">1350000</td>
          <td>Bendahara KKN</td>
        </tr>
        <tr>
          <td class="number-cell">B-02</td>
          <td class="number-cell">06/07/2026</td>
          <td style="color: #16a34a; font-weight: bold;">PEMASUKAN</td>
          <td>Penerimaan Dana Stimulan Operasional LPM UMY</td>
          <td class="number-cell">1 Paket</td>
          <td class="currency-cell">500000</td>
          <td class="currency-cell">500000</td>
          <td>Ketua Kelompok</td>
        </tr>
        <tr>
          <td class="number-cell">K-01</td>
          <td class="number-cell">07/07/2026</td>
          <td style="color: #dc2626; font-weight: bold;">PENGELUARAN</td>
          <td>Pembelian buku cerita Islami, Juz Amma, dan alat tulis TPA</td>
          <td class="number-cell">15 Pcs</td>
          <td class="currency-cell">350000</td>
          <td class="currency-cell">525000</td>
          <td>Divisi Keagamaan</td>
        </tr>
        <tr>
          <td class="number-cell">K-02</td>
          <td class="number-cell">08/07/2026</td>
          <td style="color: #dc2626; font-weight: bold;">PENGELUARAN</td>
          <td>Belanja bahan masakan gizi seimbang PMT Sehat (Posyandu)</td>
          <td class="number-cell">1 Paket</td>
          <td class="currency-cell">300000</td>
          <td class="currency-cell">300000</td>
          <td>Divisi Kesehatan</td>
        </tr>
        <tr>
          <td class="number-cell">K-03</td>
          <td class="number-cell">09/07/2026</td>
          <td style="color: #dc2626; font-weight: bold;">PENGELUARAN</td>
          <td>Sewa sound system dan LCD Proyektor untuk Sosialisasi UMKM</td>
          <td class="number-cell">1 Hari</td>
          <td class="currency-cell">150000</td>
          <td class="currency-cell">150000</td>
          <td>Divisi Humas</td>
        </tr>
        <tr>
          <td class="number-cell">K-04</td>
          <td class="number-cell">10/07/2026</td>
          <td style="color: #dc2626; font-weight: bold;">PENGELUARAN</td>
          <td>Pembelian spidol, kertas plano, laminasi materi bimbel dusun</td>
          <td class="number-cell">1 Paket</td>
          <td class="currency-cell">120000</td>
          <td class="currency-cell">120000</td>
          <td>Divisi Keilmuan</td>
        </tr>
        <tr class="total-row">
          <td colspan="6" style="text-align: right;">REKAP TOTAL (Rp)</td>
          <td class="currency-cell">1095000</td>
          <td>TERVERIFIKASI</td>
        </tr>
      </table>
    ${excelFooter}`;
  } else if (id === "final-report-en") {
    filename += ".doc";
    content = `${wordHeader}
      <div class="kop-surat">
        <div class="kop-logo-text">UNIVERSITAS MUHAMMADIYAH YOGYAKARTA</div>
        <div class="kop-logo-text" style="font-size: 11pt; color: #475569;">LEMBAGA PENGABDIAN MASYARAKAT (LPM)</div>
        <div class="kop-sub">Accredited Academic Community Service Report Outline (English Edition)</div>
      </div>

      <h1>FINAL KKN WORK REPORT</h1>
      <div class="subtitle">COMMUNITY SERVICE AND DEVELOPMENT IN [VILLAGE NAME, KECAMATAN, KABUPATEN]<br>UNIVERSITAS MUHAMMADIYAH YOGYAKARTA</div>

      <div style="margin-top: 40px; text-align: center;">
        <p class="no-indent font-bold" style="font-size: 13pt;">KKN GROUP NUMBER: GROUP 063 PERSYARIKATAN</p>
        <p class="no-indent" style="font-size: 11pt; margin-top: 8px;">ACADEMIC TERM: 2026/2027 COHORT</p>
        <p class="no-indent" style="font-size: 11pt; margin-top: 4px;">FIELD SUPERVISING ADVISOR: [FIELD ADVISOR NAME, TITLE]</p>
      </div>

      <div class="page-break"></div>

      <h2>APPROVAL SHEET FOR ACADEMIC PUBLICATION</h2>
      <p class="no-indent">This is to certify that the English-medium Community Service (KKN) Final Report of Group 063, titled "Community Empowerment, Islamic Value Infusion, and Digital Literacy Initiatives in Sendangtirto Village," has been thoroughly examined, verified, and officially approved for academic submission and future archiving under UMY Library Resources.</p>
      
      <p class="no-indent" style="margin-top: 15px;">Approved at: Yogyakarta<br>On Date: July 6th, 2026</p>

      <table class="signature-table">
        <tr>
          <td>
            Verified by,<br>
            <strong>Field Supervising Advisor</strong>
            <br><br><br><br>
            <u>( [FIELD ADVISOR NAME & TITLE] )</u><br>
            NIDN. [NIDN_ADVISOR]
          </td>
          <td>
            Yogyakarta, July 6th, 2026<br>
            <strong>KKN Group Chairman</strong>
            <br><br><br><br>
            <u>( [CHAIRMAN NAME] )</u><br>
            NIM. [CHAIRMAN_NIM]
          </td>
        </tr>
        <tr>
          <td colspan="2" style="text-align: center; padding-top: 30px;">
            Acknowledged & Approved by,<br>
            <strong>Director of LPPM UMY</strong>
            <br><br><br><br>
            <u>( [DIRECTOR OF LPPM UMY] )</u><br>
            NIP. [NIP_DIRECTOR]
          </td>
        </tr>
      </table>

      <div class="page-break"></div>

      <h2>ABSTRACT</h2>
      <p class="no-indent font-bold">Empowerment, Spiritual Integration, and MSME Digital Transformation Initiatives in [VILLAGE_NAME] Village</p>
      <p><em>This community service program aims to address local challenges related to spiritual development of schoolchildren, digital illiteracy in local MSMEs, and environmental issues. Implemented by KKN Group 063 of Universitas Muhammadiyah Yogyakarta over a 30-day period using the Participatory Action Research (PAR) methodology, several key interventions were accomplished. Firstly, a series of Quranic literacy workshops and the "Anak Sholeh" islamic festival revived youth participation in masjid-centered events. Secondly, digital marketing socialization and practical tutoring enabled five local micro-businesses (MSMEs) to transition to online e-commerce platforms. Finally, hygienic dietary demonstrations successfully raised maternal awareness regarding stunting mitigation. Ultimately, these integrated actions proved crucial in building community resilience, driving local economic development, and reinforcing Islamic humanitarian values.</em></p>
      <p class="no-indent"><strong>Keywords:</strong> Community Empowerment, Digital Literacy, Spiritual Infusion, KKN UMY, Yogyakarta.</p>

      <div class="page-break"></div>

      <h2>CHAPTER I: INTRODUCTION</h2>
      <h3>1.1 Background and Social Framework</h3>
      <p>Student community service, locally referred to as Kuliah Kerja Nyata (KKN) is an integral component of the Catur Dharma (Four Key Virtues) of Universitas Muhammadiyah Yogyakarta, bridging university-backed intellectual resources with practical grassroots challenges. KKN challenges higher education institutions to play a direct, measurable role in resolving regional socioeconomic disparities.</p>
      <p>For the July 2026 cycle, Group 063 was deployed to [VILLAGE NAME]. Initial baseline assessments indicated that while agricultural productivity is robust, the local younger generation faced significant gaps in post-pandemic religious education and digital marketing adaptation. This report details the strategic initiatives designed, funded, and completed during this period.</p>

      <h3>1.2 Core Problem Identification</h3>
      <p>The primary developmental bottlenecks identified were: (1) Declining Quranic instructional quality at local Islamic centers (TPA), (2) Limited online presence and platform adoption of local craft and cuisine micro-enterprises, and (3) Moderate risk of childhood stunting due to non-optimized maternal dietary patterns.</p>

      <h2>CHAPTER II: WORK PROGRAM ARCHITECTURE</h2>
      <h3>2.1 Spiritual and Keagamaan (Islamic Faith Integration)</h3>
      <p>Aligned with Muhammadiyah tenets of progressiveness and islamic integrity, the group revitalized three mosques by providing Quranic learning materials, establishing systematic tajweed curriculum charts, and coordinating spiritual storytelling clubs.</p>

      <h3>2.2 Keilmuan (Socio-Economic & Digital Literacy)</h3>
      <p>To accelerate local economic empowerment, the group conducted structured training sessions focusing on online marketplace registration, social media branding, and basic digital bookkeeping.</p>

      <h2>CHAPTER III: RESULTS AND DISCUSSION</h2>
      <p>Overall, 95% of planned programs were completed. The TPA programs witnessed a 40% increase in child attendance. More importantly, two local handicraft enterprises secured their first digital sales within two weeks of shop creation on popular marketplace platforms.</p>

      <h2>CHAPTER IV: CONCLUSION AND STRATEGIC RECOMMENDATIONS</h2>
      <p>The 30-day deployment of Group 063 achieved significant progress in bridging digital literacy gaps and boosting community cohesion. It is highly recommended that subsequent KKN cycles continue monitoring the digital sales performance of local MSMEs and provide advanced financial accounting support.</p>
    ${wordFooter}`;
  } else {
    // Custom/fallback uploaded template or fallback default text
    filename += ".doc";
    content = `${wordHeader}
      <h1>${title}</h1>
      <p class="no-indent">Template generated by KKN Workspace Academic Resource Centre.</p>
      <div style="border: 1px solid #cccccc; padding: 10px; margin-top: 20px;">
        <strong>Template Name:</strong> ${title}<br>
        <strong>Description:</strong> ${description || "No description provided."}<br>
        <strong>Created At:</strong> ${new Date().toLocaleDateString("id-ID")}<br>
      </div>
    ${wordFooter}`;
  }

  const blob = new Blob([content], { type: mimeType });
  return { blob, filename };
}
