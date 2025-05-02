import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { Search, Download, Filter, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

interface Transaction {
  collect_id: string;
  school_id: string;
  gateway: string;
  order_amount: number;
  transaction_amount: number;
  status: string;
  custom_order_id: string;
  payment_time: string;
}

const TransactionsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Parse URL params with defaults
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sort = searchParams.get('sort') || 'payment_time';
  const order = searchParams.get('order') || 'desc';
  const status = searchParams.get('status') || '';
  
  // Date filters
  const [startDate, setStartDate] = useState<Date | null>(
    searchParams.get('startDate') ? new Date(searchParams.get('startDate') || '') : null
  );
  const [endDate, setEndDate] = useState<Date | null>(
    searchParams.get('endDate') ? new Date(searchParams.get('endDate') || '') : null
  );

  const API_URL =  'http://localhost:5000/api';

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an actual API call
        // For demo purposes, we'll simulate the data
        
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate mock data that respects the filters
        const mockData: Transaction[] = Array.from({ length: 50 }, (_, i) => ({
          collect_id: `collect_${i + 1}`,
          school_id: `school_${Math.floor(Math.random() * 5) + 1}`,
          gateway: ['PhonePe', 'Razorpay', 'Paytm'][Math.floor(Math.random() * 3)],
          order_amount: Math.floor(Math.random() * 5000) + 500,
          transaction_amount: Math.floor(Math.random() * 5500) + 500,
          status: ['success', 'pending', 'failed'][Math.floor(Math.random() * 3)],
          custom_order_id: `ORD-${Date.now()}-${i + 1}`,
          payment_time: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        // Apply status filter if any
        let filteredData = mockData;
        if (status) {
          filteredData = mockData.filter(t => t.status === status);
        }
        
        // Apply date filters if any
        if (startDate && endDate) {
          filteredData = filteredData.filter(t => {
            const paymentDate = new Date(t.payment_time);
            return paymentDate >= startDate && paymentDate <= endDate;
          });
        }
        
        // Apply sorting
        filteredData.sort((a, b) => {
          if (sort === 'payment_time') {
            return order === 'asc' 
              ? new Date(a.payment_time).getTime() - new Date(b.payment_time).getTime()
              : new Date(b.payment_time).getTime() - new Date(a.payment_time).getTime();
          } else if (sort === 'order_amount') {
            return order === 'asc' ? a.order_amount - b.order_amount : b.order_amount - a.order_amount;
          } else if (sort === 'transaction_amount') {
            return order === 'asc' ? a.transaction_amount - b.transaction_amount : b.transaction_amount - a.transaction_amount;
          }
          return 0;
        });
        
        // Apply search if any
        if (searchTerm) {
          filteredData = filteredData.filter(t => 
            t.custom_order_id.includes(searchTerm) || 
            t.school_id.includes(searchTerm) ||
            t.gateway.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
        
        // Apply pagination
        const start = (page - 1) * limit;
        const end = start + limit;
        const paginatedData = filteredData.slice(start, end);
        
        setTransactions(paginatedData);
        setTotalPages(Math.ceil(filteredData.length / limit));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [API_URL, page, limit, sort, order, status, startDate, endDate, searchTerm]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  const handleSortChange = (column: string) => {
    setSearchParams(prev => {
      if (prev.get('sort') === column) {
        prev.set('order', prev.get('order') === 'asc' ? 'desc' : 'asc');
      } else {
        prev.set('sort', column);
        prev.set('order', 'desc');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleStatusFilter = (statusFilter: string) => {
    setSearchParams(prev => {
      if (statusFilter === '') {
        prev.delete('status');
      } else {
        prev.set('status', statusFilter);
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleDateRangeChange = (start: Date | null, end: Date | null) => {
    setStartDate(start);
    setEndDate(end);
    
    setSearchParams(prev => {
      if (start && end) {
        prev.set('startDate', start.toISOString());
        prev.set('endDate', end.toISOString());
      } else {
        prev.delete('startDate');
        prev.delete('endDate');
      }
      prev.set('page', '1');
      return prev;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => {
      prev.set('page', '1');
      return prev;
    });
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate(null);
    setEndDate(null);
    setSearchParams({ page: '1', limit: limit.toString() });
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'success':
        return 'badge-success';
      case 'pending':
        return 'badge-pending';
      case 'failed':
        return 'badge-error';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getSortIcon = (column: string) => {
    if (sort !== column) return <ChevronDown size={16} />;
    return order === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />;
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Transactions</h1>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <button className="btn btn-outline flex items-center">
            <Download size={16} className="mr-1" />
            Export
          </button>
          <button 
            className="btn btn-outline flex items-center"
            onClick={() => {
              setSearchParams(prev => {
                return prev;
              });
            }}
          >
            <RefreshCw size={16} className="mr-1" />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by ID, school, or gateway"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </form>
          </div>
          
          {/* Date Range */}
          <div className="flex space-x-2">
            <div className="w-1/2">
              <DatePicker
                selected={startDate}
                onChange={(date) => handleDateRangeChange(date, endDate)}
                selectsStart
                startDate={startDate}
                endDate={endDate}
                placeholderText="Start Date"
                className="input-field"
                dateFormat="MMM d, yyyy"
              />
            </div>
            <div className="w-1/2">
              <DatePicker
                selected={endDate}
                onChange={(date) => handleDateRangeChange(startDate, date)}
                selectsEnd
                startDate={startDate}
                endDate={endDate}
                minDate={startDate}
                placeholderText="End Date"
                className="input-field"
                dateFormat="MMM d, yyyy"
              />
            </div>
          </div>
          
          {/* Status Filter */}
          <div className="flex space-x-2">
            <div className="w-3/4">
              <select
                value={status}
                onChange={(e) => handleStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Statuses</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div className="w-1/4">
              <button 
                className="btn btn-outline w-full flex items-center justify-center"
                onClick={handleClearFilters}
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  Transaction ID
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  School ID
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  Gateway
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('order_amount')}
                >
                  <div className="flex items-center">
                    <span>Order Amount</span>
                    {getSortIcon('order_amount')}
                  </div>
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('transaction_amount')}
                >
                  <div className="flex items-center">
                    <span>Transaction Amount</span>
                    {getSortIcon('transaction_amount')}
                  </div>
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  Status
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('payment_time')}
                >
                  <div className="flex items-center">
                    <span>Date</span>
                    {getSortIcon('payment_time')}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center">
                    <p className="text-gray-500">No transactions found</p>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.collect_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.custom_order_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.school_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {transaction.gateway}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${transaction.order_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${transaction.transaction_amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${getStatusBadgeClass(transaction.status)}`}>
                        {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(transaction.payment_time)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center">
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">{transactions.length}</span> of{' '}
              <span className="font-medium">{totalPages * limit}</span> results
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                page === 1
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Previous
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              // Show 5 pages centered around current page
              let pageNum = page;
              if (page < 3) {
                pageNum = i + 1;
              } else if (page > totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              
              if (pageNum > 0 && pageNum <= totalPages) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      pageNum === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              return null;
            })}
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                page === totalPages
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsPage;