import React, { useState, useEffect } from 'react';
import { FaChartLine, FaMoneyBillWave, FaShoppingCart, FaTrophy } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Reports = () => {
  const [period, setPeriod] = useState('today');
  const [stats, setStats] = useState({ total: 0, revenue: 0, topPlan: null });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [period]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/admin/reports?period=${period}`);
      const data = response.stats || response || {};
      setStats({
        total: data.totalBookings || 0,
        revenue: data.revenue || 0,
        activeMembers: data.activeMembers || 0,
        availableSeats: data.availableSeats || 0,
        occupiedSeats: data.occupiedSeats || 0,
        totalUsers: data.totalUsers || 0
      });
    } catch (error) {
      toast.error('Failed to fetch reports');
      console.error('Fetch reports error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2>Reports & Analytics</h2>
        <select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '8px', cursor: 'pointer', fontSize: '14px' }}>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
      </div>

      {loading ? <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div> : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ padding: '25px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '12px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <FaShoppingCart size={32} />
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Bookings</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{stats.total || 0}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: '25px', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', borderRadius: '12px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <FaMoneyBillWave size={32} />
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Total Revenue</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>₹{stats.revenue || 0}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: '25px', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', borderRadius: '12px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <FaTrophy size={32} />
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Top Selling Plan</div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold' }}>{stats.topPlan || 'N/A'}</div>
                </div>
              </div>
            </div>
            <div style={{ padding: '25px', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', borderRadius: '12px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '10px' }}>
                <FaChartLine size={32} />
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9 }}>Growth</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold' }}>+12%</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginTop: 0 }}>Detailed Analytics</h3>
            <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
              <FaChartLine size={48} style={{ marginBottom: '15px', opacity: 0.5 }} />
              <p>Detailed charts and graphs will be displayed here</p>
              <p style={{ fontSize: '14px' }}>Sales trends, revenue graphs, and performance metrics</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
