import React, { useState, useEffect } from 'react';
import { FaWallet, FaPlus, FaMinus, FaHistory, FaRupeeSign } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Wallet = () => {
  const [wallet, setWallet] = useState({ balance: 0, transactions: [] });
  const [loading, setLoading] = useState(true);
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      setLoading(true);
      const response = await api.getWallet();
      console.log('Wallet data:', response);
      setWallet({
        balance: response.balance || 0,
        transactions: response.transactions || []
      });
    } catch (error) {
      console.error('Error fetching wallet:', error);
      toast.error('Failed to load wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();
    if (parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    try {
      // Call recharge API
      const response = await api.rechargeWallet(
        parseFloat(amount),
        'online',
        `TXN${Date.now()}`
      );
      
      toast.success('Money added successfully!');
      
      // Update wallet balance
      setWallet(prev => ({
        ...prev,
        balance: response.balance
      }));
      
      // Refresh wallet data to get new transaction
      fetchWallet();
      
      setShowAddMoney(false);
      setAmount('');
    } catch (error) {
      console.error('Error adding money:', error);
      toast.error(error.message || 'Failed to add money');
    }
  };

  const getTransactionColor = (type) => {
    return type === 'credit' ? '#10B981' : '#EF4444';
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading wallet...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      {/* Wallet Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        borderRadius: '20px',
        padding: '40px',
        color: 'white',
        marginBottom: '30px',
        boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
          <FaWallet size={40} />
          <div>
            <div style={{ fontSize: '16px', opacity: 0.9 }}>Total Balance</div>
            <div style={{ fontSize: '48px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <FaRupeeSign size={36} />
              {parseFloat(wallet.balance || 0).toFixed(2)}
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddMoney(true)}
          style={{
            padding: '14px 28px',
            background: 'white',
            color: '#6366f1',
            border: 'none',
            borderRadius: '10px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}
        >
          <FaPlus /> Add Money
        </button>
      </div>

      {/* Transaction History */}
      <div style={{ background: 'white', borderRadius: '16px', padding: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '25px' }}>
          <FaHistory size={24} color="#6366f1" />
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>Transaction History</h2>
        </div>

        {wallet.transactions && wallet.transactions.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <FaHistory size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
            <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Transactions Yet</h3>
            <p style={{ color: '#9ca3af', margin: 0 }}>Your transaction history will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '12px' }}>
            {wallet.transactions.map((transaction, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '16px',
                  background: '#f9fafb',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: transaction.type === 'credit' ? '#d1fae5' : '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: getTransactionColor(transaction.type)
                  }}>
                    {transaction.type === 'credit' ? <FaPlus /> : <FaMinus />}
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#1f2937', marginBottom: '4px' }}>
                      {transaction.description || 'Transaction'}
                    </div>
                    <div style={{ fontSize: '13px', color: '#6b7280' }}>
                      {new Date(transaction.created_at).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                  </div>
                </div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: getTransactionColor(transaction.type),
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px'
                }}>
                  {transaction.type === 'credit' ? '+' : '-'}
                  <FaRupeeSign size={16} />
                  {parseFloat(transaction.amount).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Money Modal */}
      {showAddMoney && (
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
            borderRadius: '16px',
            padding: '30px',
            width: '90%',
            maxWidth: '400px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>Add Money to Wallet</h3>
            <form onSubmit={handleAddMoney}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Amount (₹)</label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="1"
                  step="0.01"
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '16px'
                  }}
                  placeholder="Enter amount"
                  autoFocus
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => { setShowAddMoney(false); setAmount(''); }}
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '12px',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}
                >
                  Add Money
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wallet;
