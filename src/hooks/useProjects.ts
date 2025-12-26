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

export function useMarketplaceProjects() {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['marketplace-projects'],
    queryFn: async () => {
      if (!token) return []
      const response = await projectsApi.getMarketplace(token)
      return (response.data || []) as Project[]
    },
    enabled: !!token,
  })
}

export function useProject(id: string) {
  const { token } = useAuth()

  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!token || !id) throw new Error('Not authenticated')
      const response = await projectsApi.getById(id, token)
      return response.data as Project
    },
    enabled: !!id && !!token,
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