import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// --- Admin Pages ---
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import UserDetails from "./pages/admin/UserDetails";
import ProjectModeration from "./pages/admin/ProjectModeration";
import ContractOversight from "./pages/admin/ContractOversight";
import DisputeResolution from "./pages/admin/DisputeResolution";
import ReportManagement from "./pages/admin/ReportManagement";
import Financials from "./pages/admin/Financials";
import AdminLeaderboards from "./pages/admin/Leaderboards";
import DashboardPage from "./pages/dashboard/DashboardPage";
import MarketplacePage from "@/pages/marketplace/MarketplacePage";
import ProfilePage from "./pages/profile/ProfilePage";
import ExpertDiscoveryPage from "./pages/experts/ExpertDiscoveryPage";
import ExpertPublicProfile from "./pages/experts/ExpertPublicProfile";
import ProposalsPage from "@/pages/experts/ProposalsPage";
import ExpertsLeaderboard from "./pages/experts/Leaderboard";
import ClientPublicProfile from "./pages/clients/ClientPublicProfile";
import ProjectsPage from "./pages/projects/ProjectsPage";
import ProjectDetailPage from "./pages/projects/ProjectDetailPage";
import EditProjectPage from "./pages/projects/EditProjectPage";
import CreateProjectPage from "./pages/projects/CreateProjectPage";
import ContractsListPage from "./pages/contracts/ContractsListPage";
import ContractDetailPage from "./pages/contracts/ContractDetailPage";
import SettingsPage from "./pages/settings/SettingsPage";
import MessagesPage from "./pages/messages/MessagesPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              {/* --- Admin Routes --- */}
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/users/:id" element={<UserDetails />} />
              <Route path="/admin/projects" element={<ProjectModeration />} />
              <Route path="/admin/contracts" element={<ContractOversight />} />
              <Route path="/admin/disputes" element={<DisputeResolution />} />
              <Route path="/admin/reports" element={<ReportManagement />} />
              <Route path="/admin/financials" element={<Financials />} />
              <Route
                path="/admin/leaderboards"
                element={<AdminLeaderboards />}
              />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/marketplace" element={<MarketplacePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/experts" element={<ExpertDiscoveryPage />} />
              <Route path="/experts/:id" element={<ExpertPublicProfile />} />
              <Route
                path="/experts/leaderboard"
                element={<ExpertsLeaderboard />}
              />
              <Route path="/clients/:id" element={<ClientPublicProfile />} />{" "}
              {/* New Route */}
              <Route path="/proposals" element={<ProposalsPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/new" element={<CreateProjectPage />} />
              <Route path="/projects/:id/edit" element={<EditProjectPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/contracts" element={<ContractsListPage />} />
              <Route path="/contracts/:id" element={<ContractDetailPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/messages" element={<MessagesPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;