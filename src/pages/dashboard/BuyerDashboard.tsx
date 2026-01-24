import { motion } from 'framer-motion';
import {
    Plus,
    Search,
    Briefcase,
    Clock,
    CheckCircle2,
    TrendingUp,
    FileText,
    MoreHorizontal,
    ArrowUpRight,
    ShieldCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '@/lib/api';
import { useCurrency } from '@/hooks/useCurrency';


export function BuyerDashboard() {

    const { user, token } = useAuth();
    const navigate = useNavigate();
    const { convertAndFormat } = useCurrency();
    // Fetch all projects to ensure we capture Open, Active, Drafts, etc.
    const { data: all_projects, isLoading } = useProjects();

    // Fetch real dashboard stats
    const { data: dashboardStats } = useQuery({
        queryKey: ['buyerDashboardStats', user?.id],
        queryFn: () => clientsApi.getDashboardStats(user!.id, token!),
        enabled: !!user?.id && !!token,
    });

    // Filter projects locally
    const active_projects = all_projects?.filter(p => p.status === 'active' || p.status === 'open') || [];
    const draft_projects = all_projects?.filter(p => p.status === 'draft') || [];

    // Calculate stats
    const activeCount = active_projects.length;
    const draftCount = draft_projects.length;
    // Use totalSpentINR because the backend returns converted value, but convertAndFormat converts it again
    const totalSpent = (dashboardStats?.data as any)?.totalSpentINR || 0;
    const expertsHired = dashboardStats?.data?.expertsHired || 0;

    const greeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="min-h-screen bg-slate-50/50 pb-20">
            {/* Hero Section with Premium Gradient */}
            <div className="relative bg-white border-b">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 pointer-events-none" />
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 relative">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <h1 className="text-4xl font-display font-bold text-slate-900 tracking-tight">
                                    {greeting()}, <span className="md:hidden">{user?.first_name}</span>
                                    <span className="hidden md:inline">{user?.first_name} {user?.last_name}</span>
                                </h1>
                                <p className="text-lg text-slate-500 max-w-2xl">
                                    {'Manage your deep tech projects and collaborate with world-class experts.'}
                                </p>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 }}
                            className="flex items-center gap-3"
                        >
                            <Button
                                onClick={() => navigate('/projects/new')}
                                size="lg"
                                className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 transition-all rounded-full px-8"
                            >
                                <Plus className="mr-2 h-5 w-5" />
                                {'Post New Project'}
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 space-y-12">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatsCard
                        title={'Active Projects'}
                        value={activeCount}
                        icon={Briefcase}
                        color="text-blue-600"
                        bg="bg-blue-50"
                        subtext={'Currently running'}
                    />
                    <StatsCard
                        title={'Draft Projects'}
                        value={draftCount}
                        icon={FileText}
                        color="text-slate-600"
                        bg="bg-slate-100"
                        subtext={'Pending publication'}
                    />
                    <StatsCard
                        title={'Total Spent'}
                        value={convertAndFormat(totalSpent, 'INR')}
                        icon={TrendingUp}
                        color="text-emerald-600"
                        bg="bg-emerald-50"
                        subtext={'Lifetime investment'}
                    />
                    <StatsCard
                        title={'Experts Hired'}
                        value={expertsHired}
                        icon={CheckCircle2}
                        color="text-violet-600"
                        bg="bg-violet-50"
                        subtext={'Successful collaborations'}
                    />
                </div>

                {/* Main Content Area */}
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Recent Projects Column */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900">{'Your Projects'}</h2>
                            <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50" onClick={() => navigate('/projects')}>
                                {'View All'} <ArrowUpRight className="ml-1 h-4 w-4" />
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="grid gap-6">
                                {[1, 2].map((i) => (
                                    <div key={i} className="h-48 rounded-xl bg-slate-100 animate-pulse" />
                                ))}
                            </div>
                        ) : active_projects?.length === 0 && draft_projects?.length === 0 ? (
                            <EmptyState navigate={navigate} />
                        ) : (
                            <div className="space-y-6">
                                {active_projects?.slice(0, 3).map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                                {draft_projects?.slice(0, 2).map((project) => (
                                    <ProjectCard key={project.id} project={project} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Quick Actions */}
                        <Card className="border-none shadow-sm ring-1 ring-slate-200">
                            <CardHeader>
                                <CardTitle className="text-lg">{'Quick Actions'}</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                <Button variant="outline" className="w-full justify-start h-12" onClick={() => navigate('/experts')}>
                                    <Search className="mr-3 h-5 w-5 text-slate-400" />
                                    {'Find Experts'}
                                </Button>
                                <Button variant="outline" className="w-full justify-start h-12" onClick={() => navigate('/messages')}>
                                    <MoreHorizontal className="mr-3 h-5 w-5 text-slate-400" />
                                    {'Messages'}
                                </Button>
                                <Button variant="outline" className="w-full justify-start h-12" onClick={() => navigate('/profile')}>
                                    <ShieldCheck className="mr-3 h-5 w-5 text-slate-400" />
                                    {'Your Profile'}
                                </Button>
                            </CardContent>
                        </Card>

                        {/* Premium Feature Promo */}
                        <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                                <ShieldCheck className="w-32 h-32" />
                            </div>
                            <h3 className="text-lg font-bold mb-2 relative z-10">{'StartRIT Premium'}</h3>
                            <p className="text-indigo-100 text-sm mb-6 relative z-10">
                                {'Get dedicated support, advanced IP protection, and priority access to top-tier experts.'}
                            </p>
                            <Button size="sm" className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-sm relative z-10">
                                {'Learn More'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatsCard({ title, value, icon: Icon, color, bg, subtext }: any) {
    return (
        <Card className="border-none shadow-sm hover:shadow-md transition-shadow ring-1 ring-slate-200">
            <CardContent className="p-6">
                <div className="flex justify-between items-start">
                    <div className={`p-3 rounded-xl ${bg}`}>
                        <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                </div>
                <div className="mt-4">
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
                    <p className="text-xs text-slate-400 mt-1">{subtext}</p>
                </div>
            </CardContent>
        </Card>
    );
}

function EmptyState({ navigate }: { navigate: any }) {
    return (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center bg-slate-50/50">
            <div className="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Briefcase className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">{'No Projects Yet'}</h3>
            <p className="text-slate-500 max-w-md mx-auto mb-8">
                {'Post your first project to connect with specialized deep tech experts and accelerate your R&D.'}
            </p>
            <Button onClick={() => navigate('/projects/new')} size="lg" className="rounded-full">
                <Plus className="mr-2 h-4 w-4" />
                {'Create Project'}
            </Button>
        </div>
    );
}
