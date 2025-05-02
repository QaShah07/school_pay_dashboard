import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CreditCard, 
  School, 
  Search, 
  PlusCircle, 
  Settings,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface NavItem {
  path: string;
  name: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  
  const navItems: NavItem[] = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard size={20} />
    },
    {
      path: '/transactions',
      name: 'All Transactions',
      icon: <CreditCard size={20} />
    },
    {
      path: '/transaction/status',
      name: 'Check Status',
      icon: <Search size={20} />
    },
    {
      path: '/payment/create',
      name: 'Create Payment',
      icon: <PlusCircle size={20} />
    },
    {
      path: '/settings',
      name: 'Settings',
      icon: <Settings size={20} />
    }
  ];

  return (
    <>
      {/* Mobile Sidebar Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
      
      {/* Sidebar */}
      <aside
        className={`${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-10`}
      >
        <div className="h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="h-16 px-4 flex items-center justify-between border-b">
            <Link to="/dashboard" className="flex items-center">
              <span className="text-xl font-bold text-blue-600">SchoolPay</span>
            </Link>
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
            >
              <X size={20} />
            </button>
          </div>
          
          {/* Sidebar Navigation */}
          <nav className="mt-5 flex-1 px-2 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-2.5 rounded-md transition duration-150 ease-in-out ${
                        isActive
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                    onClick={() => {
                      if (window.innerWidth < 1024) {
                        toggleSidebar();
                      }
                    }}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="text-sm font-medium">{item.name}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                  {user?.name.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3 overflow-hidden">
                <p className="text-sm font-medium text-gray-700 truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

// Fixing the import issue
const Link = NavLink;

export default Sidebar;