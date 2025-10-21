import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaImage, FaImages } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const FacilityManagement = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    is_active: true
  });
  const [editingId, setEditingId] = useState(null);
  const [showGallery, setShowGallery] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [galleryCategory, setGalleryCategory] = useState('facility');

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await api.getFacilities();
      setFacilities(response.facilities || response || []);
    } catch (error) {
      toast.error('Failed to fetch facilities');
    } finally {
      setLoading(false);
    }
  };

  const fetchGalleryImages = async (category = 'facility') => {
    try {
      const response = await api.get(`/gallery?category=${category}`);
      setGalleryImages(response.images || []);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    }
  };

  const openGallery = (category) => {
    setGalleryCategory(category);
    setShowGallery(true);
    fetchGalleryImages(category);
  };

  const selectImageFromGallery = (imagePath) => {
    setFormData({ ...formData, icon: imagePath });
    setShowGallery(false);
    toast.success('Image selected from gallery');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateFacility(editingId, formData);
        toast.success('Facility updated successfully');
      } else {
        await api.createFacility(formData);
        toast.success('Facility created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchFacilities();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (facility) => {
    setFormData({
      name: facility.name,
      description: facility.description || '',
      icon: facility.icon || '',
      is_active: facility.is_active
    });
    setEditingId(facility.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this facility?')) {
      try {
        await api.deleteFacility(id);
        toast.success('Facility deleted successfully');
        fetchFacilities();
      } catch (error) {
        toast.error('Failed to delete facility');
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', icon: '', is_active: true });
    setEditingId(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Facility Management</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{
            padding: '10px 20px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaPlus /> Add Facility
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : facilities.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <FaImage size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Facilities Found</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>Click "Add Facility" to create your first facility</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {facilities.map((facility) => (
            <div
              key={facility.id}
              style={{
                padding: '20px',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: facility.is_active ? '2px solid #10b981' : '2px solid #ddd'
              }}
            >
              <div style={{ marginBottom: '15px', textAlign: 'center' }}>
                {facility.icon ? (
                  <img src={facility.icon} alt={facility.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
                ) : (
                  <div style={{ width: '60px', height: '60px', background: '#f3f4f6', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                    <FaImage size={30} color="#9ca3af" />
                  </div>
                )}
              </div>
              
              <h3 style={{ margin: '0 0 10px 0', textAlign: 'center' }}>{facility.name}</h3>
              <p style={{ color: '#6b7280', fontSize: '14px', textAlign: 'center', marginBottom: '15px', minHeight: '40px' }}>
                {facility.description || 'No description'}
              </p>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '15px' }}>
                <span style={{
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '500',
                  background: facility.is_active ? '#d1fae5' : '#fee2e2',
                  color: facility.is_active ? '#065f46' : '#991b1b'
                }}>
                  {facility.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => handleEdit(facility)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#fbbf24',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  onClick={() => handleDelete(facility.id)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '5px'
                  }}
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
            <h3>{editingId ? 'Edit Facility' : 'Add New Facility'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Facility Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                  placeholder="e.g., WiFi, AC, Parking"
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '80px' }}
                  placeholder="Facility description..."
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Icon/Image URL</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <button
                    type="button"
                    onClick={() => openGallery('facility')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#6366f1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaImages /> Facility Images
                  </button>
                  <button
                    type="button"
                    onClick={() => openGallery('room')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#10B981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaImages /> Room Photos
                  </button>
                  <button
                    type="button"
                    onClick={() => openGallery('parking')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      background: '#F59E0B',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px'
                    }}
                  >
                    <FaImages /> Parking
                  </button>
                </div>
                <input
                  type="text"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                  placeholder="Or paste image URL directly..."
                />
                {formData.icon && (
                  <div style={{ marginTop: '10px', padding: '10px', background: '#f3f4f6', borderRadius: '6px', textAlign: 'center' }}>
                    <img 
                      src={formData.icon} 
                      alt="Preview" 
                      style={{ maxWidth: '100%', maxHeight: '150px', objectFit: 'contain', borderRadius: '6px' }}
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    style={{ width: '18px', height: '18px' }}
                  />
                  <span style={{ fontWeight: '500' }}>Active</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gallery Modal */}
      {showGallery && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1001 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', width: '90%', maxWidth: '900px', maxHeight: '80vh', overflow: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
                📸 Select from Gallery - {galleryCategory} Images
              </h3>
              <button
                onClick={() => setShowGallery(false)}
                style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
            
            {galleryImages.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center' }}>
                <FaImages size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
                <p style={{ color: '#6b7280' }}>No {galleryCategory} images in gallery.</p>
                <p style={{ color: '#9ca3af', fontSize: '14px' }}>Go to Gallery Management to upload images with category "{galleryCategory}".</p>
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
                      border: formData.icon === image.image_path ? '3px solid #6366f1' : '2px solid #e5e7eb',
                      transition: 'all 0.3s',
                      background: 'white'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ position: 'relative', paddingTop: '75%', background: '#f3f4f6' }}>
                      <img
                        src={image.image_path}
                        alt={image.title}
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ padding: '10px' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {image.title}
                      </div>
                      <div style={{ fontSize: '10px', color: '#6b7280' }}>
                        {new Date(image.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div style={{ marginTop: '20px', padding: '15px', background: '#eff6ff', borderRadius: '8px', fontSize: '13px', color: '#1e40af' }}>
              💡 <strong>Tip:</strong> Click on any image to select it. You can switch between Facility, Room, and Parking images using the buttons above.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacilityManagement;
