import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdminUser, useAdminUserContracts, useAdminActions } from '@/hooks/useAdmin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Mail, Calendar, MapPin, DollarSign, ShieldCheck, Ban, AlertTriangle, Briefcase, FileSignature, Clock, Lightbulb, FileText, Package, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';

const getFileNameFromUrl = (url: string) => {
  if (!url) return 'Unknown Link';
  try {
    const decodedUrl = decodeURIComponent(url);
    const parts = decodedUrl.split('/');
    const lastPart = parts[parts.length - 1];
    if (lastPart.trim() === '') return parts[parts.length - 2] || url;
    return lastPart.split('?')[0];
  } catch (e) {
    return url;
  }
};

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const { data: user, isLoading } = useAdminUser(id || '');
  const { data: contracts, isLoading: isLoadingContracts } = useAdminUserContracts(id || '');
  const { banUser, unbanUser, verifyExpert, updateExpertStatus, isActing } = useAdminActions();
  
  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState('');
  const [showExpertDialog, setShowExpertDialog] = useState(false);
  const [expertStatus, setExpertStatus] = useState<string>('');
  const [vettingLevel, setVettingLevel] = useState<string>('');

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">Loading user profile...</div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold">User not found</h2>
          <Button variant="link" onClick={() => navigate('/admin/users')}>Back to Users</Button>
        </div>
      </AdminLayout>
    );
  }

  const roles: string[] = Array.isArray((user as any).roles)
    ? ((user as any).roles as any[]).map((r) => String(r).toLowerCase())
    : (user.role ? [String(user.role).toLowerCase()] : []);
  const isExpert = roles.includes('expert');

  const expertDocuments: any[] = Array.isArray((user as any).expert_documents)
    ? (user as any).expert_documents
    : [];
  const resumeDocs = expertDocuments.filter((d) => String(d?.document_type || '').toLowerCase() === 'resume');
  const otherDocs = expertDocuments.filter((d) => String(d?.document_type || '').toLowerCase() !== 'resume');

  const effectiveExpertStatus = expertStatus || user.expert_status || '';
  const effectiveVettingLevel = vettingLevel || user.vetting_level || '';

  const contractColumns = [
    {
      header: 'Contract',
      accessorKey: 'id',
      className: 'font-mono text-xs',
      cell: (item: any) => `#${item.id.slice(0,8)}`
    },
    {
      header: 'Project',
      accessorKey: 'project_title',
      className: 'font-medium max-w-[200px] truncate',
      cell: (item: any) => item.project_title
    },
    {
      header: 'Type',
      cell: (item: any) => <Badge variant="outline" className="capitalize">{item.engagement_model}</Badge>
    },
    {
      header: 'Amount',
      cell: (item: any) => <span className="font-mono text-sm">${Number(item.total_amount).toLocaleString()}</span>
    },
    {
      header: 'Status',
      cell: (item: any) => (
        <Badge className={item.status === 'active' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
          {item.status}
        </Badge>
      )
    },
    {
      header: 'Date',
      cell: (item: any) => item.created_at ? format(new Date(item.created_at), 'MMM d, yyyy') : '-'
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate('/admin/users')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-zinc-900">User Profile</h1>
          <div className="ml-auto flex gap-2">
            {user.is_banned && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => unbanUser(user.id)}
                disabled={isActing}
              >
                Reactivate / Unban
              </Button>
            )}

            {isExpert && (
              <Button
                variant="outline"
                onClick={() => {
                  setExpertStatus(user.expert_status || 'pending_review');
                  setVettingLevel(user.vetting_level || 'general');
                  setShowExpertDialog(true);
                }}
                disabled={isActing}
              >
                Update Vetting
              </Button>
            )}

            {isExpert && user.expert_status === 'pending_review' && !user.is_banned && (
              <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => verifyExpert(user.id)} disabled={isActing}>
                <ShieldCheck className="mr-2 h-4 w-4" /> Verify Expert
              </Button>
            )}
            {!user.is_banned && (
              <Button variant="destructive" onClick={() => setShowBanDialog(true)} disabled={isActing}>
                <Ban className="mr-2 h-4 w-4" /> Ban User
              </Button>
            )}
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24 border-2 border-zinc-100">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-2xl bg-zinc-900 text-white">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-900">
                        {user.first_name} {user.last_name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex flex-wrap gap-1">
                          {(roles.length ? roles : [String(user.role || 'buyer')]).map((r) => (
                            <Badge key={r} variant="outline" className="capitalize">{r}</Badge>
                          ))}
                        </div>
                        {user.is_banned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">Active</Badge>
                        )}
                        {isExpert && user.expert_status && (
                          <Badge variant={user.expert_status === 'verified' ? 'default' : 'secondary'} className="capitalize bg-emerald-50 text-emerald-700 border-emerald-200">
                            {user.expert_status.replace('_', ' ')}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-sm text-zinc-600 pt-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-zinc-400" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      Joined {format(new Date(user.joined), 'MMM d, yyyy')}
                    </div>
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-zinc-400" />
                        {user.location}
                      </div>
                    )}
                  </div>

                  {isExpert && (
                    <div className="pt-4 mt-4 border-t border-zinc-100 grid grid-cols-3 gap-4">
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">Daily Rate</p>
                            <p className="font-semibold text-zinc-900">${user.avg_daily_rate || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">Sprint Rate</p>
                            <p className="font-semibold text-zinc-900">${user.avg_sprint_rate || 0}</p>
                        </div>
                        <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">Fixed Rate</p>
                            <p className="font-semibold text-zinc-900">${user.avg_fixed_rate || 0}</p>
                        </div>
                    </div>
                  )}

                  {isExpert && user.experience_summary && (
                    <div className="pt-4 mt-4 border-t border-zinc-100">
                      <h4 className="text-sm font-semibold mb-1 text-zinc-900">Bio / Experience</h4>
                      <p className="text-sm text-zinc-600 leading-relaxed">{user.experience_summary}</p>
                    </div>
                  )}

                  {isExpert && (resumeDocs.length > 0 || otherDocs.length > 0) && (
                    <div className="pt-4 mt-4 border-t border-zinc-100 space-y-3">
                      {resumeDocs.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1 text-zinc-900">Resume</h4>
                          <div className="space-y-2">
                            {resumeDocs.map((doc, idx) => (
                              <a
                                key={doc?.id || idx}
                                href={doc?.file_url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
                              >
                                <ExternalLink className="h-4 w-4" />
                                {getFileNameFromUrl(doc?.file_url)}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {otherDocs.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold mb-1 text-zinc-900">Documents</h4>
                          <div className="space-y-2">
                            {otherDocs.map((doc, idx) => (
                              <div key={doc?.id || idx} className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-2 text-sm text-zinc-700">
                                  <FileText className="h-4 w-4 text-zinc-400" />
                                  <span className="capitalize">{String(doc?.document_type || 'document').replace('_', ' ')}</span>
                                  <span className="text-zinc-400">·</span>
                                  <span className="text-zinc-500 truncate max-w-[260px]">{getFileNameFromUrl(doc?.file_url)}</span>
                                </div>
                                {doc?.file_url && (
                                  <a
                                    href={doc.file_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-sm text-primary hover:underline inline-flex items-center gap-1"
                                  >
                                    View <ExternalLink className="h-3.5 w-3.5" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {isExpert && user.skills && user.skills.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {user.skills.map((skill: string, i: number) => (
                        <Badge key={i} variant="secondary" className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Side Card */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-500 uppercase">Platform Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-emerald-50 rounded-md">
                      <DollarSign className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-medium">{isExpert ? 'Total Earnings' : 'Total Spent'}</span>
                  </div>
                  <span className="text-lg font-bold">${Number(user.total_volume || 0).toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-50 rounded-md">
                      <Briefcase className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-medium">Projects</span>
                  </div>
                  <span className="font-bold">{user.project_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-purple-50 rounded-md">
                      <FileSignature className="h-4 w-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium">Contracts</span>
                  </div>
                  <span className="font-bold">{user.contract_count || 0}</span>
                </div>
              </CardContent>
            </Card>

            {user.is_banned && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-900 text-sm">Account Suspended</h4>
                      <p className="text-red-700 text-sm mt-1">
                        Reason: {user.ban_reason || 'Violation of Terms'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {isExpert && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 uppercase">User Scoring</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Overall</span>
                    <span className="font-bold text-zinc-900">{Number(user.overall_score || 0).toFixed(1)}</span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Expertise</span>
                    <span className="font-medium">{Number(user.expertise_score || 0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Performance</span>
                    <span className="font-medium">{Number(user.performance_score || 0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Reliability</span>
                    <span className="font-medium">{Number(user.reliability_score || 0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Quality</span>
                    <span className="font-medium">{Number(user.quality_score || 0).toFixed(1)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Engagement</span>
                    <span className="font-medium">{Number(user.engagement_score || 0).toFixed(1)}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Tabs for detailed lists */}
        <Tabs defaultValue="contracts" className="w-full">
          <TabsList className="bg-white border border-zinc-200">
            <TabsTrigger value="contracts">Contracts</TabsTrigger>
            {user.role === 'buyer' && <TabsTrigger value="projects">Projects</TabsTrigger>}
            {isExpert && (
              <>
                <TabsTrigger value="patents">Patents</TabsTrigger>
                <TabsTrigger value="papers">Papers</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
              </>
            )}
          </TabsList>
          
          <TabsContent value="contracts" className="mt-4">
            <DataTable 
              columns={contractColumns} 
              data={contracts || []} 
              isLoading={isLoadingContracts} 
            />
          </TabsContent>
          
           <TabsContent value="projects" className="mt-4">
             <Card>
              <CardContent className="p-8 text-center text-zinc-500">
                <Briefcase className="h-10 w-10 mx-auto mb-3 text-zinc-300" />
                <p>Projects list view implementation pending.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {isExpert && (
            <>
              <TabsContent value="patents" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-zinc-100">
                      {user.patents?.map((url: string, i: number) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50">
                          <div className="flex items-start gap-3 w-full">
                            <div className="p-2 bg-amber-50 rounded text-amber-600 mt-1">
                              <Lightbulb className="h-4 w-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-medium text-zinc-900 hover:underline hover:text-blue-600 flex items-center gap-2"
                              >
                                <span className="truncate">{getFileNameFromUrl(url)}</span>
                                <ExternalLink className="h-3 w-3 text-zinc-400" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!user.patents || user.patents.length === 0) && <div className="p-8 text-center text-zinc-500">No patents found.</div>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="papers" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-zinc-100">
                      {user.papers?.map((url: string, i: number) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50">
                          <div className="flex items-start gap-3 w-full">
                            <div className="p-2 bg-blue-50 rounded text-blue-600 mt-1">
                              <FileText className="h-4 w-4" />
                            </div>
                             <div className="flex-1 min-w-0">
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-medium text-zinc-900 hover:underline hover:text-blue-600 flex items-center gap-2"
                              >
                                <span className="truncate">{getFileNameFromUrl(url)}</span>
                                <ExternalLink className="h-3 w-3 text-zinc-400" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                       {(!user.papers || user.papers.length === 0) && <div className="p-8 text-center text-zinc-500">No papers found.</div>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="products" className="mt-4">
                <Card>
                  <CardContent className="p-0">
                    <div className="divide-y divide-zinc-100">
                      {user.products?.map((url: string, i: number) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-zinc-50">
                          <div className="flex items-start gap-3 w-full">
                            <div className="p-2 bg-purple-50 rounded text-purple-600 mt-1">
                              <Package className="h-4 w-4" />
                            </div>
                             <div className="flex-1 min-w-0">
                              <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="font-medium text-zinc-900 hover:underline hover:text-blue-600 flex items-center gap-2"
                              >
                                <span className="truncate">{getFileNameFromUrl(url)}</span>
                                <ExternalLink className="h-3 w-3 text-zinc-400" />
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                       {(!user.products || user.products.length === 0) && <div className="p-8 text-center text-zinc-500">No products found.</div>}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>

      {/* Ban Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Ban User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to ban <strong>{user.first_name} {user.last_name}</strong>?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Ban</Label>
              <Textarea
                id="reason"
                placeholder="e.g. Repeated TOS violations..."
                value={banReason}
                onChange={(e: any) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowBanDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => {
              await banUser(user.id, banReason);
              setShowBanDialog(false);
            }} disabled={isActing}>
              {isActing ? 'Banning...' : 'Confirm Ban'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expert Vetting Dialog */}
      <Dialog open={showExpertDialog} onOpenChange={setShowExpertDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Update Expert Vetting</DialogTitle>
            <DialogDescription>
              Set the expert's vetting level and status. This directly updates the expert profile.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Expert Status</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={effectiveExpertStatus}
                onChange={(e) => setExpertStatus(e.target.value)}
              >
                <option value="incomplete">incomplete</option>
                <option value="pending_review">pending_review</option>
                <option value="rookie">rookie</option>
                <option value="verified">verified</option>
                <option value="rejected">rejected</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Vetting Level</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={effectiveVettingLevel}
                onChange={(e) => setVettingLevel(e.target.value)}
              >
                <option value="general">general</option>
                <option value="advanced">advanced</option>
                <option value="deep_tech_verified">deep_tech_verified</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowExpertDialog(false)} disabled={isActing}>Cancel</Button>
            <Button
              onClick={async () => {
                await updateExpertStatus(user.id, {
                  expert_status: effectiveExpertStatus,
                  vetting_level: effectiveVettingLevel,
                });
                setShowExpertDialog(false);
              }}
              disabled={isActing || !effectiveExpertStatus || !effectiveVettingLevel}
            >
              {isActing ? 'Saving…' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}