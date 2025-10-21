import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FaTachometerAlt, FaUsers, FaChair, FaClipboardList, 
  FaCreditCard, FaBuilding, FaImage, FaBullhorn, 
  FaTicketAlt, FaBell, FaChartLine, FaMoneyBillWave,
  FaCog, FaSignOutAlt, FaGift, FaCalendarPlus, FaHeadset, FaImages,
  FaUndo, FaHistory, FaUserClock
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import styles from './AdminSidebar.module.css';

const AdminSidebar = () => {
  const { logout } = useAuth();

  const menuItems = [
    { path: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/admin/members', icon: <FaUsers />, label: 'User Management' },
    { path: '/admin/seats', icon: <FaChair />, label: 'Seats' },
    { path: '/admin/plans', icon: <FaClipboardList />, label: 'Plans' },
    { path: '/admin/facilities', icon: <FaBuilding />, label: 'Facilities' },
    { path: '/admin/payments', icon: <FaCreditCard />, label: 'Payments' },
    { path: '/admin/refunds', icon: <FaUndo />, label: 'Refunds' },
    { path: '/admin/user-refund-requests', icon: <FaUserClock />, label: 'Refund Requests' },
    { path: '/admin/gallery', icon: <FaImages />, label: 'Gallery' },
    { path: '/admin/banners', icon: <FaImage />, label: 'Banners' },
    { path: '/admin/notices', icon: <FaBullhorn />, label: 'Notices' },
    { path: '/admin/coupons', icon: <FaTicketAlt />, label: 'Coupons' },
    { path: '/admin/offers', icon: <FaGift />, label: 'Offers' },
    { path: '/admin/advance-bookings', icon: <FaCalendarPlus />, label: 'Advance Bookings' },
    { path: '/admin/support', icon: <FaHeadset />, label: 'Support Tickets' },
    { path: '/admin/notifications', icon: <FaBell />, label: 'Notifications' },
    { path: '/admin/reports', icon: <FaChartLine />, label: 'Reports' },
    { path: '/admin/expenses', icon: <FaMoneyBillWave />, label: 'Expenses' },
    { path: '/admin/audit-logs', icon: <FaHistory />, label: 'Audit Logs' },
    { path: '/admin/gateway-settings', icon: <FaCog />, label: 'Settings' }
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2>Admin Panel</h2>
      </div>

      <nav className={styles.sidebarNav}>
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <button onClick={logout} className={styles.logoutBtn}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
