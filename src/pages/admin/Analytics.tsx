import { DEFAULT_CURRENCY } from '@/lib/currency';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, BarChart3, Globe2, Crown, Users, Receipt, ChevronRight, Layers } from 'lucide-react';
import { useAdminEarningsAnalytics } from '@/hooks/useAdmin';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { domainLabels } from '@/lib/constants';

function formatMoney(amount: number) {
  const safe = Number.isFinite(amount) ? amount : 0;
  return safe.toLocaleString(undefined, { style: 'currency', currency: DEFAULT_CURRENCY, maximumFractionDigits: 2 });
}

export default function Analytics() {
  const { data, isLoading, error } = useAdminEarningsAnalytics({
    limitCountries: 10,
    limitExperts: 10,
    limitDomains: 10,
  });

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
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Analytics</h1>
          <p className="text-zinc-500">Failed to load analytics.</p>
          <pre className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-3 overflow-auto">{String((error as any)?.message || error)}</pre>
        </div>
      </AdminLayout>
    );
  }

  const totals = data?.totals || {
    paid_invoices_count: 0,
    paid_amount_total: 0,
    avg_paid_invoice_amount: 0,
    unique_experts_paid: 0,
    unique_buyers_paid: 0,
  };

  const highest = data?.highest_earner;
  const topGeo = data?.top_geography;
  const topCountries = data?.top_countries || [];
  const topExperts = data?.top_experts || [];
  const topDomains = (data?.top_domains || []).filter((d: any) => {
    const key = String(d?.domain || '');
    return Boolean(domainLabels?.[key as keyof typeof domainLabels]);
  });

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-emerald-600" />
              Analytics
            </h1>
            <p className="text-zinc-500 mt-2">Earnings analytics based on paid invoices only.</p>
          </div>

          <div className="flex items-center gap-2">
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/analytics/countries">
                All Countries <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/analytics/earners">
                All Earners <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/analytics/domains">
                All Domains <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Paid Revenue</CardTitle>
              <Receipt className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">{formatMoney(totals.paid_amount_total)}</div>
              <p className="text-xs text-zinc-500 mt-1">Total from paid invoices</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Paid Invoices</CardTitle>
              <Receipt className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">{Number(totals.paid_invoices_count || 0).toLocaleString()}</div>
              <p className="text-xs text-zinc-500 mt-1">Avg {formatMoney(totals.avg_paid_invoice_amount)}</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Paid Experts</CardTitle>
              <Users className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">{Number(totals.unique_experts_paid || 0).toLocaleString()}</div>
              <p className="text-xs text-zinc-500 mt-1">Unique experts with paid invoices</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-zinc-600">Paid Buyers</CardTitle>
              <Users className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-zinc-900">{Number(totals.unique_buyers_paid || 0).toLocaleString()}</div>
              <p className="text-xs text-zinc-500 mt-1">Unique buyers who paid invoices</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Globe2 className="h-4 w-4 text-emerald-600" /> Top Geography
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {topGeo ? (
                <>
                  <div className="text-lg font-bold text-zinc-900">{topGeo.country}</div>
                  <div className="text-sm text-zinc-600">Paid amount: <span className="font-semibold text-zinc-900">{formatMoney(topGeo.paid_amount)}</span></div>
                  <div className="text-sm text-zinc-600">Paid invoices: <span className="font-semibold text-zinc-900">{Number(topGeo.paid_invoices_count || 0).toLocaleString()}</span></div>
                  <div className="text-sm text-zinc-600">Unique experts: <span className="font-semibold text-zinc-900">{Number(topGeo.unique_experts || 0).toLocaleString()}</span></div>
                </>
              ) : (
                <div className="text-sm text-zinc-500">No paid invoices yet.</div>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Crown className="h-4 w-4 text-amber-600" /> Highest Earner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {highest ? (
                <>
                  <div className="space-y-1">
                    <div className="text-lg font-bold text-zinc-900">{highest.expert_name}</div>
                    <div className="text-sm text-zinc-600">Country: <span className="font-semibold text-zinc-900">{highest.country}</span></div>
                    <div className="text-sm text-zinc-600">Paid amount: <span className="font-semibold text-zinc-900">{formatMoney(highest.paid_amount)}</span></div>
                    <div className="text-sm text-zinc-600">Paid invoices: <span className="font-semibold text-zinc-900">{Number(highest.paid_invoices_count || 0).toLocaleString()}</span></div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(highest.skills || []).length ? (
                      highest.skills.slice(0, 12).map((s: string) => (
                        <Badge key={s} variant="secondary" className="bg-zinc-100 text-zinc-700">
                          {s}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-zinc-500">No skills listed</span>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-sm text-zinc-500">No paid invoices yet.</div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold">Top Earners</CardTitle>
              <Button asChild variant="ghost" size="icon" title="View all earners">
                <Link to="/admin/analytics/earners">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {topExperts.length ? (
                <div className="space-y-2">
                  {topExperts.map((e: any) => (
                    <div key={e.expert_user_id} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 truncate">{e.expert_name}</div>
                        <div className="text-xs text-zinc-500">{e.country} • {Number(e.paid_invoices_count || 0).toLocaleString()} invoices</div>
                      </div>
                      <div className="font-semibold text-zinc-900">{formatMoney(e.paid_amount)}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-zinc-500">No data.</div>
              )}
            </CardContent>
          </Card>
          <Card className="border-zinc-200 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-indigo-600" /> Top Domains (Contracts)
              </CardTitle>
              <Button asChild variant="ghost" size="icon" title="View all domains">
                <Link to="/admin/analytics/domains">
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {topDomains.length ? (
                <div className="space-y-2">
                  {topDomains.map((d: any) => (
                    <div key={d.domain} className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="font-medium text-zinc-900 truncate">
                          {domainLabels?.[d.domain as keyof typeof domainLabels] || '—'}
                        </div>
                        <div className="text-xs text-zinc-500">{Number(d.experts_count || 0).toLocaleString()} experts</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-zinc-900">{Number(d.contracts_count || 0).toLocaleString()}</div>
                        <div className="text-xs text-zinc-500">{Number(d.active_contracts_count || 0).toLocaleString()} active</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-sm text-zinc-500">No data.</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
