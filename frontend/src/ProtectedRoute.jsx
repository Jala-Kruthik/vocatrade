import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';

function Spinner() {
  return (
    <div style={styles.overlay}>
      <div style={styles.spinnerWrap}>
        <div style={styles.spinner} />
        <p style={styles.label}>Verifying credentials…</p>
      </div>
    </div>
  );
}

const styles = {
  overlay: { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' },
  spinnerWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 },
  spinner: { width: 48, height: 48, border: '4px solid #334155', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },
  label: { color: '#94a3b8', fontSize: 14 },
};

if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
  document.head.appendChild(s);
}

/**
 * Usage:
 *   <ProtectedRoute />                              → any authenticated user
 *   <ProtectedRoute roles={['mentor','admin']} />   → specific roles only
 *   <ProtectedRoute roles={['client']} />           → client portal
 */
export default function ProtectedRoute({ roles }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <Spinner />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && roles.length > 0) {
    const userRole = user?.role?.toLowerCase();
    const allowed = roles.map((r) => r.toLowerCase());

    if (!allowed.includes(userRole)) {
      // Redirect to the correct home for their role
      if (userRole === 'client') return <Navigate to="/client" replace />;
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
}
