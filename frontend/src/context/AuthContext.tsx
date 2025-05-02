import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  school_id?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: string;
  school_id?: string;
}

interface JwtPayload {
  id: string;
  exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const API_URL =  'http://localhost:5000/api';

  // Check if token is valid
  const isTokenValid = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      // Check if token is expired
      return decoded.exp * 1000 > Date.now();
    } catch (error) {
      return false;
    }
  };

  // Load user from localStorage
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token');
        
        if (!token || !isTokenValid(token)) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setLoading(false);
          return;
        }
        
        // Set axios default headers
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Get user from localStorage or API
        const userData = localStorage.getItem('user');
        if (userData) {
          setUser(JSON.parse(userData));
        } else {
          // Fetch fresh user data
          const res = await axios.get(`${API_URL}/auth/profile`);
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        }
      } catch (error) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.error('Authentication error:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadUser();
  }, [API_URL]);

  // Login user
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      // Save token and user to localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      
      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data);
      navigate('/dashboard');
      toast.success('Logged in successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Login failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Register user
  const register = async (userData: RegisterData): Promise<void> => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post(`${API_URL}/auth/register`, userData);
      
      // Save token and user to localStorage
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data));
      
      // Set axios default headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
      
      setUser(res.data);
      navigate('/dashboard');
      toast.success('Registered successfully');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Registration failed';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Logout user
  const logout = (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
    navigate('/login');
    toast.info('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};