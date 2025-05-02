import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { DollarSign, CreditCard, User, School, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

interface PaymentFormData {
  school_id: string;
  student_name: string;
  student_id: string;
  student_email: string;
  amount: number;
  gateway_name: string;
}

const CreatePaymentPage: React.FC = () => {
  const { user } = useAuth();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<PaymentFormData>({
    defaultValues: {
      school_id: user?.school_id || '',
      gateway_name: 'PhonePe'
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [customOrderId, setCustomOrderId] = useState<string | null>(null);

  const API_URL =  'http://localhost:5000/api';

  const onSubmit = async (data: PaymentFormData) => {
    setLoading(true);
    
    try {
      // In a real application, this would be an actual API call
      // For this demo, we'll simulate the response
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Prepare payload (matches the structure expected by the backend)
      const payload = {
        school_id: data.school_id,
        trustee_id: user?._id,
        student_info: {
          name: data.student_name,
          id: data.student_id,
          email: data.student_email
        },
        amount: data.amount,
        gateway_name: data.gateway_name
      };
      
      // Simulate successful response
      const mockCustomOrderId = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const mockPaymentUrl = `https://payments.example.com/pay/${mockCustomOrderId}`;
      
      // Set state with the payment details
      setPaymentUrl(mockPaymentUrl);
      setCustomOrderId(mockCustomOrderId);
      
      // Show success message
      toast.success('Payment request created successfully');
      
      // Clear form
      reset();
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast.error(error.response?.data?.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 fade-in">
      <h1 className="text-2xl font-bold text-gray-900">Create Payment</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* School ID */}
              <div>
                <label htmlFor="school_id" className="block text-sm font-medium text-gray-700 mb-1">
                  School ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <School size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="school_id"
                    type="text"
                    placeholder="Enter school ID"
                    {...register('school_id', { required: 'School ID is required' })}
                    className="input-field pl-10"
                    disabled={user?.role === 'school_admin'}
                  />
                </div>
                {errors.school_id && (
                  <p className="mt-1 text-sm text-red-600">{errors.school_id.message}</p>
                )}
              </div>
              
              {/* Student Info */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="student_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Student Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="student_name"
                        type="text"
                        placeholder="Student full name"
                        {...register('student_name', { required: 'Student name is required' })}
                        className="input-field pl-10"
                      />
                    </div>
                    {errors.student_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.student_name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="student_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Student ID
                    </label>
                    <input
                      id="student_id"
                      type="text"
                      placeholder="Student ID number"
                      {...register('student_id', { required: 'Student ID is required' })}
                      className="input-field"
                    />
                    {errors.student_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.student_id.message}</p>
                    )}
                  </div>
                  
                  <div className="md:col-span-2">
                    <label htmlFor="student_email" className="block text-sm font-medium text-gray-700 mb-1">
                      Student Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="student_email"
                        type="email"
                        placeholder="student@example.com"
                        {...register('student_email', { 
                          required: 'Student email is required',
                          pattern: { 
                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: 'Invalid email address'
                          }
                        })}
                        className="input-field pl-10"
                      />
                    </div>
                    {errors.student_email && (
                      <p className="mt-1 text-sm text-red-600">{errors.student_email.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Payment Details */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Amount
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign size={18} className="text-gray-400" />
                      </div>
                      <input
                        id="amount"
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="Enter amount"
                        {...register('amount', { 
                          required: 'Amount is required',
                          min: { value: 1, message: 'Amount must be at least 1' }
                        })}
                        className="input-field pl-10"
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600">{errors.amount.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="gateway_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Payment Gateway
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <CreditCard size={18} className="text-gray-400" />
                      </div>
                      <select
                        id="gateway_name"
                        {...register('gateway_name', { required: 'Payment gateway is required' })}
                        className="input-field pl-10"
                      >
                        <option value="PhonePe">PhonePe</option>
                        <option value="Razorpay">Razorpay</option>
                        <option value="Paytm">Paytm</option>
                      </select>
                    </div>
                    {errors.gateway_name && (
                      <p className="mt-1 text-sm text-red-600">{errors.gateway_name.message}</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary w-full"
                >
                  {loading ? (
                    <span className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating Payment...
                    </span>
                  ) : (
                    'Create Payment'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
        
        <div>
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Instructions</h3>
            <div className="text-sm text-gray-600 space-y-3">
              <p>
                1. Fill in the school and student information accurately.
              </p>
              <p>
                2. Enter the payment amount and select the preferred payment gateway.
              </p>
              <p>
                3. Click "Create Payment" to generate a payment link.
              </p>
              <p>
                4. The student will be redirected to the payment gateway to complete the transaction.
              </p>
              <p>
                5. Once completed, the transaction status will be updated automatically.
              </p>
            </div>
            
            {paymentUrl && customOrderId && (
              <div className="mt-6 p-4 bg-blue-50 rounded-md border border-blue-200">
                <h4 className="text-md font-medium text-blue-800 mb-2">Payment Link Generated</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Transaction ID: <span className="font-semibold">{customOrderId}</span>
                </p>
                <p className="text-sm text-blue-700 mb-4">
                  Share this link with the student to complete the payment.
                </p>
                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full text-center"
                >
                  Go to Payment Page
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePaymentPage;