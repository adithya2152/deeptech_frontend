import { useMemo, useState } from 'react';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronLeft, Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminEarningsAnalytics } from '@/hooks/useAdmin';
import { DataTable } from '@/components/admin/DataTable';
import { domainLabels } from '@/lib/constants';

export default function AnalyticsDomains() {
  const { data, isLoading, error } = useAdminEarningsAnalytics({
    limitCountries: 1,
    limitExperts: 1,
    limitDomains: 250,
  });

  const [search, setSearch] = useState('');

  const rows = useMemo(() => {
    const raw = data?.top_domains || [];
    const allowed = raw.filter((r: any) => {
      const key = String(r?.domain || '');
      return Boolean(domainLabels?.[key as keyof typeof domainLabels]);
    });
    return allowed.map((r: any, idx: number) => ({
      id: r.domain || idx,
      rank: idx + 1,
      ...r,
    }));
  }, [data?.top_domains]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r: any) => {
      const label = domainLabels?.[r.domain as keyof typeof domainLabels] || '';
      return String(label).toLowerCase().includes(q) || String(r.domain || '').toLowerCase().includes(q);
    });
  }, [rows, search]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-zinc-900" />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Top Domains</h1>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/analytics">
                <ChevronLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          </div>
          <p className="text-zinc-500">Failed to load domain analytics.</p>
          <pre className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-3 overflow-auto">{String((error as any)?.message || error)}</pre>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <Layers className="h-7 w-7 text-indigo-600" />
              Top Domains
            </h1>
            <p className="text-zinc-500 mt-2">
              Ranked by number of contracts created for experts in each domain.
            </p>
          </div>

          <Button asChild variant="outline" className="gap-2">
            <Link to="/admin/analytics">
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        </div>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search domain…"
                className="md:max-w-sm"
              />
              <div className="text-xs text-zinc-500">
                Showing {filtered.length.toLocaleString()} of {rows.length.toLocaleString()}
              </div>
            </div>

            <DataTable
              data={filtered}
              columns={[
                { header: '#', accessorKey: 'rank', className: 'w-[70px] text-zinc-500' },
                {
                  header: 'Domain',
                  cell: (r: any) => {
                    const label = domainLabels?.[r.domain as keyof typeof domainLabels] || '—';
                    return (
                      <div>
                        <div className="font-medium text-zinc-900">{label || '—'}</div>
                      </div>
                    );
                  },
                },
                {
                  header: 'Experts',
                  cell: (r: any) => <span className="text-sm text-zinc-700">{Number(r.experts_count || 0).toLocaleString()}</span>,
                  className: 'w-[110px] text-right',
                },
                {
                  header: 'Contracts',
                  cell: (r: any) => <span className="font-semibold text-zinc-900">{Number(r.contracts_count || 0).toLocaleString()}</span>,
                  className: 'w-[130px] text-right',
                },
                {
                  header: 'Active',
                  cell: (r: any) => <span className="text-sm text-zinc-700">{Number(r.active_contracts_count || 0).toLocaleString()}</span>,
                  className: 'w-[120px] text-right',
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
