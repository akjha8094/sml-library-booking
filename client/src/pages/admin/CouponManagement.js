import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaTicketAlt, FaCopy } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'flat',
    discount_value: '',
    min_purchase_amount: 0,
    max_discount_amount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
    is_active: true
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const response = await api.getCoupons();
      setCoupons(response.coupons || response || []);
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateCoupon(editingId, formData);
        toast.success('Coupon updated');
      } else {
        await api.createCoupon(formData);
        toast.success('Coupon created');
      }
      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (error) {
      toast.error(error.message || 'Failed');
    }
  };

  const handleEdit = (coupon) => {
    setFormData(coupon);
    setEditingId(coupon.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this coupon?')) {
      try {
        await api.delete(`/coupons/${id}`);
        toast.success('Deleted');
        fetchCoupons();
      } catch (error) {
        toast.error('Failed to delete');
      }
    }
  };

  const resetForm = () => {
    setFormData({ code: '', description: '', discount_type: 'flat', discount_value: '', min_purchase_amount: 0, max_discount_amount: '', usage_limit: '', valid_from: '', valid_until: '', is_active: true });
    setEditingId(null);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success('Copied!');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Coupon Management</h2>
        <button onClick={() => { resetForm(); setShowModal(true); }} style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPlus /> Add Coupon
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : coupons.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <FaTicketAlt size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Coupons Found</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>Click "Add Coupon" to create your first coupon</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {coupons.map((coupon) => (
            <div key={coupon.id} style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
                <FaTicketAlt size={24} color="#6366f1" />
                <code style={{ fontSize: '18px', fontWeight: 'bold', color: '#1f2937' }}>{coupon.code}</code>
                <button onClick={() => copyCode(coupon.code)} style={{ padding: '5px', background: '#f3f4f6', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  <FaCopy size={14} />
                </button>
              </div>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '15px' }}>{coupon.description}</p>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
                <span style={{ padding: '4px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                  {coupon.discount_type === 'flat' ? `₹${coupon.discount_value} OFF` : `${coupon.discount_value}% OFF`}
                </span>
                <span style={{ padding: '4px 12px', background: coupon.is_active ? '#d1fae5' : '#fee2e2', color: coupon.is_active ? '#065f46' : '#991b1b', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>
                  {coupon.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '15px' }}>
                <div>Valid: {new Date(coupon.valid_from).toLocaleDateString()} - {new Date(coupon.valid_until).toLocaleDateString()}</div>
                <div>Used: {coupon.used_count || 0} / {coupon.usage_limit || '∞'}</div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleEdit(coupon)} style={{ flex: 1, padding: '8px', background: '#fbbf24', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><FaEdit /> Edit</button>
                <button onClick={() => handleDelete(coupon.id)} style={{ flex: 1, padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}><FaTrash /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, overflow: 'auto' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '600px', maxHeight: '90vh', overflow: 'auto' }}>
            <h3>{editingId ? 'Edit Coupon' : 'Add Coupon'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Coupon Code *</label>
                  <input type="text" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} placeholder="SAVE20" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '60px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Type *</label>
                  <select value={formData.discount_type} onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                    <option value="flat">Flat</option>
                    <option value="percentage">Percentage</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Discount Value *</label>
                  <input type="number" value={formData.discount_value} onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })} required min="0" step="0.01" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Min Purchase (₹)</label>
                  <input type="number" value={formData.min_purchase_amount} onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })} min="0" step="0.01" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Max Discount (₹)</label>
                  <input type="number" value={formData.max_discount_amount} onChange={(e) => setFormData({ ...formData, max_discount_amount: e.target.value })} min="0" step="0.01" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Usage Limit</label>
                  <input type="number" value={formData.usage_limit} onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })} min="1" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} placeholder="Unlimited" />
                </div>
                <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Valid From *</label>
                    <input type="date" value={formData.valid_from} onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Valid Until *</label>
                    <input type="date" value={formData.valid_until} onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
                  </div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontWeight: '500' }}>Active</span>
                  </label>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '20px' }}>
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

export default CouponManagement;
