import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  FileSignature,
  Gavel,
  DollarSign,
  LogOut,
  Flag,
  Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'User Governance', href: '/admin/users' },
  { icon: Briefcase, label: 'Project Moderation', href: '/admin/projects' },
  { icon: FileSignature, label: 'Contract Oversight', href: '/admin/contracts' },
  { icon: Flag, label: 'Safety & Reports', href: '/admin/reports' },
  { icon: Gavel, label: 'Dispute Resolution', href: '/admin/disputes' },
  { icon: DollarSign, label: 'Financials', href: '/admin/financials' },
  { icon: Trophy, label: 'Leaderboards', href: '/admin/leaderboards' },
];

export function AdminSidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="w-64 bg-zinc-900 text-zinc-300 min-h-screen flex flex-col border-r border-zinc-800 shrink-0 sticky top-0 h-screen">
      <div className="p-6 border-b border-zinc-800">
        <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-emerald-500" />
          Admin Panel
        </h2>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.href} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 mb-1 font-medium transition-all duration-200",
                  isActive
                    ? "bg-zinc-800 text-white shadow-sm border border-zinc-700/50"
                    : "hover:bg-zinc-800/50 hover:text-white text-zinc-400"
                )}
              >
                <item.icon className={cn("h-4 w-4", isActive ? "text-emerald-400" : "text-zinc-500")} />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-zinc-800">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-950/30"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}