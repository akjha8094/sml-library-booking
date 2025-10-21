import React, { useState, useEffect } from 'react';
import { 
  FaHeadset, FaTicketAlt, FaPlus, FaPaperPlane, 
  FaUser, FaUserShield, FaClock, FaCheckCircle, FaArrowLeft
} from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Support = () => {
  const [activeTab, setActiveTab] = useState('tickets'); // 'tickets' or 'create'
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: ''
  });

  useEffect(() => {
    if (activeTab === 'tickets') {
      fetchTickets();
    }
  }, [activeTab]);

  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    }
  }, [selectedTicket]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await api.getTickets();
      setTickets(response.tickets || []);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast.error('Failed to load tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (ticketId) => {
    try {
      const response = await api.getTicketMessages(ticketId);
      setMessages(response.messages || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    
    if (!formData.subject || !formData.message) {
      toast.error('Please fill all required fields');
      return;
    }

    try {
      await api.createTicket(formData);
      toast.success('Ticket created successfully!');
      setFormData({
        subject: '',
        category: 'general',
        priority: 'medium',
        message: ''
      });
      setActiveTab('tickets');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to create ticket');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;

    try {
      await api.sendMessage(selectedTicket.id, newMessage);
      setNewMessage('');
      fetchMessages(selectedTicket.id);
      toast.success('Message sent');
    } catch (error) {
      toast.error('Failed to send message');
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

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#10B981',
      medium: '#F59E0B',
      high: '#EF4444',
      urgent: '#DC2626'
    };
    return colors[priority] || '#6b7280';
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
          <FaHeadset size={28} />
          <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>Support Center</h1>
        </div>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: 0 }}>
          We're here to help! Create a ticket or check existing ones
        </p>
      </div>

      {/* Tabs */}
      {!selectedTicket && (
        <div style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '30px',
          borderBottom: '2px solid #e5e7eb',
          paddingBottom: '10px'
        }}>
          <button
            onClick={() => setActiveTab('tickets')}
            style={{
              padding: '12px 24px',
              background: activeTab === 'tickets' ? '#6366f1' : 'transparent',
              color: activeTab === 'tickets' ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaTicketAlt /> My Tickets
          </button>
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
              gap: '8px'
            }}
          >
            <FaPlus /> Create Ticket
          </button>
        </div>
      )}

      {/* Create Ticket Form */}
      {activeTab === 'create' && !selectedTicket && (
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}>
          <form onSubmit={handleCreateTicket}>
            <div style={{ display: 'grid', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Brief description of your issue"
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

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="general">General</option>
                    <option value="booking">Booking</option>
                    <option value="payment">Payment</option>
                    <option value="technical">Technical</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '16px'
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#374151' }}>
                  Message *
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Describe your issue in detail..."
                  required
                  rows="6"
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

              <button
                type="submit"
                style={{
                  padding: '16px',
                  background: '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '18px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <FaPlus /> Create Ticket
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets List */}
      {activeTab === 'tickets' && !selectedTicket && (
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading tickets...</div>
            </div>
          ) : tickets.length === 0 ? (
            <div style={{
              background: 'white',
              padding: '80px 20px',
              borderRadius: '16px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              textAlign: 'center'
            }}>
              <FaTicketAlt size={64} color="#d1d5db" style={{ marginBottom: '20px' }} />
              <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Tickets Yet</h3>
              <p style={{ color: '#9ca3af', margin: '0 0 20px 0' }}>Create your first support ticket</p>
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
                Create Ticket
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {tickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  style={{
                    background: 'white',
                    padding: '20px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    cursor: 'pointer',
                    border: '2px solid transparent',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#6366f1';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'transparent';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '5px' }}>
                        #{ticket.ticket_number}
                      </div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1f2937' }}>
                        {ticket.subject}
                      </h3>
                    </div>
                    <span style={{
                      padding: '6px 12px',
                      background: getStatusColor(ticket.status) + '20',
                      color: getStatusColor(ticket.status),
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', fontSize: '14px', color: '#6b7280' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <FaClock />
                      {formatDate(ticket.created_at)}
                    </span>
                    <span style={{
                      padding: '4px 8px',
                      background: getPriorityColor(ticket.priority) + '20',
                      color: getPriorityColor(ticket.priority),
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'capitalize'
                    }}>
                      {ticket.priority}
                    </span>
                    <span style={{ textTransform: 'capitalize' }}>
                      {ticket.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ticket Messages View */}
      {selectedTicket && (
        <div style={{
          background: 'white',
          borderRadius: '16px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          overflow: 'hidden'
        }}>
          {/* Ticket Header */}
          <div style={{
            padding: '20px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white'
          }}>
            <button
              onClick={() => setSelectedTicket(null)}
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                marginBottom: '15px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <FaArrowLeft /> Back to Tickets
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>
                  #{selectedTicket.ticket_number}
                </div>
                <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>
                  {selectedTicket.subject}
                </h2>
                <div style={{ display: 'flex', gap: '15px', fontSize: '14px', opacity: 0.9 }}>
                  <span>{formatDate(selectedTicket.created_at)}</span>
                  <span style={{ textTransform: 'capitalize' }}>Category: {selectedTicket.category}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <span style={{
                  padding: '8px 16px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {selectedTicket.status.replace('_', ' ')}
                </span>
                <span style={{
                  padding: '8px 16px',
                  background: getPriorityColor(selectedTicket.priority) + '40',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: '600',
                  textTransform: 'capitalize'
                }}>
                  {selectedTicket.priority}
                </span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            padding: '20px',
            maxHeight: '500px',
            overflowY: 'auto',
            background: '#f9fafb'
          }}>
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
                      alignItems: 'start',
                      gap: '12px',
                      flexDirection: message.sender_type === 'user' ? 'row' : 'row-reverse'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: message.sender_type === 'user' ? '#6366f1' : '#10B981',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {message.sender_type === 'user' ? <FaUser /> : <FaUserShield />}
                    </div>

                    <div style={{
                      flex: 1,
                      maxWidth: '70%'
                    }}>
                      <div style={{
                        background: message.sender_type === 'user' ? '#6366f1' : '#10B981',
                        color: 'white',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        marginBottom: '5px'
                      }}>
                        <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '5px', fontWeight: '600' }}>
                          {message.sender_name || (message.sender_type === 'user' ? 'You' : 'Support Team')}
                        </div>
                        <div style={{ fontSize: '15px', lineHeight: '1.5' }}>
                          {message.message}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: '#6b7280',
                        textAlign: message.sender_type === 'user' ? 'left' : 'right'
                      }}>
                        {formatDate(message.created_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Message Input */}
          {selectedTicket.status !== 'closed' && (
            <div style={{
              padding: '20px',
              borderTop: '1px solid #e5e7eb',
              background: 'white'
            }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    border: '2px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  style={{
                    padding: '12px 24px',
                    background: newMessage.trim() ? '#6366f1' : '#9ca3af',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}
                >
                  <FaPaperPlane /> Send
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Support;
