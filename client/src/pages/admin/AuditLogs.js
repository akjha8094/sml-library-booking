import React, { useState, useEffect } from 'react';
import { FaDownload, FaFilter } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action_type: '',
    start_date: '',
    end_date: '',
    admin_id: '',
    user_id: ''
  });
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 50,
    offset: 0,
    has_more: false
  });

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, pagination.offset]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        ...filters,
        limit: pagination.limit,
        offset: pagination.offset
      });
      
      const response = await api.get(`/admin/audit-logs?${params}`);
      setLogs(response.logs || []);
      setPagination(prev => ({ ...prev, ...response.pagination }));
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
    setPagination(prev => ({ ...prev, offset: 0 }));
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams(filters);
      const url = `/admin/audit-logs/export/csv?${params}`;
      window.open(api.defaults.baseURL + url, '_blank');
      toast.success('Export started');
    } catch (error) {
      toast.error('Failed to export logs');
    }
  };

  const getActionTypeLabel = (actionType) => {
    const labels = {
      user_block: 'User Blocked',
      user_unblock: 'User Unblocked',
      wallet_credit: 'Wallet Credit',
      wallet_debit: 'Wallet Debit',
      booking_extend: 'Booking Extended',
      booking_cancel: 'Booking Cancelled',
      seat_change: 'Seat Changed',
      refund_process: 'Refund Processed',
      login_as_user: 'Login as User',
      payment_update: 'Payment Updated',
      plan_change: 'Plan Changed',
      other: 'Other'
    };
    return labels[actionType] || actionType;
  };

  const getActionColor = (actionType) => {
    const colors = {
      user_block: '#dc3545',
      user_unblock: '#28a745',
      wallet_credit: '#10B981',
      wallet_debit: '#dc3545',
      booking_extend: '#3B82F6',
      booking_cancel: '#dc3545',
      seat_change: '#f59e0b',
      refund_process: '#6366f1',
      login_as_user: '#f59e0b',
      payment_update: '#3B82F6',
      plan_change: '#6366f1',
      other: '#6c757d'
    };
    return colors[actionType] || '#6c757d';
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ margin: 0 }}>Audit Logs</h2>
        <button
          onClick={handleExport}
          style={{
            padding: '10px 20px',
            background: '#10B981',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: '500'
          }}
        >
          <FaDownload /> Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{
        background: 'white',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px' }}>
          <FaFilter />
          <h3 style={{ margin: 0 }}>Filters</h3>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>
              Action Type
            </label>
            <select
              value={filters.action_type}
              onChange={(e) => handleFilterChange('action_type', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              <option value="">All Actions</option>
              <option value="user_block">User Blocked</option>
              <option value="user_unblock">User Unblocked</option>
              <option value="wallet_credit">Wallet Credit</option>
              <option value="wallet_debit">Wallet Debit</option>
              <option value="booking_extend">Booking Extended</option>
              <option value="booking_cancel">Booking Cancelled</option>
              <option value="seat_change">Seat Changed</option>
              <option value="refund_process">Refund Processed</option>
              <option value="login_as_user">Login as User</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>
              Start Date
            </label>
            <input
              type="date"
              value={filters.start_date}
              onChange={(e) => handleFilterChange('start_date', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>
              End Date
            </label>
            <input
              type="date"
              value={filters.end_date}
              onChange={(e) => handleFilterChange('end_date', e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '8px'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '13px', fontWeight: '500' }}>
              &nbsp;
            </label>
            <button
              onClick={() => {
                setFilters({
                  action_type: '',
                  start_date: '',
                  end_date: '',
                  admin_id: '',
                  user_id: ''
                });
              }}
              style={{
                width: '100%',
                padding: '10px',
                background: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : logs.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', background: '#f8f9fa', borderRadius: '8px' }}>
          No audit logs found
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ background: '#f8f9fa' }}>
                <tr>
                  <th style={tableHeaderStyle}>ID</th>
                  <th style={tableHeaderStyle}>Date & Time</th>
                  <th style={tableHeaderStyle}>Action</th>
                  <th style={tableHeaderStyle}>Admin</th>
                  <th style={tableHeaderStyle}>Target User</th>
                  <th style={tableHeaderStyle}>Resource</th>
                  <th style={tableHeaderStyle}>IP Address</th>
                  <th style={tableHeaderStyle}>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tableCellStyle}>{log.id}</td>
                    <td style={tableCellStyle}>
                      <div>{new Date(log.created_at).toLocaleDateString('en-IN')}</div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>
                        {new Date(log.created_at).toLocaleTimeString('en-IN')}
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '500',
                        background: getActionColor(log.action_type) + '20',
                        color: getActionColor(log.action_type),
                        display: 'inline-block'
                      }}>
                        {getActionTypeLabel(log.action_type)}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ fontWeight: '500' }}>{log.admin_name}</div>
                      <div style={{ fontSize: '12px', color: '#6c757d' }}>{log.admin_email}</div>
                    </td>
                    <td style={tableCellStyle}>
                      {log.user_name ? (
                        <>
                          <div style={{ fontWeight: '500' }}>{log.user_name}</div>
                          <div style={{ fontSize: '12px', color: '#6c757d' }}>{log.user_email}</div>
                        </>
                      ) : (
                        <span style={{ color: '#6c757d' }}>N/A</span>
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      {log.target_resource_type ? (
                        <>
                          <div style={{ textTransform: 'capitalize' }}>{log.target_resource_type}</div>
                          {log.target_resource_id && (
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>ID: {log.target_resource_id}</div>
                          )}
                        </>
                      ) : (
                        <span style={{ color: '#6c757d' }}>N/A</span>
                      )}
                    </td>
                    <td style={tableCellStyle}>
                      <code style={{ fontSize: '12px', background: '#f8f9fa', padding: '4px 8px', borderRadius: '4px' }}>
                        {log.ip_address || 'N/A'}
                      </code>
                    </td>
                    <td style={tableCellStyle}>
                      {log.action_details ? (
                        <details style={{ cursor: 'pointer' }}>
                          <summary style={{ fontSize: '12px', color: '#6366f1' }}>View</summary>
                          <pre style={{
                            fontSize: '11px',
                            background: '#f8f9fa',
                            padding: '8px',
                            borderRadius: '4px',
                            marginTop: '8px',
                            maxWidth: '300px',
                            overflow: 'auto'
                          }}>
                            {JSON.stringify(JSON.parse(log.action_details), null, 2)}
                          </pre>
                        </details>
                      ) : (
                        <span style={{ color: '#6c757d' }}>N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '20px',
            padding: '15px',
            background: 'white',
            borderRadius: '8px'
          }}>
            <div style={{ color: '#6c757d' }}>
              Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} logs
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                disabled={pagination.offset === 0}
                style={{
                  padding: '8px 16px',
                  background: pagination.offset === 0 ? '#e9ecef' : '#6366f1',
                  color: pagination.offset === 0 ? '#6c757d' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: pagination.offset === 0 ? 'not-allowed' : 'pointer'
                }}
              >
                Previous
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                disabled={!pagination.has_more}
                style={{
                  padding: '8px 16px',
                  background: !pagination.has_more ? '#e9ecef' : '#6366f1',
                  color: !pagination.has_more ? '#6c757d' : 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: !pagination.has_more ? 'not-allowed' : 'pointer'
                }}
              >
                Next
              </button>
            </div>
          </div>
        </>
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

export default AuditLogs;
