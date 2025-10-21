import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock, FaUserShield } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from '../user/Auth.module.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await adminLogin(formData.email, formData.password);
    
    if (result.success) {
      navigate('/admin/dashboard');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <FaUserShield size={40} color="#6366f1" />
          </div>
          <h1 className={styles.title}>Admin Panel</h1>
          <p className={styles.subtitle}>Smart Library Management</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            icon={<FaEnvelope />}
            placeholder="admin@smartlibrary.com"
            required
          />

          <Input
            type="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            icon={<FaLock />}
            placeholder="Enter admin password"
            required
          />

          <Button type="submit" variant="primary" block disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In as Admin'}
          </Button>

          <div className={styles.signupLink} style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <a href="/login" style={{ color: '#6366f1', textDecoration: 'none' }}>
              ← Back to User Login
            </a>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
