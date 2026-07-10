import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  const { data, error } = await supabase.from('attendance_sessions').select('*').limit(1);
  if (data) {
    if (data.length > 0) console.log(Object.keys(data[0]));
    else console.log("Empty, but success");
  } else console.error(error);
}
run();
