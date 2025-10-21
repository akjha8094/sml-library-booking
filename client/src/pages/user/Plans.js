import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck, FaClock, FaRupeeSign } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Plans = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const response = await api.getPlans();
      console.log('Plans data:', response);
      setPlans(response.plans || response || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan) => {
    navigate('/seat-selection', { state: { plan } });
  };

  const getPlanBadge = (planType) => {
    const badges = {
      full_day: { label: 'Full Day', color: '#10B981' },
      half_day: { label: 'Half Day', color: '#F59E0B' },
      hourly: { label: 'Hourly', color: '#3B82F6' }
    };
    return badges[planType] || badges.full_day;
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '18px', color: '#6b7280' }}>Loading plans...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '10px' }}>Choose Your Plan</h1>
        <p style={{ color: '#6b7280' }}>Select the best plan that suits your study schedule</p>
      </div>

      {plans.length === 0 ? (
        <div style={{ padding: '60px', textAlign: 'center', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <FaClock size={48} color="#d1d5db" style={{ marginBottom: '15px' }} />
          <h3 style={{ color: '#6b7280', margin: '0 0 10px 0' }}>No Plans Available</h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>Please check back later or contact support</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
          {plans.map((plan) => {
            const badge = getPlanBadge(plan.plan_type);
            return (
              <div
                key={plan.id}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '30px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  position: 'relative',
                  border: '2px solid transparent'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.15)';
                  e.currentTarget.style.borderColor = '#6366f1';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                  e.currentTarget.style.borderColor = 'transparent';
                }}
                onClick={() => handleSelectPlan(plan)}
              >
                <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
                  <span style={{
                    padding: '6px 12px',
                    background: badge.color,
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {badge.label}
                  </span>
                </div>

                <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '10px', color: '#1f2937' }}>
                  {plan.name}
                </h3>
                
                <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px', minHeight: '40px' }}>
                  {plan.description}
                </p>

                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '5px' }}>
                    <FaRupeeSign size={28} color="#6366f1" />
                    <span style={{ fontSize: '42px', fontWeight: 'bold', color: '#6366f1' }}>
                      {parseFloat(plan.price).toFixed(0)}
                    </span>
                    <span style={{ color: '#6b7280', marginLeft: '10px' }}>/{plan.duration_days} days</span>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <FaCheck size={16} color="#10B981" />
                    <span style={{ fontSize: '14px', color: '#4b5563' }}>
                      {plan.duration_days} days validity
                    </span>
                  </div>
                  {plan.shift_type && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <FaCheck size={16} color="#10B981" />
                      <span style={{ fontSize: '14px', color: '#4b5563', textTransform: 'capitalize' }}>
                        {plan.shift_type === 'all_day' ? 'All Day Access' : `${plan.shift_type} Shift`}
                      </span>
                    </div>
                  )}
                  {plan.shift_start_time && plan.shift_end_time && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <FaClock size={16} color="#10B981" />
                      <span style={{ fontSize: '14px', color: '#4b5563' }}>
                        {plan.shift_start_time} - {plan.shift_end_time}
                      </span>
                    </div>
                  )}
                </div>

                <button
                  style={{
                    width: '100%',
                    padding: '14px',
                    background: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#4f46e5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = '#6366f1'}
                >
                  Select Plan
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Plans;
