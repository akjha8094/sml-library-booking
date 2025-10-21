import React, { useState, useEffect } from 'react';
import { FaChair, FaFilter, FaSync } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const CheckSeats = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      
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
      setRefreshing(false);
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

  const getFilteredSeats = () => {
    if (filter === 'all') return seats;
    return seats.filter(seat => seat.seat_status === filter);
  };

  const filteredSeats = getFilteredSeats();
  const stats = {
    total: seats.length,
    available: seats.filter(s => s.seat_status === 'available').length,
    occupied: seats.filter(s => s.seat_status === 'occupied').length,
    maintenance: seats.filter(s => s.seat_status === 'maintenance').length,
    reserved: seats.filter(s => s.seat_status === 'reserved').length
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading seats...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: '0 0 5px 0' }}>Check Seat Availability</h1>
          <p style={{ color: '#6b7280', margin: 0 }}>Real-time seat status - S01 to S50</p>
        </div>
        <button
          onClick={() => fetchSeats(true)}
          disabled={refreshing}
          style={{
            padding: '12px 24px',
            background: refreshing ? '#9ca3af' : '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <FaSync className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '30px' }}>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #6366f1' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Total Seats</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1f2937' }}>{stats.total}</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #10B981' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Available</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#10B981' }}>{stats.available}</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #EF4444' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Occupied</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#EF4444' }}>{stats.occupied}</div>
        </div>
        <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #F59E0B' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Maintenance</div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#F59E0B' }}>{stats.maintenance}</div>
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaFilter color="#6b7280" />
          <span style={{ fontWeight: '500', color: '#4b5563' }}>Filter:</span>
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {['all', 'available', 'occupied', 'maintenance', 'reserved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                background: filter === status ? '#6366f1' : 'white',
                color: filter === status ? 'white' : '#4b5563',
                border: `2px solid ${filter === status ? '#6366f1' : '#e5e7eb'}`,
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
                textTransform: 'capitalize',
                transition: 'all 0.2s'
              }}
            >
              {status} {status !== 'all' && `(${stats[status] || 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginBottom: '25px', padding: '15px', background: '#f9fafb', borderRadius: '8px' }}>
        <div style={{ display: 'flex', gap: '25px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { label: 'Available', color: '#10B981', desc: 'Ready to book' },
            { label: 'Occupied', color: '#EF4444', desc: 'Currently booked' },
            { label: 'Maintenance', color: '#F59E0B', desc: 'Under repair' },
            { label: 'Reserved', color: '#3B82F6', desc: 'Reserved' }
          ].map((item) => (
            <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '16px', height: '16px', background: item.color, borderRadius: '4px' }} />
              <div>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{item.label}</span>
                <span style={{ fontSize: '12px', color: '#6b7280', marginLeft: '5px' }}>- {item.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Seats Grid */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', fontSize: '20px', fontWeight: '600' }}>
          Seat Layout ({filteredSeats.length} seats)
        </h3>
        
        {filteredSeats.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <FaChair size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
            <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Seats Found</h3>
            <p style={{ color: '#9ca3af', margin: 0 }}>Try changing the filter</p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
            gap: '15px'
          }}>
            {filteredSeats.map((seat) => (
              <div
                key={seat.id}
                style={{
                  padding: '20px 10px',
                  background: getSeatColor(seat.seat_status),
                  color: 'white',
                  borderRadius: '12px',
                  textAlign: 'center',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'default',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{ marginBottom: '8px' }}>
                  <FaChair size={28} />
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  {seat.seat_number}
                </div>
                <div style={{ fontSize: '11px', opacity: 0.9, marginTop: '4px', textTransform: 'capitalize' }}>
                  {seat.seat_status}
                </div>
                {seat.floor && (
                  <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>
                    Floor {seat.floor}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note */}
      <div style={{ marginTop: '25px', padding: '15px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#1e40af' }}>
          💡 <strong>Note:</strong> Seat availability updates in real-time. To book a seat, go to <strong>Plans</strong> → Select a plan → Choose your seat.
        </p>
      </div>
    </div>
  );
};

export default CheckSeats;
