import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import Login from '../pages/auth/login';
import Signup from '../pages/auth/signup';
import VerifyEmail from '../pages/auth/verify-email';
import ResetPassword from '../pages/auth/reset-password';
import UpdatePassword from '../pages/auth/update-password';
import Pricing from '../pages/pricing';
import Checkout from '../pages/checkout';
import Dashboard from '../pages/dashboard';
import AccountBilling from '../pages/account/billing';
import Profile from '../pages/profile';
import ThinkingDemo from '../pages/thinking-demo';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import TestThinkingPage from '../pages/test-thinking';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<MainLayout />} />
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/signup" element={<Signup />} />
        <Route path="/auth/verify-email" element={<VerifyEmail />} />
        <Route path="/auth/reset-password" element={<ResetPassword />} />
        <Route path="/auth/update-password" element={<UpdatePassword />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/thinking-demo" element={<ThinkingDemo />} />
        <Route path="/test-thinking" element={<TestThinkingPage />} />
        
        {/* Protected routes */}
        <Route 
          path="/checkout" 
          element={<ProtectedRoute><Checkout /></ProtectedRoute>} 
        />
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} 
        />
        <Route 
          path="/account/billing" 
          element={<ProtectedRoute><AccountBilling /></ProtectedRoute>} 
        />
        <Route 
          path="/profile" 
          element={<ProtectedRoute><Profile /></ProtectedRoute>} 
        />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter; 