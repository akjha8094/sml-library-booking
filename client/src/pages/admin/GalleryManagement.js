import React, { useState, useEffect } from 'react';
import { FaUpload, FaTrash, FaImage, FaEdit, FaTimes } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const GalleryManagement = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    category: 'general',
    files: null
  });

  const categories = [
    { value: 'all', label: 'All Images' },
    { value: 'banner', label: 'Banners' },
    { value: 'facility', label: 'Facilities' },
    { value: 'room', label: 'Rooms' },
    { value: 'parking', label: 'Parking' },
    { value: 'general', label: 'General' }
  ];

  useEffect(() => {
    fetchImages();
  }, [selectedCategory]);

  const fetchImages = async () => {
    try {
      setLoading(true);
      const params = selectedCategory !== 'all' ? { category: selectedCategory } : {};
      const response = await api.get('/gallery', { params });
      setImages(response.images || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast.error('Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setUploadForm({ ...uploadForm, files: e.target.files });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    
    if (!uploadForm.files || uploadForm.files.length === 0) {
      toast.error('Please select at least one image');
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      
      if (uploadForm.files.length === 1) {
        formData.append('image', uploadForm.files[0]);
        formData.append('title', uploadForm.title || uploadForm.files[0].name);
        formData.append('description', uploadForm.description);
        formData.append('category', uploadForm.category);
        await api.post('/gallery/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        for (let i = 0; i < uploadForm.files.length; i++) {
          formData.append('images', uploadForm.files[i]);
        }
        formData.append('category', uploadForm.category);
        await api.post('/gallery/upload-multiple', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      toast.success('Image(s) uploaded successfully');
      setShowUploadModal(false);
      setUploadForm({ title: '', description: '', category: 'general', files: null });
      fetchImages();
    } catch (error) {
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this image?')) return;

    try {
      await api.delete(`/gallery/${id}`);
      toast.success('Image deleted successfully');
      fetchImages();
    } catch (error) {
      toast.error('Failed to delete image');
    }
  };

  const copyImageUrl = (imagePath) => {
    // If already full URL, copy as is; otherwise add origin
    const fullUrl = imagePath.startsWith('http') ? imagePath : `${window.location.origin}${imagePath}`;
    navigator.clipboard.writeText(fullUrl);
    toast.success('Image URL copied to clipboard');
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <h2>Gallery Management</h2>
        <button
          onClick={() => setShowUploadModal(true)}
          style={{
            padding: '10px 20px',
            background: '#6366f1',
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
          <FaUpload /> Upload Images
        </button>
      </div>

      {/* Category Filter */}
      <div style={{ marginBottom: '30px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value)}
            style={{
              padding: '8px 16px',
              background: selectedCategory === cat.value ? '#6366f1' : 'white',
              color: selectedCategory === cat.value ? 'white' : '#6b7280',
              border: `2px solid ${selectedCategory === cat.value ? '#6366f1' : '#e5e7eb'}`,
              borderRadius: '20px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Images Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px' }}>Loading images...</div>
      ) : images.length === 0 ? (
        <div style={{
          background: 'white',
          padding: '80px 20px',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <FaImage size={64} color="#d1d5db" style={{ marginBottom: '20px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Images</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>Upload images to get started</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {images.map((image) => (
            <div
              key={image.id}
              style={{
                background: 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'transform 0.3s',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ position: 'relative', paddingTop: '75%', background: '#f3f4f6' }}>
                <img
                  src={image.image_path}
                  alt={image.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                  onError={(e) => {
                    e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="150"%3E%3Crect fill="%23ddd" width="200" height="150"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E';
                  }}
                />
                <span style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: '#6366f1',
                  color: 'white',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {image.category}
                </span>
              </div>

              <div style={{ padding: '15px' }}>
                <h4 style={{ margin: '0 0 8px 0', fontSize: '15px', color: '#1f2937', fontWeight: '600' }}>
                  {image.title}
                </h4>
                {image.description && (
                  <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
                    {image.description}
                  </p>
                )}
                <div style={{ fontSize: '11px', color: '#9ca3af', marginBottom: '12px' }}>
                  {new Date(image.created_at).toLocaleDateString('en-IN')} • {(image.file_size / 1024).toFixed(2)} KB
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => copyImageUrl(image.image_path)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#10B981',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={() => handleDelete(image.id)}
                    style={{
                      padding: '8px 12px',
                      background: '#EF4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '16px',
            width: '90%',
            maxWidth: '600px',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Upload Images</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280'
                }}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleUpload}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Select Images *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileChange}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px dashed #e5e7eb',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                />
                <small style={{ color: '#6b7280', fontSize: '12px' }}>
                  You can select multiple images at once
                </small>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Category *
                </label>
                <select
                  value={uploadForm.category}
                  onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                  required
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                >
                  <option value="general">General</option>
                  <option value="banner">Banner</option>
                  <option value="facility">Facility</option>
                  <option value="room">Room</option>
                  <option value="parking">Parking</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Title (for single image)
                </label>
                <input
                  type="text"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
                  placeholder="Enter image title"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
                  Description (optional)
                </label>
                <textarea
                  value={uploadForm.description}
                  onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
                  placeholder="Enter image description"
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    padding: '10px 20px',
                    background: uploading ? '#9ca3af' : '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <FaUpload /> {uploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GalleryManagement;
