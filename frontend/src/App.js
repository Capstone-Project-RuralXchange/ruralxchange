import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import EquipmentPage from './pages/EquipmentPage';
import EquipmentDetailPage from './pages/EquipmentDetailPage';
import SpecialistsPage from './pages/SpecialistsPage';
import SpecialistDetailPage from './pages/SpecialistDetailPage';
import BookingPage from './pages/BookingPage';
import RequirementsPage from './pages/RequirementsPage';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ListEquipmentPage from './pages/ListEquipmentPage';
import BecomeSpecialistPage from './pages/BecomeSpecialistPage';
import SeasonalPage from './pages/SeasonalPage';
import ProfilePage from './pages/ProfilePage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="page-loader">
      <div className="spinner"></div>
      <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const AppContent = () => {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/equipment" element={<EquipmentPage />} />
            <Route path="/equipment/:id" element={<EquipmentDetailPage />} />
            <Route path="/specialists" element={<SpecialistsPage />} />
            <Route path="/specialists/:id" element={<SpecialistDetailPage />} />
            <Route path="/requirements" element={<RequirementsPage />} />
            <Route path="/seasonal" element={<SeasonalPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/book/:type/:id" element={<PrivateRoute><BookingPage /></PrivateRoute>} />
            <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
            <Route path="/list-equipment" element={<PrivateRoute><ListEquipmentPage /></PrivateRoute>} />
            <Route path="/become-specialist" element={<PrivateRoute><BecomeSpecialistPage /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        <Footer />
      </div>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#FDF6E3',
            color: '#2D1B0E',
            border: '1px solid #E8D5B0',
            borderRadius: '12px',
            fontFamily: 'Sora, sans-serif',
            fontWeight: 500,
            boxShadow: '0 8px 24px rgba(45,27,14,0.12)',
          },
          success: { iconTheme: { primary: '#2D6A2D', secondary: '#FDF6E3' } },
          error: { iconTheme: { primary: '#C1440E', secondary: '#FDF6E3' } },
        }}
      />
    </Router>
  );
};

const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
);

export default App;
