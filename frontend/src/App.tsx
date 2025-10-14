import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StokYonetimi from './pages/StokYonetimi';
import Siparisler from './pages/Siparisler';
import Uretim from './pages/Uretim';
import Isciler from './pages/Isciler';
import Sidebar from './components/Sidebar';
import NotificationBell from './components/NotificationBell';
import UserProfileMenu from './components/UserProfileMenu';
import { useState } from 'react';
import Profil from './pages/Profil';

// Protected Route bileşeni
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-gold"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Layout with Sidebar
const SidebarLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex min-h-screen">
    <Sidebar />
    <div className="flex-1">{children}</div>
  </div>
);

// Ana App bileşeni
const AppContent: React.FC = () => {
  // Yeni İşçi Ekle modalını globalde kontrol et
  const [showAddWorker, setShowAddWorker] = useState(false);
  return (
    <Router>
      <div className="relative min-h-screen">
        {/* Sağ üstte sabit bildirim ve yeni işçi ekle butonu */}
        <div className="fixed top-4 right-8 z-50 flex items-center gap-3">
          <NotificationBell />
          <UserProfileMenu />
        </div>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <Dashboard />
                </SidebarLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stoklar" 
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <StokYonetimi />
                </SidebarLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/siparisler" 
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <Siparisler />
                </SidebarLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/uretim" 
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <Uretim />
                </SidebarLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/isciler" 
            element={
              <ProtectedRoute>
                <SidebarLayout>
                  <Isciler showAddWorker={showAddWorker} setShowAddWorker={setShowAddWorker} />
                </SidebarLayout>
              </ProtectedRoute>
            } 
          />
          <Route path="/profil" element={<ProtectedRoute><SidebarLayout><Profil /></SidebarLayout></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

// Ana App bileşeni
const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;
