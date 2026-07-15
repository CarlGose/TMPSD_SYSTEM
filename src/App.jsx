import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from '@/components/ui/sonner'
import ProtectedRoute from '@/components/ProtectedRoute'
import DashboardLayout from '@/layouts/DashboardLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardHome from '@/pages/DashboardHome'
import DriverList from '@/pages/DriverList'
import AddDriver from '@/pages/AddDriver'
import DriverDetail from '@/pages/DriverDetail'
import EditDriver from '@/pages/EditDriver'
import RateDriver from '@/pages/RateDriver'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full spinner" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/rate/:id" element={<RateDriver />} />

      {/* Protected admin routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DashboardHome />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/drivers"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DriverList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/drivers/new"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <AddDriver />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/drivers/:id"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <DriverDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/drivers/:id/edit"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <EditDriver />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <Router>
      <ThemeProvider defaultTheme="light" storageKey="tricycle-theme">
        <AuthProvider>
          <AppRoutes />
          <Toaster
            position="top-right"
            richColors
            closeButton
            theme="dark"
          />
        </AuthProvider>
      </ThemeProvider>
    </Router>
  )
}
