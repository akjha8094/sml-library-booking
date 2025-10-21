import React, { useState, useEffect } from 'react';
import { FaSearch, FaUserCheck, FaUserSlash, FaEnvelope, FaPhone, FaBirthdayCake, FaCalendar, FaWallet, FaPlus, FaMinus, FaHistory, FaSignInAlt } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Members = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [showBookingsModal, setShowBookingsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [walletAction, setWalletAction] = useState('credit');
  const [walletForm, setWalletForm] = useState({ amount: '', reason: '' });
  const [userBookings, setUserBookings] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = members.filter(member => 
        member.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.mobile?.includes(searchTerm)
      );
      setFilteredMembers(filtered);
    } else {
      setFilteredMembers(members);
    }
  }, [searchTerm, members]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/members');
      setMembers(response.members || []);
      setFilteredMembers(response.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error(error.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockToggle = async (userId, isBlocked) => {
    try {
      await api.put(`/admin/members/${userId}/block`, { is_blocked: !isBlocked });
      toast.success(`User ${!isBlocked ? 'blocked' : 'unblocked'} successfully`);
      fetchMembers();
    } catch (error) {
      toast.error(error.message || 'Failed to update user status');
    }
  };

  const handleWalletManagement = (member, action) => {
    setSelectedMember(member);
    setWalletAction(action);
    setWalletForm({ amount: '', reason: '' });
    setShowWalletModal(true);
  };

  const handleWalletSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/admin/user-control/${selectedMember.id}/wallet/${walletAction}`, walletForm);
      toast.success(`Wallet ${walletAction === 'credit' ? 'credited' : 'debited'} successfully`);
      setShowWalletModal(false);
      fetchMembers();
    } catch (error) {
      toast.error(error.message || 'Failed to update wallet');
    }
  };

  const handleViewBookings = async (member) => {
    setSelectedMember(member);
    try {
      const response = await api.get(`/admin/user-control/${member.id}/bookings`);
      setUserBookings(response.bookings || []);
      setShowBookingsModal(true);
    } catch (error) {
      toast.error('Failed to fetch bookings');
    }
  };

  const handleLoginAsUser = async (userId) => {
    try {
      const response = await api.post(`/admin/impersonation/impersonate/${userId}`);
      localStorage.setItem('impersonation_token', response.impersonation_token);
      localStorage.setItem('impersonation_data', JSON.stringify({
        session_id: response.session_id,
        admin_name: response.admin_info.admin_name,
        user: response.user
      }));
      toast.success(`Logged in as ${response.user.name}`);
      window.location.href = '/';
    } catch (error) {
      toast.error(error.message || 'Failed to login as user');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getMembershipStatus = (lastBookingEnd) => {
    if (!lastBookingEnd) return { text: 'No Booking', color: '#6c757d' };
    const endDate = new Date(lastBookingEnd);
    const today = new Date();
    if (endDate >= today) return { text: 'Active', color: '#28a745' };
    return { text: 'Expired', color: '#dc3545' };
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div>Loading members...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0 }}>Members Management</h2>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <span style={{ color: '#6c757d' }}>Total Members: {members.length}</span>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <FaSearch style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d' }} />
          <input
            type="text"
            placeholder="Search by name, email, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 10px 10px 40px',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
        </div>
      </div>

      {/* Members Table */}
      {filteredMembers.length === 0 ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: '#f8f9fa',
          borderRadius: '8px',
          color: '#6c757d'
        }}>
          {searchTerm ? 'No members found matching your search.' : 'No members registered yet.'}
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%',
            borderCollapse: 'collapse',
            background: 'white',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th style={tableHeaderStyle}>ID</th>
                <th style={tableHeaderStyle}>Name</th>
                <th style={tableHeaderStyle}>Email</th>
                <th style={tableHeaderStyle}>Mobile</th>
                <th style={tableHeaderStyle}>Gender</th>
                <th style={tableHeaderStyle}>DOB</th>
                <th style={tableHeaderStyle}>Wallet</th>
                <th style={tableHeaderStyle}>Status</th>
                <th style={tableHeaderStyle}>Membership</th>
                <th style={tableHeaderStyle}>Joined</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const membershipStatus = getMembershipStatus(member.last_booking_end);
                return (
                  <tr key={member.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={tableCellStyle}>{member.id}</td>
                    <td style={tableCellStyle}>
                      <div style={{ fontWeight: '500' }}>{member.name}</div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaEnvelope size={12} color="#6c757d" />
                        <span style={{ fontSize: '13px' }}>{member.email}</span>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaPhone size={12} color="#6c757d" />
                        <span style={{ fontSize: '13px' }}>{member.mobile}</span>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{ textTransform: 'capitalize' }}>{member.gender || 'N/A'}</span>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaBirthdayCake size={12} color="#6c757d" />
                        <span style={{ fontSize: '13px' }}>{formatDate(member.dob)}</span>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaWallet size={12} color="#28a745" />
                        <span style={{ fontSize: '13px', fontWeight: '500' }}>₹{member.wallet_balance || 0}</span>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: member.is_blocked ? '#dc354520' : '#28a74520',
                        color: member.is_blocked ? '#dc3545' : '#28a745',
                        fontWeight: '500'
                      }}>
                        {member.is_blocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background: membershipStatus.color + '20',
                        color: membershipStatus.color,
                        fontWeight: '500'
                      }}>
                        {membershipStatus.text}
                      </span>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <FaCalendar size={12} color="#6c757d" />
                        <span style={{ fontSize: '13px' }}>{formatDate(member.created_at)}</span>
                      </div>
                    </td>
                    <td style={tableCellStyle}>
                      <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleBlockToggle(member.id, member.is_blocked)}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: member.is_blocked ? '#28a745' : '#dc3545',
                            color: 'white',
                            fontWeight: '500'
                          }}
                        >
                          {member.is_blocked ? (
                            <><FaUserCheck /> Unblock</>
                          ) : (
                            <><FaUserSlash /> Block</>
                          )}
                        </button>
                        <button
                          onClick={() => handleWalletManagement(member, 'credit')}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            background: '#10B981',
                            color: 'white'
                          }}
                          title="Add Money"
                        >
                          <FaPlus />
                        </button>
                        <button
                          onClick={() => handleWalletManagement(member, 'debit')}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            background: '#dc3545',
                            color: 'white'
                          }}
                          title="Deduct Money"
                        >
                          <FaMinus />
                        </button>
                        <button
                          onClick={() => handleViewBookings(member)}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            background: '#6366f1',
                            color: 'white'
                          }}
                          title="View Bookings"
                        >
                          <FaHistory />
                        </button>
                        <button
                          onClick={() => handleLoginAsUser(member.id)}
                          style={{
                            padding: '6px 12px',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px',
                            background: '#f59e0b',
                            color: 'white'
                          }}
                          title="Login as User"
                        >
                          <FaSignInAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Wallet Management Modal */}
      {showWalletModal && selectedMember && (
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
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '20px' }}>
              {walletAction === 'credit' ? 'Add Money to Wallet' : 'Deduct Money from Wallet'}
            </h3>
            
            <div style={{ marginBottom: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
              <div style={{ marginBottom: '8px' }}>
                <strong>User:</strong> {selectedMember.name}
              </div>
              <div>
                <strong>Current Balance:</strong> ₹{selectedMember.wallet_balance}
              </div>
            </div>

            <form onSubmit={handleWalletSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={walletForm.amount}
                  onChange={(e) => setWalletForm({ ...walletForm, amount: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px'
                  }}
                  required
                  min="0.01"
                  placeholder="Enter amount"
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Reason</label>
                <textarea
                  value={walletForm.reason}
                  onChange={(e) => setWalletForm({ ...walletForm, reason: e.target.value })}
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    resize: 'vertical'
                  }}
                  placeholder="Enter reason for transaction"
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowWalletModal(false)}
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
                    background: walletAction === 'credit' ? '#10B981' : '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600'
                  }}
                >
                  {walletAction === 'credit' ? 'Add Money' : 'Deduct Money'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bookings Modal */}
      {showBookingsModal && selectedMember && (
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
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0 }}>Bookings - {selectedMember.name}</h3>
              <button
                onClick={() => setShowBookingsModal(false)}
                style={{
                  padding: '8px 16px',
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>

            {userBookings.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6c757d' }}>
                No bookings found
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8f9fa' }}>
                  <tr>
                    <th style={tableHeaderStyle}>Plan</th>
                    <th style={tableHeaderStyle}>Seat</th>
                    <th style={tableHeaderStyle}>Start Date</th>
                    <th style={tableHeaderStyle}>End Date</th>
                    <th style={tableHeaderStyle}>Amount</th>
                    <th style={tableHeaderStyle}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userBookings.map((booking) => (
                    <tr key={booking.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={tableCellStyle}>{booking.plan_name}</td>
                      <td style={tableCellStyle}>{booking.seat_number}</td>
                      <td style={tableCellStyle}>{new Date(booking.start_date).toLocaleDateString('en-IN')}</td>
                      <td style={tableCellStyle}>{new Date(booking.end_date).toLocaleDateString('en-IN')}</td>
                      <td style={tableCellStyle}>₹{booking.final_amount}</td>
                      <td style={tableCellStyle}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          background: booking.status === 'active' ? '#28a74520' : '#6c757d20',
                          color: booking.status === 'active' ? '#28a745' : '#6c757d',
                          fontWeight: '500',
                          textTransform: 'capitalize'
                        }}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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
  fontSize: '14px',
  color: '#212529'
};

export default Members;
