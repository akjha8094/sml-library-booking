import React, { useState, useEffect } from 'react';
import { FaChair, FaCalendarAlt, FaRupeeSign, FaClock, FaCheckCircle, FaTimesCircle, FaDownload } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.getBookings();
      console.log('Bookings data:', response);
      setBookings(response.bookings || response || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: { bg: '#d1fae5', color: '#065f46', icon: <FaCheckCircle /> },
      completed: { bg: '#dbeafe', color: '#1e40af', icon: <FaCheckCircle /> },
      expired: { bg: '#fee2e2', color: '#991b1b', icon: <FaTimesCircle /> },
      cancelled: { bg: '#f3f4f6', color: '#4b5563', icon: <FaTimesCircle /> }
    };
    return styles[status] || styles.active;
  };

  const downloadInvoice = (booking) => {
    const invoiceContent = `
      SMART LIBRARY - BOOKING INVOICE
      ================================
      
      Booking ID: ${booking.id}
      Date: ${new Date(booking.created_at).toLocaleDateString()}
      
      Booking Details:
      ----------------
      Seat Number: ${booking.seat_number || 'N/A'}
      Plan: ${booking.plan_name || 'N/A'}
      Start Date: ${new Date(booking.start_date).toLocaleDateString()}
      End Date: ${new Date(booking.end_date).toLocaleDateString()}
      Status: ${booking.status.toUpperCase()}
      
      Payment Details:
      ----------------
      Amount Paid: ₹${parseFloat(booking.final_amount || 0).toFixed(2)}
      Payment Status: PAID
      
      ================================
      Thank you for choosing Smart Library!
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredBookings = filter === 'all' 
    ? bookings 
    : bookings.filter(b => b.status === filter);

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading bookings...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>My Bookings</h1>
        <p style={{ color: '#6b7280' }}>View your booking history and payment details</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        {['all', 'active', 'completed', 'expired', 'cancelled'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '10px 20px',
              background: filter === status ? '#6366f1' : 'white',
              color: filter === status ? 'white' : '#4b5563',
              border: `2px solid ${filter === status ? '#6366f1' : '#e5e7eb'}`,
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              textTransform: 'capitalize',
              transition: 'all 0.2s'
            }}
          >
            {status} ({status === 'all' ? bookings.length : bookings.filter(b => b.status === status).length})
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <FaChair size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Bookings Found</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>You haven't made any bookings yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {filteredBookings.map((booking) => {
            const statusStyle = getStatusBadge(booking.status);
            return (
              <div
                key={booking.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '25px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s',
                  border: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#6366f1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: '20px', alignItems: 'start' }}>
                  {/* Seat Icon */}
                  <div style={{
                    width: '80px',
                    height: '80px',
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    flexDirection: 'column',
                    gap: '5px'
                  }}>
                    <FaChair size={32} />
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{booking.seat_number || 'N/A'}</div>
                  </div>

                  {/* Booking Details */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                        Booking #{booking.id}
                      </h3>
                      <div style={{
                        padding: '4px 12px',
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        {statusStyle.icon}
                        {booking.status.toUpperCase()}
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
                      <div>
                        <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Plan</div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                          {booking.plan_name || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                          <FaCalendarAlt size={12} /> Start Date
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                          {new Date(booking.start_date).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                          <FaClock size={12} /> End Date
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                          {new Date(booking.end_date).toLocaleDateString('en-IN')}
                        </div>
                      </div>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>
                          <FaRupeeSign size={12} /> Amount Paid
                        </div>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10B981' }}>
                          ₹{parseFloat(booking.final_amount || 0).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div>
                    <button
                      onClick={() => downloadInvoice(booking)}
                      style={{
                        padding: '10px 20px',
                        background: '#6366f1',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <FaDownload /> Invoice
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
