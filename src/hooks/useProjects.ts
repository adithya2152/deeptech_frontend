import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '../contexts/AuthContext'
import { projectsApi } from '../lib/api'
import { Project, ProjectStatus } from '../types/index'

export function useProjects(status?: ProjectStatus) {
  const { user, token } = useAuth()

  return useQuery({
    queryKey: ['projects', user?.id, status],
    queryFn: async () => {
      if (!user || !token) return []
      const response = await projectsApi.getAll(token, status)
      return (response.data || []) as Project[]
    },
    enabled: !!user && !!token,
  })
}

export function useMarketplaceProjects(buyerId?: string) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['marketplace-projects', buyerId || 'all'],
    queryFn: async () => {
      // Allow public access: pass token only if available
      const response = await projectsApi.getMarketplace(token || undefined, buyerId ? { buyerId } : undefined)
      return (response.data || []) as Project[]
    },
    // always enabled so guests can view marketplace
    enabled: true,
  })
}

// --- NEW HOOK ADDED HERE ---
export function useRecommendedProjects(expertId?: string, options?: { enabled?: boolean }) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['recommended-projects', expertId],
    queryFn: async () => {
      if (!token || !expertId) return []
      // This calls the new method we will add to api.ts below
      const response = await projectsApi.getRecommended(expertId, token)
      
      // Note: The Node controller returns { success: true, data: { results: [], totalResults: N } }
      // So we navigate to response.data.data.results
      // If your axios interceptor unwraps .data automatically, adjust to response.data.results
      return (response.data?.results || []) as Project[]
    },
    enabled: !!token && !!expertId && (options?.enabled ?? true),
  })
}
// ---------------------------

export function useProject(id: string) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!id) throw new Error('Invalid project id')
      // Allow public access: pass token only if available
      const response = await projectsApi.getById(id, token || undefined)
      return response.data as Project
    },
    enabled: !!id,
  })
}

export function useCreateProject() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (projectData: any) => {
      if (!token) throw new Error('Not authenticated')
      const response = await projectsApi.create(projectData, token)
      return response.data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['marketplace-projects'] })
    },
  })
}

export function useUpdateProject() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      if (!token) throw new Error('Not authenticated')
      const response = await projectsApi.update(id, data, token)
      return response.data as Project
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['marketplace-projects'] })
    },
  })
}

export function useUpdateProjectStatus() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjectStatus }) => {
      if (!token) throw new Error('Not authenticated')
      const response = await projectsApi.update(id, { status }, token)
      return response.data as Project
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['marketplace-projects'] })
    },
  })
}

export function useDeleteProject() {
  const { token } = useAuth()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error('Not authenticated')
      await projectsApi.delete(id, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['marketplace-projects'] })
    },
  })
}