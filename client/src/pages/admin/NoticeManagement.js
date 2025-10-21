import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBullhorn } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const NoticeManagement = () => {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '', is_active: true });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notices/admin');
      setNotices(response.notices || response || []);
    } catch (error) {
      toast.error('Failed to fetch notices');
      console.error('Fetch notices error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/notices/${editingId}`, formData);
        toast.success('Notice updated');
      } else {
        await api.post('/notices', formData);
        toast.success('Notice created');
      }
      setShowModal(false);
      resetForm();
      fetchNotices();
    } catch (error) {
      toast.error(error.message || 'Failed');
    }
  };

  const handleEdit = (notice) => {
    setFormData(notice);
    setEditingId(notice.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete notice?')) {
      try {
        await api.delete(`/notices/${id}`);
        toast.success('Deleted');
        fetchNotices();
      } catch (error) {
        toast.error('Failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', is_active: true });
    setEditingId(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Notice Board Management</h2>
        <button onClick={() => { resetForm(); setShowModal(true); }} style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPlus /> Add Notice
        </button>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div> : notices.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <FaBullhorn size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Notices Found</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>Click "Add Notice" to create your first notice</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {notices.map((notice) => (
            <div key={notice.id} style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: notice.is_active ? '4px solid #10b981' : '4px solid #6c757d' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <FaBullhorn color="#6366f1" />
                    <h3 style={{ margin: 0 }}>{notice.title}</h3>
                    <span style={{ padding: '2px 10px', borderRadius: '12px', fontSize: '11px', background: notice.is_active ? '#d1fae5' : '#fee2e2', color: notice.is_active ? '#065f46' : '#991b1b' }}>{notice.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <p style={{ color: '#6b7280', margin: 0 }}>{notice.content}</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                  <button onClick={() => handleEdit(notice)} style={{ padding: '8px 16px', background: '#fbbf24', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><FaEdit /></button>
                  <button onClick={() => handleDelete(notice.id)} style={{ padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><FaTrash /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px' }}>
            <h3>{editingId ? 'Edit Notice' : 'Add Notice'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Content *</label>
                <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '100px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: '500' }}>Active (Display on Homepage)</span>
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{editingId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoticeManagement;
