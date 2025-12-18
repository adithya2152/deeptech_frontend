import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { mockContracts, mockExperts, mockProjects } from '@/data/mockData';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ContractCard } from '@/components/contracts/ContractCard';
import { useNavigate } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { Plus, Briefcase, FileText, Clock, DollarSign, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isBuyer = user?.role === 'buyer';
  const isExpert = user?.role === 'expert';

  const { data: allProjects, isLoading } = useProjects();
  const userProjects = allProjects?.slice(0, 2) || [];
  const userContracts = mockContracts;

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold">Welcome, {user?.name?.split(' ')[0]}</h1>
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
                <p className="text-2xl font-bold">{isBuyer ? (allProjects?.length || 0) : userContracts.length}</p>
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
                isLoading ? (
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
                userContracts.map(contract => (
                  <ContractCard 
                    key={contract.id} 
                    contract={contract}
                    projectTitle={mockProjects.find(p => p.id === contract.projectId)?.title}
                  />
                ))
              )}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="font-display text-xl font-semibold mb-4">Recent Activity</h2>
            <Card>
              <CardContent className="p-4 space-y-4">
                {[
                  { text: 'Dr. Sarah Chen logged 5 hours', time: '2 hours ago', type: 'log' },
                  { text: 'Contract with Marcus Schmidt started', time: '1 day ago', type: 'contract' },
                  { text: 'Invoice #INV-002 generated', time: '2 days ago', type: 'invoice' },
                  { text: 'New message from Dr. Priya Patel', time: '3 days ago', type: 'message' },
                ].map((activity, i) => (
                  <div key={i} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
                    <div className="h-2 w-2 rounded-full bg-primary mt-2" />
                    <div className="flex-1">
                      <p className="text-sm">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
