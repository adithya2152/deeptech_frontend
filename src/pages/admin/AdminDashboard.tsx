import { useAdminStats, useAdminDisputes, useAdminProjects, useAdminContracts, useAdminReports } from '@/hooks/useAdmin';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle, CheckCircle2, DollarSign, Briefcase, FileSignature, Inbox, ShieldAlert, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: stats, isLoading: loadingStats } = useAdminStats();
  const { data: disputes } = useAdminDisputes();
  const { data: projects } = useAdminProjects();
  const { data: contracts } = useAdminContracts();
  const { data: reports } = useAdminReports();
  const navigate = useNavigate();

  if (loadingStats) {
    return (
      <AdminLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
        </div>
      </AdminLayout>
    );
  }

  // Filter for pending/active items for the dashboard view
  const activeDisputes = disputes?.filter((d: any) => d.status === 'open' || d.status === 'in_review') || [];
  const pendingProjects = projects?.filter((p: any) => p.status === 'pending') || [];
  const pendingReports = reports?.filter((r: any) => r.status === 'pending') || [];
  
  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Admin Governance</h1>
            <p className="text-zinc-500 mt-2">Platform oversight, financial tracking, and dispute resolution.</p>
          </div>
          <div className="text-sm text-zinc-400">
            Last updated: {format(new Date(), 'MMM d, h:mm a')}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">${stats?.totalRevenue?.toLocaleString() || '0'}</div>
              <p className="text-xs text-zinc-500 mt-1">Platform Total</p>
            </CardContent>
          </Card>
          
          <Card className="border-zinc-200 shadow-sm cursor-pointer hover:border-blue-300 transition-colors" onClick={() => navigate('/admin/projects')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Pending Projects</CardTitle>
              <Briefcase className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">{pendingProjects.length}</div>
              <p className="text-xs text-zinc-500 mt-1">Require Moderation</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm cursor-pointer hover:border-red-300 transition-colors" onClick={() => navigate('/admin/disputes')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Open Disputes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{activeDisputes.length}</div>
              <p className="text-xs text-zinc-500 mt-1">Action Required</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm cursor-pointer hover:border-amber-300 transition-colors" onClick={() => navigate('/admin/reports')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">New Reports</CardTitle>
              <ShieldAlert className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{pendingReports.length}</div>
              <p className="text-xs text-zinc-500 mt-1">Safety Review</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="disputes" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="bg-zinc-100 p-1">
              <TabsTrigger value="disputes">Priority Disputes</TabsTrigger>
              <TabsTrigger value="projects">Project Approvals</TabsTrigger>
              <TabsTrigger value="reports">Recent Reports</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="disputes" className="space-y-4">
            {activeDisputes.length === 0 ? (
                <EmptyState 
                    icon={CheckCircle2} 
                    title="No Open Disputes" 
                    description="All clear! There are no disputes requiring resolution at this time." 
                />
            ) : (
                <>
                {activeDisputes.slice(0, 3).map((dispute: any) => (
                <Card key={dispute.id} className="border-l-4 border-l-red-500 shadow-sm hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => navigate('/admin/disputes')}>
                    <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                        <div>
                        <CardTitle className="text-base font-bold text-zinc-900">{dispute.reason}</CardTitle>
                        <CardDescription className="font-mono text-xs mt-1">Contract ID: {dispute.contract_id?.slice(0,8)}</CardDescription>
                        </div>
                        <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-100 border-red-200">
                            {dispute.status.replace('_', ' ')}
                        </Badge>
                    </div>
                    </CardHeader>
                    <CardContent>
                    <p className="text-sm text-zinc-600 line-clamp-2">
                        {dispute.description}
                    </p>
                    </CardContent>
                </Card>
                ))}
                <div className="flex justify-center">
                    <Button variant="outline" className="w-full" onClick={() => navigate('/admin/disputes')}>
                        View All Disputes <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                </>
            )}
          </TabsContent>

          <TabsContent value="projects" className="space-y-4">
            {pendingProjects.length === 0 ? (
                <EmptyState 
                    icon={Inbox} 
                    title="No Pending Projects" 
                    description="There are no projects waiting for approval." 
                />
            ) : (
                <>
                {pendingProjects.slice(0, 3).map((project: any) => (
                <Card key={project.id} className="hover:border-zinc-300 transition-all cursor-pointer" onClick={() => navigate('/admin/projects')}>
                    <CardContent className="p-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                            <Briefcase className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-zinc-900">{project.title}</h4>
                            <p className="text-sm text-zinc-500">Buyer: {project.buyer_name}</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Pending</Badge>
                    </CardContent>
                </Card>
                ))}
                <div className="flex justify-center">
                    <Button variant="outline" className="w-full" onClick={() => navigate('/admin/projects')}>
                        Manage Projects <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                </>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
             {pendingReports.length === 0 ? (
                <EmptyState 
                    icon={CheckCircle2} 
                    title="No Pending Reports" 
                    description="There are no user reports requiring attention." 
                />
             ) : (
                <>
                {pendingReports.slice(0, 3).map((report: any) => (
                <Card key={report.id} className="hover:border-zinc-300 transition-all cursor-pointer" onClick={() => navigate('/admin/reports')}>
                    <CardContent className="p-5 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                            <ShieldAlert className="h-5 w-5" />
                        </div>
                        <div>
                            <h4 className="font-bold text-zinc-900 capitalize">{report.type}</h4>
                            <p className="text-sm text-zinc-500 line-clamp-1">{report.description}</p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                    </CardContent>
                </Card>
                ))}
                <div className="flex justify-center">
                    <Button variant="outline" className="w-full" onClick={() => navigate('/admin/reports')}>
                        Review All Reports <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </div>
                </>
             )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

function EmptyState({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 text-center">
            <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-zinc-100">
                <Icon className="h-6 w-6 text-zinc-400" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm mx-auto">{description}</p>
        </div>
    );
}