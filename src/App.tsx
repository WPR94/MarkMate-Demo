import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import EssayFeedback from './pages/EssayFeedback';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Rubrics from './pages/Rubrics';
import Analytics from './pages/Analytics';
import BatchProcessor from './pages/BatchProcessor';
import FeedbackHistory from './pages/FeedbackHistory';
import Demo from './pages/Demo';
import DashboardDemo from './pages/DashboardDemo';
import About from './pages/About';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import DataProcessingAgreement from './pages/DataProcessingAgreement';
import AccountSettings from './pages/AccountSettings';
import ProtectedRoute from './components/ProtectedRoute';
import { CookieConsent } from './components/CookieConsent';
import { FeedbackButton } from './components/FeedbackButton';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

function App() {
  // Session timeout for security (auto-logout after inactivity)
  useSessionTimeout();
  
  const { user } = useAuth();

  return (
    <div className="overflow-x-hidden">
      <Toaster position="top-center" toastOptions={{ duration: 3000 }} />
      <CookieConsent />
      {/* Show feedback button only for authenticated users */}
      {user && <FeedbackButton />}
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        {/* Protected routes */}
        <Route element={<ProtectedRoute />}> 
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/essay-feedback" element={<EssayFeedback />} />
          <Route path="/feedback-history" element={<FeedbackHistory />} />
          <Route path="/students" element={<Students />} />
          <Route path="/rubrics" element={<Rubrics />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/batch" element={<BatchProcessor />} />
        </Route>
        {/* Public */}
        <Route path="/demo" element={<Demo />} />
  <Route path="/dashboard-demo" element={<DashboardDemo />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/dpa" element={<DataProcessingAgreement />} />
        {/* Protected Settings */}
        <Route element={<ProtectedRoute />}>
          <Route path="/settings" element={<AccountSettings />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;