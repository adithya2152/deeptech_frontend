import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Project, ProjectStatus } from '@/types'

// Get all projects for current user
export function useProjects(status?: ProjectStatus) {
  const { user } = useAuth()

  return useQuery({
    queryKey: ['projects', user?.id, status],
    queryFn: async () => {
      if (!user) return []

      console.log('🔍 Fetching projects for client:', user.id)

      let query = supabase
        .from('projects')
        .select('*')
        .eq('client_id', user.id)
        .order('created_at', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) {
        console.error('❌ Error fetching projects:', error.message)
        throw error
      }

      console.log('✅ Projects loaded:', data?.length || 0)
      
      // Transform snake_case database fields to camelCase
      const projects = (data || []).map((project: any) => ({
        ...project,
        problemDescription: project.description,
        trlLevel: parseInt(project.trl_level) || 1,
        riskCategories: project.risk_categories || [],
        expectedOutcome: project.expected_outcome || '',
        createdAt: new Date(project.created_at),
        updatedAt: new Date(project.updated_at),
      }))
      
      return projects as Project[]
    },
    enabled: !!user,
  })
}

// Get single project by ID
export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('❌ Error fetching project:', error.message)
        throw error
      }

      console.log('✅ Project loaded:', data.title)
      
      // Transform snake_case to camelCase
      return {
        ...data,
        problemDescription: data.description,
        trlLevel: parseInt(data.trl_level) || 1,
        riskCategories: data.risk_categories || [],
        expectedOutcome: data.expected_outcome || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      } as Project
    },
    enabled: !!id,
  })
}

// Create new project
export function useCreateProject() {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async (projectData: Omit<Project, 'id' | 'buyer_id' | 'created_at' | 'updated_at' | 'status'>) => {
      if (!user) throw new Error('User not authenticated')

      // Database uses client_id instead of buyer_id
      const { data, error } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          client_id: user.id,
          status: 'draft',
        })
        .select()
        .single()

      if (error) {
        console.error('❌ Error creating project:', error.message)
        throw error
      }

      console.log('✅ Project created:', data.id)
      return data as Project
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// Update project
export function useUpdateProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Project> }) => {
      const { data, error } = await supabase
        .from('projects')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating project:', error.message)
        throw error
      }

      console.log('✅ Project updated:', data.id)
      return data as Project
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', data.id] })
    },
  })
}

// Delete project
export function useDeleteProject() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('❌ Error deleting project:', error.message)
        throw error
      }

      console.log('✅ Project deleted:', id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

// Update project status (Draft -> Active -> Completed)
export function useUpdateProjectStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ProjectStatus }) => {
      const { data, error } = await supabase
        .from('projects')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating project status:', error.message)
        throw error
      }

      console.log('✅ Project status updated:', status)
      return data as Project
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project', data.id] })
    },
  })
}