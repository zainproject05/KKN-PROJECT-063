import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.log("No Supabase configuration in environment variables!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  console.log("Attempting to query pg_catalog or information_schema...");
  
  // 1. Try information_schema.columns (sometimes exposed or has view)
  const { data: cols, error: err1 } = await supabase
    .from("columns")
    .select("table_name, column_name")
    .eq("table_schema", "public");
    
  if (err1) {
    console.log("Querying 'columns' directly failed:", err1.message);
  } else {
    console.log("Querying 'columns' directly SUCCEEDED! Columns:");
    console.log(cols);
    return;
  }

  // 2. Try querying pg_attribute or pg_class
  const { data: attrs, error: err2 } = await supabase
    .from("pg_attribute")
    .select("*")
    .limit(5);
    
  if (err2) {
    console.log("Querying 'pg_attribute' failed:", err2.message);
  } else {
    console.log("Querying 'pg_attribute' SUCCEEDED!");
    console.log(attrs);
    return;
  }
}

main();
