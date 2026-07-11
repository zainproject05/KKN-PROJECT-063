const fs = require('fs');
let code = fs.readFileSync('src/components/LoginPage.tsx', 'utf8');
code = code.replace(/await supabase.auth.signInWithPassword\(\{ email: username\.trim\(\), password \} \s*username\.trim\(\),\s*password\s*\);/, "await supabase.auth.signInWithPassword({ email: username.trim(), password });");
fs.writeFileSync('src/components/LoginPage.tsx', code);
