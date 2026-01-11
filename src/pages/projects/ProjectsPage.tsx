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
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white border border-zinc-200 rounded-2xl mx-auto max-w-2xl">
      <div className="h-24 w-24 bg-zinc-50 rounded-full flex items-center justify-center mb-6">
        <FolderOpen className="h-10 w-10 text-zinc-300" />
      </div>
      <h3 className="text-xl font-bold text-zinc-900 mb-3">No {status === 'all' ? '' : status.replace('_', ' ')} projects found</h3>
      <p className="text-base text-zinc-500 max-w-md mb-8 leading-relaxed">
        {status === 'all'
          ? "You haven't posted any projects yet. Create a new job posting to find the perfect expert for your needs."
          : `There are no projects in the "${status}" status at the moment.`
        }
      </p>
      {status === 'all' && (
        <Button onClick={() => navigate('/projects/new')} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-6 rounded-full text-base shadow-sm">
          <Plus className="h-5 w-5 mr-2" />
          Post a New Job
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-white">
        <div className="border-b border-zinc-200 bg-white">
           <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">My Jobs</h1>
                  <p className="text-zinc-500 mt-2 text-sm">
                     Manage your job postings, view proposals, and track active contracts.
                  </p>
                </div>
                <Button onClick={() => navigate('/projects/new')} className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-full h-10 px-6 shadow-sm">
                  <Plus className="h-5 w-5 mr-2" />
                  Post a Job
                </Button>
              </div>
           </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
               <TabsList className="bg-transparent h-auto p-0 gap-6 sm:w-auto overflow-x-auto justify-start border-b border-zinc-200 rounded-none w-full">
                  {['all', 'draft', 'open', 'active', 'completed', 'archived'].map((tab) => (
                    <TabsTrigger 
                      key={tab} 
                      value={tab}
                      className="rounded-none border-b-2 border-transparent px-1 py-3 text-sm font-medium text-zinc-500 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none hover:text-primary transition-colors capitalize"
                    >
                      {tab}
                      <span className="ml-2 text-xs bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-full">
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
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                 <Input
                   placeholder="Search jobs..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-9 bg-white border-zinc-200 rounded-full focus-visible:ring-primary/20 focus-visible:border-primary"
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
                     <p className="text-zinc-500">No projects match your search.</p>
                    <Button variant="link" onClick={() => setSearchQuery('')} className="text-primary">Clear search</Button>
                   </div>
                 ) : (
                   <EmptyState status={activeTab} />
                 )
               ) : (
                 <div className="grid gap-4">
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