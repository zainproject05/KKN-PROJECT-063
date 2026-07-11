import fs from 'fs';
let content = fs.readFileSync('src/components/kkn/Attendance.tsx', 'utf-8');

if (!content.includes('PremiumExportButton')) {
  // Add import
  content = content.replace(
    'import { SessionCountdown } from "./SessionCountdown";',
    'import { SessionCountdown } from "./SessionCountdown";\nimport { PremiumExportButton } from "../PremiumExportButton";'
  );
  
  // Replace handlePrintPDFReport button with PremiumExportButton
  // But wait, PremiumExportButton needs data, columns, filename, title, and HTML for PDF
  // Actually PremiumExportButton requires `contentHtml`? Let's check PremiumExportButton props again.
}
