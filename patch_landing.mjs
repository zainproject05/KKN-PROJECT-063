import fs from 'fs';
let code = fs.readFileSync('src/components/LandingPage.tsx', 'utf-8');

code = code.replace(
  'text-5xl sm:text-7xl md:text-8xl',
  'text-4xl sm:text-5xl md:text-7xl lg:text-8xl'
);
code = code.replace(
  'text-2xl sm:text-4xl md:text-5xl',
  'text-xl sm:text-2xl md:text-4xl lg:text-5xl'
);
code = code.replace(
  'text-[14px] sm:text-[16px] max-w-4xl',
  'text-[13px] sm:text-[15px] md:text-[16px] max-w-4xl px-2'
);
code = code.replace(
  'gap-5 mt-10',
  'gap-3 sm:gap-5 mt-8 sm:mt-10 flex-col sm:flex-row'
);

fs.writeFileSync('src/components/LandingPage.tsx', code);
