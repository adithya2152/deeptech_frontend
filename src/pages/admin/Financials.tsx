import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminStats, useAdminPayouts, useAdminActions } from '@/hooks/useAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Download, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTable } from '@/components/admin/DataTable';
import { format } from 'date-fns';

export default function Financials() {
  const { data: stats } = useAdminStats();
  const { data: payouts, isLoading } = useAdminPayouts(); 
  const { processPayout, isActing } = useAdminActions();

  const columns = [
    { 
      header: 'ID', 
      accessorKey: 'id' as const, 
      className: 'font-mono text-xs text-zinc-400',
      cell: (item: any) => item.id.slice(0, 8)
    },
    { 
      header: 'User', 
      cell: (item: any) => (
        <div>
          <div className="font-medium">{item.user_name}</div>
          <div className="text-xs text-zinc-500">{item.email}</div>
        </div>
      )
    },
    { 
      header: 'Amount', 
      cell: (item: any) => <span className="font-medium">${Number(item.amount).toLocaleString()}</span> 
    },
    { 
      header: 'Method', 
      accessorKey: 'method' as const,
      cell: (item: any) => <span className="capitalize text-zinc-600">{item.method}</span>
    },
    { 
        header: 'Status', 
        accessorKey: 'status' as const,
        cell: (item: any) => (
            <span className={`text-xs px-2 py-1 rounded-full capitalize ${
                item.status === 'processed' ? 'bg-emerald-100 text-emerald-700' :
                item.status === 'pending' ? 'bg-amber-100 text-amber-700' : 
                'bg-red-100 text-red-700'
            }`}>
                {item.status}
            </span>
        )
    },
    { 
      header: 'Date', 
      cell: (item: any) => format(new Date(item.created_at), 'MMM d, yyyy')
    },
    {
      header: 'Action',
      cell: (item: any) => (
        item.status === 'pending' ? (
          <Button 
            size="sm" 
            className="h-7 bg-emerald-600 hover:bg-emerald-700"
            onClick={() => processPayout(item.id)}
            disabled={isActing}
          >
            Approve
          </Button>
        ) : (
          <span className="text-zinc-400">-</span>
        )
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">Financial Overview</h1>
            <p className="text-zinc-500">Monitor revenue, escrow holdings, and payouts.</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export Report
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-emerald-900 text-white border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-emerald-200">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold flex items-center gap-2">
                ${stats?.totalRevenue?.toLocaleString() || '0'}
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-300 mt-1">Platform earnings to date</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">Active Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-900">{stats?.activeContracts || 0}</div>
              <p className="text-xs text-zinc-500 mt-1">Ongoing engagements</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-zinc-500">Pending Payouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-zinc-900">
                {payouts?.filter((p: any) => p.status === 'pending').length || 0}
              </div>
              <p className="text-xs text-zinc-500 mt-1">Requests awaiting approval</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="payouts" className="w-full">
          <TabsList>
            <TabsTrigger value="payouts">Payout Requests</TabsTrigger>
            <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          </TabsList>
          <TabsContent value="payouts" className="mt-4">
             <DataTable 
                columns={columns} 
                data={payouts?.filter((p: any) => p.status === 'pending') || []} 
                isLoading={isLoading} 
             />
             {(!payouts || payouts.filter((p: any) => p.status === 'pending').length === 0) && !isLoading && (
                <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-zinc-200 rounded-lg">
                    <Wallet className="h-10 w-10 text-zinc-300 mb-3" />
                    <p className="text-zinc-500">No pending payout requests requiring manual approval.</p>
                </div>
             )}
          </TabsContent>
          <TabsContent value="transactions" className="mt-4">
             <DataTable 
                columns={columns} 
                data={payouts || []} 
                isLoading={isLoading} 
             />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}