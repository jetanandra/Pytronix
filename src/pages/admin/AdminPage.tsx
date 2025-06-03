import React, { useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import ProductList from './ProductList';
import ProductForm from './ProductForm';
import OrderList from './OrderList';
import OrderDetail from './OrderDetail';
import UserList from './UserList';
import AdminCategoryPage from './AdminCategoryPage';
import { Shield, AlertTriangle } from 'lucide-react';
import ReviewManagementPage from './ReviewManagementPage';
import OrderCancellationsPage from './OrderCancellationsPage';
import WorkshopManagementPage from './WorkshopManagementPage';
import WorkshopForm from './WorkshopForm';
import WorkshopRequestsPage from './WorkshopRequestsPage';
import WorkshopCategoryManagement from './WorkshopCategoryManagement';
import HeroSlideManagement from './HeroSlideManagement';

const AdminPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Check if user has admin role
  const isAdmin = user?.user_metadata?.role === 'admin';
  
  // Redirect if user is not admin
  useEffect(() => {
    if (user && !isAdmin) {
      navigate('/admin-setup');
    }
  }, [user, isAdmin, navigate]);
  
  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
          <p className="text-gray-600 dark:text-soft-gray mb-6">
            Please sign in to access the admin dashboard.
          </p>
          <a href="/login" className="btn-primary">Sign In</a>
        </div>
      </div>
    );
  }
  
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-32 pb-12 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-yellow-500 mb-4 mx-auto" />
          <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
          <p className="text-gray-600 dark:text-soft-gray mb-6">
            You need admin privileges to access this page.
          </p>
          <a href="/admin-setup" className="btn-primary">Set Up Admin Access</a>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen pt-20">
      <div className="flex flex-col md:flex-row">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Routes>
            <Route path="/" element={<AdminDashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/new" element={<ProductForm />} />
            <Route path="/products/edit/:id" element={<ProductForm isEdit />} />
            <Route path="/orders" element={<OrderList />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/categories" element={<AdminCategoryPage />} />
            <Route path="/users" element={<UserList />} />
            <Route path="/reviews" element={<ReviewManagementPage />} />
            <Route path="/cancellations" element={<OrderCancellationsPage />} />
            <Route path="/workshops" element={<WorkshopManagementPage />} />
            <Route path="/workshops/new" element={<WorkshopForm />} />
            <Route path="/workshops/edit/:id" element={<WorkshopForm isEdit />} />
            <Route path="/workshop-requests" element={<WorkshopRequestsPage />} />
            <Route path="/workshop-categories" element={<WorkshopCategoryManagement />} />
            <Route path="/hero-slides" element={<HeroSlideManagement />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AdminPage;