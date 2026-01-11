import GoogleTranslate from '@/components/shared/GoogleTranslate';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Menu, X, User, Settings, LogOut, Briefcase, Search, LayoutDashboard,
  FileText, MessageSquare, Globe, RefreshCcw, Inbox
} from 'lucide-react';
import { useState } from 'react';
import { useQuery } from "@tanstack/react-query";
import { expertsApi } from "@/lib/api";

export function Navbar() {
  const { user, profile, isAuthenticated, token, logout, switchRole } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const role = profile?.role || user?.role;
  const isBuyer = role === "buyer";
  const isExpert = role === "expert";
  const isAdmin = role === "admin";

  const { data: expertData } = useQuery({
    queryKey: ["expertNavbar", user?.id],
    queryFn: () => expertsApi.getById(user!.id, token!),
    enabled: !!user?.id && !!token && isExpert,
  });

  const expertStatus = expertData?.data?.expert_status;
  const canUseExpertApp = !isExpert || expertStatus === "verified";

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleConfirmSwitchRole = async () => {
    await switchRole();
    setMobileMenuOpen(false);
  };

  const getInitials = (first_name: string | null, last_name: string | null) => {
    const f = first_name ? first_name[0] : '';
    const l = last_name ? last_name[0] : '';
    return (f + l).toUpperCase() || 'U';
  };

  const avatarUrl = profile?.avatar_url || user?.avatar_url;

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between relative">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary shadow-sm">
              <span className="text-lg font-bold text-primary-foreground">D</span>
            </div>
            <span className="font-display text-xl font-bold text-foreground">DeepTech</span>
          </Link>

          <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-6">
            {isAuthenticated ? (
              <>
                {isBuyer && (
                  <>
                    <Link to="/experts" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Find Experts</Link>
                    <Link to="/projects" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">My Projects</Link>
                    <Link to="/contracts" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">My Contracts</Link>
                  </>
                )}
                {isExpert && (
                  <>
                    <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!canUseExpertApp} onClick={() => canUseExpertApp && navigate("/marketplace")}>Find Work</button>
                    <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!canUseExpertApp} onClick={() => canUseExpertApp && navigate("/proposals")}>Proposals</button>
                    <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={!canUseExpertApp} onClick={() => canUseExpertApp && navigate("/contracts")}>Active Contracts</button>
                  </>
                )}
                {isAdmin && (
                  <Link to="/admin" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Admin Panel</Link>
                )}
              </>
            ) : (
              <>
                <Link to="/experts" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Browse Experts</Link>
                <Link to="/how-it-works" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">How It Works</Link>
              </>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <div className="flex items-center gap-2 mr-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <GoogleTranslate />
            </div>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 overflow-hidden ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 hover:bg-muted">
                    <Avatar className="h-10 w-10 border border-border shadow-sm">
                      <AvatarImage src={avatarUrl} className="object-cover" />
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                        {getInitials(user?.first_name ?? null, user?.last_name ?? null)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <div className="flex items-center gap-3 p-3">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarImage src={avatarUrl} className="object-cover" />
                      <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
                        {getInitials(user?.first_name ?? null, user?.last_name ?? null)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                      <p className="text-sm font-bold truncate leading-none mb-1">{user?.first_name} {user?.last_name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{user?.role}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />

                  {!isAdmin && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-pointer">
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Switch to {isBuyer ? 'Selling' : 'Buying'}
                        </DropdownMenuItem>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Switch roles?</AlertDialogTitle>
                          <AlertDialogDescription>
                            You’re about to switch to {isBuyer ? 'Selling (Expert)' : 'Buying (Client)'} mode. Your active permissions will update immediately.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={handleConfirmSwitchRole}>Switch</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => navigate('/dashboard')}><LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}><User className="mr-2 h-4 w-4" /> Profile</DropdownMenuItem>

                  {isBuyer && <DropdownMenuItem onClick={() => navigate('/projects/new')}><FileText className="mr-2 h-4 w-4" /> Create Project</DropdownMenuItem>}
                  <DropdownMenuItem disabled={isExpert && !canUseExpertApp} onClick={() => canUseExpertApp && navigate("/messages")}><MessageSquare className="mr-2 h-4 w-4" /> Messages</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/settings')}><Settings className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive focus:bg-destructive/10"><LogOut className="mr-2 h-4 w-4" /> Log Out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log In</Button>
                <Button size="sm" onClick={() => navigate('/register')} className="gradient-primary">Get Started</Button>
              </div>
            )}
          </div>

          <button className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background animate-in slide-in-from-top-1">
          <div className="px-4 py-4 space-y-3">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-2 py-3 mb-2 bg-muted/50 rounded-xl">
                  <Avatar className="h-12 w-12 border border-border shadow-sm">
                    <AvatarImage src={avatarUrl} className="object-cover" />
                    <AvatarFallback className="bg-primary text-primary-foreground font-bold">{getInitials(user?.first_name ?? null, user?.last_name ?? null)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm font-bold truncate">{user?.first_name} {user?.last_name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                  </div>
                </div>

                {!isAdmin && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-sm font-medium w-full text-left text-blue-600 bg-blue-50">
                        <RefreshCcw className="h-5 w-5" /> Switch to {isBuyer ? 'Selling' : 'Buying'}
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Switch roles?</AlertDialogTitle>
                        <AlertDialogDescription>
                          You’re about to switch to {isBuyer ? 'Selling (Expert)' : 'Buying (Client)'} mode. Your active permissions will update immediately.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmSwitchRole}>Switch</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}

                <Link to="/dashboard" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-sm font-medium" onClick={() => setMobileMenuOpen(false)}><LayoutDashboard className="h-5 w-5 text-muted-foreground" /> Dashboard</Link>
                {isBuyer && (
                  <>
                    <Link to="/experts" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-sm font-medium" onClick={() => setMobileMenuOpen(false)}><Search className="h-5 w-5 text-muted-foreground" /> Find Experts</Link>
                    <Link to="/projects" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-sm font-medium" onClick={() => setMobileMenuOpen(false)}><Briefcase className="h-5 w-5 text-muted-foreground" /> My Projects</Link>
                    <Link to="/contracts" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-sm font-medium" onClick={() => setMobileMenuOpen(false)}><FileText className="h-5 w-5 text-muted-foreground" /> My Contracts</Link>
                  </>
                )}
                {isExpert && (
                  <>
                    <Link to="/marketplace" className={`flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-sm font-medium ${!canUseExpertApp ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => setMobileMenuOpen(false)}><Globe className="h-5 w-5 text-muted-foreground" /> Find Work</Link>
                    <Link to="/proposals" className={`flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-sm font-medium ${!canUseExpertApp ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => setMobileMenuOpen(false)}><Inbox className="h-5 w-5 text-muted-foreground" /> Proposals</Link>
                    <Link to="/contracts" className={`flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-sm font-medium ${!canUseExpertApp ? 'opacity-50 pointer-events-none' : ''}`} onClick={() => setMobileMenuOpen(false)}><FileText className="h-5 w-5 text-muted-foreground" /> Active Contracts</Link>
                  </>
                )}
                <Link to="/profile" className="flex items-center gap-2 p-3 rounded-lg hover:bg-muted text-sm font-medium" onClick={() => setMobileMenuOpen(false)}><User className="h-5 w-5 text-muted-foreground" /> Profile</Link>
                <div className="h-px bg-border my-2" />
                <button onClick={() => { handleLogout(); setMobileMenuOpen(false); }} className="flex items-center gap-2 p-3 rounded-lg hover:bg-destructive/10 w-full text-destructive text-sm font-bold"><LogOut className="h-5 w-5" /> Log Out</button>
              </>
            ) : (
              <>
                <Link to="/experts" className="block p-3 rounded-lg hover:bg-muted text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>Browse Experts</Link>
                <Link to="/how-it-works" className="block p-3 rounded-lg hover:bg-muted text-sm font-medium" onClick={() => setMobileMenuOpen(false)}>How It Works</Link>
                <div className="pt-3 flex flex-col gap-2">
                  <Button variant="outline" className="w-full" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>Log In</Button>
                  <Button className="w-full gradient-primary" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>Get Started</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}