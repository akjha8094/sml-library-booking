import React, { useState, useEffect } from 'react';
import { FaTicketAlt, FaReply, FaEye } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const SupportManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyMessage, setReplyMessage] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.getAdminTickets();
      setTickets(response.tickets || []);
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId) => {
    try {
      const response = await api.getTicketMessages(ticketId);
      setMessages(response.messages || []);
    } catch (error) {
      toast.error('Failed to fetch messages');
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.updateTicketStatus(id, status);
      toast.success('Status updated successfully');
      fetchTickets();
      if (selectedTicket && selectedTicket.id === id) {
        setSelectedTicket({ ...selectedTicket, status });
      }
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleReply = async () => {
    if (!replyMessage.trim()) return;

    try {
      await api.replyToTicket(selectedTicket.id, replyMessage);
      setReplyMessage('');
      fetchMessages(selectedTicket.id);
      toast.success('Reply sent successfully');
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      open: '#3B82F6',
      in_progress: '#F59E0B',
      resolved: '#10B981',
      closed: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const filteredTickets = filter === 'all' ? tickets : tickets.filter(t => t.status === filter);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Support Ticket Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {['all', 'open', 'in_progress', 'resolved', 'closed'].map((status) => (
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
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '400px 1fr' : '1fr', gap: '20px' }}>
        {/* Tickets List */}
        <div style={{ overflowY: 'auto', maxHeight: '80vh' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{
                    background: 'white',
                    padding: '15px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: `2px solid ${selectedTicket?.id === ticket.id ? '#6366f1' : '#e5e7eb'}`,
                    transition: 'all 0.3s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>#{ticket.ticket_number}</div>
                    <span style={{
                      padding: '4px 10px',
                      background: getStatusColor(ticket.status) + '20',
                      color: getStatusColor(ticket.status),
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{ticket.subject}</h4>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    {ticket.user_name} • {ticket.email}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '5px' }}>
                    {new Date(ticket.created_at).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Details */}
        {selectedTicket && (
          <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            {/* Header */}
            <div style={{ padding: '20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                    #{selectedTicket.ticket_number}
                  </div>
                  <h3 style={{ margin: '0 0 10px 0' }}>{selectedTicket.subject}</h3>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {selectedTicket.user_name} • {selectedTicket.email} • {selectedTicket.mobile}
                  </div>
                </div>
                <select
                  value={selectedTicket.status}
                  onChange={(e) => handleStatusUpdate(selectedTicket.id, e.target.value)}
                  style={{
                    padding: '8px 16px',
                    background: getStatusColor(selectedTicket.status) + '20',
                    color: getStatusColor(selectedTicket.status),
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '15px', fontSize: '13px', color: '#6b7280' }}>
                <span style={{ textTransform: 'capitalize' }}>Category: {selectedTicket.category}</span>
                <span style={{ textTransform: 'capitalize' }}>Priority: {selectedTicket.priority}</span>
                <span>{new Date(selectedTicket.created_at).toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Messages */}
            <div style={{ padding: '20px', maxHeight: '400px', overflowY: 'auto' }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                  No messages yet
                </div>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      style={{
                        display: 'flex',
                        flexDirection: message.sender_type === 'admin' ? 'row-reverse' : 'row',
                        gap: '12px'
                      }}
                    >
                      <div style={{
                        padding: '12px 16px',
                        background: message.sender_type === 'admin' ? '#6366f1' : '#f3f4f6',
                        color: message.sender_type === 'admin' ? 'white' : '#1f2937',
                        borderRadius: '12px',
                        maxWidth: '70%'
                      }}>
                        <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '5px', fontWeight: '600' }}>
                          {message.sender_name || (message.sender_type === 'admin' ? 'You' : 'User')}
                        </div>
                        <div style={{ fontSize: '14px', lineHeight: '1.5' }}>{message.message}</div>
                        <div style={{ fontSize: '11px', opacity: 0.7, marginTop: '5px' }}>
                          {new Date(message.created_at).toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Reply Box */}
            {selectedTicket.status !== 'closed' && (
              <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb' }}>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your reply..."
                  rows="3"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '14px',
                    resize: 'vertical',
                    marginBottom: '10px'
                  }}
                />
                <button
                  onClick={handleReply}
                  disabled={!replyMessage.trim()}
                  style={{
                    padding: '10px 20px',
                    background: replyMessage.trim() ? '#6366f1' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: replyMessage.trim() ? 'pointer' : 'not-allowed',
                    fontWeight: '600'
                  }}
                >
                  <FaReply style={{ marginRight: '8px' }} />
                  Send Reply
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SupportManagement;
