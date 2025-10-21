import React, { useState, useEffect } from 'react';
import { FaCheckCircle, FaClock, FaTimesCircle, FaEye, FaSpinner, FaChartBar } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const UserRefundRequests = () => {
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [reviewForm, setReviewForm] = useState({
    status: 'approved',
    admin_notes: ''
  });

  useEffect(() => {
    fetchRequests();
    fetchStats();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await api.getUserRefundRequests(params);
      setRequests(response.requests || []);
    } catch (error) {
      console.error('Error fetching refund requests:', error);
      toast.error('Failed to load refund requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.getUserRefundRequestStats();
      setStats(response.stats || null);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleReviewClick = (request) => {
    setSelectedRequest(request);
    setShowReviewModal(true);
    setReviewForm({
      status: 'approved',
      admin_notes: ''
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!reviewForm.admin_notes.trim() && reviewForm.status === 'rejected') {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      await api.reviewRefundRequest(selectedRequest.id, reviewForm);
      toast.success(`Refund request ${reviewForm.status === 'approved' ? 'approved' : 'rejected'} successfully`);
      setShowReviewModal(false);
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('Error reviewing request:', error);
      toast.error(error.message || 'Failed to process request');
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
    <div style={{ padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '10px' }}>
          User Refund Requests
        </h1>
        <p style={{ color: '#6b7280' }}>Review and process user refund requests</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '15px', marginBottom: '30px' }}>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '5px' }}>Total Requests</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#1f2937' }}>{stats.total_requests || 0}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #f59e0b' }}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '5px' }}>Pending</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#f59e0b' }}>{stats.pending || 0}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #3b82f6' }}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '5px' }}>Under Review</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3b82f6' }}>{stats.under_review || 0}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '5px' }}>Approved</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10b981' }}>{stats.approved || 0}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #ef4444' }}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '5px' }}>Rejected</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ef4444' }}>{stats.rejected || 0}</div>
          </div>
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', borderLeft: '4px solid #10b981' }}>
            <div style={{ fontSize: '13px', color: '#6b7280', marginBottom: '5px' }}>Total Amount</div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>₹{parseFloat(stats.total_expected_amount || 0).toFixed(0)}</div>
          </div>
        </div>
      )}

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

      {/* Requests Table */}
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
              ? "No refund requests found" 
              : `No ${filter.replace('_', ' ')} refund requests`
            }
          </p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f9fafb', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>ID</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>User</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Booking</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Type</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Amount</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Status</th>
                <th style={{ padding: '15px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Submitted</th>
                <th style={{ padding: '15px', textAlign: 'center', fontSize: '13px', fontWeight: '600', color: '#6b7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request, index) => {
                const statusStyle = getStatusBadge(request.status);
                return (
                  <tr 
                    key={request.id} 
                    style={{ 
                      borderBottom: '1px solid #f3f4f6',
                      background: index % 2 === 0 ? 'white' : '#fafafa'
                    }}
                  >
                    <td style={{ padding: '15px', fontSize: '14px', fontWeight: '600' }}>#{request.id}</td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>{request.user_name}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{request.email}</div>
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '500' }}>#{request.booking_id}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>Seat {request.seat_number}</div>
                    </td>
                    <td style={{ padding: '15px', fontSize: '14px' }}>{getRequestTypeLabel(request.request_type)}</td>
                    <td style={{ padding: '15px', fontSize: '16px', fontWeight: 'bold', color: '#10b981' }}>
                      ₹{parseFloat(request.expected_amount || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '15px' }}>
                      <div style={{
                        padding: '4px 10px',
                        background: statusStyle.bg,
                        color: statusStyle.color,
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px'
                      }}>
                        {statusStyle.icon}
                        {statusStyle.text}
                      </div>
                    </td>
                    <td style={{ padding: '15px', fontSize: '13px', color: '#6b7280' }}>
                      {new Date(request.created_at).toLocaleDateString('en-IN')}
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      {request.status === 'pending' || request.status === 'under_review' ? (
                        <button
                          onClick={() => handleReviewClick(request)}
                          style={{
                            padding: '8px 16px',
                            background: '#6366f1',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: '500',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <FaEye size={12} /> Review
                        </button>
                      ) : (
                        <span style={{ fontSize: '13px', color: '#9ca3af' }}>
                          {request.reviewed_by_name || 'N/A'}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedRequest && (
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
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2 style={{ marginBottom: '20px', fontSize: '24px', fontWeight: 'bold' }}>
              Review Refund Request
            </h2>

            {/* Request Details */}
            <div style={{ marginBottom: '25px', padding: '20px', background: '#f9fafb', borderRadius: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Request ID</div>
                  <div style={{ fontSize: '16px', fontWeight: 'bold' }}>#{selectedRequest.id}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>User</div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>{selectedRequest.user_name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{selectedRequest.email}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Booking</div>
                  <div style={{ fontSize: '15px', fontWeight: '600' }}>#{selectedRequest.booking_id} - Seat {selectedRequest.seat_number}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>{selectedRequest.plan_name}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Expected Refund</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#10b981' }}>
                    ₹{parseFloat(selectedRequest.expected_amount || 0).toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>
                    to {selectedRequest.refund_method === 'wallet' ? 'Wallet' : 'Original Payment'}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Request Type</div>
                <div style={{ fontSize: '14px', fontWeight: '600' }}>{getRequestTypeLabel(selectedRequest.request_type)}</div>
              </div>

              <div style={{ marginBottom: selectedRequest.description ? '12px' : '0' }}>
                <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Reason</div>
                <div style={{ fontSize: '14px', color: '#1f2937', padding: '10px', background: 'white', borderRadius: '6px' }}>
                  {selectedRequest.reason}
                </div>
              </div>

              {selectedRequest.description && (
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '6px' }}>Description</div>
                  <div style={{ fontSize: '14px', color: '#1f2937', padding: '10px', background: 'white', borderRadius: '6px' }}>
                    {selectedRequest.description}
                  </div>
                </div>
              )}
            </div>

            <form onSubmit={handleReviewSubmit}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Decision
                </label>
                <div style={{ display: 'flex', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="status"
                      value="approved"
                      checked={reviewForm.status === 'approved'}
                      onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '15px', fontWeight: '500', color: '#10b981' }}>Approve</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="status"
                      value="under_review"
                      checked={reviewForm.status === 'under_review'}
                      onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '15px', fontWeight: '500', color: '#3b82f6' }}>Mark Under Review</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="status"
                      value="rejected"
                      checked={reviewForm.status === 'rejected'}
                      onChange={(e) => setReviewForm({ ...reviewForm, status: e.target.value })}
                      style={{ width: '18px', height: '18px' }}
                    />
                    <span style={{ fontSize: '15px', fontWeight: '500', color: '#ef4444' }}>Reject</span>
                  </label>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
                  Admin Notes {reviewForm.status === 'rejected' && <span style={{ color: 'red' }}>*</span>}
                </label>
                <textarea
                  value={reviewForm.admin_notes}
                  onChange={(e) => setReviewForm({ ...reviewForm, admin_notes: e.target.value })}
                  placeholder="Provide notes or reason for your decision..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical'
                  }}
                  required={reviewForm.status === 'rejected'}
                />
              </div>

              {reviewForm.status === 'approved' && (
                <div style={{
                  padding: '15px',
                  background: '#d1fae5',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  borderLeft: '4px solid #10b981'
                }}>
                  <div style={{ fontSize: '13px', color: '#065f46', fontWeight: '600', marginBottom: '4px' }}>
                    ✓ Refund will be automatically processed
                  </div>
                  <div style={{ fontSize: '13px', color: '#047857' }}>
                    ₹{parseFloat(selectedRequest.expected_amount).toFixed(2)} will be credited to user's {selectedRequest.refund_method}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
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
                    background: reviewForm.status === 'approved' ? '#10b981' : reviewForm.status === 'rejected' ? '#ef4444' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '500'
                  }}
                >
                  Submit Decision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserRefundRequests;
