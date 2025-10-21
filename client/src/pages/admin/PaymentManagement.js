import React, { useState, useEffect } from 'react';
import { FaSearch, FaDownload, FaCheckCircle, FaTimesCircle, FaClock, FaUndo } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [refundForm, setRefundForm] = useState({
    refund_amount: '',
    refund_type: 'full',
    refund_method: 'wallet',
    refund_reason: '',
    notes: ''
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await api.getPayments();
      setPayments(response.payments || response || []);
    } catch (error) {
      toast.error('Failed to fetch payments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#28a745',
      pending: '#ffc107',
      failed: '#dc3545',
      refunded: '#6c757d'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <FaCheckCircle />;
      case 'pending': return <FaClock />;
      case 'failed': return <FaTimesCircle />;
      default: return <FaClock />;
    }
  };

  const handleRefundClick = (payment) => {
    setSelectedPayment(payment);
    setRefundForm({
      refund_amount: payment.amount,
      refund_type: 'full',
      refund_method: 'wallet',
      refund_reason: '',
      notes: ''
    });
    setShowRefundModal(true);
  };

  const handleRefundSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/refunds/process', {
        payment_id: selectedPayment.id,
        ...refundForm
      });
      toast.success('Refund processed successfully');
      setShowRefundModal(false);
      fetchPayments();
    } catch (error) {
      toast.error(error.message || 'Failed to process refund');
    }
  };

  const handleRefundFormChange = (field, value) => {
    setRefundForm(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate amount for full refund
      if (field === 'refund_type' && value === 'full' && selectedPayment) {
        updated.refund_amount = selectedPayment.amount;
      }
      
      return updated;
    });
  };

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.user_id?.toString().includes(searchTerm);
    const matchesFilter = filter === 'all' || payment.status === filter;
    return matchesSearch && matchesFilter;
  });

  const totalAmount = filteredPayments.reduce((sum, p) => sum + parseFloat(p.amount || 0), 0);

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Payment Management</h2>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Total Payments</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3B82F6' }}>{filteredPayments.length}</div>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Total Amount</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>₹{totalAmount.toFixed(2)}</div>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Completed</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>
            {filteredPayments.filter(p => p.status === 'completed').length}
          </div>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Pending</div>
          <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#ffc107' }}>
            {filteredPayments.filter(p => p.status === 'pending').length}
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Search by Transaction ID or User ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '10px 10px 10px 40px', border: '1px solid #ddd', borderRadius: '8px' }}
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: '10px 15px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer' }}
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Payments Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : filteredPayments.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
          No payments found
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th style={tableHeaderStyle}>ID</th>
                <th style={tableHeaderStyle}>Transaction ID</th>
                <th style={tableHeaderStyle}>User ID</th>
                <th style={tableHeaderStyle}>Amount</th>
                <th style={tableHeaderStyle}>Gateway</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment) => (
                <tr key={payment.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tableCellStyle}>{payment.id}</td>
                  <td style={tableCellStyle}>
                    <code style={{ fontSize: '12px', background: '#f8f9fa', padding: '4px 8px', borderRadius: '4px' }}>
                      {payment.transaction_id}
                    </code>
                  </td>
                  <td style={tableCellStyle}>{payment.user_id}</td>
                  <td style={tableCellStyle}>
                    <span style={{ fontWeight: 'bold', color: '#10B981' }}>₹{payment.amount}</span>
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{ textTransform: 'capitalize' }}>{payment.payment_gateway}</span>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '500',
                      background: getStatusColor(payment.status) + '20',
                      color: getStatusColor(payment.status)
                    }}>
                      {getStatusIcon(payment.status)}
                      <span style={{ textTransform: 'capitalize' }}>{payment.status}</span>
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {payment.status === 'completed' && payment.refund_status !== 'full' && (
                        <button
                          onClick={() => handleRefundClick(payment)}
                          style={{
                            padding: '6px 12px',
                            background: '#f59e0b',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px'
                          }}
                        >
                          <FaUndo /> Refund
                        </button>
                      )}
                      <button
                        style={{
                          padding: '6px 12px',
                          background: '#6366f1',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <FaDownload /> Receipt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedPayment && (
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
            borderRadius: '12px',
            padding: '30px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Process Refund</h3>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>Transaction ID:</strong> {selectedPayment.transaction_id}
              </div>
              <div style={{ marginBottom: '8px' }}>
                <strong>Payment Amount:</strong> ₹{selectedPayment.amount}
              </div>
              <div>
                <strong>Payment Gateway:</strong> {selectedPayment.payment_gateway}
              </div>
            </div>

            <form onSubmit={handleRefundSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Refund Type</label>
                <select
                  value={refundForm.refund_type}
                  onChange={(e) => handleRefundFormChange('refund_type', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                  required
                >
                  <option value="full">Full Refund</option>
                  <option value="partial">Partial Refund</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Refund Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={refundForm.refund_amount}
                  onChange={(e) => handleRefundFormChange('refund_amount', e.target.value)}
                  max={selectedPayment.amount}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                  required
                  disabled={refundForm.refund_type === 'full'}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Refund Method</label>
                <select
                  value={refundForm.refund_method}
                  onChange={(e) => handleRefundFormChange('refund_method', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                  required
                >
                  <option value="wallet">Wallet (Instant)</option>
                  <option value="original">Original Payment Method (3-5 days)</option>
                  <option value="bank_transfer">Bank Transfer (Manual)</option>
                </select>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Refund Reason *</label>
                <textarea
                  value={refundForm.refund_reason}
                  onChange={(e) => handleRefundFormChange('refund_reason', e.target.value)}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    resize: 'vertical'
                  }}
                  required
                  placeholder="Enter reason for refund..."
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Additional Notes</label>
                <textarea
                  value={refundForm.notes}
                  onChange={(e) => handleRefundFormChange('notes', e.target.value)}
                  rows="2"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    resize: 'vertical'
                  }}
                  placeholder="Optional notes..."
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowRefundModal(false)}
                  style={{
                    padding: '10px 20px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '10px 20px',
                    background: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  Process Refund ₹{refundForm.refund_amount}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const tableHeaderStyle = {
  padding: '12px',
  textAlign: 'left',
  fontWeight: '600',
  fontSize: '13px',
  color: '#495057',
  borderBottom: '2px solid #dee2e6'
};

const tableCellStyle = {
  padding: '12px',
  fontSize: '14px'
};

export default PaymentManagement;
