import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Layout from './components/layout/Layout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Login from './pages/auth/Login.tsx';
import Register from './pages/auth/Register';
import Dashboard from './pages/Dashboard.tsx';
import TransactionsPage from './pages/transactions/TransactionsPage';
import SchoolTransactionsPage from './pages/transactions/SchoolTransactionsPage';
import TransactionStatusPage from './pages/transactions/TransactionStatusPage';
import CreatePaymentPage from './pages/payments/CreatePaymentPage';
import PaymentStatusPage from './pages/payments/PaymentStatusPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
        <Route path="/payment/status/:customOrderId" element={<PaymentStatusPage />} />
        
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/transactions/school/:schoolId" element={<SchoolTransactionsPage />} />
            <Route path="/transaction/status" element={<TransactionStatusPage />} />
            <Route path="/payment/create" element={<CreatePaymentPage />} />
          </Route>
        </Route>
        
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
  
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};  

export default App;