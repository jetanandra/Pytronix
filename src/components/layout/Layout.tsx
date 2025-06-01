import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { useNotifications } from '../../context/NotificationContext';
import NotificationPanel from '../ui/NotificationPanel';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { showNotificationPanel } = useNotifications();

  return (
    <div className="flex flex-col min-h-screen relative">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      
      {/* Notification Panel rendered at the layout level */}
      <NotificationPanel />
    </div>
  );
};

export default Layout;