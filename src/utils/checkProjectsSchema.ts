import { supabase } from '@/lib/supabase'

export async function checkProjectsSchema() {
  // Try inserting with empty object to see what columns are required
  const { error } = await supabase
    .from('projects')
    .insert({})
    .select()
  
  if (error) {
    console.log('📋 Schema error:', error.message)
    console.log('📋 Error details:', error.details)
    console.log('📋 Error hint:', error.hint)
  }
  
  // Also try selecting with limit 0 to see response structure
  const { data: emptyData, error: selectError } = await supabase
    .from('projects')
    .select('*')
    .limit(0)
  
  console.log('📊 Empty select result:', emptyData, selectError)
  
  return { error }
}
