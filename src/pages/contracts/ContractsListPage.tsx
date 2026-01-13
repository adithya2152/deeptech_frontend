import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useContracts } from '@/hooks/useContracts';
import { ContractCard } from '@/components/contracts/ContractCard';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Loader2,
  Inbox,
  FileText,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  Filter
} from 'lucide-react';

export default function ContractsListPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data: contracts = [], isLoading } = useContracts();

  const statusTabs = [
    { value: 'all', label: 'All', icon: FileText, color: 'text-foreground' },
    { value: 'active', label: 'Active', icon: Zap, color: 'text-emerald-600' },
    { value: 'pending', label: 'Pending', icon: Clock, color: 'text-amber-600' },
    { value: 'completed', label: 'Completed', icon: CheckCircle2, color: 'text-sky-600' },
    { value: 'declined', label: 'Declined', icon: XCircle, color: 'text-zinc-500' },
  ];

  const filteredContracts = contracts.filter((contract: any) => {
    const projectTitle = contract.project_title || '';
    const partyIsBuyer = String(user?.id) === String(contract.buyer_id);
    const counterparty = partyIsBuyer ? contract.expert : contract.buyer;
    const counterpartyName = counterparty
      ? `${counterparty.first_name} ${counterparty.last_name}`
      : '';

    const matchesSearch = !searchQuery ||
      projectTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      counterpartyName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ? true : contract.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Calculate counts per status
  const statusCounts = contracts.reduce((acc: Record<string, number>, c: any) => {
    acc[c.status] = (acc[c.status] || 0) + 1;
    return acc;
  }, {});
  statusCounts.all = contracts.length;

  const renderGrid = (items: any[]) => {
    if (items.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-24 border-2 border-dashed rounded-2xl bg-muted/5">
          <div className="p-4 rounded-full bg-muted/50 mb-4">
            <Inbox className="h-10 w-10 text-muted-foreground/40" />
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground">No contracts found</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">Try adjusting your search or filters.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
        {items.map((contract: any) => {
          const partyIsBuyer = String(user?.id) === String(contract.buyer_id);
          const counterparty = partyIsBuyer ? contract.expert : contract.buyer;
          const counterpartyName = counterparty
            ? `${counterparty.first_name} ${counterparty.last_name}`
            : (partyIsBuyer ? 'Expert' : 'Buyer');

          return (
            <ContractCard
              key={contract.id}
              contract={contract}
              counterpartyName={counterpartyName}
              counterpartyRole={partyIsBuyer ? 'Expert' : 'Buyer'}
              projectTitle={contract.project_title}
            />
          );
        })}
      </div>
    );
  };

  return (
    <Layout>
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-primary/5 via-background to-background border-b">
        <div className="container max-w-7xl mx-auto py-10 px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                Contracts
              </h1>
              <p className="text-muted-foreground mt-2 max-w-xl">
                Manage your active agreements, track payments, and oversee project collaborations.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-sm py-1.5 px-3">
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                {contracts.length} Total
              </Badge>
              {statusCounts.active > 0 && (
                <Badge className="bg-emerald-500/10 hover:bg-emerald-500/40 text-emerald-600 border-0 text-sm py-1.5 px-3">
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  {statusCounts.active} Active
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto py-8 px-4">
        <div className="flex flex-col gap-6">
          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Status Tabs */}
            <div className="flex flex-wrap gap-2">
              {statusTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = statusFilter === tab.value;
                const count = statusCounts[tab.value] || 0;

                return (
                  <Button
                    key={tab.value}
                    variant={isActive ? "default" : "outline"}
                    size="sm"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`gap-2 ${isActive ? '' : 'bg-background hover:bg-muted/50'}`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? '' : tab.color}`} />
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive
                          ? 'bg-primary-foreground/20 text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                        }`}>
                        {count}
                      </span>
                    )}
                  </Button>
                );
              })}
            </div>

            {/* Search */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-border/50 focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-4 border-muted" />
                <Loader2 className="h-16 w-16 animate-spin text-primary absolute top-0 left-0" />
              </div>
              <p className="text-sm text-muted-foreground font-medium">Loading contracts...</p>
            </div>
          ) : (
            renderGrid(filteredContracts)
          )}
        </div>
      </div>
    </Layout>
  );
}