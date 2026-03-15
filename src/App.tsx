import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AppLayout } from "./components/layout/AppLayout";
import { SplashPage } from "./pages/SplashPage";
import { HomePage } from "./pages/HomePage";
import { AuthPage } from "./pages/AuthPage";
import { MainDashboardPage } from "./pages/MainDashboardPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { ManageUsersPage } from "./pages/admin/ManageUsersPage";
import { ManageAdminsPage } from "./pages/admin/ManageAdminsPage";
import { PendingRequestsPage } from "./pages/admin/PendingRequestsPage";
import { ReportCrimePage } from "./pages/ReportCrimePage";
import { GetHelpPage } from "./pages/GetHelpPage";
import { LostAndFoundPage } from "./pages/LostAndFoundPage";
import { MissingPersonsPage } from "./pages/MissingPersonsPage";
import { ReportMissingPersonPage } from "./pages/ReportMissingPersonPage";
import { ReportMissingPropertyPage } from "./pages/ReportMissingPropertyPage";
import { SearchStationsPage } from "./pages/SearchStationsPage";
import { LawsAndRightsPage } from "./pages/LawsAndRightsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <Routes>
              <Route path="/" element={<SplashPage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/auth" element={<AuthPage />} />

              <Route element={<AppLayout />}>
                <Route path="/main" element={<MainDashboardPage />} />
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/manage-users" element={<ManageUsersPage />} />
                <Route path="/admin/manage-admins" element={<ManageAdminsPage />} />
                <Route path="/admin/pending-requests" element={<PendingRequestsPage />} />
                <Route path="/report-crime" element={<ReportCrimePage />} />
                <Route path="/get-help" element={<GetHelpPage />} />
                <Route path="/lost-and-found" element={<LostAndFoundPage />} />
                <Route path="/missing-persons" element={<MissingPersonsPage />} />
                <Route path="/report-missing-person" element={<ReportMissingPersonPage />} />
                <Route path="/report-missing-property" element={<ReportMissingPropertyPage />} />
                <Route path="/search-stations" element={<SearchStationsPage />} />
                <Route path="/laws-and-rights" element={<LawsAndRightsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
