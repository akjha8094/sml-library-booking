import React, { useState } from 'react';
import { FaBell, FaPaperPlane } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const NotificationManagement = () => {
  const [formData, setFormData] = useState({ title: '', message: '', target: 'all', user_ids: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.sendNotification(formData);
      toast.success('Notification sent successfully');
      setFormData({ title: '', message: '', target: 'all', user_ids: '' });
    } catch (error) {
      toast.error('Failed to send notification');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <FaBell size={48} color="#6366f1" style={{ marginBottom: '15px' }} />
        <h2 style={{ margin: 0 }}>Send Notifications to Users</h2>
        <p style={{ color: '#6b7280', marginTop: '10px' }}>Broadcast messages to all users or specific users</p>
      </div>

      <div style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Notification Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
              placeholder="Enter notification title"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Message *</label>
            <textarea
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px', minHeight: '120px' }}
              placeholder="Enter your message here..."
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>Send To *</label>
            <select
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
            >
              <option value="all">All Users</option>
              <option value="active">Active Members Only</option>
              <option value="specific">Specific Users (by ID)</option>
            </select>
          </div>

          {formData.target === 'specific' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px' }}>User IDs (comma separated)</label>
              <input
                type="text"
                value={formData.user_ids}
                onChange={(e) => setFormData({ ...formData, user_ids: e.target.value })}
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '8px', fontSize: '14px' }}
                placeholder="e.g., 1,2,3,5"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={sending}
            style={{
              width: '100%',
              padding: '14px',
              background: sending ? '#9ca3af' : '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: sending ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            <FaPaperPlane /> {sending ? 'Sending...' : 'Send Notification'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NotificationManagement;
