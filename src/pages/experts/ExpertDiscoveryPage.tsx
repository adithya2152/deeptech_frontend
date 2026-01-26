import { useState, useMemo, useEffect, useRef } from 'react';
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
import { useCurrency } from '@/hooks/useCurrency';
import { currencySymbol as getCurrencySymbol } from '@/lib/currency';

// Helper to load saved state safely
const getSavedState = () => {
  if (typeof window === 'undefined') return null;
  try {
    const saved = sessionStorage.getItem('expert_discovery_state');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

export default function ExpertDiscoveryPage() {
  const { convert, displayCurrency } = useCurrency();
  const { user } = useAuth();
  
  // Load saved state once on mount
  const savedState = useMemo(() => getSavedState(), []);

  // Initialize inputs/filters from saved state
  const [inputValue, setInputValue] = useState(savedState?.inputValue || '');
  const [searchQuery, setSearchQuery] = useState(savedState?.searchQuery || '');
  const [selectedDomains, setSelectedDomains] = useState<Domain[]>(savedState?.selectedDomains || []);
  const [rateRange, setRateRange] = useState(savedState?.rateRange || [0, 500]);
  const [onlyVerified, setOnlyVerified] = useState(savedState?.onlyVerified || false);
  const [sortBy, setSortBy] = useState<'rating' | 'rate' | 'hours'>(savedState?.sortBy || 'rating');
  const [useSemanticSearch, setUseSemanticSearch] = useState((user && savedState?.useSemanticSearch) || false);

  // Initialize CACHED DATA from saved state
  // We use this to display content immediately without waiting for API
  const [cachedDbExperts, setCachedDbExperts] = useState(savedState?.cachedDbExperts || null);
  const [cachedSemanticExperts, setCachedSemanticExperts] = useState(savedState?.cachedSemanticExperts || null);

  // Dynamic constants based on currency
  const BASE_MAX_RATE_INR = 2000; 

  const sliderMax = useMemo(() => {
    if (displayCurrency === 'INR') return BASE_MAX_RATE_INR;
    const converted = convert(BASE_MAX_RATE_INR, 'INR');
    if (converted > 10000) return Math.ceil(converted / 1000) * 1000;
    if (converted > 1000) return Math.ceil(converted / 100) * 100;
    return Math.ceil(converted / 10) * 10;
  }, [displayCurrency, convert]);

  const sliderStep = useMemo(() => {
    if (sliderMax >= 10000) return 500;
    if (sliderMax >= 1000) return 100;
    if (sliderMax >= 100) return 10;
    return 1;
  }, [sliderMax]);

  const currencySymbol = getCurrencySymbol(displayCurrency);
  const [prevCurrency, setPrevCurrency] = useState(displayCurrency);

  // Reset range only when currency actually changes
  useEffect(() => {
    if (displayCurrency !== prevCurrency) {
      setRateRange([0, sliderMax]);
      setPrevCurrency(displayCurrency);
    } else if (!savedState && rateRange[1] === 500 && rateRange[1] !== sliderMax) {
         setRateRange([0, sliderMax]);
    }
  }, [displayCurrency, sliderMax, prevCurrency, savedState]);

  // --- API OPTIMIZATION LOGIC ---

  // Check if our current filters match the cached data
  // If they match, we can skip the API call for AI search
  const isCacheValidForSemantic = useMemo(() => {
    return cachedSemanticExperts && savedState?.searchQuery === searchQuery;
  }, [cachedSemanticExperts, savedState, searchQuery]);

  // 1. Standard DB Search Hook
  const { data: fetchedDbExperts, isLoading: isDbLoading } = useExperts({
    domains: selectedDomains.length > 0 ? selectedDomains : undefined,
    onlyVerified,
    searchQuery: !useSemanticSearch ? searchQuery : undefined,
  });

  // 2. Semantic (AI) Search Hook
  // CRITICAL FIX: If we have valid cached results, pass '' to the hook to PREVENT the API call.
  const shouldFetchSemantic = useSemanticSearch && searchQuery.trim() && !isCacheValidForSemantic;
  
  const { data: fetchedSemanticExperts, isLoading: isSemanticLoading } = useSemanticExperts(
    shouldFetchSemantic ? searchQuery : '' 
  );

  // Determine which data to display: Fresh API data OR Cache
  const dbExperts = fetchedDbExperts || cachedDbExperts;
  const semanticExperts = isCacheValidForSemantic ? cachedSemanticExperts : fetchedSemanticExperts;

  // Update Cache when fresh data arrives
  useEffect(() => {
    if (fetchedDbExperts) setCachedDbExperts(fetchedDbExperts);
  }, [fetchedDbExperts]);

  useEffect(() => {
    if (fetchedSemanticExperts) setCachedSemanticExperts(fetchedSemanticExperts);
  }, [fetchedSemanticExperts]);


  // Save everything to sessionStorage
  useEffect(() => {
    const stateToSave = {
      inputValue,
      searchQuery,
      selectedDomains,
      rateRange,
      onlyVerified,
      sortBy,
      useSemanticSearch,
      // Save the actual data results
      cachedDbExperts: fetchedDbExperts || cachedDbExperts,
      cachedSemanticExperts: fetchedSemanticExperts || cachedSemanticExperts
    };
    sessionStorage.setItem('expert_discovery_state', JSON.stringify(stateToSave));
  }, [inputValue, searchQuery, selectedDomains, rateRange, onlyVerified, sortBy, useSemanticSearch, fetchedDbExperts, cachedDbExperts, fetchedSemanticExperts, cachedSemanticExperts]);

  const experts = (useSemanticSearch && searchQuery.trim()) ? semanticExperts : dbExperts;

  // Determine loading state
  // We are only "loading" if we don't have data AND we are actually trying to fetch
  const isLoading = useSemanticSearch 
    ? (isSemanticLoading && !semanticExperts) 
    : (isDbLoading && !dbExperts);

  const filteredExperts = useMemo(() => {
    if (!experts) return [];

    if (useSemanticSearch && searchQuery.trim()) {
      let filtered = experts.filter((e: any) => {
        const expertUserId = e.user_id || e.id;
        return String(expertUserId) !== String(user?.id);
      });

      if (selectedDomains.length > 0) {
        filtered = filtered.filter((e: any) =>
          e.domains.some((d: Domain) => selectedDomains.includes(d))
        );
      }

      filtered = filtered.filter((e: any) => {
        const rateInInr = Number(e.avg_hourly_rate) || 0;
        const rate = convert(rateInInr, 'INR');
        const upperLimit = rateRange[1] >= sliderMax ? Infinity : rateRange[1];
        return rate >= rateRange[0] && rate <= upperLimit;
      });

      if (onlyVerified) {
        filtered = filtered.filter((e: any) => e.expert_status === 'verified');
      }

      switch (sortBy) {
        case 'rating':
          filtered.sort((a: any, b: any) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
          break;
        case 'rate':
          filtered.sort((a: any, b: any) =>
            (a.avg_hourly_rate || 0) - (b.avg_hourly_rate || 0)
          );
          break;
        case 'hours':
          filtered.sort((a: any, b: any) =>
            (Number(b.total_hours) || 0) - (Number(a.total_hours) || 0)
          );
          break;
      }

      return filtered;
    }

    let filtered = experts.filter((e: any) => {
      const expertUserId = e.user_id || e.id;
      return String(expertUserId) !== String(user?.id);
    });

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((e: any) => {
        const name = e.name || `${e.first_name} ${e.last_name}`;
        const summary = e.experience_summary || '';
        const bio = e.bio || '';

        return name.toLowerCase().includes(query) ||
          summary.toLowerCase().includes(query) ||
          bio.toLowerCase().includes(query);
      });
    }

    if (selectedDomains.length > 0) {
      filtered = filtered.filter((e: any) => {
        const expertDomains = e.domains || [];
        return expertDomains.some((d: string) => selectedDomains.includes(d as Domain));
      });
    }

    filtered = filtered.filter((e: any) => {
      const rateInInr = Number(e.avg_hourly_rate) || 0;
      const rate = convert(rateInInr, 'INR');
      const upperLimit = rateRange[1] >= sliderMax ? Infinity : rateRange[1];
      return rate >= rateRange[0] && rate <= upperLimit;
    });

    if (onlyVerified) {
      filtered = filtered.filter((e: any) =>
        e.expert_status === 'verified'
      );
    }

    switch (sortBy) {
      case 'rating':
        filtered.sort((a: any, b: any) => (Number(b.rating) || 0) - (Number(a.rating) || 0));
        break;
      case 'rate':
        filtered.sort((a: any, b: any) =>
          (a.avg_hourly_rate || 0) - (b.avg_hourly_rate || 0)
        );
        break;
      case 'hours':
        filtered.sort((a: any, b: any) =>
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
    setInputValue('');
    setSelectedDomains([]);
    setRateRange([0, sliderMax]);
    setOnlyVerified(false);
    setUseSemanticSearch(false);
    
    // Clear cache
    setCachedDbExperts(null);
    setCachedSemanticExperts(null);
    sessionStorage.removeItem('expert_discovery_state');
  };

  const hasActiveFilters =
    selectedDomains.length > 0 ||
    onlyVerified ||
    rateRange[0] > 0 ||
    rateRange[1] < sliderMax;

  const [showAllDomains, setShowAllDomains] = useState(false);
  const [domainSearch, setDomainSearch] = useState("");

  const filteredDomains = Object.entries(domainLabels).filter(([_, label]) =>
    label.toLowerCase().includes(domainSearch.toLowerCase())
  );

  const FilterContent = () => (
    <div className="space-y-6">
      <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-center gap-3">
          <Checkbox
            id="verified"
            checked={onlyVerified}
            onCheckedChange={(checked) => setOnlyVerified(!!checked)}
            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="verified" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer">
              {'Verified Experts Only'}
            </Label>
            <p className="text-xs text-muted-foreground">
              {'Show only vetted professionals'}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">{'Domains'}</Label>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder="Search domains..."
            value={domainSearch}
            onChange={(e) => setDomainSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-slate-50 border-slate-200"
          />
        </div>

        <div className="space-y-2">
          {filteredDomains.length > 0 ? (
            <>
              {filteredDomains.slice(0, (showAllDomains || domainSearch) ? undefined : 10).map(([key, label]) => (
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
              {!domainSearch && filteredDomains.length > 10 && (
                <Button
                  variant="link"
                  className="px-0 h-auto text-xs text-muted-foreground hover:text-primary"
                  onClick={() => setShowAllDomains(!showAllDomains)}
                >
                  {showAllDomains ? 'Show Less' : `+ ${filteredDomains.length - 10} More`}
                </Button>
              )}
            </>
          ) : (
            <p className="text-xs text-muted-foreground py-2 text-center">
              {'No domains found'}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">{'Hourly Rate Range'}</Label>
        <div className="px-2">
          <Slider
            value={rateRange}
            onValueChange={setRateRange}
            min={0}
            max={sliderMax}
            step={sliderStep}
            className="my-4"
          />
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>{currencySymbol}{rateRange[0]}</span>
          <span>{currencySymbol}{rateRange[1]}{rateRange[1] === sliderMax ? '+' : ''}</span>
        </div>
      </div>

      {hasActiveFilters && (
        <Button variant="ghost" onClick={clearFilters} className="w-full text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4 mr-2" />
          {'Clear Filters'}
        </Button>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-7 sm:px-6 lg:px-8">
        <div className="mb-5">
          <h1 className="font-display text-2xl font-semibold text-foreground">{'Find Experts'}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {'Discover top-rated professionals for your projects'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={'Search by name or expertise...'}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setSearchQuery(inputValue.trim());
                  // Clear semantic cache on new search to force API call
                  setCachedSemanticExperts(null);
                }
              }}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={useSemanticSearch ? "default" : "outline"}
              onClick={() => {
                if (!user) {
                  alert("Please log in to use AI Search functionality");
                  return;
                }
                const newSemanticState = !useSemanticSearch;
                
                // If turning ON ai search, trigger search
                if (newSemanticState) {
                   setSearchQuery(inputValue.trim());
                   // Clear cache if queries don't match or to force refresh
                   if (inputValue.trim() !== searchQuery) {
                     setCachedSemanticExperts(null);
                   }
                }
                setUseSemanticSearch(newSemanticState);
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
            <div className="sticky top-24 p-4 bg-slate-50/50 rounded-xl border border-slate-200/60 max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar backdrop-blur-sm">
              <h3 className="font-medium text-sm mb-4 text-slate-900">{'Filters'}</h3>
              <FilterContent />
            </div>
          </aside>

          <div className="flex-1">
            {isLoading ? (
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
                        ? 'Try adjusting your filters to find what you need.'
                        : 'No experts found matching your criteria.'}
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