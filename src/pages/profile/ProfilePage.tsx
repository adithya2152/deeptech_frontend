import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { ProjectCard } from '@/components/projects/ProjectCard'
import { useProjects } from '@/hooks/useProjects'
import { useAuth } from '@/contexts/AuthContext'
import { ProjectStatus } from '@/types'
import { Plus, Search, Loader2, FolderOpen, Briefcase } from 'lucide-react'

export default function ProjectsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | ProjectStatus>('all')

  useEffect(() => {
    if (user?.role === 'expert') {
      navigate('/marketplace');
    }
  }, [user, navigate]);

  const { data: projects, isLoading } = useProjects(activeTab === 'all' ? undefined : activeTab);

  const filteredProjects = (projects || []).filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.domain.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const EmptyState = ({ status }: { status: string }) => (
    <Card className="border-dashed border-zinc-200 bg-zinc-50/50">
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="h-16 w-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-zinc-100">
            <FolderOpen className="h-8 w-8 text-zinc-300" />
        </div>
        <h3 className="text-lg font-semibold mb-2 text-zinc-900">No {status === 'all' ? '' : status} projects found</h3>
        <p className="text-sm text-zinc-500 mb-6 text-center max-w-sm">
          {status === 'all'
            ? 'Get started by creating your first deep-tech project specification.'
            : `You don't have any projects in the "${status}" stage yet.`
          }
        </p>
        {(status === 'all' || status === 'draft') && (
          <Button onClick={() => navigate('/projects/new')} className="bg-zinc-900 text-white hover:bg-zinc-800">
            <Plus className="h-4 w-4 mr-2" />
            Create New Project
          </Button>
        )}
      </CardContent>
    </Card>
  )

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-zinc-900">My Projects</h1>
            <p className="text-zinc-500 mt-1">
              Manage and track your R&D initiatives
            </p>
          </div>
          <Button onClick={() => navigate('/projects/new')} className="bg-zinc-900 text-white hover:bg-zinc-800 shadow-md transition-all hover:translate-y-[-1px]">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Search projects by title or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-white"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-6">
          <TabsList className="bg-zinc-100/80 p-1 h-11 w-full sm:w-auto overflow-x-auto justify-start">
            <TabsTrigger value="all" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">All</TabsTrigger>
            <TabsTrigger value="draft" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Drafts</TabsTrigger>
            <TabsTrigger value="open" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Open</TabsTrigger>
            <TabsTrigger value="active" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Active</TabsTrigger>
            <TabsTrigger value="completed" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Completed</TabsTrigger>
            <TabsTrigger value="archived" className="data-[state=active]:bg-white data-[state=active]:shadow-sm px-4">Archived</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
              </div>
            ) : filteredProjects.length === 0 ? (
              searchQuery ? (
                <Card className="border-dashed bg-zinc-50/50">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <Search className="h-12 w-12 text-zinc-300 mb-4" />
                    <h3 className="text-lg font-semibold mb-2 text-zinc-900">No results found</h3>
                    <p className="text-sm text-zinc-500">
                        We couldn't find any projects matching "{searchQuery}"
                    </p>
                    <Button variant="link" onClick={() => setSearchQuery('')} className="mt-2 text-blue-600">
                        Clear search
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <EmptyState status={activeTab === 'all' ? 'all' : activeTab} />
              )
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}