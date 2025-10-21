import React, { useState, useEffect } from 'react';
import { FaSave, FaCreditCard } from 'react-icons/fa';
import api from '../../services/api';
import { toast } from 'react-toastify';

const GatewaySettings = () => {
  const [settings, setSettings] = useState({
    razorpay_key: '',
    razorpay_secret: '',
    stripe_key: '',
    stripe_secret: '',
    paypal_client_id: '',
    paypal_secret: '',
    phonepe_merchant_id: '',
    phonepe_salt: '',
    currency: 'INR',
    gst_percentage: 18,
    service_charge: 0
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/admin/gateway-settings');
      if (response.settings) {
        setSettings(response.settings);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/admin/gateway-settings', settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error('Save settings error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '25px' }}>
        <h2>Payment Gateway Settings</h2>
        <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Configure payment gateways and tax settings</p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Razorpay */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FaCreditCard size={24} color="#6366f1" />
            <h3 style={{ margin: 0 }}>Razorpay</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>API Key</label>
              <input type="text" value={settings.razorpay_key} onChange={(e) => setSettings({ ...settings, razorpay_key: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} placeholder="rzp_test_xxxxx" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>API Secret</label>
              <input type="password" value={settings.razorpay_secret} onChange={(e) => setSettings({ ...settings, razorpay_secret: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} placeholder="*************" />
            </div>
          </div>
        </div>

        {/* Stripe */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FaCreditCard size={24} color="#635bff" />
            <h3 style={{ margin: 0 }}>Stripe</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Publishable Key</label>
              <input type="text" value={settings.stripe_key} onChange={(e) => setSettings({ ...settings, stripe_key: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} placeholder="pk_test_xxxxx" />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Secret Key</label>
              <input type="password" value={settings.stripe_secret} onChange={(e) => setSettings({ ...settings, stripe_secret: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} placeholder="sk_test_xxxxx" />
            </div>
          </div>
        </div>

        {/* PayPal */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FaCreditCard size={24} color="#0070ba" />
            <h3 style={{ margin: 0 }}>PayPal</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Client ID</label>
              <input type="text" value={settings.paypal_client_id} onChange={(e) => setSettings({ ...settings, paypal_client_id: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Client Secret</label>
              <input type="password" value={settings.paypal_secret} onChange={(e) => setSettings({ ...settings, paypal_secret: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
          </div>
        </div>

        {/* PhonePe */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <FaCreditCard size={24} color="#5f259f" />
            <h3 style={{ margin: 0 }}>PhonePe</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Merchant ID</label>
              <input type="text" value={settings.phonepe_merchant_id} onChange={(e) => setSettings({ ...settings, phonepe_merchant_id: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Salt Key</label>
              <input type="password" value={settings.phonepe_salt} onChange={(e) => setSettings({ ...settings, phonepe_salt: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
          </div>
        </div>

        {/* Tax & Currency */}
        <div style={{ background: 'white', padding: '25px', borderRadius: '12px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3 style={{ marginTop: 0 }}>Tax & Currency Settings</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Currency</label>
              <select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}>
                <option value="INR">INR (₹)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>GST/VAT (%)</label>
              <input type="number" value={settings.gst_percentage} onChange={(e) => setSettings({ ...settings, gst_percentage: e.target.value })} min="0" max="100" step="0.01" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500', fontSize: '14px' }}>Service Charge (₹)</label>
              <input type="number" value={settings.service_charge} onChange={(e) => setSettings({ ...settings, service_charge: e.target.value })} min="0" step="0.01" style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }} />
            </div>
          </div>
        </div>

        <button type="submit" disabled={saving} style={{ width: '100%', padding: '14px', background: saving ? '#9ca3af' : '#6366f1', color: 'white', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: '500', cursor: saving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <FaSave /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default GatewaySettings;
