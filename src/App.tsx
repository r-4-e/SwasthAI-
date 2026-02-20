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

function PrivateRoute({ children }: { children: React.ReactElement }) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/onboarding" element={<PrivateRoute><Onboarding /></PrivateRoute>} />
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
