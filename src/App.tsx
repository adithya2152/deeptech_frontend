import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useEffect } from "react";


import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

// --- Admin Pages ---
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserManagement from "./pages/admin/UserManagement";
import UserDetails from "./pages/admin/UserDetails";
import ExpertVerification from "./pages/admin/ExpertVerification"; // ✅ 1. ADD THIS IMPORT
import ProjectModeration from "./pages/admin/ProjectModeration";
import ContractOversight from "./pages/admin/ContractOversight";
import DisputeResolution from "./pages/admin/DisputeResolution";
import ReportManagement from "./pages/admin/ReportManagement";
import Financials from "./pages/admin/Financials";
import AdminLeaderboards from "./pages/admin/Leaderboards";
import Analytics from "./pages/admin/Analytics";
import AnalyticsCountries from "./pages/admin/AnalyticsCountries";
import AnalyticsEarners from "./pages/admin/AnalyticsEarners";
import AnalyticsDomains from "./pages/admin/AnalyticsDomains";
import CircumventionAnalytics from "./pages/admin/CircumventionAnalytics";
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
import ProjectProposalsPage from "./pages/projects/ProjectProposalsPage";
import EditProjectPage from "./pages/projects/EditProjectPage";
import CreateProjectPage from "./pages/projects/CreateProjectPage";
import ContractsListPage from "./pages/contracts/ContractsListPage";
import ContractDetailPage from "./pages/contracts/ContractDetailPage";
import SettingsPage from "./pages/settings/SettingsPage";
import MessagesPage from "./pages/messages/MessagesPage";
import HowItWorks from "./pages/HowItWorks";
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
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />

              {/* --- Admin Routes --- */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/users/:id"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <UserDetails />
                  </ProtectedRoute>
                }
              />

              {/* ✅ 2. ADD THIS ROUTE */}
              <Route
                path="/admin/experts/:id/verification"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ExpertVerification />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/projects"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ProjectModeration />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/contracts"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ContractOversight />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/disputes"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <DisputeResolution />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <ReportManagement />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/financials"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Financials />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/leaderboards"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLeaderboards />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <Analytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics/countries"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AnalyticsCountries />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics/earners"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AnalyticsEarners />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics/domains"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AnalyticsDomains />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analytics/circumvention"
                element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <CircumventionAnalytics />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/marketplace"
                element={
                  <ProtectedRoute
                    allowedRoles={["expert"]}
                    requireVerifiedExpert
                  >
                    <MarketplacePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route path="/experts" element={<ExpertDiscoveryPage />} />
              <Route path="/experts/:id" element={<ExpertPublicProfile />} />
              <Route
                path="/experts/leaderboard"
                element={<ExpertsLeaderboard />}
              />
              <Route path="/clients/:id" element={<ClientPublicProfile />} />

              <Route
                path="/proposals"
                element={
                  <ProtectedRoute
                    allowedRoles={["expert"]}
                    requireVerifiedExpert
                  >
                    <ProposalsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <ProjectsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/new"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <CreateProjectPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id/edit"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <EditProjectPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id"
                element={
                  <ProtectedRoute requireVerifiedExpert>
                    <ProjectDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects/:id/proposals"
                element={
                  <ProtectedRoute allowedRoles={["buyer"]}>
                    <ProjectProposalsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contracts"
                element={
                  <ProtectedRoute requireVerifiedExpert>
                    <ContractsListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/contracts/:id"
                element={
                  <ProtectedRoute requireVerifiedExpert>
                    <ContractDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/messages"
                element={
                  <ProtectedRoute requireVerifiedExpert>
                    <MessagesPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/how-it-works" element={<HowItWorks />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>

        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider >
  );
};

export default App;
