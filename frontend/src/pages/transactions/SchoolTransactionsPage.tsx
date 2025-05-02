import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Search, Download, RefreshCw, School } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

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

const SchoolTransactionsPage: React.FC = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedSchool, setSelectedSchool] = useState<string>(schoolId || (user?.school_id || ''));
  const [schools, setSchools] = useState<{ id: string, name: string }[]>([]);
  
  // Parse URL params with defaults
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const sort = searchParams.get('sort') || 'payment_time';
  const order = searchParams.get('order') || 'desc';

  const API_URL = 'http://localhost:5000/api';

  // Fetch school list (simulated)
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        // Simulated API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setSchools([
          { id: 'school_1', name: 'ABC Public School' },
          { id: 'school_2', name: 'XYZ International School' },
          { id: 'school_3', name: 'City Montessori School' },
          { id: 'school_4', name: 'Delhi Public School' },
          { id: 'school_5', name: 'St. Marys Academy' }
        ]);
      } catch (error) {
        console.error('Error fetching schools:', error);
      }
    };
    
    fetchSchools();
  }, []);

  useEffect(() => {
    if (!selectedSchool) return;
    
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        // In a real app, this would be an actual API call
        // For demo purposes, we'll simulate the data
        
        // Simulate API response delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Generate mock data for the selected school
        const mockData: Transaction[] = Array.from({ length: 30 }, (_, i) => ({
          collect_id: `collect_${i + 1}`,
          school_id: selectedSchool,
          gateway: ['PhonePe', 'Razorpay', 'Paytm'][Math.floor(Math.random() * 3)],
          order_amount: Math.floor(Math.random() * 5000) + 500,
          transaction_amount: Math.floor(Math.random() * 5500) + 500,
          status: ['success', 'pending', 'failed'][Math.floor(Math.random() * 3)],
          custom_order_id: `ORD-${Date.now()}-${i + 1}`,
          payment_time: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString()
        }));
        
        // Apply search if any
        let filteredData = mockData;
        if (searchTerm) {
          filteredData = mockData.filter(t => 
            t.custom_order_id.includes(searchTerm) || 
            t.gateway.toLowerCase().includes(searchTerm.toLowerCase())
          );
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
  }, [API_URL, selectedSchool, page, limit, sort, order, searchTerm]);

  const handleSchoolChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSchoolId = e.target.value;
    setSelectedSchool(newSchoolId);
    setSearchParams({ page: '1', limit: limit.toString() });
  };

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => {
      prev.set('page', '1');
      return prev;
    });
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

  const getSchoolName = (id: string) => {
    const school = schools.find(s => s.id === id);
    return school ? school.name : id;
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">School Transactions</h1>
          {selectedSchool && (
            <p className="text-gray-500">
              Viewing transactions for {getSchoolName(selectedSchool)}
            </p>
          )}
        </div>
        
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* School Selector */}
          <div>
            <label htmlFor="school" className="block text-sm font-medium text-gray-700 mb-1">
              Select School
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <School size={18} className="text-gray-400" />
              </div>
              <select
                id="school"
                value={selectedSchool}
                onChange={handleSchoolChange}
                className="input-field pl-10"
                disabled={user?.role === 'school_admin'}
              >
                <option value="">Select a school</option>
                {schools.map(school => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Search Transactions
            </label>
            <form onSubmit={handleSearch} className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                id="search"
                type="text"
                placeholder="Search by ID or gateway"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10"
              />
            </form>
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
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Transaction ID
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                    {sort === 'order_amount' && (
                      <span className="ml-1">
                        {order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSortChange('transaction_amount')}
                >
                  <div className="flex items-center">
                    <span>Transaction Amount</span>
                    {sort === 'transaction_amount' && (
                      <span className="ml-1">
                        {order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
                <th 
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                    {sort === 'payment_time' && (
                      <span className="ml-1">
                        {order === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center items-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  </td>
                </tr>
              ) : !selectedSchool ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <p className="text-gray-500">Please select a school to view transactions</p>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <p className="text-gray-500">No transactions found for this school</p>
                  </td>
                </tr>
              ) : (
                transactions.map((transaction) => (
                  <tr key={transaction.collect_id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {transaction.custom_order_id}
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
        {selectedSchool && transactions.length > 0 && (
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
        )}
      </div>
    </div>
  );
};

export default SchoolTransactionsPage;