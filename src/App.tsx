import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import { AuthForm } from "./components/AuthForm";
import { DashboardOverview } from "./pages/DashboardOverview";
import { ContactsPage } from "./pages/ContactsPage";
import { CampaignsPage } from "./pages/CampaignsPage";
import { MessageLogsPage } from "./pages/MessageLogsPage";
import { SettingsPage } from "./pages/SettingsPage";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-matrix-black">
        <div className="text-center">
          <div className="mb-8 matrix-title text-5xl animate-pulse">
            ◈◇◈ SMS SENDER ◈◇◈
          </div>
          <div className="w-12 h-12 border-2 border-matrix-neon-green border-t-matrix-neon-cyan rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-matrix-neon-cyan text-sm mt-6">
            &gt; INITIALIZING SYSTEM...
          </p>
          <p className="text-matrix-neon-green text-xs mt-2 opacity-70">
            &gt; LOADING NEURAL PROTOCOLS...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth Routes */}
      <Route
        path="/auth"
        element={user ? <Navigate to="/dashboard" replace /> : <AuthForm />}
      />

      {/* Dashboard Routes (Protected) */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardOverview />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/campaigns" element={<CampaignsPage />} />
        <Route path="/logs" element={<MessageLogsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
