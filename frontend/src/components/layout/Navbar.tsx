import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, Bell, Sun, Moon, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  toggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode] = React.useState(false);
  const [userMenuOpen, setUserMenuOpen] = React.useState(false);

  const toggleDarkMode = () => {
    setDarkMode(prev => !prev);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <nav className="bg-white border-b border-gray-200 z-30">
      <div className="px-4 py-3 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <Link to="/dashboard" className="ml-2 lg:ml-0 flex items-center">
              <span className="text-xl font-bold text-blue-600">SchoolPay</span>
            </Link>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            
            <button className="p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <Bell size={18} />
            </button>
            
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100 text-blue-600">
                  <User size={18} />
                </div>
                <span className="hidden md:block text-sm font-medium">{user?.name}</span>
              </button>
              
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 fade-in">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-gray-500 truncate">{user?.email}</p>
                  </div>
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setUserMenuOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;