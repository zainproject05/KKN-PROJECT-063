import fs from 'fs';
let content = fs.readFileSync('src/components/PremiumExportButton.tsx', 'utf-8');

// We will add custom logic for `isAttendance = filename.includes("presensi")`
// But wait, the metadata for Attendance (like session name, time) needs to be passed.
// Instead of hardcoding in PremiumExportButton, how about we add a `customHtmlTemplate` prop?

content = content.replace(
  'interface PremiumExportButtonProps {',
  'interface PremiumExportButtonProps {\n  customHtmlTemplate?: string;'
);

content = content.replace(
  'const isFinance = filename === "keuangan_kkn";',
  'const isFinance = filename === "keuangan_kkn";\n    if (customHtmlTemplate) {\n      return customHtmlTemplate;\n    }'
);

content = content.replace(
  '    const printWindow = window.open("", "_blank");\n    if (!printWindow) return;\n    const htmlContent = generatePremiumHTML(false);\n    printWindow.document.write(htmlContent);',
  '    const htmlContent = generatePremiumHTML(false);\n    const printWindow = window.open("", "_blank");\n    if (!printWindow) return;\n    printWindow.document.write(htmlContent);'
);

content = content.replace(
  '    const htmlContent = generatePremiumHTML(true);\n    const blob = new Blob([\'\\ufeff\' + htmlContent]',
  '    const htmlContent = generatePremiumHTML(true);\n    const blob = new Blob([\'<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">\\n<head>\\n<meta charset="utf-8">\\n<title>Export</title>\\n</head>\\n<body>\\n\' + htmlContent + \'\\n</body>\\n</html>\']'
);

fs.writeFileSync('src/components/PremiumExportButton.tsx', content);
