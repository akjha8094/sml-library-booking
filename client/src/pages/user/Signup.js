import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaCalendar } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import Input, { Select } from '../../components/common/Input';
import Button from '../../components/common/Button';
import styles from './Auth.module.css';

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    dob: '',
    gender: '',
    referred_by: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user types
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.mobile)) {
      newErrors.mobile = 'Please enter a valid 10-digit mobile number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);

    const { confirmPassword, ...signupData } = formData;
    const result = await signup(signupData);
    
    if (result.success) {
      navigate('/');
    }
    
    setLoading(false);
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <div className={styles.logoSection}>
          <div className={styles.logo}>
            <span className={styles.logoSm}>Sm</span>
          </div>
          <h1 className={styles.title}>Smart Library</h1>
          <p className={styles.subtitle}>Create your account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <Input
            type="text"
            name="name"
            label="Full Name"
            value={formData.name}
            onChange={handleChange}
            icon={<FaUser />}
            placeholder="Enter your full name"
            required
          />

          <div className={styles.formRow}>
            <Input
              type="date"
              name="dob"
              label="Date of Birth"
              value={formData.dob}
              onChange={handleChange}
              icon={<FaCalendar />}
              required
            />

            <Select
              name="gender"
              label="Gender"
              value={formData.gender}
              onChange={handleChange}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' },
                { value: 'Other', label: 'Other' }
              ]}
              required
            />
          </div>

          <Input
            type="tel"
            name="mobile"
            label="Mobile Number"
            value={formData.mobile}
            onChange={handleChange}
            icon={<FaPhone />}
            placeholder="10-digit mobile number"
            error={errors.mobile}
            required
          />

          <Input
            type="email"
            name="email"
            label="Email Address"
            value={formData.email}
            onChange={handleChange}
            icon={<FaEnvelope />}
            placeholder="your.email@example.com"
            required
          />

          <Input
            type="password"
            name="password"
            label="Password"
            value={formData.password}
            onChange={handleChange}
            icon={<FaLock />}
            placeholder="At least 6 characters"
            error={errors.password}
            required
          />

          <Input
            type="password"
            name="confirmPassword"
            label="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            icon={<FaLock />}
            placeholder="Re-enter password"
            error={errors.confirmPassword}
            required
          />

          <Input
            type="text"
            name="referred_by"
            label="Referral Code (Optional)"
            value={formData.referred_by}
            onChange={handleChange}
            placeholder="Enter referral code if you have one"
          />

          <Button type="submit" variant="primary" block disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>

          <div className={styles.signupLink} style={{ marginTop: '1.5rem' }}>
            Already have an account? <Link to="/login">Sign In</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
