import React, { useState, useEffect } from 'react';
import { FaChair, FaCalendarAlt, FaRupeeSign, FaClock, FaCheckCircle, FaTimesCircle, FaDownload, FaUndo, FaExclamationTriangle } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [refundForm, setRefundForm] = useState({
    request_type: 'cancellation',
    reason: '',
    description: '',
    refund_method: 'wallet'
  });

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

  const canRequestRefund = (booking) => {
    // Can request refund if:
    // 1. Booking is active or completed
    // 2. Not already fully refunded
    // 3. Has a completed payment
    return (
      (booking.status === 'active' || booking.status === 'completed') &&
      booking.refund_status !== 'full' &&
      booking.payment_status === 'completed'
    );
  };

  const calculateExpectedRefund = (booking) => {
    const amount = parseFloat(booking.final_amount || 0);
    const startDate = new Date(booking.start_date);
    const today = new Date();
    const daysUntilStart = Math.floor((startDate - today) / (1000 * 60 * 60 * 24));

    if (daysUntilStart >= 7) {
      return { percentage: 100, amount: amount };
    } else if (daysUntilStart >= 3) {
      return { percentage: 50, amount: amount * 0.5 };
    } else {
      return { percentage: 0, amount: 0 };
    }
  };

  const handleRefundClick = (booking) => {
    setSelectedBooking(booking);
    setShowRefundModal(true);
    setRefundForm({
      request_type: 'cancellation',
      reason: '',
      description: '',
      refund_method: 'wallet'
    });
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    
    if (!refundForm.reason.trim()) {
      toast.error('Please provide a reason for refund');
      return;
    }

    try {
      await api.createRefundRequest({
        booking_id: selectedBooking.id,
        ...refundForm
      });
      
      toast.success('Refund request submitted successfully! We will review it soon.');
      setShowRefundModal(false);
      fetchBookings();
    } catch (error) {
      console.error('Error submitting refund request:', error);
      toast.error(error.message || 'Failed to submit refund request');
    }
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
        <p style={{ color: '#6b7280' }}>View your booking history and request refunds</p>
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
            const canRefund = canRequestRefund(booking);
            const expectedRefund = canRefund ? calculateExpectedRefund(booking) : null;
            
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

                    {/* Refund Warning */}
                    {canRefund && expectedRefund && expectedRefund.percentage < 100 && (
                      <div style={{
                        marginTop: '12px',
                        padding: '10px 12px',
                        background: '#fef3c7',
                        borderLeft: '4px solid #f59e0b',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <FaExclamationTriangle color="#f59e0b" />
                        <div style={{ fontSize: '13px', color: '#92400e' }}>
                          {expectedRefund.percentage === 0 
                            ? 'Refund not available (less than 3 days to start date)'
                            : `Only ${expectedRefund.percentage}% refund available (₹${expectedRefund.amount.toFixed(2)})`
                          }
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
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
                        gap: '8px',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <FaDownload /> Invoice
                    </button>
                    
                    {canRefund && (
                      <button
                        onClick={() => handleRefundClick(booking)}
                        style={{
                          padding: '10px 20px',
                          background: '#f59e0b',
                          color: 'white',
                          border: 'none',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '14px',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <FaUndo /> Request Refund
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Refund Request Modal */}
      {showRefundModal && selectedBooking && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
              Request Refund
            </h2>

            <div style={{ marginBottom: '20px', padding: '15px', background: '#f3f4f6', borderRadius: '8px' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>Booking Details</div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                Booking #{selectedBooking.id} - Seat {selectedBooking.seat_number}
              </div>
              <div style={{ fontSize: '14px', color: '#4b5563' }}>
                Amount: ₹{parseFloat(selectedBooking.final_amount).toFixed(2)}
              </div>
              {(() => {
                const refund = calculateExpectedRefund(selectedBooking);
                return (
                  <div style={{ 
                    marginTop: '10px', 
                    padding: '10px', 
                    background: refund.percentage === 0 ? '#fee2e2' : '#d1fae5',
                    borderRadius: '6px'
                  }}>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: refund.percentage === 0 ? '#991b1b' : '#065f46' }}>
                      Expected Refund: {refund.percentage}% = ₹{refund.amount.toFixed(2)}
                    </div>
                  </div>
                );
              })()}
            </div>

            <form onSubmit={handleRefundSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Request Type
                </label>
                <select
                  value={refundForm.request_type}
                  onChange={(e) => setRefundForm({ ...refundForm, request_type: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="cancellation">Cancellation</option>
                  <option value="issue">Issue with Service</option>
                  <option value="duplicate_payment">Duplicate Payment</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Reason <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  value={refundForm.reason}
                  onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                  placeholder="Brief reason for refund"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Description (Optional)
                </label>
                <textarea
                  value={refundForm.description}
                  onChange={(e) => setRefundForm({ ...refundForm, description: e.target.value })}
                  placeholder="Provide detailed explanation..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Refund Method
                </label>
                <select
                  value={refundForm.refund_method}
                  onChange={(e) => setRefundForm({ ...refundForm, refund_method: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px'
                  }}
                >
                  <option value="wallet">Wallet (Instant)</option>
                  <option value="original">Original Payment Method (3-7 days)</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#f3f4f6',
                    color: '#4b5563',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '12px 24px',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
