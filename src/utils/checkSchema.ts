import { supabase } from '@/lib/supabase'

export async function checkProfileSchema() {
  console.log('🔍 Checking profiles table schema...')
  
  // Try to get any existing profile to see the columns
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
  
  console.log('📋 Profiles table structure:', data, error)
  
  // Check if domains column exists by trying to query it specifically
  const { data: domainsCheck, error: domainsError } = await supabase
    .from('profiles')
    .select('user_id, domains')
    .limit(1)
  
  if (domainsError) {
    console.error('❌ Domains column missing or error:', domainsError.message)
    console.log('⚠️ Please run this SQL in Supabase SQL Editor:')
    console.log(`
      -- Add domains column to profiles table
      ALTER TABLE profiles 
      ADD COLUMN IF NOT EXISTS domains text[];
      
      -- Add comment
      COMMENT ON COLUMN profiles.domains IS 'Array of expertise domains for expert users';
    `)
  } else {
    console.log('✅ Domains column exists:', domainsCheck)
  }
  
  return { data, error, domainsCheck, domainsError }
}
