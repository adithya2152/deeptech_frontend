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
  const { token } = useAuth()

  return useQuery({
    queryKey: ['experts', filters],
    queryFn: async () => {
      const response = await expertsApi.getAll(token, filters)

      return (response.data || []).map((expert: any) => ({
        ...expert,
        avg_daily_rate: Number(expert.avg_daily_rate) || 0,
        avg_fixed_rate: Number(expert.avg_fixed_rate) || 0,
        avg_sprint_rate: Number(expert.avg_sprint_rate) || 0,
        rating: Number(expert.rating) || 0,
      })) as Expert[]
    },
    initialData: [],
  })
}

// Get single expert by ID
export function useExpert(id: string) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['expert', id],
    queryFn: async () => {
      const response = await expertsApi.getById(id, token)
      const expert = response.data;
      
      return {
          ...expert,
          avg_daily_rate: Number(expert.avg_daily_rate) || 0,
          avg_fixed_rate: Number(expert.avg_fixed_rate) || 0,
          avg_sprint_rate: Number(expert.avg_sprint_rate) || 0,
          rating: Number(expert.rating) || 0,
      } as Expert
    },
    enabled: !!id,
  })
}

// Semantic search for experts
export function useSemanticExperts(query: string) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['experts', 'semantic', query],
    queryFn: async () => {
      console.log('🔍 Performing semantic search for experts:', query)

      try {
        const response = await expertsApi.semanticSearch(query, token)
        console.log('✅ Semantic search response:', response)

        // Transform semantic search results to match Expert interface
        const transformedResults = (response.results || []).map((result: any) => ({
          ...result,
          experienceSummary: result.experience_summary || result.bio,
          // New rate fields
          avg_daily_rate: Number(result.avg_daily_rate) || 0,
          avg_fixed_rate: Number(result.avg_fixed_rate) || 0,
          avg_sprint_rate: Number(result.avg_sprint_rate) || 0,
          
          vettingStatus: result.vetting_status,
          vettingLevel: result.vetting_level,
          reviewCount: result.review_count,
          totalHours: result.total_hours,
          rating: typeof result.rating === 'string' ? parseFloat(result.rating) : result.rating,
        }))

        console.log('✅ Final transformed results:', transformedResults)
        return transformedResults as Expert[]
      } catch (error) {
        console.error('❌ Semantic search error:', error)
        throw error
      }
    },
    enabled: !!query.trim(),
  })
}

// Project-based expert recommendations using semantic search
export function useProjectExpertRecommendations(projectData: {
  title: string;
  description: string;
  expected_outcome: string;
  domain: string;
}) {
  const { token } = useAuth()

  // Format the query as specified
  const query = `${projectData.title}. ${projectData.description}. Expected outcome: ${projectData.expected_outcome}. Domain: ${projectData.domain}. Looking for experts with relevant experience and expertise.`

  return useQuery({
    queryKey: ['experts', 'project-recommendations', projectData],
    queryFn: async () => {
      console.log('🔍 Finding expert recommendations for project:', projectData.title)

      try {
        const response = await expertsApi.semanticSearch(query, token)
        console.log('✅ Project expert recommendations response:', response)

        // Transform semantic search results to match Expert interface
        const transformedResults = (response.results || []).map((result: any) => ({
          ...result,
          experienceSummary: result.experience_summary || result.bio,
          avg_daily_rate: Number(result.avg_daily_rate) || 0,
          avg_fixed_rate: Number(result.avg_fixed_rate) || 0,
          avg_sprint_rate: Number(result.avg_sprint_rate) || 0,

          vettingStatus: result.vetting_status,
          vettingLevel: result.vetting_level,
          reviewCount: result.review_count,
          totalHours: result.total_hours,
          rating: typeof result.rating === 'string' ? parseFloat(result.rating) : result.rating,
        }))

        console.log('✅ Final project recommendations:', transformedResults)
        return transformedResults as Expert[]
      } catch (error) {
        console.error('❌ Project expert recommendations error:', error)
        throw error
      }
    },
    enabled: !!projectData.title && !!projectData.description && !!projectData.expected_outcome && !!projectData.domain,
  })
}