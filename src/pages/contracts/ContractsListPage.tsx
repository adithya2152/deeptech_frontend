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
        <div className="flex flex-col items-center justify-center py-20 border border-dashed border-muted-foreground/20 rounded-xl">
          <div className="bg-muted/50 p-4 rounded-full mb-4">
            <Inbox className="h-8 w-8 text-muted-foreground/40" />
          </div>
          <h3 className="text-base font-medium text-foreground mb-1">No contracts found</h3>
          <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-8 md:grid-cols-2">
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
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Contracts</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your active agreements, track payments, and oversee collaborations.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{contracts.length} total</span>
            {statusCounts.active > 0 && (
              <>
                <span>•</span>
                <span>{statusCounts.active} active</span>
              </>
            )}
          </div>
        </div>

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
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setStatusFilter(tab.value)}
                    className={`gap-1.5 ${isActive ? '' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {tab.label}
                    {count > 0 && (
                      <span className={`ml-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full ${isActive
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
            <div className="relative w-full lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contracts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-card border-border focus-visible:ring-primary/20"
              />
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            renderGrid(filteredContracts)
          )}
        </div>
      </div>
    </Layout>
  );
}