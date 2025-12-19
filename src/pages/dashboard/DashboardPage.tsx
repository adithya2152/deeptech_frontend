import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockContracts, mockProjects } from '@/data/mockData';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ContractCard } from '@/components/contracts/ContractCard';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { useExperts } from '@/hooks/useExperts';
import { Plus, Briefcase, FileText, Clock, DollarSign, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Explicitly check role (no default fallback)
  const isBuyer = user?.role === 'buyer';
  const isExpert = user?.role === 'expert';

  console.log('👤 User role:', user?.role, '| isBuyer:', isBuyer, '| isExpert:', isExpert);

  const { data: allProjects, isLoading: projectsLoading } = useProjects();
  const { data: experts, isLoading: expertsLoading } = useExperts();
  const userProjects = allProjects?.slice(0, 2) || [];
  const userContracts = mockContracts; // TODO: Replace with useContracts when contracts table is ready

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-display text-3xl font-bold">Welcome, {user?.name?.split(' ')[0]}</h1>
              <Badge variant={isBuyer ? 'default' : 'secondary'} className="text-xs">
                {isBuyer ? '👔 Buyer Account' : '🎓 Expert Account'}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-1">Here's what's happening with your {isBuyer ? 'projects' : 'contracts'}</p>
          </div>
          {isBuyer && (
            <Button onClick={() => navigate('/projects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{isBuyer ? (allProjects?.length || 0) : 0}</p>
                <p className="text-sm text-muted-foreground">{isBuyer ? 'Active Projects' : 'Active Contracts'}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">—</p>
                <p className="text-sm text-muted-foreground">Hours This Month</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">—</p>
                <p className="text-sm text-muted-foreground">{isBuyer ? 'Total Spent' : 'Total Earned'}</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-muted-foreground">—</p>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Projects/Contracts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold">{isBuyer ? 'Your Projects' : 'Active Contracts'}</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate(isBuyer ? '/projects' : '/contracts')}>
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {isBuyer ? (
                projectsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : userProjects.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-8">
                      <p className="text-muted-foreground mb-4">No projects yet</p>
                      <Button onClick={() => navigate('/projects/new')}>
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Project
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  userProjects.map(project => <ProjectCard key={project.id} project={project} />)
                )
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Briefcase className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg font-medium mb-2">Contracts Coming Soon</p>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      Contract management features will be available once the backend is ready.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="font-display text-xl font-semibold mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="p-4 space-y-4">
                {projectsLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                ) : allProjects && allProjects.length > 0 ? (
                  allProjects.slice(0, 4).map((project) => {
                    const timeAgo = new Date(project.createdAt).toLocaleDateString();
                    const statusText = project.status === 'draft' ? 'created' : 
                                      project.status === 'active' ? 'activated' : 
                                      project.status === 'completed' ? 'completed' : 'archived';
                    return (
                      <div key={project.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                        <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                        <div className="flex-1">
                          <p className="text-sm">Project "{project.title}" {statusText}</p>
                          <p className="text-xs text-muted-foreground">{timeAgo}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
