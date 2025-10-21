import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { FaBell, FaWallet, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import BottomNav from '../navigation/BottomNav';
import api from '../../services/api';
import styles from './UserLayout.module.css';

const UserLayout = () => {
  const { user, logout, updateUser } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    fetchUnreadCount();
    fetchWalletBalance();
    // Poll every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
      fetchWalletBalance();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await api.getNotifications();
      const count = (response.notifications || []).filter(n => !n.is_read).length;
      setUnreadCount(count);
    } catch (error) {
      console.error('Error fetching notification count:', error);
    }
  };

  const fetchWalletBalance = async () => {
    try {
      const response = await api.getWallet();
      setWalletBalance(response.balance || 0);
      // Update user context with wallet balance
      if (user) {
        updateUser({ wallet_balance: response.balance || 0 });
      }
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  return (
    <div className={styles.layout}>
      {/* Top Navigation */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <button className={styles.menuBtn} onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
          
          <div className={styles.logo}>
            <span className={styles.logoSm}>Sm</span>
            <span className={styles.logoText}>Smart Library</span>
          </div>

          <div className={styles.headerActions}>
            <button className={styles.iconBtn} onClick={() => navigate('/wallet')}>
              <FaWallet />
              <span className={styles.walletBadge}>₹{parseFloat(walletBalance || 0).toFixed(0)}</span>
            </button>
            <button className={styles.iconBtn} onClick={() => navigate('/notifications')} style={{ position: 'relative' }}>
              <FaBell />
              {unreadCount > 0 && (
                <span className={styles.notificationBadge}>{unreadCount > 99 ? '99+' : unreadCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.container}>
          <Outlet />
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Side Menu (Mobile) */}
      {menuOpen && (
        <div className={styles.sideMenu} onClick={() => setMenuOpen(false)}>
          <div className={styles.sideMenuContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sideMenuHeader}>
              <h3>Menu</h3>
              <button onClick={() => setMenuOpen(false)}><FaTimes /></button>
            </div>
            <div className={styles.sideMenuBody}>
              <button onClick={toggleTheme}>
                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
              <button onClick={logout}>Logout</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserLayout;
