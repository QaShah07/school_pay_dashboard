import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Line } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { format } from 'date-fns';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { CreditCard, TrendingUp, AlertTriangle, CheckCircle, DollarSign, Users, School } from 'lucide-react';

// Register Chart.js components
Chart.register(...registerables);

interface DashboardStats {
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  totalAmount: number;
  avgTransactionAmount: number;
}

interface TransactionCountsByDay {
  date: string;
  count: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTransactions: 0,
    successfulTransactions: 0,
    failedTransactions: 0,
    pendingTransactions: 0,
    totalAmount: 0,
    avgTransactionAmount: 0
  });
  const [transactionsByStatus, setTransactionsByStatus] = useState<number[]>([0, 0, 0]);
  const [transactionTrend, setTransactionTrend] = useState<TransactionCountsByDay[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // In a real application, these would be actual API calls
        // For this demo, we'll simulate the data
        
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample data for dashboard
        setStats({
          totalTransactions: 256,
          successfulTransactions: 189,
          failedTransactions: 32,
          pendingTransactions: 35,
          totalAmount: 58650,
          avgTransactionAmount: 229.1
        });
        
        setTransactionsByStatus([189, 35, 32]); // success, pending, failed
        
        // Generate last 7 days data
        const last7Days = Array.from({length: 7}, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - i);
          return {
            date: format(date, 'MMM dd'),
            count: Math.floor(Math.random() * 30) + 10
          };
        }).reverse();
        
        setTransactionTrend(last7Days);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [API_URL]);

  const statusChartData = {
    labels: ['Successful', 'Pending', 'Failed'],
    datasets: [
      {
        label: 'Transactions by Status',
        data: transactionsByStatus,
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
        borderWidth: 0,
      }
    ]
  };
  
  const trendChartData = {
    labels: transactionTrend.map(t => t.date),
    datasets: [
      {
        label: 'Daily Transactions',
        data: transactionTrend.map(t => t.count),
        fill: 'start',
        backgroundColor: 'rgba(59, 130, 246, 0.2)',
        borderColor: '#3B82F6',
        tension: 0.4,
      }
    ]
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user?.name}!</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link 
            to="/payment/create"
            className="btn btn-primary inline-flex items-center"
          >
            <DollarSign size={16} className="mr-1" />
            Create Payment
          </Link>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <CreditCard size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTransactions}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Successful</p>
              <p className="text-2xl font-bold text-gray-900">{stats.successfulTransactions}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <TrendingUp size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{stats.pendingTransactions}</p>
            </div>
          </div>
        </div>
        
        <div className="card bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={20} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Failed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.failedTransactions}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Transactions by Status</h2>
          <div className="h-64">
            <Bar data={statusChartData} options={{ 
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }} />
          </div>
        </div>
        
        <div className="card bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Transaction Trend (Last 7 Days)</h2>
          <div className="h-64">
            <Line data={trendChartData} options={{ 
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'bottom'
                }
              }
            }} />
          </div>
        </div>
      </div>
      
      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mb-3">
              <DollarSign size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Amount</p>
            <p className="text-3xl font-bold text-gray-900">${stats.totalAmount.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="card bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-teal-100 text-teal-600 mb-3">
              <Users size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Avg. Transaction Amount</p>
            <p className="text-3xl font-bold text-gray-900">${stats.avgTransactionAmount.toFixed(2)}</p>
          </div>
        </div>
        
        <div className="card bg-white p-5 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mb-3">
              <School size={24} />
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Success Rate</p>
            <p className="text-3xl font-bold text-gray-900">
              {((stats.successfulTransactions / stats.totalTransactions) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;