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

        // Transform semantic search results to match Expert interface and UI expectations
        const transformedResults = (response.results || []).map((result: any) => {
          // Normalize names
          const name = result.name || result.full_name || '';
          const [first_name, ...rest] = (result.first_name ? [result.first_name, result.last_name || ''] : (name ? name.split(' ') : ['', '']));
          const last_name = result.last_name || rest.join(' ') || '';

          // Normalize arrays
          const domains = Array.isArray(result.domains) ? result.domains : (result.domain ? [result.domain] : (result.tags && Array.isArray(result.tags) ? result.tags : []));
          const skills = Array.isArray(result.skills) ? result.skills : (result.skill_set ? result.skill_set : []);

          return {
            // preserve raw fields
            ...result,

            // IDs and routing fields
            expert_profile_id: result.expert_profile_id || result.profile_id || result.id || result.expert_profile || null,
            profile_id: result.profile_id || result.expert_profile_id || result.id || null,
            id: result.id || result.user_id || null,

            // User display fields
            first_name: first_name || '',
            last_name: last_name || '',
            name: result.name || `${first_name || ''} ${last_name || ''}`.trim(),
            avatar_url: result.avatar_url || result.avatar || (result.user && result.user.avatar_url) || result.picture || result.profile_picture || null,

            // Experience and skills
            experience_summary: result.experience_summary || result.experienceSummary || result.bio || result.summary || '',
            domains: domains,
            skills: skills,

            // Rates and numeric fields
            avg_daily_rate: Number(result.avg_daily_rate || result.rate || 0) || 0,
            avg_fixed_rate: Number(result.avg_fixed_rate) || 0,
            avg_sprint_rate: Number(result.avg_sprint_rate) || 0,

            // Vetting / status
            expert_status: result.expert_status || result.status || result.expertStatus || null,
            vetting_level: result.vetting_level || result.vettingLevel || result.vetting_status || null,

            // Metrics
            review_count: Number(result.review_count || result.reviewCount || 0) || 0,
            total_hours: Number(result.total_hours || result.totalHours || 0) || 0,
            rating: typeof result.rating === 'string' ? parseFloat(result.rating) : (Number(result.rating) || 0),
          } as any
        })

        // For any result missing avatar_url, fetch full expert profile to get avatar
        const missingAvatarIds = transformedResults
          .filter((r: any) => !r.avatar_url && (r.expert_profile_id || r.id))
          .map((r: any) => r.expert_profile_id || r.id)
          .filter(Boolean);

        if (missingAvatarIds.length > 0) {
          try {
            const profileFetches = missingAvatarIds.map((id: string) =>
              expertsApi.getById(id, token).then((res) => ({ id, data: res.data }))
            );

            const profiles = await Promise.all(profileFetches);

            const profileMap: Record<string, any> = {};
            profiles.forEach((p: any) => {
              if (p && p.id) profileMap[p.id] = p.data;
            });

            // Merge avatar_url into results
            transformedResults.forEach((r: any) => {
              const rid = r.expert_profile_id || r.id;
              const profile = profileMap[rid];
              if (!r.avatar_url && profile) {
                r.avatar_url = profile.avatar_url || profile.user?.avatar_url || profile.profile?.avatar_url || null;
              }
            });
          } catch (err) {
            console.warn('Failed to fetch missing avatars for semantic results', err);
          }
        }

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
  const query = `${projectData.description}. Expected outcome: ${projectData.expected_outcome}. Domain: ${projectData.domain}. Looking for experts with relevant experience and expertise.`

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