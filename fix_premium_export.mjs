import fs from 'fs';
let content = fs.readFileSync('src/components/PremiumExportButton.tsx', 'utf-8');

content = content.replace(
  'export function PremiumExportButton({\n  data,\n  columns,\n  filename,\n  title,\n  id = "premium-export-btn"\n}: PremiumExportButtonProps) {',
  'export function PremiumExportButton({\n  data,\n  columns,\n  filename,\n  title,\n  customHtmlTemplate,\n  id = "premium-export-btn"\n}: PremiumExportButtonProps) {'
);

fs.writeFileSync('src/components/PremiumExportButton.tsx', content);
console.log('Fixed customHtmlTemplate prop');
