import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, ArrowLeft } from 'lucide-react';
import axios from 'axios';

interface PaymentStatus {
  status: string;
  custom_order_id: string;
  amount: number;
  payment_mode?: string;
  payment_message?: string;
  payment_time?: string;
}

const PaymentStatusPage: React.FC = () => {
  const { customOrderId } = useParams<{ customOrderId: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null);

  const API_URL =  'http://localhost:5000/api';

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        // In a real app, we would call the API
        // For demo, we'll simulate the response
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Randomly pick a status for demo purposes
        const statuses = ['success', 'failed', 'pending'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        
        // Mock payment status
        const mockStatus: PaymentStatus = {
          status: randomStatus,
          custom_order_id: customOrderId || 'unknown',
          amount: Math.floor(Math.random() * 5000) + 500,
          payment_mode: ['upi', 'netbanking', 'card'][Math.floor(Math.random() * 3)],
          payment_message: randomStatus === 'success' 
            ? 'Payment successful' 
            : randomStatus === 'pending' 
              ? 'Payment pending verification' 
              : 'Payment failed',
          payment_time: new Date().toISOString()
        };
        
        setPaymentStatus(mockStatus);
      } catch (error: any) {
        console.error('Error fetching payment status:', error);
        setError(error.response?.data?.message || 'Failed to fetch payment status');
      } finally {
        setLoading(false);
      }
    };
    
    if (customOrderId) {
      checkPaymentStatus();
    } else {
      setError('No transaction ID provided');
      setLoading(false);
    }
  }, [customOrderId, API_URL]);

  const getStatusColor = () => {
    if (!paymentStatus) return 'bg-gray-100';
    
    switch (paymentStatus.status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'pending':
        return 'bg-yellow-50 border-yellow-200';
      case 'failed':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    if (!paymentStatus) return null;
    
    switch (paymentStatus.status) {
      case 'success':
        return <CheckCircle size={64} className="text-green-500" />;
      case 'pending':
        return <Clock size={64} className="text-yellow-500" />;
      case 'failed':
        return <XCircle size={64} className="text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className={`max-w-md w-full rounded-lg shadow-sm border p-8 ${getStatusColor()}`}>
        {loading ? (
          <div className="flex flex-col items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-4 text-gray-600">Checking payment status...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center py-8">
            <XCircle size={64} className="text-red-500" />
            <h2 className="mt-4 text-xl font-bold text-gray-900">Error</h2>
            <p className="mt-2 text-gray-600">{error}</p>
            <button
              onClick={() => navigate('/')}
              className="mt-6 btn btn-primary flex items-center"
            >
              <ArrowLeft size={16} className="mr-2" />
              Back to Home
            </button>
          </div>
        ) : paymentStatus ? (
          <div className="flex flex-col items-center">
            {getStatusIcon()}
            <h2 className="mt-4 text-xl font-bold text-gray-900">
              Payment {paymentStatus.status.charAt(0).toUpperCase() + paymentStatus.status.slice(1)}
            </h2>
            <p className="mt-2 text-gray-600">{paymentStatus.payment_message}</p>
            
            <div className="w-full mt-8">
              <div className="border-t border-gray-200 py-4">
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Transaction ID</dt>
                    <dd className="text-sm font-medium text-gray-900">{paymentStatus.custom_order_id}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Amount</dt>
                    <dd className="text-sm font-medium text-gray-900">${paymentStatus.amount.toFixed(2)}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Payment Method</dt>
                    <dd className="text-sm font-medium text-gray-900">{paymentStatus.payment_mode?.toUpperCase() || 'N/A'}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Date & Time</dt>
                    <dd className="text-sm font-medium text-gray-900">{formatDate(paymentStatus.payment_time)}</dd>
                  </div>
                  <div className="py-3 flex justify-between">
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd className={`text-sm font-medium ${
                      paymentStatus.status === 'success'
                        ? 'text-green-600'
                        : paymentStatus.status === 'pending'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                    }`}>
                      {paymentStatus.status.toUpperCase()}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            
            <div className="mt-6 w-full">
              <button
                onClick={() => navigate('/dashboard')}
                className="btn btn-primary w-full flex items-center justify-center"
              >
                <ArrowLeft size={16} className="mr-2" />
                Return to Dashboard
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default PaymentStatusPage;