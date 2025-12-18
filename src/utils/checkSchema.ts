import { supabase } from '@/lib/supabase'

export async function checkProfileSchema() {
  // Try to get any existing profile to see the columns
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)
  
  console.log('📋 Profiles table structure:', data, error)
  
  // Also check if we can describe the table
  const { data: schema } = await supabase
    .from('profiles')
    .select()
    .limit(0)
  
  console.log('📊 Schema response:', schema)
  
  return { data, error }
}
