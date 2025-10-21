import React, { useState, useEffect } from 'react';
import { FaCalendar, FaChair, FaUser, FaRupeeSign } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdvanceBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.getAllAdvanceBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, booking_status, payment_status) => {
    try {
      await api.updateAdvanceBookingStatus(id, { booking_status, payment_status });
      toast.success('Status updated successfully');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this booking?')) {
      try {
        await api.deleteAdvanceBooking(id);
        toast.success('Booking deleted successfully');
        fetchBookings();
      } catch (error) {
        toast.error('Failed to delete booking');
      }
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      scheduled: '#3B82F6',
      active: '#10B981',
      completed: '#6b7280',
      cancelled: '#EF4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPaymentColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      paid: '#10B981',
      failed: '#EF4444',
      refunded: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const filteredBookings = filter === 'all' ? bookings : bookings.filter(b => b.booking_status === filter);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Advance Booking Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['all', 'scheduled', 'active', 'completed', 'cancelled'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              style={{
                padding: '8px 16px',
                background: filter === status ? '#6366f1' : 'white',
                color: filter === status ? 'white' : '#6b7280',
                border: `2px solid ${filter === status ? '#6366f1' : '#e5e7eb'}`,
                borderRadius: '6px',
                cursor: 'pointer',
                textTransform: 'capitalize'
              }}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>User</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Plan</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Seat</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Dates</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Payment</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr key={booking.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '12px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600' }}>{booking.user_name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>{booking.user_email}</div>
                  </td>
                  <td style={{ padding: '12px' }}>{booking.plan_name}</td>
                  <td style={{ padding: '12px' }}>
                    {booking.seat_number || 'Not assigned'}
                    {booking.floor && ` (F${booking.floor})`}
                  </td>
                  <td style={{ padding: '12px', fontSize: '13px' }}>
                    {new Date(booking.start_date).toLocaleDateString('en-IN')} -<br />
                    {new Date(booking.end_date).toLocaleDateString('en-IN')}
                  </td>
                  <td style={{ padding: '12px', fontWeight: '600' }}>₹{booking.total_amount}</td>
                  <td style={{ padding: '12px' }}>
                    <select
                      value={booking.booking_status}
                      onChange={(e) => handleStatusUpdate(booking.id, e.target.value, booking.payment_status)}
                      style={{
                        padding: '6px 12px',
                        background: getStatusColor(booking.booking_status) + '20',
                        color: getStatusColor(booking.booking_status),
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="active">Active</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <select
                      value={booking.payment_status}
                      onChange={(e) => handleStatusUpdate(booking.id, booking.booking_status, e.target.value)}
                      style={{
                        padding: '6px 12px',
                        background: getPaymentColor(booking.payment_status) + '20',
                        color: getPaymentColor(booking.payment_status),
                        border: 'none',
                        borderRadius: '6px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(booking.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#ef4444',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdvanceBookingManagement;
