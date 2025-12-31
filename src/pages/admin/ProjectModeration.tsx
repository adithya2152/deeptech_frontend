import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminProjects, useAdminActions } from '@/hooks/useAdmin';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, X, Eye, Search, Filter } from 'lucide-react';
import { ProjectDetailsDialog } from '@/components/admin/ProjectDetailsDialog';

export default function ProjectModeration() {
  const { data: projects, isLoading } = useAdminProjects();
  const { approveProject, rejectProject, isActing } = useAdminActions();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const itemsPerPage = 10;

  const filteredProjects = useMemo(() => {
    if (!projects) return [];
    
    return projects.filter((project: any) => {
      const matchesSearch = 
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.buyer_name.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' 
        ? true 
        : project.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [projects, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredProjects.length / itemsPerPage);
  
  const paginatedProjects = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const openProjectDetails = (project: any) => {
    setSelectedProject(project);
    setIsDialogOpen(true);
  };

  const columns = [
    {
      header: 'Project Details',
      accessorKey: 'title' as const,
      className: 'w-[40%]',
      cell: (item: any) => (
        <div className="space-y-1">
          <p className="font-semibold text-zinc-900">{item.title}</p>
          <p className="text-xs text-zinc-500 line-clamp-1">{item.description}</p>
        </div>
      )
    },
    {
      header: 'Buyer',
      accessorKey: 'buyer_name' as const,
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="text-sm font-medium text-zinc-700">{item.buyer_name}</span>
          <span className="text-xs text-zinc-500">ID: {item.buyer_id?.substring(0, 8)}...</span>
        </div>
      )
    },
    {
      header: 'Budget',
      accessorKey: 'budget_min' as const,
      cell: (item: any) => (
        <span className="text-sm font-medium text-zinc-700">
          ${item.budget_min?.toLocaleString()} - ${item.budget_max?.toLocaleString()}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status' as const,
      cell: (item: any) => (
        <Badge variant={
          item.status === 'active' ? 'default' : 
          item.status === 'pending' ? 'secondary' : 
          item.status === 'rejected' ? 'destructive' : 'outline'
        }>
          {item.status.toUpperCase()}
        </Badge>
      )
    },
    {
      header: 'Date',
      cell: (item: any) => (
        <span className="text-sm text-zinc-600">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item: any) => (
        <div className="flex justify-end gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => openProjectDetails(item)}
          >
            <Eye className="h-4 w-4 text-zinc-500" />
          </Button>
          
          {item.status === 'pending' && (
            <>
              <Button 
                size="sm" 
                className="bg-emerald-600 hover:bg-emerald-700 h-8 w-8 p-0"
                onClick={() => approveProject(item.id)}
                disabled={isActing}
                title="Approve"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-8 w-8 p-0"
                onClick={() => rejectProject(item.id)}
                disabled={isActing}
                title="Reject"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Project Moderation</h1>
            <p className="text-zinc-500 mt-1">Review, approve, or reject project listings.</p>
          </div>
          <div className="flex gap-2">
            <div className="bg-white p-1 rounded-lg border border-zinc-200 shadow-sm inline-flex">
               <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-auto">
                <TabsList className="bg-transparent h-8">
                  <TabsTrigger value="all" className="h-7 text-xs">All</TabsTrigger>
                  <TabsTrigger value="pending" className="h-7 text-xs">Pending</TabsTrigger>
                  <TabsTrigger value="active" className="h-7 text-xs">Active</TabsTrigger>
                  <TabsTrigger value="rejected" className="h-7 text-xs">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search projects or buyers..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-zinc-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending Review</SelectItem>
                <SelectItem value="active">Active Projects</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DataTable 
          columns={columns} 
          data={paginatedProjects} 
          isLoading={isLoading} 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        <ProjectDetailsDialog 
          project={selectedProject}
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onApprove={approveProject}
          onReject={rejectProject}
          isActing={isActing}
        />
      </div>
    </AdminLayout>
  );
}