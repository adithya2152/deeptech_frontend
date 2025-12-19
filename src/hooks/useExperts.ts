import { useQuery } from '@tanstack/react-query'
import { expertsApi } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
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
  const { session } = useAuth()
  const token = session?.access_token

  return useQuery({
    queryKey: ['experts', filters],
    queryFn: async () => {
      console.log('🔍 Fetching experts via API with filters:', filters)

      const response = await expertsApi.getAll(token, filters)

      console.log('✅ Experts loaded from API:', response.data?.length || 0)
      return (response.data || []) as Expert[]
    },
    initialData: [],
  })
}

// Get single expert by ID
export function useExpert(id: string) {
  const { session } = useAuth()
  const token = session?.access_token

  return useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      console.log('🔍 Fetching expert via API:', id)

      const response = await expertsApi.getById(id, token)

      console.log('✅ Expert loaded from API:', response.data)
      return response.data as Expert
    },
    enabled: !!id,
  })
}
