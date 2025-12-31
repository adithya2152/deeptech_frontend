import { useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminContracts, useAdminUser } from '@/hooks/useAdmin';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, Search, Filter } from 'lucide-react';
import { ContractDetailsDialog } from '@/components/admin/ContractDetailsDialog';
import { Link } from 'react-router-dom';

const TableNameCell = ({ userId, type }: { userId: string, type: 'C' | 'F' }) => {
    const { data: user, isLoading } = useAdminUser(userId);
    
    if (isLoading) return <span className="text-zinc-400 italic">Loading...</span>;
    if (!user) return <span className="text-zinc-400">Unknown</span>;

    return (
        <Link 
            to={`/admin/users/${userId}`} 
            className="font-medium text-zinc-900 hover:text-blue-600 hover:underline flex items-center gap-1"
        >
            <span className="text-zinc-400 font-normal no-underline mr-1">{type}:</span>
            {user.first_name} {user.last_name}
        </Link>
    );
}

export default function ContractOversight() {
  const { data: contracts, isLoading } = useAdminContracts();
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const itemsPerPage = 10;

  const filteredContracts = useMemo(() => {
    if (!contracts) return [];
    
    return contracts.filter((contract: any) => {
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = contract.id.toLowerCase().includes(searchLower);
      
      const matchesStatus = statusFilter === 'all' 
        ? true 
        : contract.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [contracts, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  
  const paginatedContracts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredContracts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredContracts, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const openContractDetails = (contract: any) => {
    setSelectedContract(contract);
    setIsDialogOpen(true);
  };

  const columns = [
    {
      header: 'Contract ID',
      accessorKey: 'id' as const,
      className: 'font-mono text-xs w-[120px]',
      cell: (item: any) => (
        <span className="bg-zinc-100 px-2 py-1 rounded text-zinc-600 select-all">
          #{item.id.slice(0, 8)}
        </span>
      )
    },
    {
        header: 'Parties',
        cell: (item: any) => (
          <div className="flex flex-col text-sm space-y-1">
             <TableNameCell userId={item.buyer_id} type="C" />
             <TableNameCell userId={item.expert_id} type="F" />
          </div>
        )
    },
    {
      header: 'Model',
      accessorKey: 'engagement_model' as const,
      cell: (item: any) => (
        <Badge variant="outline" className="capitalize bg-white whitespace-nowrap">
            {item.engagement_model?.replace('_', ' ')}
        </Badge>
      )
    },
    {
      header: 'Value',
      accessorKey: 'total_amount' as const,
      cell: (item: any) => <span className="font-medium text-emerald-700">${item.total_amount?.toLocaleString()}</span>
    },
    {
      header: 'Status',
      accessorKey: 'status' as const,
      cell: (item: any) => (
        <Badge variant={
          item.status === 'active' ? 'default' : 
          item.status === 'completed' ? 'secondary' : 
          item.status === 'disputed' ? 'destructive' : 'outline'
        }>
          {item.status}
        </Badge>
      )
    },
    {
      header: 'Created',
      cell: (item: any) => <span className="text-sm text-zinc-500">{new Date(item.created_at).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item: any) => (
        <div className="flex justify-end">
            <Button 
                variant="ghost" 
                size="sm"
                onClick={() => openContractDetails(item)}
                className="hover:bg-zinc-100"
            >
                <Eye className="h-4 w-4 mr-2 text-zinc-500" /> View
            </Button>
        </div>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Contract Oversight</h1>
            <p className="text-zinc-500 mt-1">Monitor active engagements, milestones, and escrow.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-lg border border-zinc-200 shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search by ID..." 
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
                <SelectItem value="all">All Contracts</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={paginatedContracts} 
          isLoading={isLoading} 
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />

        <ContractDetailsDialog 
            contract={selectedContract}
            open={isDialogOpen}
            onOpenChange={setIsDialogOpen}
        />
      </div>
    </AdminLayout>
  );
}