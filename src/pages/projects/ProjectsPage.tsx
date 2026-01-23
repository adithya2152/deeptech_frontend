import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { ProjectStatus } from '@/types';
import { Plus, Search, Loader2, FolderOpen } from 'lucide-react';

export default function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | ProjectStatus>('all');

  useEffect(() => {
    if (user?.role === 'expert') {
      navigate('/marketplace');
    }
  }, [user, navigate]);

  const { data: allProjects = [], isLoading: l1 } = useProjects();
  const { data: draftProjects = [], isLoading: l2 } = useProjects('draft');
  const { data: openProjects = [], isLoading: l3 } = useProjects('open');
  const { data: activeProjects = [], isLoading: l4 } = useProjects('active');
  const { data: completedProjects = [], isLoading: l5 } = useProjects('completed');
  const { data: archivedProjects = [], isLoading: l6 } = useProjects('archived');

  const isLoading = l1 || l2 || l3 || l4 || l5 || l6;

  const tabKeys = ['all', 'draft', 'open', 'active', 'completed', 'archived'] as const;

  const getProjectsForTab = () => {
    switch (activeTab) {
      case 'draft': return draftProjects;
      case 'open': return openProjects;
      case 'active': return activeProjects;
      case 'completed': return completedProjects;
      case 'archived': return archivedProjects;
      default: return allProjects;
    }
  };

  const currentList = getProjectsForTab();

  const filteredProjects = currentList.filter(project =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const EmptyState = ({ status }: { status: string }) => (
    <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-muted-foreground/20 rounded-xl">
      <div className="bg-muted/50 p-4 rounded-full mb-4">
        <FolderOpen className="h-8 w-8 text-muted-foreground/40" />
      </div>
      <h3 className="text-base font-medium text-foreground mb-1">{'No projects found'}</h3>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {status === 'all'
          ? 'You haven\'t posted any projects yet. Create a new job posting to find the perfect expert.'
          : `No projects found for status: ${status}`
        }
      </p>
      {status === 'all' && (
        <Button onClick={() => navigate('/projects/new')} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {'Post a New Job'}
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">{'My Projects'}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {'Manage your project postings, view proposals, and track active contracts.'}
            </p>
          </div>
          <Button onClick={() => navigate('/projects/new')} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            {'Post a Project'}
          </Button>
        </div>

        <div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <TabsList className="bg-transparent h-auto p-0 gap-6 sm:w-auto overflow-x-auto justify-start border-b border-border rounded-none w-full">
                {tabKeys.map((tab) => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="rounded-none border-b-2 border-transparent px-1 py-3 text-sm font-medium text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-foreground transition-colors capitalize"
                  >
                    {tab}
                    <span className="ml-2 text-xs bg-muted text-muted-foreground px-1.5 py-0.5 rounded-full">
                      {tab === 'all' ? allProjects.length :
                        tab === 'draft' ? draftProjects.length :
                          tab === 'open' ? openProjects.length :
                            tab === 'active' ? activeProjects.length :
                              tab === 'completed' ? completedProjects.length :
                                archivedProjects.length}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="relative w-full sm:w-64 shrink-0">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={'Search projects...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border focus-visible:ring-primary/20 focus-visible:border-primary"
                />
              </div>
            </div>

            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-24">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredProjects.length === 0 ? (
                searchQuery ? (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">{'No projects match your search.'}</p>
                    <Button variant="link" onClick={() => setSearchQuery('')} className="text-primary">{'Clear search'}</Button>
                  </div>
                ) : (
                  <EmptyState status={activeTab} />
                )
              ) : (
                <div className="grid gap-8 md:grid-cols-2">
                  {filteredProjects.map((project) => (
                    <ProjectCard key={project.id} project={project} compact={false} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </Layout>
  );
}