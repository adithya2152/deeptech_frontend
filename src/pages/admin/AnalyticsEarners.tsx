import { useMemo, useState } from 'react';

import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, ChevronLeft, Crown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminEarningsAnalytics } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/admin/DataTable';

function formatMoney(amount: number) {
  const safe = Number.isFinite(amount) ? amount : 0;
  return safe.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

export default function AnalyticsEarners() {
  // Ask for a larger set of earners; keep countries small to avoid extra work.
  const { data, isLoading, error } = useAdminEarningsAnalytics({ limitCountries: 1, limitExperts: 250 });
  const [search, setSearch] = useState('');

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
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">All Earners</h1>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/analytics">
                <ChevronLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          </div>
          <p className="text-zinc-500">Failed to load earner analytics.</p>
          <pre className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-3 overflow-auto">{String((error as any)?.message || error)}</pre>
        </div>
      </AdminLayout>
    );
  }

  const topExpertsRaw = data?.top_experts || [];
  const topExperts = useMemo(() => {
    return topExpertsRaw.map((e: any, idx: number) => ({
      id: e.expert_user_id || idx,
      rank: idx + 1,
      ...e,
    }));
  }, [topExpertsRaw]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return topExperts;
    return topExperts.filter((e: any) => {
      const hay = [
        e.expert_name,
        e.country,
        Array.isArray(e.skills) ? e.skills.join(' ') : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(q);
    });
  }, [search, topExperts]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <Crown className="h-7 w-7 text-amber-600" />
              All Earners
            </h1>
            <p className="text-zinc-500 mt-2">Ranked by paid invoice amount (expert earnings).</p>
          </div>

          <Button asChild variant="outline" className="gap-2">
            <Link to="/admin/analytics">
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        </div>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Earners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, country, or skill…"
                className="md:max-w-sm"
              />
              <div className="text-xs text-zinc-500">
                Showing {filtered.length.toLocaleString()} of {topExperts.length.toLocaleString()}
              </div>
            </div>

            <DataTable
              data={filtered}
              columns={[
                {
                  header: '#',
                  accessorKey: 'rank',
                  className: 'w-[70px] text-zinc-500',
                },
                {
                  header: 'Expert',
                  cell: (e: any) => (
                    <div className="min-w-0">
                      <div className="font-medium text-zinc-900 truncate">{e.expert_name || '—'}</div>
                      <div className="text-xs text-zinc-500 truncate">{e.expert_user_id ? `ID: ${e.expert_user_id}` : ''}</div>
                    </div>
                  ),
                },
                {
                  header: 'Country',
                  cell: (e: any) => <span className="text-sm text-zinc-700">{e.country || '—'}</span>,
                  className: 'w-[180px]',
                },
                {
                  header: 'Paid',
                  cell: (e: any) => <span className="font-semibold text-zinc-900">{formatMoney(Number(e.paid_amount || 0))}</span>,
                  className: 'w-[140px] text-right',
                },
                {
                  header: 'Invoices',
                  cell: (e: any) => (
                    <span className="text-sm text-zinc-700">{Number(e.paid_invoices_count || 0).toLocaleString()}</span>
                  ),
                  className: 'w-[110px] text-right',
                },
                {
                  header: 'Skills',
                  cell: (e: any) => {
                    const skills = Array.isArray(e.skills) ? (e.skills as string[]).filter(Boolean) : [];
                    const shown = skills.slice(0, 3);
                    const extra = skills.length - shown.length;
                    return (
                      <div className="flex flex-wrap gap-1">
                        {shown.map((s) => (
                          <Badge key={s} variant="secondary" className="bg-zinc-100 text-zinc-700">
                            {s}
                          </Badge>
                        ))}
                        {extra > 0 ? (
                          <Badge variant="secondary" className="bg-zinc-100 text-zinc-700">
                            +{extra}
                          </Badge>
                        ) : null}
                      </div>
                    );
                  },
                },
                {
                  header: '',
                  cell: (e: any) => (
                    <Button asChild variant="link" className="px-0">
                      <Link to={`/admin/users/${e.expert_user_id}`}>View</Link>
                    </Button>
                  ),
                  className: 'w-[80px] text-right',
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
