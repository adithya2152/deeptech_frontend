import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMarketplaceProjects } from '@/hooks/useProjects';
import { Layout } from '@/components/layout/Layout';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { Loader2, Search, Briefcase, FilterX, RefreshCcw } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { domainLabels } from '@/lib/constants';

const DOMAIN_OPTIONS: { value: string; label: string }[] = [
  { value: 'all', label: 'All Domains' },
  ...Object.entries(domainLabels).map(([value, label]) => ({ value, label })),
];

export default function MarketplacePage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const buyerIdFilter = searchParams.get('buyerId') || searchParams.get('buyer_id') || undefined;

  const { data: projects = [], isLoading, refetch, isRefetching } = useMarketplaceProjects(buyerIdFilter);
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) setSearchTerm(q);
  }, [searchParams]);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDomain =
      domainFilter === 'all' || project.domain === domainFilter;

    const isVisible = project.status === 'open';

    const matchesBuyer = !buyerIdFilter || String(project.buyer_id) === String(buyerIdFilter);

    // Hide projects the current user themselves posted when they're in expert mode
    // Use buyer_user_id which is the user_accounts.id of the project creator
    // This works across role switches because user.id stays the same
    const isSelfPosted = user && project.buyer_user_id && String(project.buyer_user_id) === String(user.id);

    // Always hide your own projects in expert mode
    if (isSelfPosted && user?.role === 'expert') return false;

    return matchesSearch && matchesDomain && isVisible && matchesBuyer;
  });


  const isExpert = user?.role === 'expert';
  const hasActiveFilters = searchTerm !== '' || domainFilter !== 'all';

  const clearFilters = () => {
    setSearchTerm('');
    setDomainFilter('all');
  };

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Project Marketplace</h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Find deep tech challenges and propose your solutions.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading || isRefetching}
              className="text-muted-foreground"
            >
              <RefreshCcw className={`h-4 w-4 mr-2 ${isRefetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full md:w-64 flex-shrink-0">
            <Select value={domainFilter} onValueChange={setDomainFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Domain" />
              </SelectTrigger>
              <SelectContent>
                {DOMAIN_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" onClick={clearFilters} className="px-3">
              <FilterX className="h-4 w-4 mr-2" />
              Clear
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading marketplace...</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2">
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} context="marketplace" />
            ))}

            {filteredProjects.length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border border-dashed border-muted-foreground/20 rounded-xl">
                <div className="bg-muted/50 p-4 rounded-full mb-4">
                  <Briefcase className="h-8 w-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-base font-medium text-foreground mb-1">No projects found</h3>
                <p className="text-sm text-muted-foreground max-w-sm mb-4">
                  Try adjusting your search or filters to find more opportunities.
                </p>
                {hasActiveFilters && (
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}