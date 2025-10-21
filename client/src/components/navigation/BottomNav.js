import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaHome, FaGift, FaHeadset, FaUser } from 'react-icons/fa';
import styles from './BottomNav.module.css';

const BottomNav = () => {
  const navItems = [
    { path: '/', icon: <FaHome />, label: 'Home' },
    { path: '/offers', icon: <FaGift />, label: 'Offers' },
    { path: '/support', icon: <FaHeadset />, label: 'Support' },
    { path: '/profile', icon: <FaUser />, label: 'Profile' }
  ];

  return (
    <nav className={styles.bottomNav}>
      {navItems.map((item) => (
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
  );
};

export default BottomNav;
