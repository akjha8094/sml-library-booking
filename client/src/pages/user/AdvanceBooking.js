import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaCalendarPlus, FaChair, FaClock, FaRupeeSign, 
  FaCheck, FaTimes, FaEye, FaHistory 
} from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AdvanceBooking = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'history'
  const [plans, setPlans] = useState([]);
  const [seats, setSeats] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    plan_id: '',
    seat_id: '',
    start_date: '',
    end_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchPlans();
    fetchSeats();
    if (activeTab === 'history') {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchPlans = async () => {
    try {
      const response = await api.getPlans();
      setPlans(response.plans || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  const fetchSeats = async () => {
    try {
      const response = await api.getSeats();
      const availableSeats = (response.seats || []).filter(s => s.seat_status === 'available');
      setSeats(availableSeats);
    } catch (error) {
      console.error('Error fetching seats:', error);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.getAdvanceBookings();
      setBookings(response.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanChange = (planId) => {
    const plan = plans.find(p => p.id === parseInt(planId));
    if (plan) {
      setFormData({ 
        ...formData, 
        plan_id: planId,
        end_date: '' // Reset end date when plan changes
      });
    }
  };

  const handleStartDateChange = (date) => {
    const plan = plans.find(p => p.id === parseInt(formData.plan_id));
    if (plan && date) {
      const startDate = new Date(date);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + plan.duration_days - 1);
      
      setFormData({
        ...formData,
        start_date: date,
        end_date: endDate.toISOString().split('T')[0]
      });
    } else {
      setFormData({ ...formData, start_date: date });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.plan_id || !formData.start_date) {
      toast.error('Please fill all required fields');
      return;
    }

    const plan = plans.find(p => p.id === parseInt(formData.plan_id));
    if (!plan) {
      toast.error('Invalid plan selected');
      return;
    }

    try {
      setSubmitting(true);
      await api.createAdvanceBooking({
        ...formData,
        total_amount: plan.price
      });
      
      toast.success('Advance booking created successfully!');
      setFormData({
        plan_id: '',
        seat_id: '',
        start_date: '',
        end_date: '',
        notes: ''
      });
      setActiveTab('history');
    } catch (error) {
      toast.error(error.message || 'Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.cancelAdvanceBooking(id);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error('Failed to cancel booking');
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

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#F59E0B',
      paid: '#10B981',
      failed: '#EF4444',
      refunded: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

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
          <FaCalendarPlus size={28} />
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Advance Booking</h1>
        </div>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
          Book your seat in advance for future dates
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        borderBottom: '2px solid #e5e7eb',
        paddingBottom: '10px'
      }}>
        <button
          onClick={() => setActiveTab('create')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'create' ? '#6366f1' : 'transparent',
            color: activeTab === 'create' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s'
          }}
        >
          <FaCalendarPlus /> New Booking
        </button>
        <button
          onClick={() => setActiveTab('history')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'history' ? '#6366f1' : 'transparent',
            color: activeTab === 'history' ? 'white' : '#6b7280',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s'
          }}
        >
          <FaHistory /> My Bookings
        </button>
      </div>

      {/* Create Booking Form */}
      {activeTab === 'create' && (
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '20px' }}>
              {/* Select Plan */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Select Plan *
                </label>
                <select
                  value={formData.plan_id}
                  onChange={(e) => handlePlanChange(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">Choose a plan</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.name} - ₹{plan.price} ({plan.duration_days} days)
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Seat (Optional) */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Select Seat (Optional)
                </label>
                <select
                  value={formData.seat_id}
                  onChange={(e) => setFormData({ ...formData, seat_id: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                >
                  <option value="">No preference (will be assigned later)</option>
                  {seats.map(seat => (
                    <option key={seat.id} value={seat.id}>
                      {seat.seat_number} - Floor {seat.floor}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Start Date *
                </label>
                <input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleStartDateChange(e.target.value)}
                  min={getMinDate()}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
              </div>

              {/* End Date */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  End Date
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    background: '#f9fafb',
                    cursor: 'not-allowed'
                  }}
                />
                <small style={{ color: '#6b7280', fontSize: '14px' }}>
                  End date is automatically calculated based on selected plan duration
                </small>
              </div>

              {/* Notes */}
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Additional Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="3"
                  placeholder="Any special requirements or notes..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Amount Display */}
              {formData.plan_id && (
                <div style={{
                  background: '#f0fdf4',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '2px solid #86efac'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '18px', fontWeight: '600', color: '#166534' }}>
                      Total Amount:
                    </span>
                    <span style={{ fontSize: '28px', fontWeight: 'bold', color: '#166534' }}>
                      ₹{plans.find(p => p.id === parseInt(formData.plan_id))?.price || 0}
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                style={{
                  padding: '16px',
                  background: submitting ? '#9ca3af' : '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s'
                }}
              >
                {submitting ? 'Creating Booking...' : 'Create Advance Booking'}
              </button>
            </div>
          </form>

          {/* Info Note */}
          <div style={{
            marginTop: '30px',
            padding: '15px',
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '8px'
          }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#1e40af', lineHeight: '1.6' }}>
              💡 <strong>Note:</strong> Advance bookings are for future dates. Payment can be made later. 
              You can cancel the booking anytime before the start date.
            </p>
          </div>
        </div>
      )}

      {/* Booking History */}
      {activeTab === 'history' && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading bookings...</div>
            </div>
          ) : bookings.length === 0 ? (
            <div style={{
              background: 'white',
              padding: '80px 20px',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <FaHistory size={64} color="#d1d5db" style={{ marginBottom: '20px' }} />
              <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Bookings Yet</h3>
              <p style={{ color: '#9ca3af', margin: '0 0 20px 0' }}>Create your first advance booking</p>
              <button
                onClick={() => setActiveTab('create')}
                style={{
                  padding: '12px 24px',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                Create Booking
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '20px' }}>
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    border: '2px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                    <div>
                      {/* Plan Name */}
                      <h3 style={{ margin: '0 0 15px 0', fontSize: '20px', color: '#1f2937' }}>
                        {booking.plan_name}
                      </h3>

                      <div style={{ display: 'grid', gap: '10px' }}>
                        {/* Seat */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FaChair color="#6366f1" />
                          <span style={{ color: '#6b7280' }}>
                            Seat: {booking.seat_number || 'Not assigned yet'}
                            {booking.floor && ` (Floor ${booking.floor})`}
                          </span>
                        </div>

                        {/* Dates */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FaClock color="#6366f1" />
                          <span style={{ color: '#6b7280' }}>
                            {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
                          </span>
                        </div>

                        {/* Amount */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <FaRupeeSign color="#6366f1" />
                          <span style={{ color: '#6b7280', fontSize: '18px', fontWeight: '600' }}>
                            ₹{booking.total_amount}
                          </span>
                        </div>

                        {/* Status Badges */}
                        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                          <span style={{
                            padding: '6px 12px',
                            background: getStatusColor(booking.booking_status) + '20',
                            color: getStatusColor(booking.booking_status),
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {booking.booking_status}
                          </span>
                          <span style={{
                            padding: '6px 12px',
                            background: getPaymentStatusColor(booking.payment_status) + '20',
                            color: getPaymentStatusColor(booking.payment_status),
                            borderRadius: '6px',
                            fontSize: '14px',
                            fontWeight: '600',
                            textTransform: 'capitalize'
                          }}>
                            {booking.payment_status}
                          </span>
                        </div>

                        {/* Notes */}
                        {booking.notes && (
                          <div style={{
                            marginTop: '10px',
                            padding: '10px',
                            background: '#f9fafb',
                            borderRadius: '6px',
                            fontSize: '14px',
                            color: '#6b7280'
                          }}>
                            <strong>Notes:</strong> {booking.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {booking.booking_status === 'scheduled' && booking.payment_status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking.id)}
                          style={{
                            padding: '10px 20px',
                            background: '#EF4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <FaTimes /> Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdvanceBooking;
