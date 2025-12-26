import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useContracts, } from '@/hooks/useContracts';
import { ContractCard } from '@/components/contracts/ContractCard';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Loader2, Inbox } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ContractsListPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: contracts = [], isLoading } = useContracts();
  const isBuyer = user?.role === 'buyer';

  const filteredContracts = contracts.filter((contract: any) => {
    const projectTitle = contract.project_title || '';
    const counterparty = isBuyer ? contract.expert : contract.buyer;
    const counterpartyName = counterparty
      ? `${counterparty.first_name} ${counterparty.last_name}`
      : '';

    const matchesSearch = !searchQuery ||
      projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      counterpartyName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? contract.status !== 'all' : contract.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const renderGrid = (items: any[]) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl bg-muted/10">
          <Inbox className="h-12 w-12 text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No contracts found</h3>
          <p className="text-sm text-muted-foreground/60">Try adjusting your filters.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {items.map((contract: any) => {
          const counterparty = isBuyer ? contract.expert : contract.buyer;
          const counterpartyName = counterparty
            ? `${counterparty.first_name} ${counterparty.last_name}`
            : (isBuyer ? 'Expert' : 'Buyer');

          return (
            <ContractCard
              key={contract.id}
              contract={contract}
              counterpartyName={counterpartyName}
              counterpartyRole={isBuyer ? 'Expert' : 'Buyer'}
              projectTitle={contract.project_title}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Layout>
      <div className="container max-w-7xl mx-auto py-10 px-4">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="font-display text-4xl font-bold tracking-tight">Contract Management</h1>
            <p className="text-muted-foreground mt-2">Oversee your active and pending project agreements.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 bg-card p-4 rounded-xl border shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-none bg-muted/50"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[220px] bg-muted/50 border-none">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="declined">Declined</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Syncing contracts...</p>
            </div>
          ) : (
            <Tabs value={statusFilter} onValueChange={setStatusFilter} className="w-full space-y-8">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="all" className="px-8">All</TabsTrigger>
                <TabsTrigger value="active" className="px-8">Active</TabsTrigger>
                <TabsTrigger value="pending" className="px-8">Pending</TabsTrigger>
                <TabsTrigger value="completed" className="px-8">Completed</TabsTrigger>
                <TabsTrigger value="declined" className="px-8">Declined</TabsTrigger>
              </TabsList>

              <TabsContent value={statusFilter} className="mt-0">
                {renderGrid(filteredContracts)}
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </Layout>
  );
}