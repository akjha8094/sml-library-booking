import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaChair } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const SeatManagement = () => {
  const [seats, setSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    seat_number: '',
    floor: 1,
    section: '',
    seat_status: 'available'
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchSeats();
  }, []);

  const fetchSeats = async () => {
    try {
      setLoading(true);
      const response = await api.get('/seats');
      const seatData = response.seats || [];
      // Sort seats by numeric value (S01, S02...S50, S51)
      const sortedSeats = seatData.sort((a, b) => {
        const numA = parseInt(a.seat_number.substring(1));
        const numB = parseInt(b.seat_number.substring(1));
        return numA - numB;
      });
      setSeats(sortedSeats);
    } catch (error) {
      toast.error('Failed to fetch seats');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.updateSeat(editingId, formData);
        toast.success('Seat updated successfully');
      } else {
        await api.createSeat(formData);
        toast.success('Seat created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchSeats();
    } catch (error) {
      toast.error(error.message || 'Operation failed');
    }
  };

  const handleEdit = (seat) => {
    setFormData({
      seat_number: seat.seat_number,
      floor: seat.floor,
      section: seat.section || '',
      seat_status: seat.seat_status
    });
    setEditingId(seat.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this seat?')) {
      try {
        await api.deleteSeat(id);
        toast.success('Seat deleted successfully');
        fetchSeats();
      } catch (error) {
        toast.error('Failed to delete seat');
      }
    }
  };

  const resetForm = () => {
    setFormData({ seat_number: '', floor: 1, section: '', seat_status: 'available' });
    setEditingId(null);
  };

  const getStatusColor = (status) => {
    const colors = {
      available: '#28a745',
      occupied: '#dc3545',
      maintenance: '#ffc107',
      reserved: '#17a2b8'
    };
    return colors[status] || '#6c757d';
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Seat Management</h2>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          style={{
            padding: '10px 20px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <FaPlus /> Add Seat
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '15px' }}>
          {seats.map((seat) => (
            <div
              key={seat.id}
              style={{
                padding: '15px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textAlign: 'center',
                border: `2px solid ${getStatusColor(seat.seat_status)}`
              }}
            >
              <FaChair size={30} color={getStatusColor(seat.seat_status)} />
              <div style={{ fontSize: '18px', fontWeight: 'bold', margin: '10px 0' }}>
                {seat.seat_number}
              </div>
              <div style={{ fontSize: '12px', color: '#6c757d', marginBottom: '8px' }}>
                Floor {seat.floor} {seat.section && `- ${seat.section}`}
              </div>
              <div style={{
                fontSize: '11px',
                padding: '4px 8px',
                background: getStatusColor(seat.seat_status) + '20',
                color: getStatusColor(seat.seat_status),
                borderRadius: '4px',
                marginBottom: '10px',
                textTransform: 'capitalize'
              }}>
                {seat.seat_status}
              </div>
              <div style={{ display: 'flex', gap: '5px', justifyContent: 'center' }}>
                <button
                  onClick={() => handleEdit(seat)}
                  style={{ padding: '5px 10px', background: '#ffc107', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDelete(seat.id)}
                  style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '500px'
          }}>
            <h3>{editingId ? 'Edit Seat' : 'Add New Seat'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Seat Number *</label>
                <input
                  type="text"
                  value={formData.seat_number}
                  onChange={(e) => setFormData({ ...formData, seat_number: e.target.value })}
                  required
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                  placeholder="e.g., S01"
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Floor *</label>
                <input
                  type="number"
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: parseInt(e.target.value) })}
                  required
                  min="1"
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Section</label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                  placeholder="e.g., A, B, VIP"
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Status *</label>
                <select
                  value={formData.seat_status}
                  onChange={(e) => setFormData({ ...formData, seat_status: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatManagement;
