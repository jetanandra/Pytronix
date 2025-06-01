import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './index.css';
import AppRoutes from './routes';
import { ThemeProvider } from './context/ThemeContext';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { ProfileProvider } from './context/ProfileContext';
import { NotificationProvider } from './context/NotificationContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <CartProvider>
            <NotificationProvider>
              <Toaster 
                position="top-right"
                toastOptions={{
                  style: {
                    background: '#333',
                    color: '#fff',
                  },
                  success: {
                    duration: 3000,
                    iconTheme: {
                      primary: '#22c55e',
                      secondary: '#fff',
                    },
                  },
                  error: {
                    duration: 4000,
                    iconTheme: {
                      primary: '#ef4444',
                      secondary: '#fff',
                    },
                  },
                }}
              />
              <AppRoutes />
            </NotificationProvider>
          </CartProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);