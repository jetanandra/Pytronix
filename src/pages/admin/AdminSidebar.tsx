import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  ChevronRight,
  Menu,
  X,
  AlertTriangle,
  Layers,
  Star,
  Calendar,
  MessageSquare,
  Image
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  const routes = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: <LayoutDashboard className="w-5 h-5" />
    },
    {
      name: 'Products',
      path: '/admin/products',
      icon: <Package className="w-5 h-5" />
    },
    {
      name: 'Categories',
      path: '/admin/categories',
      icon: <Layers className="w-5 h-5" />
    },
    {
      name: 'Orders',
      path: '/admin/orders',
      icon: <ShoppingBag className="w-5 h-5" />
    },
    {
      name: 'Reviews',
      path: '/admin/reviews',
      icon: <Star className="w-5 h-5" />
    },
    {
      name: 'Cancellations',
      path: '/admin/cancellations',
      icon: <AlertTriangle className="w-5 h-5" />
    },
    {
      name: 'Workshops',
      path: '/admin/workshops',
      icon: <Calendar className="w-5 h-5" />
    },
    {
      name: 'Workshop Categories',
      path: '/admin/workshop-categories',
      icon: <Layers className="w-5 h-5" />
    },
    {
      name: 'Workshop Requests',
      path: '/admin/workshop-requests',
      icon: <MessageSquare className="w-5 h-5" />
    },
    {
      name: 'Hero Slides',
      path: '/admin/hero-slides',
      icon: <Image className="w-5 h-5" />
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: <Users className="w-5 h-5" />
    },
    {
      name: 'Settings',
      path: '/admin/settings',
      icon: <Settings className="w-5 h-5" />
    }
  ];
  
  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed top-20 left-4 z-20">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 rounded-md bg-white dark:bg-light-navy shadow-md"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      
      {/* Sidebar */}
      <aside 
        className={`
          w-64 bg-white dark:bg-light-navy border-r border-gray-200 dark:border-gray-700 
          fixed md:sticky top-0 pt-20 md:pt-0 h-screen z-10 transition-transform duration-300
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="p-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 font-orbitron">
            Admin Panel
          </h2>
          
          <nav className="space-y-1">
            {routes.map((route) => {
              const isActive = location.pathname === route.path || 
                              (route.path !== '/admin' && location.pathname.startsWith(route.path));
              
              return (
                <Link
                  key={route.path}
                  to={route.path}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition
                    ${isActive 
                      ? 'bg-neon-blue text-white' 
                      : 'text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy'}
                  `}
                >
                  {route.icon}
                  <span className="ml-3">{route.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>
        </div>
        
        <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={signOut}
            className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy rounded-lg transition"
          >
            <LogOut className="w-5 h-5 text-red-500" />
            <span className="ml-3">Sign Out</span>
          </button>
        </div>
      </aside>
      
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-0 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}
    </>
  );
};

export default AdminSidebar;