import React, { useState, useEffect } from 'react';
import { FaTag, FaCalendar, FaCopy, FaCheck, FaGift, FaPercentage, FaRupeeSign } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Offers = () => {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await api.getOffers();
      setOffers(response.offers || []);
    } catch (error) {
      console.error('Error fetching offers:', error);
      toast.error('Failed to load offers');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success('Offer code copied!');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDiscountDisplay = (offer) => {
    if (offer.discount_type === 'percentage') {
      return `${offer.discount_value}% OFF`;
    }
    return `₹${offer.discount_value} OFF`;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading offers...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '15px 30px',
          borderRadius: '50px',
          marginBottom: '15px'
        }}>
          <FaGift size={28} />
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Special Offers</h1>
        </div>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
          Save more with our exclusive deals and offers
        </p>
      </div>

      {/* Offers Grid */}
      {offers.length === 0 ? (
        <div style={{ 
          padding: '80px 20px', 
          textAlign: 'center', 
          background: 'white', 
          borderRadius: '16px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <FaTag size={64} color="#d1d5db" style={{ marginBottom: '20px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0', fontSize: '24px' }}>No Offers Available</h3>
          <p style={{ color: '#9ca3af', margin: 0, fontSize: '16px' }}>Check back later for exciting deals!</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
          gap: '20px' 
        }}>
          {offers.map((offer) => (
            <div
              key={offer.id}
              style={{
                background: 'white',
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease',
                border: '2px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                e.currentTarget.style.borderColor = '#6366f1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                e.currentTarget.style.borderColor = 'transparent';
              }}
            >
              {/* Offer Header */}
              <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '25px 20px',
                color: 'white',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <div style={{
                  position: 'absolute',
                  top: '-20px',
                  right: '-20px',
                  width: '100px',
                  height: '100px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '50%'
                }} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  {offer.discount_type === 'percentage' ? (
                    <FaPercentage size={24} />
                  ) : (
                    <FaRupeeSign size={24} />
                  )}
                  <h3 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold', flex: 1 }}>
                    {offer.title}
                  </h3>
                </div>
                
                <div style={{
                  background: 'rgba(255,255,255,0.2)',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '5px' }}>
                    {getDiscountDisplay(offer)}
                  </div>
                  {offer.max_discount_amount && (
                    <div style={{ fontSize: '14px', opacity: 0.9 }}>
                      Up to ₹{offer.max_discount_amount}
                    </div>
                  )}
                </div>
              </div>

              {/* Offer Body */}
              <div style={{ padding: '20px' }}>
                <p style={{ 
                  color: '#4b5563', 
                  fontSize: '14px', 
                  lineHeight: '1.6',
                  marginBottom: '15px',
                  minHeight: '60px'
                }}>
                  {offer.description}
                </p>

                {/* Offer Code */}
                <div style={{
                  background: '#f9fafb',
                  border: '2px dashed #6366f1',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>USE CODE</div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6366f1', letterSpacing: '1px' }}>
                      {offer.offer_code}
                    </div>
                  </div>
                  <button
                    onClick={() => copyCode(offer.offer_code)}
                    style={{
                      background: copiedCode === offer.offer_code ? '#10B981' : '#6366f1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '10px 15px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                  >
                    {copiedCode === offer.offer_code ? (
                      <><FaCheck /> Copied</>
                    ) : (
                      <><FaCopy /> Copy</>
                    )}
                  </button>
                </div>

                {/* Validity */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  fontSize: '13px',
                  color: '#6b7280',
                  marginBottom: '12px'
                }}>
                  <FaCalendar />
                  <span>Valid: {formatDate(offer.valid_from)} - {formatDate(offer.valid_until)}</span>
                </div>

                {/* Minimum Amount */}
                {offer.min_purchase_amount > 0 && (
                  <div style={{
                    background: '#fef3c7',
                    padding: '10px 15px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#92400e',
                    marginBottom: '12px'
                  }}>
                    💰 Min. purchase: ₹{offer.min_purchase_amount}
                  </div>
                )}

                {/* Terms */}
                {offer.terms_conditions && (
                  <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '12px',
                    marginTop: '12px'
                  }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '5px' }}>
                      Terms & Conditions:
                    </div>
                    <div style={{ fontSize: '12px', color: '#6b7280', lineHeight: '1.5' }}>
                      {offer.terms_conditions}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Note */}
      <div style={{
        marginTop: '40px',
        padding: '20px',
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: '12px',
        textAlign: 'center'
      }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#1e40af', lineHeight: '1.6' }}>
          💡 <strong>Tip:</strong> Copy the offer code and apply it during checkout to avail the discount.
          Offers are subject to terms and validity period.
        </p>
      </div>
    </div>
  );
};

export default Offers;
