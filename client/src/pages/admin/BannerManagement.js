import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaImage, FaCheckCircle, FaTimesCircle, FaImages } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const BannerManagement = () => {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    image_url: '',
    link_url: '',
    display_order: 1,
    is_active: true
  });
  const [editingId, setEditingId] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      setLoading(true);
      const response = await api.getAllBanners(); // Use admin endpoint to get ALL banners
      setBanners(response.banners || response || []);
    } catch (error) {
      toast.error('Failed to fetch banners');
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryImages = async () => {
    try {
      const response = await api.get('/gallery?category=banner');
      setGalleryImages(response.images || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const selectImageFromGallery = (imagePath) => {
    setFormData({ ...formData, image_url: imagePath });
    setShowGallery(false);
    toast.success('Image selected from gallery');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateBanner(editingId, formData);
        toast.success('Banner updated successfully');
      } else {
        await api.createBanner(formData);
        toast.success('Banner created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchBanners();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (banner) => {
    setFormData({
      title: banner.title,
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      display_order: banner.display_order,
      is_active: banner.is_active
    });
    setEditingId(banner.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this banner?')) {
      try {
        await api.deleteBanner(id);
        toast.success('Banner deleted successfully');
        fetchBanners();
      } catch (error) {
        toast.error('Failed to delete banner');
      }
    }
  };

  const resetForm = () => {
    setFormData({ title: '', image_url: '', link_url: '', display_order: 1, is_active: true });
    setEditingId(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Banner Management</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <FaPlus /> Add Banner
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : banners.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <FaImage size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Banners Found</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>Click "Add Banner" to create your first banner</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {banners.map((banner) => (
            <div key={banner.id} style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
              <div style={{ position: 'relative', paddingTop: '56.25%', background: '#f3f4f6' }}>
                {banner.image_url ? (
                  <img
                    src={banner.image_url}
                    alt={banner.title}
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FaImage size={50} color="#9ca3af" />
                  </div>
                )}
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  {banner.is_active ? (
                    <FaCheckCircle size={24} color="#10b981" />
                  ) : (
                    <FaTimesCircle size={24} color="#ef4444" />
                  )}
                </div>
              </div>
              <div style={{ padding: '15px' }}>
                <h3 style={{ margin: '0 0 8px 0' }}>{banner.title}</h3>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
                  Order: {banner.display_order}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={() => handleEdit(banner)} style={{ flex: 1, padding: '8px', background: '#fbbf24', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => handleDelete(banner.id)} style={{ flex: 1, padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px', overflowY: 'auto' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '100%', maxWidth: '600px', margin: 'auto' }}>
            <h3>{editingId ? 'Edit Banner' : 'Add New Banner'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Banner Title *</label>
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Image URL *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="url" 
                    value={formData.image_url} 
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })} 
                    required 
                    style={{ flex: 1, padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} 
                    placeholder="https://example.com/banner.jpg" 
                  />
                  <button
                    type="button"
                    onClick={() => { setShowGallery(true); fetchGalleryImages(); }}
                    style={{
                      padding: '10px 20px',
                      background: '#10B981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <FaImages /> Gallery
                  </button>
                </div>
                {formData.image_url && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#f3f4f6', borderRadius: '6px' }}>
                    <img 
                      src={formData.image_url} 
                      alt="Preview" 
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'contain', borderRadius: '6px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Link URL (Optional)</label>
                <input type="url" value={formData.link_url} onChange={(e) => setFormData({ ...formData, link_url: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} placeholder="https://example.com" />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Display Order *</label>
                <input type="number" value={formData.display_order} onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })} required min="1" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} style={{ width: '18px', height: '18px' }} />
                  <span style={{ fontWeight: '500' }}>Active</span>
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

      {/* Gallery Modal */}
      {showGallery && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001, padding: '20px' }}>
          <div style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '1000px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '20px 30px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>📸 Select from Gallery (Banners)</h3>
              <button
                onClick={() => setShowGallery(false)}
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer', fontSize: '14px' }}
              >
                Close
              </button>
            </div>
            
            <div style={{ padding: '20px 30px', overflowY: 'auto', flex: 1 }}>
              {galleryImages.length === 0 ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <FaImages size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
                  <p style={{ color: '#6b7280' }}>No banner images in gallery. Go to Gallery Management to upload images with category "Banner".</p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
                  {galleryImages.map((image) => (
                    <div
                      key={image.id}
                      onClick={() => selectImageFromGallery(image.image_path)}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        border: formData.image_url === image.image_path ? '3px solid #6366f1' : '2px solid #e5e7eb',
                        transition: 'all 0.3s',
                        background: 'white'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'scale(1.05)';
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ position: 'relative', paddingTop: '60%', background: '#f3f4f6' }}>
                        <img
                          src={image.image_path}
                          alt={image.title}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                      <div style={{ padding: '10px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{image.title}</div>
                        <div style={{ fontSize: '10px', color: '#6b7280' }}>{new Date(image.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BannerManagement;
