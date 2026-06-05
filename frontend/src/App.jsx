import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';
import DashboardPage from './DashboardPage';
import ModulesPage from './ModulesPage';
import LogsPage from './LogsPage';
import DrillsPage from './DrillsPage';
import CoursesPage from './CoursesPage';
import ClientPage from './ClientPage';
import AppChatbot from './AppChatbot';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }} />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Client portal — certified providers only */}
          <Route element={<ProtectedRoute roles={['client']} />}>
            <Route path="/client" element={<ClientPage />} />
          </Route>

          {/* Service Provider portal */}
          <Route element={<ProtectedRoute roles={['provider', 'admin']} />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/modules" element={<ModulesPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/drills" element={<DrillsPage />} />
          </Route>

          {/* Admin only */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            {/* <Route path="/admin" element={<AdminPanel />} /> */}
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
        <AppChatbot />
      </BrowserRouter>
    </AuthProvider>
  );
}
