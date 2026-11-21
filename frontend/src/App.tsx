import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';

// Pages
import LoginPage from './pages/auth/LoginPage';
import Dashboard from './pages/Dashboard';
import BatchListPage from './pages/training/BatchListPage';
import CreateBatchPage from './pages/training/CreateBatchPage';
import BatchDetailPage from './pages/training/BatchDetailPage';
import ApprovalListPage from './pages/district/ApprovalListPage';
import QualityReviewPage from './pages/quality/QualityReviewPage';
import StatePendingPage from './pages/state/StatePendingPage';
import CertificatesPage from './pages/state/CertificatesPage';
import NotificationsPage from './pages/state/NotificationsPage';
import VerifyPage from './pages/verify/VerifyPage';
import AuditPage from './pages/audit/AuditPage';

// Role-gated wrapper
function RequireRole({ roles }: { roles?: string[] }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// Auth-required wrapper (any logged-in user)
function RequireAuth() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-500 text-sm">Loading CertiFlow...</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public routes - no auth needed */}
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/verify/:id" element={<VerifyPage />} />

      {/* Protected routes - wrapped in Layout */}
      <Route element={<RequireAuth />}>
        <Route element={<Layout />}>
          {/* Dashboard - all roles */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Training Centre routes */}
          <Route element={<RequireRole roles={['TRAINING_CENTRE', 'STATE_OFFICE']} />}>
            <Route path="/batches" element={<BatchListPage />} />
            <Route path="/batches/create" element={<CreateBatchPage />} />
            <Route path="/batches/:id" element={<BatchDetailPage />} />
          </Route>

          {/* District Officer routes */}
          <Route element={<RequireRole roles={['DISTRICT_OFFICER']} />}>
            <Route path="/approvals" element={<ApprovalListPage />} />
          </Route>

          {/* Quality Team routes */}
          <Route element={<RequireRole roles={['QUALITY_TEAM']} />}>
            <Route path="/quality" element={<QualityReviewPage />} />
          </Route>

          {/* State Office routes */}
          <Route element={<RequireRole roles={['STATE_OFFICE']} />}>
            <Route path="/state/pending" element={<StatePendingPage />} />
            <Route path="/state/batches" element={<BatchListPage />} />
            <Route path="/state/certificates" element={<CertificatesPage />} />
            <Route path="/state/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Audit Log - officers and above */}
          <Route
            element={
              <RequireRole
                roles={['DISTRICT_OFFICER', 'QUALITY_TEAM', 'STATE_OFFICE']}
              />
            }
          >
            <Route path="/audit" element={<AuditPage />} />
          </Route>

          {/* Catch-all → dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Root redirect */}
      <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1f2937',
              color: '#f9fafb',
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
