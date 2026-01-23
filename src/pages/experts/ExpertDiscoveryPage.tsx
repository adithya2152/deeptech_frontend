import { useState, useMemo } from 'react';
import { Layout } from '@/components/layout/Layout';
import { ExpertCard } from '@/components/experts/ExpertCard';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { domainLabels } from '@/lib/constants';
import { useExperts, useSemanticExperts } from '@/hooks/useExperts';
import { Domain } from '@/types';
import { Search, SlidersHorizontal, X, Loader2, UserX, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';


export default function ExpertDiscoveryPage() {
    const [inputValue, setInputValue] = useState('');
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>([]);
  const [rateRange, setRateRange] = useState([0, 5000]);
  const [onlyVerified, setOnlyVerified] = useState(false);
  const [sortBy, setSortBy] = useState<'rating' | 'rate' | 'hours'>('rating');
  const [useSemanticSearch, setUseSemanticSearch] = useState(false);

  const { data: dbExperts, isLoading } = useExperts({
    domains: selectedDomains.length > 0 ? selectedDomains : undefined,
    onlyVerified,
    searchQuery: !useSemanticSearch ? searchQuery : undefined,
  });

  // Semantic search
  const { data: semanticExperts, isLoading: isSemanticLoading } = useSemanticExperts(
    useSemanticSearch && searchQuery.trim() ? searchQuery : ''
  );

  const experts = (useSemanticSearch && searchQuery.trim()) ? semanticExperts : dbExperts;

  const filteredExperts = useMemo(() => {
    if (!experts) return [];

    if (useSemanticSearch && searchQuery.trim()) {
      // For semantic search, apply client-side filters to the results
      // Exclude current user from the list to prevent self-interaction
      let filtered = experts.filter(e => {
        const expertUserId = e.user_id || e.id;
        return String(expertUserId) !== String(user?.id);
      });

      // Filter by domains
      if (selectedDomains.length > 0) {
        filtered = filtered.filter(e =>
          e.domains.some(d => selectedDomains.includes(d))
        );
      }

      // Filter by rate
      filtered = filtered.filter(e => {
        const rate = e.avg_daily_rate || 0;
        return rate >= rateRange[0] && rate <= rateRange[1];
      });


      // Filter by verified status
      if (onlyVerified) {
        filtered = filtered.filter(e => e.expert_status === 'verified');
      }

      // Sort
      switch (sortBy) {
        case 'rating':
          filtered.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
          break;
        case 'rate':
          filtered.sort((a, b) =>
            (a.avg_daily_rate || 0) - (b.avg_daily_rate || 0)
          );
          break;
        case 'hours':
          filtered.sort((a, b) =>
            (Number(b.total_hours) || 0) - (Number(a.total_hours) || 0)
          );
          break;
      }

      return filtered;
    }

    // Original filtering logic for non-semantic search
    // Exclude current user from the list to prevent self-interaction
    let filtered = experts.filter(e => {
      const expertUserId = e.user_id || e.id;
      return String(expertUserId) !== String(user?.id);
    });

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e => {
        const name = e.name || `${e.first_name} ${e.last_name}`;
        const summary = e.experience_summary || '';
        const bio = e.bio || '';

        return name.toLowerCase().includes(query) ||
          summary.toLowerCase().includes(query) ||
          bio.toLowerCase().includes(query);
      });
    }

    if (selectedDomains.length > 0) {
      filtered = filtered.filter(e => {
        const expertDomains = e.domains || [];
        return expertDomains.some((d: string) => selectedDomains.includes(d as Domain));
      });
    }

    // Filter by rate
    filtered = filtered.filter(e => {
      const rate = e.avg_daily_rate || 0;
      return rate >= rateRange[0] && rate <= rateRange[1];
    });

    // Filter by verified status
    if (onlyVerified) {
      filtered = filtered.filter(e =>
        e.expert_status === 'verified'
      );
    }

    // Sort
    switch (sortBy) {
      case 'rating':
        filtered.sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        break;
      case 'rate':
        filtered.sort((a, b) =>
          (a.avg_daily_rate || 0) - (b.avg_daily_rate || 0)
        );
        break;
      case 'hours':
        filtered.sort((a, b) =>
          (Number(b.total_hours) || 0) - (Number(a.total_hours) || 0)
        );
        break;
    }

    return filtered;
  }, [experts, searchQuery, selectedDomains, rateRange, onlyVerified, sortBy, useSemanticSearch, user?.id]);

  const toggleDomain = (domain: Domain) => {
    setSelectedDomains(prev =>
      prev.includes(domain)
        ? prev.filter(d => d !== domain)
        : [...prev, domain]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedDomains([]);
    setRateRange([0, 5000]);
    setOnlyVerified(false);
  };

  const hasActiveFilters =
    selectedDomains.length > 0 ||
    onlyVerified ||
    rateRange[0] > 0 ||
    rateRange[1] < 5000;

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Label className="text-sm font-medium">{'Domains'}</Label>
        <div className="space-y-2">
          {Object.entries(domainLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-2">
              <Checkbox
                id={key}
                checked={selectedDomains.includes(key as Domain)}
                onCheckedChange={() => toggleDomain(key as Domain)}
              />
              <Label htmlFor={key} className="text-sm font-normal cursor-pointer">
                {label}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">{'Daily Rate Range'}</Label>
        <Slider
          value={rateRange}
          onValueChange={setRateRange}
          min={0}
          max={5000}
          step={250}
        />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${rateRange[0]}</span>
          <span>${rateRange[1]}+</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Checkbox
            id="verified"
            checked={onlyVerified}
            onCheckedChange={(checked) => setOnlyVerified(!!checked)}
          />
          <Label htmlFor="verified" className="text-sm font-normal cursor-pointer">
            {'Only Verified'}
          </Label>
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full">
          <X className="h-4 w-4 mr-2" />
          {'Clear Filters'}
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-display text-2xl font-semibold text-foreground">{'Title'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {'Subtitle'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={'Search Placeholder'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchQuery(inputValue.trim());
                }
              }}
              className="pl-10"
            />

          </div>
          <div className="flex gap-2">
            <Button
              variant={useSemanticSearch ? "default" : "outline"}
              onClick={() => {
                setSearchQuery(inputValue.trim());
                setUseSemanticSearch(prev => !prev);

              }}
              className="whitespace-nowrap"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {useSemanticSearch ? 'Ai Search' : 'Regular Search'}
            </Button>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder={'Sort By'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rating">{'Highest Rated'}</SelectItem>
                <SelectItem value="rate">{'Lowest Rate'}</SelectItem>
                <SelectItem value="hours">{'Most Experience'}</SelectItem>
              </SelectContent>
            </Select>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  {'Filters'}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>{'Filters'}</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <FilterContent />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        <div className="flex gap-8">
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 p-4 bg-card rounded-xl border border-border/50">
              <h3 className="font-medium text-sm mb-4">{'Filters'}</h3>
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            {(useSemanticSearch ? isSemanticLoading : isLoading) ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  {filteredExperts.length} {'Experts Found'}
                </div>

                {filteredExperts.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    {filteredExperts.map(expert => (
                      <ExpertCard key={expert.expert_profile_id || expert.profile_id || expert.id} expert={expert} />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 border border-dashed border-muted-foreground/20 rounded-xl">
                    <div className="bg-muted/50 p-4 rounded-full mb-4">
                      <UserX className="h-8 w-8 text-muted-foreground/40" />
                    </div>
                    <h3 className="text-base font-medium text-foreground mb-1">{'No Experts'}</h3>
                    <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
                      {hasActiveFilters
                        ? 'No Experts Desc'
                        : 'No Experts All'}
                    </p>
                    {hasActiveFilters && (
                      <Button variant="outline" size="sm" onClick={clearFilters}>
                        {'Clear Filters'}
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}