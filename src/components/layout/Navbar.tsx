import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ShoppingCart, Sun, Moon, ChevronDown, Search, LogOut, User, Shield, Bell } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import { motion } from 'framer-motion';
import { getAllCategories } from '../../services/productService';
import { Category } from '../../types';
import LogoPhytronix from '../../Logo/Logo-Phytronix.svg';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { cart } = useCart();
  const { user, signOut } = useAuth();
  const { unreadCount, toggleNotificationPanel } = useNotifications();
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchValue, setSearchValue] = useState('');
  
  // Get admin status from user metadata
  const isAdmin = user?.user_metadata?.role === 'admin';
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  // Handle scroll for transparent navbar effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    const fetchCategories = async () => {
      const data = await getAllCategories();
      setCategories(data);
    };
    fetchCategories();
  }, []);
  
  const navClass = isScrolled
    ? 'bg-white/90 dark:bg-dark-navy/90 shadow-md backdrop-blur-sm'
    : 'bg-transparent';
    
  const itemCount = cart.items.reduce((total, item) => total + item.quantity, 0);
  
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };
  
  const handleSearch = (e: React.FormEvent<HTMLFormElement> | React.MouseEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchOpen(false);
      setSearchValue('');
    }
  };
  
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navClass} backdrop-blur-md border-b border-neon-blue/30 dark:border-neon-blue/40`}
      style={{
        WebkitBackdropFilter: 'blur(16px)',
        backdropFilter: 'blur(16px)',
        boxShadow: theme === 'dark'
          ? '0 16px 48px 0 rgba(16,30,54,0.32), 0 2px 24px 0 rgba(16,30,54,0.18)'
          : '0 16px 48px 0 rgba(16,30,54,0.12), 0 2px 24px 0 rgba(16,30,54,0.08)',
        borderBottom: 'none',
        background: theme === 'dark'
          ? 'linear-gradient(to bottom, rgba(15,23,42,0.98) 70%, rgba(15,23,42,0.85) 100%)'
          : 'linear-gradient(to bottom, rgba(255,255,255,0.98) 70%, rgba(255,255,255,0.85) 100%)',
      }}
    >
      <nav className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src={LogoPhytronix}
              alt="Phytronix Logo"
              className="h-10 w-10 md:h-12 md:w-12 transition-transform duration-200 group-hover:scale-105 drop-shadow-lg bg-white/80 dark:bg-dark-navy/80 rounded-full p-1 border border-neon-blue dark:border-neon-blue"
              style={{ boxShadow: theme === 'dark' ? '0 2px 16px 0 #0ff4f8' : '0 2px 16px 0 #0a3d62' }}
            />
            <span className="ml-3 text-xl md:text-2xl font-orbitron font-bold text-neon-blue dark:text-neon-blue neon-text tracking-wide select-none">
              PHYTRONIX
            </span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link to="/" className="nav-link text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
              Home
            </Link>
            <div className="relative group">
              <button className="flex items-center text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                Products <ChevronDown className="ml-1 w-4 h-4" />
              </button>
              <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white dark:bg-light-navy opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-20">
                {categories.map(category => (
                  <Link
                    key={category.id}
                    to={`/products?category=${category.id}`}
                    className="block px-4 py-2 text-sm text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy hover:text-neon-blue dark:hover:text-neon-blue transition"
                  >
                    {category.name}
                  </Link>
                ))}
                <Link to="/products" className="block px-4 py-2 text-sm text-neon-blue hover:bg-gray-100 dark:hover:bg-dark-navy">
                  All Products
                </Link>
              </div>
            </div>
            <Link to="/workshops" className="nav-link text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
              Workshops
            </Link>
            <Link to="/cart" className="nav-link text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
              Cart
            </Link>
            {user ? (
              <div className="relative group">
                <button className="flex items-center text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                  <User className="w-4 h-4 mr-1" />
                  Account <ChevronDown className="ml-1 w-4 h-4" />
                </button>
                <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 w-64 rounded-md shadow-lg py-1 bg-white dark:bg-light-navy opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-30">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-soft-gray border-b border-gray-200 dark:border-gray-700 truncate max-w-xs" title={user.email}>
                    {user.email}
                  </div>
                  <Link to="/orders" className="block px-4 py-2 text-sm text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy">
                    My Orders
                  </Link>
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy">
                    Profile
                  </Link>
                  {isAdmin && (
                    <Link to="/admin" className="flex items-center px-4 py-2 text-sm text-neon-blue hover:bg-gray-100 dark:hover:bg-dark-navy">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </Link>
                  )}
                  {!isAdmin && (
                    <Link to="/admin-setup" className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-soft-gray hover:bg-gray-100 dark:hover:bg-dark-navy">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Setup
                    </Link>
                  )}
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-dark-navy"
                  >
                    <div className="flex items-center">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="nav-link text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue transition">
                Login
              </Link>
            )}
          </div>
          
          {/* Right Navigation (Search, Theme, Cart) */}
          <div className="flex items-center space-x-4">
            {/* Search Toggle */}
            <button 
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-light-navy transition"
            >
              <Search className="w-5 h-5 text-gray-700 dark:text-soft-gray" />
            </button>
            
            {/* Notification Bell - Only show for logged in users */}
            {user && (
              <button
                onClick={toggleNotificationPanel}
                className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-light-navy transition"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5 text-gray-700 dark:text-soft-gray" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center animate-pulse">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}
            
            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-light-navy transition"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-soft-gray" />
              ) : (
                <Moon className="w-5 h-5 text-gray-700" />
              )}
            </button>
            
            {/* Cart with Badge */}
            <Link to="/cart" className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-light-navy transition">
              <ShoppingCart className="w-5 h-5 text-gray-700 dark:text-soft-gray" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neon-blue text-white text-xs flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-soft-gray md:hidden focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
        
        {/* Search Bar - Expands when active */}
        {searchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="pt-4"
          >
            <form className="relative rounded-lg shadow-sm" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search for products..."
                className="w-full pl-10 pr-10 py-2 bg-white dark:bg-light-navy border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-neon-blue"
                autoFocus
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
              />
              <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <Search className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </nav>
      
      {/* Mobile Menu */}
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white dark:bg-dark-navy shadow-lg"
        >
          <div className="container-custom py-4 flex flex-col space-y-4">
            <Link to="/" className="py-2 text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue">
              Home
            </Link>
            <Link to="/products" className="py-2 text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue">
              All Products
            </Link>
            <Link to="/workshops" className="py-2 text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue">
              Workshops
            </Link>
            <Link to="/cart" className="py-2 text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue">
              Cart
            </Link>
            {user ? (
              <>
                <div className="py-2 text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  {user.email}
                </div>
                <Link to="/orders" className="py-2 text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue">
                  My Orders
                </Link>
                <Link to="/profile" className="py-2 text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue">
                  Profile
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="py-2 flex items-center text-neon-blue">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Dashboard
                  </Link>
                )}
                {!isAdmin && (
                  <Link to="/admin-setup" className="py-2 flex items-center text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue">
                    <Shield className="w-4 h-4 mr-2" />
                    Admin Setup
                  </Link>
                )}
                <button 
                  onClick={handleSignOut}
                  className="py-2 text-left text-red-600 hover:text-red-800 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </>
            ) : (
              <Link to="/login" className="py-2 text-gray-700 dark:text-soft-gray hover:text-neon-blue dark:hover:text-neon-blue">
                Login
              </Link>
            )}
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Navbar;