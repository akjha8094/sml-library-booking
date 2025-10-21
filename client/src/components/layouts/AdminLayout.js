import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FaBell } from 'react-icons/fa';
import AdminSidebar from '../navigation/AdminSidebar';
import api from '../../services/api';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.getAdminUnreadCount();
      setUnreadCount(response.count || 0);
    } catch (error) {
      console.error('Error fetching admin notification count:', error);
    }
  };

  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        {/* Admin Header */}
        <header className={styles.adminHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Admin Panel</h1>
            <button 
              className={styles.notificationBtn} 
              onClick={() => navigate('/admin/admin-notifications')}
              style={{ position: 'relative' }}
            >
              <FaBell size={20} />
              {unreadCount > 0 && (
                <span className={styles.notificationBadge}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </header>
        
        {/* Page Content */}
        <div className={styles.pageContent}>
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
