import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaClock, FaTimesCircle, FaEye, FaTrash, FaSpinner } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const MyRefundRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.getMyRefundRequests(params);
      setRequests(response || []);
    } catch (error) {
      console.error('Error fetching refund requests:', error);
      toast.error('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelRequest = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this refund request?')) {
      return;
    }

    try {
      await api.cancelRefundRequest(id);
      toast.success('Refund request cancelled successfully');
      fetchRequests();
    } catch (error) {
      console.error('Error cancelling request:', error);
      toast.error(error.message || 'Failed to cancel request');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: { bg: '#fef3c7', color: '#92400e', icon: <FaClock />, text: 'Pending' },
      under_review: { bg: '#dbeafe', color: '#1e40af', icon: <FaSpinner />, text: 'Under Review' },
      approved: { bg: '#d1fae5', color: '#065f46', icon: <FaCheckCircle />, text: 'Approved' },
      rejected: { bg: '#fee2e2', color: '#991b1b', icon: <FaTimesCircle />, text: 'Rejected' },
      completed: { bg: '#d1fae5', color: '#047857', icon: <FaCheckCircle />, text: 'Completed' }
    };
    return styles[status] || styles.pending;
  };

  const getRequestTypeLabel = (type) => {
    const labels = {
      cancellation: 'Cancellation',
      issue: 'Service Issue',
      duplicate_payment: 'Duplicate Payment',
      other: 'Other'
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading refund requests...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          My Refund Requests
        </h1>
        <p style={{ color: '#6b7280' }}>Track your refund request status</p>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', flexWrap: 'wrap' }}>
        {['all', 'pending', 'under_review', 'approved', 'rejected', 'completed'].map((status) => (
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
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div style={{ 
          padding: '60px', 
          textAlign: 'center', 
          background: 'white', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)' 
        }}>
          <FaClock size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Refund Requests</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            {filter === 'all' 
              ? "You haven't requested any refunds yet" 
              : `No ${filter.replace('_', ' ')} refund requests`
            }
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {requests.map((request) => {
            const statusStyle = getStatusBadge(request.status);
            
            return (
              <div
                key={request.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '25px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: '2px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <h3 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                        Request #{request.id}
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
                        {statusStyle.text}
                      </div>
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      Submitted: {new Date(request.created_at).toLocaleString('en-IN')}
                    </div>
                  </div>

                  {request.status === 'pending' && (
                    <button
                      onClick={() => handleCancelRequest(request.id)}
                      style={{
                        padding: '8px 16px',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <FaTrash size={12} /> Cancel Request
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Booking Details</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                      Booking #{request.booking_id} - Seat {request.seat_number}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                      Plan: {request.plan_name}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Request Type</div>
                    <div style={{ fontSize: '15px', fontWeight: '600', color: '#1f2937' }}>
                      {getRequestTypeLabel(request.request_type)}
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Expected Refund</div>
                    <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10B981' }}>
                      ₹{parseFloat(request.expected_amount || 0).toFixed(2)}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                      Method: {request.refund_method === 'wallet' ? 'Wallet' : 'Original Payment'}
                    </div>
                  </div>

                  {request.reviewed_at && (
                    <div>
                      <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '4px' }}>Reviewed</div>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                        {new Date(request.reviewed_at).toLocaleString('en-IN')}
                      </div>
                      {request.reviewed_by_name && (
                        <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '2px' }}>
                          By: {request.reviewed_by_name}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Reason</div>
                  <div style={{ 
                    padding: '12px', 
                    background: '#f9fafb', 
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#4b5563'
                  }}>
                    {request.reason}
                  </div>
                </div>

                {request.description && (
                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '6px', fontWeight: '500' }}>Description</div>
                    <div style={{ 
                      padding: '12px', 
                      background: '#f9fafb', 
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#4b5563'
                    }}>
                      {request.description}
                    </div>
                  </div>
                )}

                {request.admin_notes && (
                  <div style={{ 
                    marginTop: '15px',
                    padding: '15px', 
                    background: request.status === 'approved' ? '#d1fae5' : '#fee2e2',
                    borderRadius: '8px',
                    borderLeft: `4px solid ${request.status === 'approved' ? '#10b981' : '#ef4444'}`
                  }}>
                    <div style={{ 
                      fontSize: '13px', 
                      color: request.status === 'approved' ? '#065f46' : '#991b1b',
                      marginBottom: '6px', 
                      fontWeight: '600'
                    }}>
                      Admin Response
                    </div>
                    <div style={{ 
                      fontSize: '14px',
                      color: request.status === 'approved' ? '#047857' : '#dc2626'
                    }}>
                      {request.admin_notes}
                    </div>
                  </div>
                )}

                {request.status === 'completed' && (
                  <div style={{
                    marginTop: '15px',
                    padding: '12px',
                    background: '#d1fae5',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <FaCheckCircle color="#10b981" size={20} />
                    <div style={{ fontSize: '14px', color: '#047857', fontWeight: '500' }}>
                      Refund has been processed and credited to your {request.refund_method}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyRefundRequests;
