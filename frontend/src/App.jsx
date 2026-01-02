import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Landing Page
import LandingPage from './pages/LandingPage'

// Layouts
import AuthLayout from './layouts/AuthLayout'
import DashboardLayout from './layouts/DashboardLayout'

// Auth Pages
import LoginPage from './pages/auth/LoginPage'
import SignupPage from './pages/auth/SignupPage'

// Dashboard Pages
import DashboardHome from './pages/dashboard/DashboardHome'
import LeadsPage from './pages/revops/LeadsPage'
import CampaignsPage from './pages/revops/CampaignsPage'
import CustomersPage from './pages/customers/CustomersPage'
import DataLabelingPage from './pages/data-labeling/DataLabelingPage'
import TalentPage from './pages/talent/TalentPage'
import JobsPage from './pages/jobs/JobsPage'
import SettingsPage from './pages/settings/SettingsPage'

function ProtectedRoute({ children }) {
  const { user } = useAuthStore()
  return user ? children : <Navigate to="/login" />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth Routes */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
        </Route>

        {/* Dashboard Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardHome />} />
          <Route path="/revops" element={<LeadsPage />} />
          <Route path="/revops/leads" element={<LeadsPage />} />
          <Route path="/revops/campaigns" element={<CampaignsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/data-labeling" element={<DataLabelingPage />} />
          <Route path="/talent" element={<TalentPage />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
