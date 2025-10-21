import React, { useState, useEffect } from 'react';
import { FaWifi, FaParking, FaCoffee, FaShieldAlt, FaBolt, FaSnowflake } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Facilities = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFacilities();
  }, []);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const response = await api.getFacilities();
      console.log('Facilities data:', response);
      setFacilities(response.facilities || response || []);
    } catch (error) {
      console.error('Error fetching facilities:', error);
      toast.error('Failed to load facilities');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (title) => {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('wifi') || lowerTitle.includes('internet')) return <FaWifi size={40} />;
    if (lowerTitle.includes('parking')) return <FaParking size={40} />;
    if (lowerTitle.includes('coffee') || lowerTitle.includes('water')) return <FaCoffee size={40} />;
    if (lowerTitle.includes('cctv') || lowerTitle.includes('security')) return <FaShieldAlt size={40} />;
    if (lowerTitle.includes('power') || lowerTitle.includes('backup')) return <FaBolt size={40} />;
    if (lowerTitle.includes('ac') || lowerTitle.includes('air')) return <FaSnowflake size={40} />;
    return <FaShieldAlt size={40} />;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading facilities...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>Our Facilities</h1>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>We provide world-class amenities for your comfort</p>
      </div>

      {facilities.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <FaShieldAlt size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Facilities Listed</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>Check back soon for updates</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '25px' }}>
          {facilities.map((facility) => (
            <div
              key={facility.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                padding: '30px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                textAlign: 'center',
                transition: 'transform 0.3s, box-shadow 0.3s',
                border: '2px solid #f3f4f6'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(99,102,241,0.15)';
                e.currentTarget.style.borderColor = '#6366f1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
                e.currentTarget.style.borderColor = '#f3f4f6';
              }}
            >
              <div style={{ 
                color: '#6366f1',
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'center'
              }}>
                {facility.icon ? (
                  <img src={facility.icon} alt={facility.title} style={{ width: '60px', height: '60px', objectFit: 'contain' }} />
                ) : (
                  getIcon(facility.title || facility.name)
                )}
              </div>
              
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px', color: '#1f2937' }}>
                {facility.name || facility.title}
              </h3>
              
              <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.6', margin: 0 }}>
                {facility.description || 'Premium facility for your convenience'}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Facilities;
