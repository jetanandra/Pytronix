import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import LoaderSpinner from '../components/ui/LoaderSpinner';
import ErrorBoundary from '../components/ui/ErrorBoundary';
import AuthGuard from '../components/auth/AuthGuard';

// Lazy load pages for better performance
const HomePage = lazy(() => import('../pages/HomePage'));
const ProductsPage = lazy(() => import('../pages/ProductsPage'));
const ProductDetailPage = lazy(() => import('../pages/ProductDetailPage'));
const CartPage = lazy(() => import('../pages/CartPage'));
const CheckoutPage = lazy(() => import('../pages/CheckoutPage'));
const LoginPage = lazy(() => import('../pages/LoginPage'));
const AdminPage = lazy(() => import('../pages/AdminPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const AdminSetupPage = lazy(() => import('../pages/AdminSetupPage'));
const AdminCategoryPage = lazy(() => import('../pages/admin/AdminCategoryPage'));

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Layout>
          <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoaderSpinner size="lg" color="blue" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/products" element={<ProductsPage />} />
              <Route path="/product/:id" element={<ProductDetailPage />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={
                <AuthGuard>
                  <CheckoutPage />
                </AuthGuard>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/profile" element={
                <AuthGuard>
                  <ProfilePage />
                </AuthGuard>
              } />
              <Route path="/admin/*" element={
                <AuthGuard>
                  <AdminPage />
                </AuthGuard>
              } />
              <Route path="/admin-setup" element={<AdminSetupPage />} />
              <Route path="/admin/categories" element={
                <AuthGuard>
                  <AdminCategoryPage />
                </AuthGuard>
              } />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRoutes;