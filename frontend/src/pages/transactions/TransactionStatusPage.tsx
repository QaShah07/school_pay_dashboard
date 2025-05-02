import React, { useState } from 'react';
import { SearchIcon, Loader, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import axios from 'axios';

interface TransactionStatus {
  collect_id: string;
  custom_order_id: string;
  school_id: string;
  gateway: string;
  order_amount: number;
  transaction_amount: number;
  status: string;
  payment_mode: string;
  payment_message: string;
  payment_time: string;
}

const TransactionStatusPage: React.FC = () => {
  const [customOrderId, setCustomOrderId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<TransactionStatus | null>(null);

  const API_URL = 'http://localhost:5000/api';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!customOrderId.trim()) {
      setError('Please enter a transaction ID');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // In a real application, this would be an actual API call
      // For this demo, we'll simulate a response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a random status for demo purposes
      const statuses = ['success', 'pending', 'failed'];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      
      const mockTransaction: TransactionStatus = {
        collect_id: `collect_${Math.random().toString(36).substring(7)}`,
        custom_order_id: customOrderId,
        school_id: `school_${Math.floor(Math.random() * 5) + 1}`,
        gateway: ['PhonePe', 'Razorpay', 'Paytm'][Math.floor(Math.random() * 3)],
        order_amount: Math.floor(Math.random() * 5000) + 500,
        transaction_amount: Math.floor(Math.random() * 5500) + 500,
        status: randomStatus,
        payment_mode: ['upi', 'netbanking', 'card'][Math.floor(Math.random() * 3)],
        payment_message: randomStatus === 'success' 
          ? 'Payment successful' 
          : randomStatus === 'pending' 
            ? 'Payment pending verification' 
            : 'Payment failed',
        payment_time: new Date().toISOString()
      };
      
      setTransaction(mockTransaction);
    } catch (error: any) {
      console.error('Error checking transaction status:', error);
      setError(error.response?.data?.message || 'Failed to check transaction status');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = () => {
    if (!transaction) return null;
    
    switch (transaction.status) {
      case 'success':
        return <CheckCircle size={48} className="text-green-500" />;
      case 'pending':
        return <AlertTriangle size={48} className="text-yellow-500" />;
      case 'failed':
        return <AlertCircle size={48} className="text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Check Transaction Status</h1>
      
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="customOrderId" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Transaction ID
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon size={18} className="text-gray-400" />
              </div>
              <input
                id="customOrderId"
                type="text"
                placeholder="e.g., ORD-1234567890"
                value={customOrderId}
                onChange={(e) => setCustomOrderId(e.target.value)}
                className="input-field pl-10"
              />
            </div>
            {error && (
              <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader size={18} className="mr-2 animate-spin" />
                Checking...
              </span>
            ) : (
              'Check Status'
            )}
          </button>
        </form>
      </div>
      
      {transaction && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 fade-in">
          <div className="flex flex-col items-center mb-6">
            {getStatusIcon()}
            <h2 className="text-xl font-bold mt-4">
              Transaction {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
            </h2>
            <p className="text-gray-500 mt-1">{transaction.payment_message}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Transaction Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-medium">{transaction.custom_order_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="font-medium">{formatDate(transaction.payment_time)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="font-medium">{transaction.payment_mode.toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gateway:</span>
                  <span className="font-medium">{transaction.gateway}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Amount Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order Amount:</span>
                  <span className="font-medium">${transaction.order_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction Amount:</span>
                  <span className="font-medium">${transaction.transaction_amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">School ID:</span>
                  <span className="font-medium">{transaction.school_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className={`font-medium ${
                    transaction.status === 'success'
                      ? 'text-green-600'
                      : transaction.status === 'pending'
                        ? 'text-yellow-600'
                        : 'text-red-600'
                  }`}>
                    {transaction.status.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionStatusPage;