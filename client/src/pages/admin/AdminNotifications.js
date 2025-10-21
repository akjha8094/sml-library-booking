import React, { useState, useEffect } from 'react';
import { FaBell, FaTrash, FaCheckDouble, FaMoneyBillWave, FaTicketAlt, FaHeadset, FaClipboardList } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminNotifications();
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
      await api.markAdminNotificationRead(id);
      setNotifications(notifications.map(n => 
        n.id === id ? { ...n, is_read: true } : n
      ));
      toast.success('Marked as read');
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.markAllAdminNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const deleteNotification = async (id) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) return;
    
    try {
      await api.deleteAdminNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'payment': return <FaMoneyBillWave color="#10B981" />;
      case 'booking': return <FaTicketAlt color="#6366F1" />;
      case 'support': return <FaHeadset color="#F59E0B" />;
      case 'plan': return <FaClipboardList color="#EC4899" />;
      default: return <FaBell color="#6B7280" />;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'payment': return '#D1FAE5';
      case 'booking': return '#E0E7FF';
      case 'support': return '#FEF3C7';
      case 'plan': return '#FCE7F3';
      default: return '#F3F4F6';
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.is_read;
    return n.type === filter;
  });

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: '0 0 5px 0', fontSize: '28px', fontWeight: '700', color: '#1F2937' }}>
              Admin Notifications
            </h2>
            <p style={{ margin: 0, color: '#6B7280', fontSize: '14px' }}>
              {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              style={{
                padding: '10px 20px',
                background: '#6366F1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontWeight: '600'
              }}
            >
              <FaCheckDouble /> Mark All as Read
            </button>
          )}
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {[
            { value: 'all', label: 'All' },
            { value: 'unread', label: 'Unread' },
            { value: 'payment', label: 'Payments' },
            { value: 'booking', label: 'Bookings' },
            { value: 'support', label: 'Support' },
            { value: 'plan', label: 'Plans' }
          ].map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              style={{
                padding: '8px 16px',
                background: filter === value ? '#6366F1' : 'white',
                color: filter === value ? 'white' : '#6B7280',
                border: `2px solid ${filter === value ? '#6366F1' : '#E5E7EB'}`,
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'all 0.3s'
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>
          <div style={{ fontSize: '18px', color: '#6B7280' }}>Loading notifications...</div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '60px',
          borderRadius: '12px',
          textAlign: 'center',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}>
          <FaBell size={48} color="#D1D5DB" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#6B7280', margin: '0 0 10px 0' }}>No Notifications</h3>
          <p style={{ color: '#9CA3AF', margin: 0 }}>
            {filter === 'all' ? 'You have no notifications yet' : `No ${filter} notifications`}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              style={{
                background: notification.is_read ? 'white' : getTypeColor(notification.type),
                padding: '20px',
                borderRadius: '12px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                border: notification.is_read ? '1px solid #E5E7EB' : '2px solid #6366F1',
                position: 'relative',
                transition: 'all 0.3s'
              }}
            >
              {!notification.is_read && (
                <div style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '10px',
                  height: '10px',
                  background: '#3B82F6',
                  borderRadius: '50%'
                }} />
              )}

              <div style={{ display: 'flex', gap: '15px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  {getTypeIcon(notification.type)}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1F2937' }}>
                      {notification.title}
                    </h4>
                    <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '10px' }}>
                      {!notification.is_read && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#10B981',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            fontWeight: '600'
                          }}
                          title="Mark as read"
                        >
                          <FaCheckDouble />
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        style={{
                          padding: '6px 12px',
                          background: '#EF4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                        title="Delete"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>

                  <p style={{ margin: '0 0 10px 0', color: '#4B5563', fontSize: '14px', lineHeight: '1.5' }}>
                    {notification.message}
                  </p>

                  <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{
                      padding: '4px 10px',
                      background: 'white',
                      color: '#6B7280',
                      fontSize: '12px',
                      borderRadius: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize',
                      border: '1px solid #E5E7EB'
                    }}>
                      {notification.type}
                    </span>
                    <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                      {new Date(notification.created_at).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminNotifications;
