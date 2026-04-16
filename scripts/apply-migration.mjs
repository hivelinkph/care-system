// Run: node scripts/apply-migration.mjs
// Applies the providers/kpis/ratings migration to the Supabase cloud project
// using the Management API. Requires SUPABASE_ACCESS_TOKEN env var OR
// will prompt you to paste the SQL into the SQL Editor manually.

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const SUPABASE_URL = 'https://gqtxmivxyuxoocrznxnj.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdxdHhtaXZ4eXV4b29jcnpueG5qIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDI1Nzk5NCwiZXhwIjoyMDg5ODMzOTk0fQ.saCz9ck3Ps38CUMpUOraFU83GQNmDMgiktzX5-ou8_4';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

// Check if tables already exist
async function tableExists(name) {
  const { error } = await supabase.from(name).select('id').limit(1);
  return !error || !error.message.includes('does not exist');
}

async function main() {
  console.log('Checking existing tables...');

  const providersExists = await tableExists('providers');
  const kpisExists = await tableExists('kpis');

  if (providersExists && kpisExists) {
    console.log('✓ Tables already exist. Migration not needed.');
    return;
  }

  const sql = readFileSync(
    join(__dirname, '../supabase/migrations/20260416000000_providers_kpis_ratings.sql'),
    'utf-8'
  );

  console.log('\n──────────────────────────────────────────────────');
  console.log('Tables not found. Please apply the migration manually:');
  console.log('──────────────────────────────────────────────────');
  console.log('1. Go to: https://supabase.com/dashboard/project/gqtxmivxyuxoocrznxnj/sql');
  console.log('2. Paste and run the SQL from:');
  console.log('   supabase/migrations/20260416000000_providers_kpis_ratings.sql');
  console.log('──────────────────────────────────────────────────\n');
  console.log('SQL to run:\n');
  console.log(sql);
}

main().catch(console.error);
