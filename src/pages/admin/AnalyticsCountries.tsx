import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, Globe2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAdminEarningsAnalytics } from '@/hooks/useAdmin';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function formatMoney(amount: number) {
  const safe = Number.isFinite(amount) ? amount : 0;
  return safe.toLocaleString(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

export default function AnalyticsCountries() {
  // Ask for a larger set of countries; keep experts small to avoid extra work.
  const { data, isLoading, error } = useAdminEarningsAnalytics({
    limitCountries: 250,
    limitExperts: 1,
    limitCountryUsers: 250,
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
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">All Countries</h1>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/analytics">
                <ChevronLeft className="h-4 w-4" /> Back
              </Link>
            </Button>
          </div>
          <p className="text-zinc-500">Failed to load country analytics.</p>
          <pre className="text-xs text-red-600 bg-red-50 border border-red-100 rounded p-3 overflow-auto">{String((error as any)?.message || error)}</pre>
        </div>
      </AdminLayout>
    );
  }

  const topCountriesRaw = data?.top_countries || [];
  const topCountries = topCountriesRaw.map((c: any, idx: number) => ({
    id: c.country || idx,
    ...c,
  }));

  const countryUsersRaw = data?.country_user_counts || [];
  const countryUsers = countryUsersRaw.map((c: any, idx: number) => ({
    id: c.country || idx,
    ...c,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
              <Globe2 className="h-7 w-7 text-emerald-600" />
              All Countries
            </h1>
            <p className="text-zinc-500 mt-2">Ranked by paid invoice amount (expert country).</p>
          </div>

          <Button asChild variant="outline" className="gap-2">
            <Link to="/admin/analytics">
              <ChevronLeft className="h-4 w-4" /> Back
            </Link>
          </Button>
        </div>

        <Card className="border-zinc-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Countries</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="earnings" className="w-full">
              <TabsList>
                <TabsTrigger value="earnings">Earnings</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
              </TabsList>

              <TabsContent value="earnings">
                {topCountries.length ? (
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-zinc-500 border-b">
                          <th className="py-2 pr-4">Country</th>
                          <th className="py-2 pr-4">Paid Amount</th>
                          <th className="py-2 pr-4">Paid Invoices</th>
                          <th className="py-2 pr-4">Unique Experts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topCountries.map((c: any) => (
                          <tr key={c.id} className="border-b last:border-b-0">
                            <td className="py-2 pr-4 font-medium text-zinc-900">{c.country}</td>
                            <td className="py-2 pr-4 text-zinc-900">{formatMoney(Number(c.paid_amount || 0))}</td>
                            <td className="py-2 pr-4 text-zinc-700">{Number(c.paid_invoices_count || 0).toLocaleString()}</td>
                            <td className="py-2 pr-4 text-zinc-700">{Number(c.unique_experts || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">No paid invoice data yet.</div>
                )}
              </TabsContent>

              <TabsContent value="users">
                {countryUsers.length ? (
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-zinc-500 border-b">
                          <th className="py-2 pr-4">Country / Region</th>
                          <th className="py-2 pr-4">Experts</th>
                          <th className="py-2 pr-4">Buyers</th>
                          <th className="py-2 pr-4">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {countryUsers.map((c: any) => (
                          <tr key={c.id} className="border-b last:border-b-0">
                            <td className="py-2 pr-4 font-medium text-zinc-900">{c.country}</td>
                            <td className="py-2 pr-4 text-zinc-700">{Number(c.experts_count || 0).toLocaleString()}</td>
                            <td className="py-2 pr-4 text-zinc-700">{Number(c.buyers_count || 0).toLocaleString()}</td>
                            <td className="py-2 pr-4 text-zinc-900 font-semibold">{Number(c.total_users || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-zinc-500">No user country data yet.</div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
