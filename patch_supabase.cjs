const fs = require('fs');
let code = fs.readFileSync('src/lib/supabaseClient.ts', 'utf8');

code = code.replace(
  "export const supabase = isSupabaseConfigured",
  "export const supabase: any = isSupabaseConfigured"
);

fs.writeFileSync('src/lib/supabaseClient.ts', code);
