import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { DataTable } from '@/components/admin/DataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MoreHorizontal, ShieldCheck, Ban, Search, MailPlus, AlertTriangle, CheckCircle2, Eye } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useAdminActions, useAdminUsers } from '@/hooks/useAdmin';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function UserManagement() {
  const { banUser, unbanUser, verifyExpert, inviteAdmin, isActing } = useAdminActions();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  
  const [inviteEmail, setInviteEmail] = useState('');
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const [showBanDialog, setShowBanDialog] = useState(false);
  const [userToBan, setUserToBan] = useState<any>(null);
  const [banReason, setBanReason] = useState('');

  const [showUnbanDialog, setShowUnbanDialog] = useState(false);
  const [userToUnban, setUserToUnban] = useState<any>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: users, isLoading } = useAdminUsers(debouncedSearch, roleFilter);

  const handleBanClick = (user: any) => {
    setUserToBan(user);
    setBanReason('');
    setShowBanDialog(true);
  };

  const handleUnbanClick = (user: any) => {
    setUserToUnban(user);
    setShowUnbanDialog(true);
  };

  const confirmBan = async () => {
    if (!userToBan) return;
    const success = await banUser(userToBan.id, banReason || 'Violation of Terms of Service');
    if (success) {
        setShowBanDialog(false);
        setUserToBan(null);
    }
  };

  const confirmUnban = async () => {
    if (!userToUnban) return;
    const success = await unbanUser(userToUnban.id);
    if (success) {
        setShowUnbanDialog(false);
        setUserToUnban(null);
    }
  };

  const columns = [
    {
      header: 'User',
      accessorKey: 'name' as const,
      cell: (item: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-zinc-900">{item.name || 'Unknown'}</span>
          <span className="text-xs text-zinc-500">{item.email}</span>
        </div>
      )
    },
    {
      header: 'Role',
      accessorKey: 'role' as const,
      cell: (item: any) => (
        <Badge variant="outline" className="capitalize">
          {item.role}
        </Badge>
      )
    },
    {
      header: 'Status',
      cell: (item: any) => {
        let statusLabel = 'Active';
        let style = "bg-blue-50 text-blue-700 border-blue-200";

        if (item.is_banned) {
            statusLabel = 'Banned';
            style = "bg-red-50 text-red-700 border-red-200";
        } else if (item.role === 'expert') {
            const status = item.expert_status || 'incomplete'; // Use new field
            
            if (status === 'verified') {
                statusLabel = 'Verified';
                style = "bg-emerald-100 text-emerald-700 border-emerald-200";
            } else if (status === 'pending_review') {
                statusLabel = 'Pending Review';
                style = "bg-amber-50 text-amber-700 border-amber-200";
            } else if (status === 'rejected') {
                statusLabel = 'Rejected';
                style = "bg-red-50 text-red-700 border-red-200";
            } else {
                statusLabel = 'Incomplete';
                style = "bg-zinc-100 text-zinc-500 border-zinc-200";
            }
        }

        return (
          <Badge className={style}>
            {statusLabel}
          </Badge>
        );
      }
    },
    {
      header: 'Volume',
      cell: (item: any) => (
        <span className="font-mono text-sm">
          ${Number(item.volume || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Joined',
      cell: (item: any) => item.joined ? format(new Date(item.joined), 'MMM d, yyyy') : '-'
    },
    {
      header: 'Actions',
      cell: (item: any) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Manage User</DropdownMenuLabel>
            
            {/* View Profile is the primary action now */}
            <DropdownMenuItem onClick={() => window.location.href = `/admin/users/${item.id}`}>
              <Eye className="mr-2 h-4 w-4 text-zinc-500" /> View Profile Details
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            {item.is_banned ? (
                <DropdownMenuItem className="text-emerald-600 focus:text-emerald-600" onClick={() => handleUnbanClick(item)} disabled={isActing}>
                    <CheckCircle2 className="mr-2 h-4 w-4" /> Activate / Unban
                </DropdownMenuItem>
            ) : (
                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleBanClick(item)} disabled={isActing}>
                    <Ban className="mr-2 h-4 w-4" /> Ban / Suspend
                </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">User Governance</h1>
            <p className="text-zinc-500">Manage buyers, experts, and platform administrators.</p>
          </div>
          
          <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
            <DialogTrigger asChild>
              <Button>
                <MailPlus className="mr-2 h-4 w-4" /> Invite Admin
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite New Administrator</DialogTitle>
                <DialogDescription>
                  This will create a new admin account. The user will need to reset their password to log in.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input 
                        placeholder="admin@example.com" 
                        value={inviteEmail} 
                        onChange={(e) => setInviteEmail(e.target.value)} 
                    />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={async () => {
                  await inviteAdmin(inviteEmail);
                  setShowInviteDialog(false);
                  setInviteEmail('');
                }} disabled={isActing}>
                  Send Invitation
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Ban Dialog */}
        <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" /> Ban User
                    </DialogTitle>
                    <DialogDescription>
                        Are you sure you want to ban <strong>{userToBan?.name}</strong>? This action will revoke their access immediately.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="reason">Reason for Ban</Label>
                        <Textarea
                            id="reason"
                            placeholder="e.g. Repeated TOS violations, Fraudulent activity..."
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setShowBanDialog(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={confirmBan} disabled={isActing}>
                        {isActing ? 'Banning...' : 'Confirm Ban'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Unban Dialog */}
        <Dialog open={showUnbanDialog} onOpenChange={setShowUnbanDialog}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-emerald-600">
                        <CheckCircle2 className="h-5 w-5" /> Unban User
                    </DialogTitle>
                    <DialogDescription>
                        This will restore access for <strong>{userToUnban?.name}</strong> immediately.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="ghost" onClick={() => setShowUnbanDialog(false)}>Cancel</Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={confirmUnban} disabled={isActing}>
                        {isActing ? 'Activating...' : 'Confirm Reactivation'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Search by name or email..." 
              className="pl-9"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="expert">Experts Only</SelectItem>
              <SelectItem value="buyer">Buyers Only</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DataTable columns={columns} data={users || []} isLoading={isLoading} />
      </div>
    </AdminLayout>
  );
}