import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { RecuperarPasswordPage } from './pages/RecuperarPassword';
import { ClienteDashboard } from './pages/cliente/Dashboard';
import { TrabajadorDashboard } from './pages/trabajador/Dashboard';
import { AdminDashboard } from './pages/admin/Dashboard';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="size-full bg-background text-foreground transition-colors duration-300">
            <Routes>
              <Route path="/" element={<LoginPage />} />
              <Route path="/registro" element={<RegisterPage />} />
              <Route path="/recuperar-password" element={<RecuperarPasswordPage />} />
              <Route
                path="/cliente/*"
                element={
                  <ProtectedRoute>
                    <ClienteDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/trabajador/*"
                element={
                  <ProtectedRoute>
                    <TrabajadorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/*"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>

            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--card)',
                  color: 'var(--card-foreground)',
                  border: '1px solid var(--border)',
                },
              }}
            />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}