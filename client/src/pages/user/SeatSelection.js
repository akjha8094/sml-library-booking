import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChair, FaArrowLeft, FaCheck } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const SeatSelection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { plan } = location.state || {};
  const [seats, setSeats] = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!plan) {
      toast.error('Please select a plan first');
      navigate('/plans');
      return;
    }
    fetchSeats();
    // eslint-disable-next-line
  }, []);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const response = await api.getSeats();
      console.log('Seats data:', response);
      const seatData = response.seats || response || [];
      // Sort seats by numeric value (S01, S02...S50, S51)
      const sortedSeats = seatData.sort((a, b) => {
        const numA = parseInt(a.seat_number.substring(1));
        const numB = parseInt(b.seat_number.substring(1));
        return numA - numB;
      });
      setSeats(sortedSeats);
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Failed to load seats');
    } finally {
      setLoading(false);
    }
  };

  const getSeatColor = (status) => {
    const colors = {
      available: '#10B981',
      occupied: '#EF4444',
      maintenance: '#F59E0B',
      reserved: '#3B82F6'
    };
    return colors[status] || '#6c757d';
  };

  const handleSeatClick = (seat) => {
    if (seat.seat_status === 'available') {
      setSelectedSeat(seat);
    } else {
      toast.warning(`Seat ${seat.seat_number} is ${seat.seat_status}`);
    }
  };

  const handleProceed = () => {
    if (!selectedSeat) {
      toast.error('Please select a seat');
      return;
    }
    navigate('/checkout', { state: { plan, seat: selectedSeat } });
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading seats...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button
          onClick={() => navigate('/plans')}
          style={{
            padding: '10px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0 }}>Select Your Seat</h1>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>
            Plan: {plan?.name} - ₹{plan?.price} / {plan?.duration_days} days
          </p>
        </div>
      </div>

      {/* Selected Seat Info */}
      {selectedSeat && (
        <div style={{
          background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          marginBottom: '30px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>Selected Seat</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{selectedSeat.seat_number}</div>
            <div style={{ fontSize: '14px', opacity: 0.9, marginTop: '5px' }}>
              Floor {selectedSeat.floor} {selectedSeat.section ? `- ${selectedSeat.section}` : ''}
            </div>
          </div>
          <button
            onClick={handleProceed}
            style={{
              padding: '14px 28px',
              background: 'white',
              color: '#6366f1',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaCheck /> Proceed to Payment
          </button>
        </div>
      )}

      {/* Legend */}
      <div style={{ marginBottom: '25px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Available', color: '#10B981' },
            { label: 'Occupied', color: '#EF4444' },
            { label: 'Maintenance', color: '#F59E0B' },
            { label: 'Reserved', color: '#3B82F6' },
            { label: 'Selected', color: '#6366f1' }
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: item.color,
                borderRadius: '4px'
              }} />
              <span style={{ fontSize: '14px', color: '#4b5563' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Seats Grid */}
      {seats.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <FaChair size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Seats Available</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>Please contact support</p>
        </div>
      ) : (
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
            gap: '15px'
          }}>
            {seats.map((seat) => {
              const isSelected = selectedSeat?.id === seat.id;
              const isAvailable = seat.seat_status === 'available';
              
              return (
                <div
                  key={seat.id}
                  onClick={() => handleSeatClick(seat)}
                  style={{
                    padding: '20px 10px',
                    background: isSelected ? '#6366f1' : getSeatColor(seat.seat_status),
                    color: 'white',
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: isAvailable ? 'pointer' : 'not-allowed',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    border: isSelected ? '3px solid #4f46e5' : '2px solid transparent',
                    opacity: isAvailable ? 1 : 0.6,
                    position: 'relative'
                  }}
                  onMouseEnter={(e) => {
                    if (isAvailable) {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (isAvailable) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                >
                  <div style={{ marginBottom: '8px' }}>
                    <FaChair size={24} />
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    {seat.seat_number}
                  </div>
                  {seat.floor && (
                    <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px' }}>
                      Floor {seat.floor}
                    </div>
                  )}
                  {isSelected && (
                    <div style={{
                      position: 'absolute',
                      top: '5px',
                      right: '5px',
                      background: 'white',
                      color: '#6366f1',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <FaCheck size={14} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fixed Bottom Button for Mobile */}
      {selectedSeat && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '15px 20px',
          background: 'white',
          boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
          display: 'none'
        }}
        className="mobile-only"
        >
          <button
            onClick={handleProceed}
            style={{
              width: '100%',
              padding: '16px',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FaCheck /> Proceed with {selectedSeat.seat_number}
          </button>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
