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
const AdminPage = lazy(() => import('../pages/admin/AdminPage'));
const ProfilePage = lazy(() => import('../pages/ProfilePage'));
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'));
const AdminSetupPage = lazy(() => import('../pages/AdminSetupPage'));
const AdminCategoryPage = lazy(() => import('../pages/admin/AdminCategoryPage'));
const AboutUsPage = lazy(() => import('../pages/AboutUsPage'));
const ContactPage = lazy(() => import('../pages/ContactPage'));
const BlogPage = lazy(() => import('../pages/BlogPage'));
const FAQPage = lazy(() => import('../pages/FAQPage'));
const ShippingReturnsPage = lazy(() => import('../pages/ShippingReturnsPage'));
const WarrantyPage = lazy(() => import('../pages/WarrantyPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const OrdersPage = lazy(() => import('../pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('../pages/OrderDetailPage'));
const OrderDetail = lazy(() => import('../pages/admin/OrderDetail'));
const OrderCancellationsPage = lazy(() => import('../pages/admin/OrderCancellationsPage'));
const ReviewManagementPage = lazy(() => import('../pages/admin/ReviewManagementPage'));

// Workshop System Pages
const WorkshopsPage = lazy(() => import('../pages/WorkshopsPage'));
const WorkshopDetailPage = lazy(() => import('../pages/WorkshopDetailPage'));
const WorkshopRequestPage = lazy(() => import('../pages/WorkshopRequestPage'));
const WorkshopCategoryManagement = lazy(() => import('../pages/admin/WorkshopCategoryManagement'));
const WorkshopsAllPage = lazy(() => import('../pages/WorkshopsAllPage'));

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
              <Route path="/orders" element={
                <AuthGuard>
                  <OrdersPage />
                </AuthGuard>
              } />
              <Route path="/orders/:id" element={
                <AuthGuard>
                  <OrderDetailPage />
                </AuthGuard>
              } />
              <Route path="/admin/*" element={
                <AuthGuard>
                  <AdminPage />
                </AuthGuard>
              } />
              <Route path="/admin-setup" element={<AdminSetupPage />} />
              <Route path="/admin/orders/:id" element={
                <AuthGuard>
                  <OrderDetail />
                </AuthGuard>
              } />
              <Route path="/about" element={<AboutUsPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/shipping" element={<ShippingReturnsPage />} />
              <Route path="/warranty" element={<WarrantyPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Workshop Routes */}
              <Route path="/workshops" element={<WorkshopsPage />} />
              <Route path="/workshops/all" element={<WorkshopsAllPage />} />
              <Route path="/workshops/category/:id" element={<WorkshopsPage />} />
              <Route path="/workshop/:id" element={<WorkshopDetailPage />} />
              <Route path="/workshop-request" element={<WorkshopRequestPage />} />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </Layout>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default AppRoutes;