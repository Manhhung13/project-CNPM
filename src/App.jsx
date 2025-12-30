import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import { AuthProvider } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PrivateRoute from './components/PrivateRoute';
import MainLayout from './components/MainLayout';

import DashboardPage from './pages/DashboardPage';
import HouseholdManagementPage from './pages/HouseholdManagementPage';
import ResidentManagementPage from './pages/ResidentManagementPage';
import FeeManagementPage from './pages/FeeManagementPage';
import PaymentCollectionPage from './pages/PaymentCollectionPage';
import ApartmentManagementPage from './pages/ApartmentManagementPage';




function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route element={<PrivateRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<DashboardPage />} />
                <Route path="/households" element={<HouseholdManagementPage />} />
                <Route path="/residents" element={<ResidentManagementPage />} />
                <Route path="/fees" element={<FeeManagementPage />} />
                <Route path="/payments" element={<PaymentCollectionPage />} />
                <Route path="/apartments" element={<ApartmentManagementPage />} />
              </Route>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
