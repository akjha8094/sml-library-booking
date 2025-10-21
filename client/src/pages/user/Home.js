import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaChair, FaClipboardList, FaHistory, FaRupeeSign, 
  FaCalendarAlt, FaBuilding, FaChevronLeft, FaChevronRight 
} from 'react-icons/fa';
import api from '../../services/api';
import Card from '../../components/common/Card';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const [banners, setBanners] = useState([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [facilities, setFacilities] = useState([]);
  const [notices, setNotices] = useState([]);

  useEffect(() => {
    fetchBanners();
    fetchFacilities();
    fetchNotices();
  }, []);

  // Auto-slide banners every 5 seconds
  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentBanner((prev) => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const fetchBanners = async () => {
    try {
      const response = await api.getBanners();
      setBanners(response.banners || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    }
  };

  const fetchFacilities = async () => {
    try {
      const response = await api.getFacilities();
      setFacilities(response.facilities || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
    }
  };

  const fetchNotices = async () => {
    try {
      const response = await api.get('/notices');
      setNotices(response.notices || []);
    } catch (error) {
      console.error('Error fetching notices:', error);
    }
  };

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % (banners.length || 1));
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % (banners.length || 1));
  };

  const menuItems = [
    {
      title: 'Check seat',
      icon: <FaChair />,
      path: '/check-seats',
      color: '#EF476F'
    },
    {
      title: 'Facilities',
      icon: <FaBuilding />,
      path: '/facilities',
      color: '#EF476F'
    },
    {
      title: 'Plans',
      icon: <FaClipboardList />,
      path: '/plans',
      color: '#EF476F'
    },
    {
      title: 'Renew seat / due payment',
      icon: <FaRupeeSign />,
      path: '/my-bookings',
      color: '#EF476F'
    },
    {
      title: 'Payment history',
      icon: <FaHistory />,
      path: '/my-bookings',
      color: '#EF476F'
    },
    {
      title: 'Advance booking',
      icon: <FaCalendarAlt />,
      path: '/advance-booking',
      color: '#EF476F'
    }
  ];

  return (
    <div className={styles.home}>
      {/* Notices Section - Now at Top */}
      {notices.length > 0 && (
        <div className={styles.noticesSection}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>📢 Latest Notices</h3>
            <span className={styles.badge}>{notices.length}</span>
          </div>
          <div className={styles.noticesGrid}>
            {notices.slice(0, 3).map((notice) => (
              <div key={notice.id} className={styles.noticeCard}>
                <div className={styles.noticeHeader}>
                  <h4 className={styles.noticeTitle}>{notice.title}</h4>
                  <span className={styles.noticeDate}>
                    {new Date(notice.created_at).toLocaleDateString('en-IN', { 
                      day: 'numeric', 
                      month: 'short' 
                    })}
                  </span>
                </div>
                <p className={styles.noticeContent}>{notice.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Banner Carousel */}
      <div className={styles.bannerSection}>
        <div className={styles.bannerContainer}>
          {banners.length > 0 ? (
            <>
              <button className={styles.bannerNav} onClick={prevBanner}>
                <FaChevronLeft />
              </button>
              <div className={styles.banner}>
                <img 
                  src={banners[currentBanner]?.image_url || banners[currentBanner]?.image || '/placeholder-banner.jpg'} 
                  alt={banners[currentBanner]?.title || 'Banner'} 
                  className={styles.bannerImage}
                />
              </div>
              <button className={styles.bannerNav} onClick={nextBanner}>
                <FaChevronRight />
              </button>
            </>
          ) : (
            <div className={styles.banner}>
              <img 
                src="/placeholder-banner.jpg" 
                alt="Default Banner" 
                className={styles.bannerImage}
              />
            </div>
          )}
        </div>
        {banners.length > 1 && (
          <div className={styles.bannerDots}>
            {banners.map((_, index) => (
              <span 
                key={index}
                className={`${styles.dot} ${index === currentBanner ? styles.activeDot : ''}`}
                onClick={() => setCurrentBanner(index)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Menu Grid */}
      <div className={styles.menuGrid}>
        {menuItems.map((item, index) => (
          <Card 
            key={index}
            hover
            clickable
            onClick={() => navigate(item.path)}
            className={styles.menuCard}
            style={{ background: item.color }}
          >
            <div className={styles.menuIcon}>{item.icon}</div>
            <div className={styles.menuTitle}>{item.title}</div>
          </Card>
        ))}
      </div>

      {/* Facilities Preview */}
      {facilities.length > 0 && (
        <div className={styles.facilitiesSection}>
          <h3 className={styles.sectionTitle}>🏢 Our Facilities</h3>
          <div className={styles.facilitiesGrid}>
            {facilities.slice(0, 6).map((facility) => (
              <div key={facility.id} className={styles.facilityItem}>
                <div className={styles.facilityIcon}>
                  {facility.icon ? <img src={facility.icon} alt={facility.title || facility.name} style={{ width: '30px', height: '30px' }} /> : '📚'}
                </div>
                <div className={styles.facilityName}>{facility.title || facility.name}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
