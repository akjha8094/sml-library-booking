import React, { useState, useEffect } from 'react';
import { FaBell, FaCheck, FaGift, FaCreditCard, FaTicketAlt, FaBullhorn, FaCalendar } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.getNotifications();
      setNotifications(response.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      await Promise.all(unreadIds.map(id => api.markNotificationRead(id)));
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const getIcon = (type) => {
    const icons = {
      offer: <FaGift />,
      payment: <FaCreditCard />,
      booking: <FaTicketAlt />,
      general: <FaBullhorn />,
      reminder: <FaCalendar />,
      support: <FaBell />
    };
    return icons[type] || <FaBell />;
  };

  const getTypeColor = (type) => {
    const colors = {
      offer: '#10B981',
      payment: '#3B82F6',
      booking: '#F59E0B',
      general: '#6366f1',
      reminder: '#EF4444',
      support: '#8B5CF6'
    };
    return colors[type] || '#6b7280';
  };

  const formatDate = (date) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return notifDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredNotifications = filter === 'all' 
    ? notifications 
    : filter === 'unread'
    ? notifications.filter(n => !n.is_read)
    : notifications.filter(n => n.type === filter);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 5px 0' }}>
              Notifications
            </h1>
            <p style={{ color: '#6b7280', margin: 0 }}>
              {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: '10px 20px',
                background: '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaCheck /> Mark All Read
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['all', 'unread', 'offer', 'booking', 'payment', 'support', 'general'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              style={{
                padding: '8px 16px',
                background: filter === type ? '#6366f1' : 'white',
                color: filter === type ? 'white' : '#6b7280',
                border: `2px solid ${filter === type ? '#6366f1' : '#e5e7eb'}`,
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'capitalize',
                transition: 'all 0.3s'
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading notifications...</div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '80px 20px',
          borderRadius: '16px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          textAlign: 'center'
        }}>
          <FaBell size={64} color="#d1d5db" style={{ marginBottom: '20px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Notifications</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            {filter === 'unread' ? 'You have no unread notifications' : 'You have no notifications yet'}
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.is_read && markAsRead(notification.id)}
              style={{
                background: notification.is_read ? 'white' : '#eff6ff',
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                cursor: notification.is_read ? 'default' : 'pointer',
                border: `2px solid ${notification.is_read ? '#e5e7eb' : '#bfdbfe'}`,
                transition: 'all 0.3s',
                display: 'flex',
                gap: '15px',
                alignItems: 'start'
              }}
              onMouseEnter={(e) => {
                if (!notification.is_read) {
                  e.currentTarget.style.transform = 'translateX(5px)';
                  e.currentTarget.style.borderColor = '#6366f1';
                }
              }}
              onMouseLeave={(e) => {
                if (!notification.is_read) {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.borderColor = '#bfdbfe';
                }
              }}
            >
              {/* Icon */}
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: getTypeColor(notification.type) + '20',
                color: getTypeColor(notification.type),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0
              }}>
                {getIcon(notification.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                  <h4 style={{ 
                    margin: 0, 
                    fontSize: '16px', 
                    fontWeight: notification.is_read ? '500' : '700',
                    color: '#1f2937'
                  }}>
                    {notification.title}
                  </h4>
                  {!notification.is_read && (
                    <div style={{
                      width: '10px',
                      height: '10px',
                      background: '#6366f1',
                      borderRadius: '50%',
                      marginTop: '5px',
                      flexShrink: 0,
                      marginLeft: '10px'
                    }} />
                  )}
                </div>

                <p style={{ 
                  margin: '0 0 10px 0', 
                  color: '#6b7280', 
                  fontSize: '14px',
                  lineHeight: '1.6'
                }}>
                  {notification.message}
                </p>

                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <span style={{
                    fontSize: '12px',
                    color: '#9ca3af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}>
                    <FaCalendar size={12} />
                    {formatDate(notification.created_at)}
                  </span>
                  <span style={{
                    padding: '3px 10px',
                    background: getTypeColor(notification.type) + '20',
                    color: getTypeColor(notification.type),
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'capitalize'
                  }}>
                    {notification.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Note */}
      {!loading && notifications.length > 0 && (
        <div style={{
          marginTop: '30px',
          padding: '15px 20px',
          background: '#f9fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          textAlign: 'center',
          fontSize: '14px',
          color: '#6b7280'
        }}>
          💡 Click on unread notifications to mark them as read
        </div>
      )}
    </div>
  );
};

export default Notifications;
