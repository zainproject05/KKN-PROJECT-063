import fs from 'fs';
let content = fs.readFileSync('src/components/PremiumExportButton.tsx', 'utf-8');

const regex = /const blob = new Blob\(\['<html .*?\\n<body>\\n' \+ htmlContent \+ '\\n<\/body>\\n<\/html>'\]/s;

// We will just do a check: if htmlContent includes '<html', we replace '<html' with the word-specific html tag, and insert the head.
const replacement = `
    let finalHtml = htmlContent;
    if (htmlContent.includes('<html')) {
        finalHtml = htmlContent.replace('<html', '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"');
    } else {
        finalHtml = '<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">\\n<head>\\n<meta charset="utf-8">\\n<title>Export</title>\\n</head>\\n<body>\\n' + htmlContent + '\\n</body>\\n</html>';
    }
    const blob = new Blob(['\\ufeff' + finalHtml]`;

content = content.replace(regex, replacement);
fs.writeFileSync('src/components/PremiumExportButton.tsx', content);
console.log('Patched handleExportWord');
