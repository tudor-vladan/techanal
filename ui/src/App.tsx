import { AuthProvider, useAuth } from '@/lib/auth-context';
import { ThemeProvider } from "@/components/theme-provider";
import { LoginForm } from '@/components/login-form';
import { Navbar } from '@/components/navbar';
import { AppSidebar } from '@/components/appSidebar';
import { Home } from '@/pages/Home';
import { Settings } from '@/pages/Settings';
import TradingAnalysisPage from '@/pages/TradingAnalysis';
import SystemMonitor from '@/pages/SystemMonitor';
import DemoPage from '@/pages/Demo';
import LearningAnalytics from './pages/LearningAnalytics';
import AIManagementPage from './pages/AIManagement';
import ModelManagementPage from './pages/ModelManagement';
import MFASetupPage from './pages/MFASetup';
import PWAStatusPage from './pages/PWAStatus';
import RateLimitingPage from './pages/RateLimiting';

import SecurityAuditPage from './pages/SecurityAudit';
import SecurityHeadersPage from './pages/SecurityHeaders';
import SecurityMonitoringPage from './pages/SecurityMonitoring';
import DebugLogsPage from './pages/DebugLogs';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

function AppContent() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Lightweight route change logger
  // Avoids infinite loops; only logs when authenticated
  if (typeof window !== 'undefined') {
    // Dynamically import to avoid circulars and keep App lean on first load
    import('./lib/debugLogger').then(({ default: logger }) => {
      try {
        if (user) {
          logger.info('Route navigated', { path: location.pathname, search: location.search }, 'route');
        }
      } catch {}
    }).catch(() => {});
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen"></div>;
  }

  return (
    <SidebarProvider>
      <div className="flex flex-col w-full min-h-screen bg-background">
        <Navbar />
        {!user ? (
          <main className="flex flex-col items-center justify-center flex-1 p-4">
            <LoginForm />
          </main>
        ) : (
          <div className="flex flex-1">
            <AppSidebar />
            <SidebarInset className="flex-1">
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/trading-analysis" element={<TradingAnalysisPage />} />
                  <Route path="/settings" element={<Settings />} />
                  <Route path="/system-monitor" element={<SystemMonitor />} />
                  <Route path="/demo" element={<DemoPage />} />
                  <Route path="/learning-analytics" element={<LearningAnalytics />} />
                  <Route path="/ai-management" element={<AIManagementPage />} />
                  <Route path="/model-management" element={<ModelManagementPage />} />
                  <Route path="/mfa-setup" element={<MFASetupPage />} />
                  <Route path="/pwa-status" element={<PWAStatusPage />} />
                  <Route path="/rate-limiting" element={<RateLimitingPage />} />
  
                  <Route path="/security-audit" element={<SecurityAuditPage />} />
                  <Route path="/security-headers" element={<SecurityHeadersPage />} />
                  <Route path="/security-monitoring" element={<SecurityMonitoringPage />} />
                  <Route path="/debug-logs" element={<DebugLogsPage />} />
                </Routes>
              </main>
            </SidebarInset>
          </div>
        )}
      </div>
    </SidebarProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider 
        attribute="class" 
        defaultTheme="system" 
        enableSystem
        disableTransitionOnChange
        storageKey="volo-app-theme"
      >
        <Router>
          <AppContent />
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
