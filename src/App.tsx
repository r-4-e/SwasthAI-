/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import ScanMeal from './pages/ScanMeal';
import WaterLog from './pages/WaterLog';
import Profile from './pages/Profile';
import React from 'react';

function PrivateRoute({ children, requireProfile = true }: { children: React.ReactElement, requireProfile?: boolean }) {
  const { user, isLoading, hasProfile } = useAuth();
  
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  
  if (!user) return <Navigate to="/login" />;

  // If profile is required but missing, redirect to onboarding
  // We check hasProfile !== null to ensure we've actually checked
  if (requireProfile && hasProfile === false) {
    return <Navigate to="/onboarding" />;
  }

  // If we are on onboarding but already have a profile, go to dashboard
  if (!requireProfile && hasProfile === true) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<PrivateRoute requireProfile={false}><Onboarding /></PrivateRoute>} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/scan-meal" element={<PrivateRoute><ScanMeal /></PrivateRoute>} />
          <Route path="/water" element={<PrivateRoute><WaterLog /></PrivateRoute>} />
          <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="/log" element={<Navigate to="/scan-meal" />} />
          {/* <Route path="/scan-barcode" element={<PrivateRoute><ScanBarcode /></PrivateRoute>} /> */}
          {/* <Route path="/manual-entry" element={<PrivateRoute><ManualEntry /></PrivateRoute>} /> */}
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}
