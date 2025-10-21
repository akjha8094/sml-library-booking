import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaUsers, FaUserCheck, FaUserTimes, FaShoppingCart, 
  FaMoneyBillWave, FaBirthdayCake, FaChartLine, FaWallet,
  FaExclamationTriangle, FaSync
} from 'react-icons/fa';
import api from '../../services/api';
import Card from '../../components/common/Card';
import styles from './Dashboard.module.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: { total: 0, days1_3: 0, days4_7: 0, days8_15: 0 },
    todayPurchases: { count: 0, amount: 0 },
    lastMonthCollection: 0,
    todayBirthdays: 0,
    todayExpense: 0,
    last3MonthsExpense: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      const response = await api.getDashboard();
      console.log('Dashboard data:', response);
      setStats({
        totalMembers: response.totalMembers || 0,
        activeMembers: response.activeMembers || 0,
        expiredMembers: response.expiredMembers || { total: 0, days1_3: 0, days4_7: 0, days8_15: 0 },
        todayPurchases: response.todayPurchases || { count: 0, amount: 0 },
        lastMonthCollection: parseFloat(response.lastMonthCollection || 0),
        todayBirthdays: response.todayBirthdays || 0,
        todayExpense: parseFloat(response.todayExpense || 0),
        last3MonthsExpense: parseFloat(response.last3MonthsExpense || 0)
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  };

  const MetricCard = ({ title, value, subtitle, icon, color, onClick }) => (
    <Card hover clickable onClick={onClick} className={styles.metricCard}>
      <div className={styles.cardIcon} style={{ color }}>
        {icon}
      </div>
      <div className={styles.cardContent}>
        <h3 className={styles.cardValue}>{value}</h3>
        <p className={styles.cardTitle}>{title}</p>
        {subtitle && <p className={styles.cardSubtitle}>{subtitle}</p>}
      </div>
    </Card>
  );

  if (loading) {
    return <div className={styles.loading}>Loading dashboard...</div>;
  }

  return (
    <div className={styles.dashboard}>
      <div className={styles.dashboardHeader}>
        <h1>Dashboard</h1>
        <button 
          onClick={() => fetchDashboardData(true)} 
          disabled={refreshing}
          style={{
            padding: '10px 20px',
            background: refreshing ? '#9ca3af' : '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          <FaSync className={refreshing ? 'spinning' : ''} />
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      {/* Top Summary Cards */}
      <div className={styles.summaryCards}>
        <Card className={styles.summaryCard}>
          <h3>Total Members</h3>
          <p className={styles.summaryValue}>{stats.totalMembers}</p>
        </Card>
        <Card className={styles.summaryCard}>
          <h3>Active Members</h3>
          <p className={styles.summaryValue}>{stats.activeMembers}</p>
        </Card>
        <Card className={styles.summaryCard}>
          <h3>Expired Members</h3>
          <p className={styles.summaryValue}>{stats.expiredMembers.total}</p>
        </Card>
      </div>

      {/* Metric Cards Grid */}
      <div className={styles.metricsGrid}>
        <MetricCard
          title="Live"
          value={stats.activeMembers}
          subtitle="Live Members"
          icon={<FaUserCheck />}
          color="#10B981"
          onClick={() => navigate('/admin/members?status=active')}
        />

        <MetricCard
          title="Total"
          value={stats.totalMembers}
          subtitle="Total Members"
          icon={<FaUsers />}
          color="#3B82F6"
          onClick={() => navigate('/admin/members')}
        />

        <MetricCard
          title="Expired"
          value={stats.expiredMembers.total}
          subtitle="Memberships"
          icon={<FaUserTimes />}
          color="#EF4444"
          onClick={() => navigate('/admin/members?status=expired')}
        />

        <MetricCard
          title="1-3"
          value={stats.expiredMembers.days1_3}
          subtitle="Expiring(1-3 days)"
          icon={<FaExclamationTriangle />}
          color="#F59E0B"
          onClick={() => navigate('/admin/members?expired=1-3')}
        />

        <MetricCard
          title="4-7"
          value={stats.expiredMembers.days4_7}
          subtitle="Expiring(4-7 days)"
          icon={<FaExclamationTriangle />}
          color="#F59E0B"
          onClick={() => navigate('/admin/members?expired=4-7')}
        />

        <MetricCard
          title="8-15"
          value={stats.expiredMembers.days8_15}
          subtitle="Expiring(8-15 days)"
          icon={<FaExclamationTriangle />}
          color="#F59E0B"
          onClick={() => navigate('/admin/members?expired=8-15')}
        />

        <MetricCard
          title="Today Collection"
          value={`₹${parseFloat(stats.todayPurchases?.amount || 0).toFixed(2)}`}
          subtitle={`${stats.todayPurchases?.count || 0} purchases`}
          icon={<FaShoppingCart />}
          color="#10B981"
          onClick={() => navigate('/admin/payments?filter=today')}
        />

        <MetricCard
          title="Last Month"
          value={`₹${parseFloat(stats.lastMonthCollection || 0).toFixed(2)}`}
          subtitle="Collection"
          icon={<FaMoneyBillWave />}
          color="#8B5CF6"
          onClick={() => navigate('/admin/reports?period=lastmonth')}
        />

        <MetricCard
          title="Total Collection"
          value={`₹${(parseFloat(stats.todayPurchases?.amount || 0) + parseFloat(stats.lastMonthCollection || 0)).toFixed(2)}`}
          subtitle="Overall"
          icon={<FaChartLine />}
          color="#06D6A0"
          onClick={() => navigate('/admin/reports')}
        />

        <MetricCard
          title="Today Expense"
          value={`₹${parseFloat(stats.todayExpense || 0).toFixed(2)}`}
          subtitle="Today"
          icon={<FaWallet />}
          color="#EF4444"
          onClick={() => navigate('/admin/expenses?filter=today')}
        />

        <MetricCard
          title="Today Birthday"
          value={stats.todayBirthdays || 0}
          subtitle="Birthdays Today"
          icon={<FaBirthdayCake />}
          color="#EC4899"
          onClick={() => navigate('/admin/members?birthdays=today')}
        />
      </div>
    </div>
  );
};

export default Dashboard;
