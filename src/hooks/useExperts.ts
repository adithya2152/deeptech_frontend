import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Domain, Expert } from '@/types'

interface ExpertFilters {
  domains?: Domain[]
  rateMin?: number
  rateMax?: number
  onlyVerified?: boolean
  searchQuery?: string
}

// Get filtered experts
export function useExperts(filters: ExpertFilters = {}) {
  return useQuery({
    queryKey: ['experts', filters],
    queryFn: async () => {
      console.log('🔍 Fetching experts with filters:', filters)

      let query = supabase
        .from('experts')
        .select('*')
        .eq('vetting_status', 'approved')

      // Apply domain filter (if experts table uses array column)
      if (filters.domains?.length) {
        query = query.contains('domains', filters.domains)
      }

      // Apply rate filter
      if (filters.rateMin !== undefined) {
        query = query.gte('hourly_rate_advisory', filters.rateMin)
      }
      if (filters.rateMax !== undefined) {
        query = query.lte('hourly_rate_advisory', filters.rateMax)
      }

      // Apply verified filter
      if (filters.onlyVerified) {
        query = query.eq('vetting_level', 'deep_tech_verified')
      }

      // Apply search (basic - can be enhanced with full-text search)
      if (filters.searchQuery) {
        query = query.ilike('experience_summary', `%${filters.searchQuery}%`)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching experts:', error.message)
        // Return empty array instead of throwing for better UX
        return [] as Expert[]
      }

      console.log('✅ Experts loaded:', data?.length || 0)
      return data as Expert[]
    },
  })
}

// Get single expert by ID
export function useExpert(id: string) {
  return useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Error fetching expert:', error.message)
        throw error
      }

      console.log('✅ Expert loaded:', data)
      return data as Expert
    },
    enabled: !!id,
  })
}
