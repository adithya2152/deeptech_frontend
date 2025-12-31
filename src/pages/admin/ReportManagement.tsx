import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminReports, useAdminActions, useAdminUser } from '@/hooks/useAdmin';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, Eye, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';
import { ReportDetailsDialog } from '@/components/admin/ReportDetailsDialog';

// Helper for table cells
const TableUserCell = ({ userId }: { userId: string }) => {
    const { data: user, isLoading } = useAdminUser(userId);
    if (isLoading) return <span className="text-zinc-400 text-xs">Loading...</span>;
    if (!user) return <span className="text-zinc-400 text-xs">Unknown</span>;
    return (
        <div>
            <span className="font-medium block text-zinc-900">{user.first_name} {user.last_name}</span>
            <span className="text-[10px] text-zinc-500">{user.role ? user.role.toUpperCase() : 'USER'}</span>
        </div>
    );
};

export default function ReportManagement() {
  const { data: reports, isLoading } = useAdminReports();
  const { dismissReport, takeActionOnReport, isActing } = useAdminActions();

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('pending'); // Default to pending for focus
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const itemsPerPage = 10;

  const filteredReports = useMemo(() => {
    if (!reports) return [];
    
    return reports.filter((report: any) => {
      const matchesSearch = 
        report.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' 
        ? true 
        : report.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reports, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReports, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const openReportDetails = (report: any) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  const columns = [
    {
      header: 'Type',
      accessorKey: 'type' as const,
      cell: (item: any) => (
        <Badge variant="outline" className={`capitalize ${
            item.type === 'harassment' ? 'border-red-200 text-red-700 bg-red-50' : 
            item.type === 'scam' ? 'border-purple-200 text-purple-700 bg-purple-50' : 'bg-zinc-50 text-zinc-700'
        }`}>
          {item.type}
        </Badge>
      )
    },
    {
      header: 'Reporter',
      cell: (item: any) => <TableUserCell userId={item.reporter_id} />
    },
    {
      header: 'Reported User',
      cell: (item: any) => <TableUserCell userId={item.reported_id} />
    },
    {
      header: 'Description',
      accessorKey: 'description' as const,
      className: 'max-w-xs',
      cell: (item: any) => (
        <p className="truncate text-zinc-500 max-w-[200px]" title={item.description}>
            {item.description}
        </p>
      )
    },
    {
      header: 'Date',
      cell: (item: any) => (
        <span className="text-sm text-zinc-500">
            {format(new Date(item.created_at), 'MMM d, yyyy')}
        </span>
      )
    },
    {
      header: 'Status',
      accessorKey: 'status' as const,
      cell: (item: any) => (
        <Badge variant={
            item.status === 'pending' ? 'secondary' : 
            item.status === 'resolved' ? 'default' : 'outline'
        } className={item.status === 'pending' ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : ''}>
          {item.status.toUpperCase()}
        </Badge>
      )
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item: any) => (
        <div className="flex justify-end">
            <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => openReportDetails(item)}
            >
                <Eye className="h-4 w-4 text-zinc-500" />
            </Button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Safety & Reports</h1>
            <p className="text-zinc-500 mt-1">Monitor user reports and enforce guidelines.</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
            <div className="bg-white p-4 rounded-lg border border-zinc-200 shadow-sm flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-zinc-900">
                        {reports?.filter((r: any) => r.status === 'pending').length || 0}
                    </p>
                    <p className="text-xs text-zinc-500">Pending Review</p>
                </div>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search reports..." 
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-zinc-500" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reports</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={paginatedReports} 
          isLoading={isLoading} 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        <ReportDetailsDialog 
            report={selectedReport}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
            onDismiss={dismissReport}
            onAction={takeActionOnReport}
            isActing={isActing}
        />
      </div>
    </AdminLayout>
  );
}