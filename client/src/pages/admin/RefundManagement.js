import React, { useState, useEffect } from 'react';
import { FaSearch, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const RefundManagement = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchRefunds();
    fetchStats();
  }, []);

  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/refunds');
      setRefunds(response.refunds || []);
    } catch (error) {
      toast.error('Failed to fetch refunds');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/refunds/stats/summary');
      setStats(response.stats || {});
    } catch (error) {
      console.error('Failed to fetch refund stats');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: '#28a745',
      processing: '#ffc107',
      pending: '#6c757d',
      failed: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'completed': return <FaCheckCircle />;
      case 'processing': return <FaClock />;
      case 'pending': return <FaClock />;
      case 'failed': return <FaTimesCircle />;
      default: return <FaClock />;
    }
  };

  const filteredRefunds = refunds.filter(refund => {
    const matchesSearch = 
      refund.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.user_email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || refund.refund_status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ padding: '20px' }}>
      <h2 style={{ marginBottom: '20px' }}>Refund Management</h2>

      {/* Summary Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '25px' }}>
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Total Refunds</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#3B82F6' }}>{stats.total_refunds || 0}</div>
          </div>
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Completed</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#28a745' }}>{stats.completed || 0}</div>
          </div>
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Total Amount</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>₹{parseFloat(stats.total_amount || 0).toFixed(2)}</div>
          </div>
          <div style={{ padding: '20px', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <div style={{ fontSize: '14px', color: '#6c757d', marginBottom: '8px' }}>Completed Amount</div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#10B981' }}>₹{parseFloat(stats.completed_amount || 0).toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Search by user name, email, or transaction ID..."
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
          <option value="processing">Processing</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {/* Refunds Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : filteredRefunds.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
          No refunds found
        </div>
      ) : (
        <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th style={tableHeaderStyle}>ID</th>
                <th style={tableHeaderStyle}>User</th>
                <th style={tableHeaderStyle}>Transaction ID</th>
                <th style={tableHeaderStyle}>Amount</th>
                <th style={tableHeaderStyle}>Type</th>
                <th style={tableHeaderStyle}>Method</th>
                <th style={tableHeaderStyle}>Reason</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Date</th>
                <th style={tableHeaderStyle}>Processed By</th>
              </tr>
            </thead>
            <tbody>
              {filteredRefunds.map((refund) => (
                <tr key={refund.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={tableCellStyle}>{refund.id}</td>
                  <td style={tableCellStyle}>
                    <div>
                      <div style={{ fontWeight: '500' }}>{refund.user_name}</div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>{refund.user_email}</div>
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    <code style={{ fontSize: '12px', background: '#f8f9fa', padding: '4px 8px', borderRadius: '4px' }}>
                      {refund.transaction_id}
                    </code>
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{ fontWeight: 'bold', color: '#dc3545' }}>₹{refund.refund_amount}</span>
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{ 
                      textTransform: 'capitalize',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      background: refund.refund_type === 'full' ? '#28a74520' : '#ffc10720',
                      color: refund.refund_type === 'full' ? '#28a745' : '#ffc107'
                    }}>
                      {refund.refund_type}
                    </span>
                  </td>
                  <td style={tableCellStyle}>
                    <span style={{ textTransform: 'capitalize' }}>{refund.refund_method}</span>
                  </td>
                  <td style={tableCellStyle}>
                    <div style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={refund.refund_reason}>
                      {refund.refund_reason}
                    </div>
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
                      background: getStatusColor(refund.refund_status) + '20',
                      color: getStatusColor(refund.refund_status)
                    }}>
                      {getStatusIcon(refund.refund_status)}
                      <span style={{ textTransform: 'capitalize' }}>{refund.refund_status}</span>
                    </div>
                  </td>
                  <td style={tableCellStyle}>
                    {new Date(refund.refund_date).toLocaleDateString('en-IN')}
                  </td>
                  <td style={tableCellStyle}>{refund.processed_by_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
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

export default RefundManagement;
