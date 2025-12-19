import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import { projectsApi } from '@/lib/api'
import { Project, ProjectStatus } from '@/types'

// Get all projects for current user
export function useProjects(status?: ProjectStatus) {
  const { user, session } = useAuth()
  const token = session?.access_token

  return useQuery({
    queryKey: ['projects', user?.id, status],
    queryFn: async () => {
      if (!user || !token) return []

      console.log('🔍 Fetching projects via API for user:', user.id)

      const response = await projectsApi.getAll(token, status)
      
      console.log('✅ Projects loaded from API:', response.data?.length || 0)
      
      return (response.data || []) as Project[]
    },
    enabled: !!user && !!token,
    initialData: [],
  })
}

// Get single project by ID
export function useProject(id: string) {
  const { session } = useAuth()
  const token = session?.access_token

  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      if (!token) throw new Error('Not authenticated')

      console.log('🔍 Fetching project via API:', id)

      const response = await projectsApi.getById(id, token)
      
      console.log('✅ Project loaded from API:', response.data.id)
      
      return response.data as Project
    },
    enabled: !!id && !!token,
  })
}

// Create new project
export function useCreateProject() {
  const { session } = useAuth()
  const token = session?.access_token
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (projectData: Omit<Project, 'id' | 'clientId' | 'createdAt' | 'updatedAt'>) => {
      if (!token) throw new Error('Not authenticated')

      console.log('➕ Creating project via API')

      const response = await projectsApi.create(projectData, token)
      
      console.log('✅ Project created via API:', response.data.id)
      
      return response.data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// Update project
export function useUpdateProject() {
  const { session } = useAuth()
  const token = session?.access_token
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Project> }) => {
      if (!token) throw new Error('Not authenticated')

      console.log('🔄 Updating project via API:', id)

      const response = await projectsApi.update(id, data, token)
      
      console.log('✅ Project updated via API')
      
      return response.data as Project
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
    },
  })
}

// Delete project
export function useDeleteProject() {
  const { session } = useAuth()
  const token = session?.access_token
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) throw new Error('Not authenticated')

      console.log('🗑️ Deleting project via API:', id)

      await projectsApi.delete(id, token)
      
      console.log('✅ Project deleted via API')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// Update project status (Draft -> Active -> Completed)
export function useUpdateProjectStatus() {
  const { session } = useAuth()
  const token = session?.access_token
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjectStatus }) => {
      if (!token) throw new Error('Not authenticated')

      console.log('🔄 Updating project status via API:', id, status)

      const response = await projectsApi.update(id, { status }, token)
      
      console.log('✅ Project status updated via API')
      
      return response.data as Project
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', variables.id] })
    },
  })
}