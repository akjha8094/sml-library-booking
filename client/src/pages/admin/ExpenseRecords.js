import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaWallet } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const ExpenseRecords = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ category: '', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/expenses');
      setExpenses(response.expenses || response || []);
    } catch (error) {
      toast.error('Failed to fetch expenses');
      console.error('Fetch expenses error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/expenses/${editingId}`, formData);
        toast.success('Expense updated');
      } else {
        await api.post('/admin/expenses', formData);
        toast.success('Expense added');
      }
      setShowModal(false);
      resetForm();
      fetchExpenses();
    } catch (error) {
      toast.error('Failed');
    }
  };

  const handleEdit = (expense) => {
    setFormData(expense);
    setEditingId(expense.id);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete?')) {
      try {
        await api.delete(`/admin/expenses/${id}`);
        toast.success('Deleted');
        fetchExpenses();
      } catch (error) {
        toast.error('Failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({ category: '', amount: '', description: '', expense_date: new Date().toISOString().split('T')[0] });
    setEditingId(null);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h2>Expense Records</h2>
        <button onClick={() => { resetForm(); setShowModal(true); }} style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FaPlus /> Add Expense
        </button>
      </div>

      <div style={{ background: 'white', padding: '20px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <FaWallet size={32} color="#ef4444" />
          <div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Total Expenses</div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#ef4444' }}>₹{totalExpenses.toFixed(2)}</div>
          </div>
        </div>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div> : expenses.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <FaWallet size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Expenses Found</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>Click "Add Expense" to record your first expense</p>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8f9fa' }}>
              <tr>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Category</th>
                <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Description</th>
                <th style={{ padding: '12px', textAlign: 'right', fontWeight: '600' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '12px' }}>{new Date(expense.expense_date).toLocaleDateString('en-IN')}</td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ padding: '4px 12px', background: '#dbeafe', color: '#1e40af', borderRadius: '12px', fontSize: '13px' }}>{expense.category}</span>
                  </td>
                  <td style={{ padding: '12px', color: '#6b7280' }}>{expense.description}</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: '#ef4444' }}>₹{expense.amount}</td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                      <button onClick={() => handleEdit(expense)} style={{ padding: '6px 12px', background: '#fbbf24', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><FaEdit /></button>
                      <button onClick={() => handleDelete(expense.id)} style={{ padding: '6px 12px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}><FaTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '500px' }}>
            <h3>{editingId ? 'Edit Expense' : 'Add Expense'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Category *</label>
                <input type="text" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} placeholder="e.g., Utilities, Maintenance" />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Amount (₹) *</label>
                <input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required min="0" step="0.01" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Description</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px', minHeight: '60px' }} />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Expense Date *</label>
                <input type="date" value={formData.expense_date} onChange={(e) => setFormData({ ...formData, expense_date: e.target.value })} required style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => { setShowModal(false); resetForm(); }} style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '10px 20px', background: '#6366f1', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>{editingId ? 'Update' : 'Add'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseRecords;
