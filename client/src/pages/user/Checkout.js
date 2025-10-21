import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaChair, FaRupeeSign, FaCreditCard, FaMobileAlt, FaCheckCircle, FaArrowLeft, FaWallet } from 'react-icons/fa';
import { SiPhonepe, SiPaytm, SiRazorpay, SiGooglepay } from 'react-icons/si';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { toast } from 'react-toastify';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { plan, seat } = location.state || {};
  
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processing, setProcessing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [applyingCoupon, setApplyingCoupon] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    if (!plan || !seat) {
      toast.error('Invalid checkout data');
      navigate('/plans');
    }
    fetchWalletBalance();
    // eslint-disable-next-line
  }, []);

  const fetchWalletBalance = async () => {
    try {
      const response = await api.getWallet();
      setWalletBalance(response.balance || 0);
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
    }
  };

  const paymentGateways = [
    { id: 'wallet', name: 'Wallet', icon: <FaWallet size={32} />, color: '#10B981', balance: walletBalance },
    { id: 'razorpay', name: 'Razorpay', icon: <SiRazorpay size={32} />, color: '#0C2451' },
    { id: 'phonepe', name: 'PhonePe', icon: <SiPhonepe size={32} />, color: '#5f259f' },
    { id: 'paytm', name: 'Paytm', icon: <SiPaytm size={32} />, color: '#00BAF2' },
    { id: 'googlepay', name: 'Google Pay', icon: <SiGooglepay size={32} />, color: '#4285F4' },
    { id: 'card', name: 'Credit/Debit Card', icon: <FaCreditCard size={32} />, color: '#6366f1' },
    { id: 'upi', name: 'UPI', icon: <FaMobileAlt size={32} />, color: '#10B981' }
  ];

  const planPrice = parseFloat(plan?.price || 0);
  const gstAmount = (planPrice * 0.18); // 18% GST
  const totalBeforeDiscount = planPrice + gstAmount;
  const finalAmount = totalBeforeDiscount - discount;

  const applyCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }
    
    try {
      setApplyingCoupon(true);
      const response = await api.validateCoupon(couponCode, planPrice);
      const discountAmount = response.coupon?.discount_amount || 0;
      setDiscount(discountAmount);
      toast.success(`Coupon applied! You saved ₹${discountAmount}`);
    } catch (error) {
      toast.error(error.message || 'Invalid coupon code');
      setDiscount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      toast.error('Please select a payment method');
      return;
    }

    // Check wallet balance if wallet payment is selected
    if (paymentMethod === 'wallet') {
      if (walletBalance < finalAmount) {
        toast.error(`Insufficient wallet balance! You need ₹${finalAmount.toFixed(2)} but have ₹${walletBalance.toFixed(2)}`);
        toast.info('Please add money to your wallet or choose another payment method');
        setTimeout(() => {
          navigate('/wallet');
        }, 2000);
        return;
      }
    }

    try {
      setProcessing(true);
      
      // Create booking
      const bookingData = {
        plan_id: plan.id,
        seat_id: seat.id,
        start_date: new Date().toISOString().split('T')[0],
        final_amount: finalAmount,
        coupon_code: couponCode || null,
        discount_amount: discount
      };

      const bookingResponse = await api.createBooking(bookingData);
      const bookingId = bookingResponse.booking?.id || bookingResponse.id;

      // Process payment
      const paymentData = {
        booking_id: bookingId,
        amount: finalAmount,
        payment_gateway: paymentMethod,
        payment_response: {
          gateway: paymentMethod,
          transaction_id: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
          status: 'success',
          paid_at: new Date().toISOString()
        }
      };

      await api.processPayment(paymentData);

      // Navigate to success page
      navigate('/payment-success', {
        state: {
          booking: {
            id: bookingId,
            seat: seat.seat_number,
            plan: plan.name,
            amount: finalAmount,
            startDate: bookingData.start_date,
            duration: plan.duration_days,
            paymentMethod: paymentMethod
          }
        }
      });

      toast.success('Payment successful!');
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!plan || !seat) return null;

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .checkout-grid {
            grid-template-columns: 1fr !important;
          }
          .payment-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          .price-summary {
            position: static !important;
          }
        }
        @media (max-width: 480px) {
          .payment-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '10px',
            background: '#f3f4f6',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <FaArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0 }}>Checkout</h1>
          <p style={{ color: '#6b7280', margin: '5px 0 0 0' }}>Complete your booking</p>
        </div>
      </div>

      <div className="checkout-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: '1fr 400px', 
        gap: '30px' 
      }}>
        {/* Main Content */}
        <div>
          {/* Booking Summary */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '16px', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Booking Summary</h2>
            
            <div style={{ display: 'grid', gap: '15px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '15px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '50px', height: '50px', background: '#6366f1', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
                    <FaChair size={24} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '18px' }}>{seat.seat_number}</div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>Floor {seat.floor} {seat.section && `- ${seat.section}`}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: '600', color: '#10B981' }}>Reserved</div>
                  <div style={{ fontSize: '12px', color: '#6b7280' }}>For {user?.name}</div>
                </div>
              </div>

              <div>
                <div style={{ fontWeight: '600', marginBottom: '8px' }}>Plan Details</div>
                <div style={{ fontSize: '14px', color: '#6b7280', lineHeight: '1.6' }}>
                  <div>• {plan.name}</div>
                  <div>• Duration: {plan.duration_days} days</div>
                  {plan.shift_type && <div>• Shift: {plan.shift_type}</div>}
                  {plan.shift_start_time && <div>• Timing: {plan.shift_start_time} - {plan.shift_end_time}</div>}
                </div>
              </div>
            </div>
          </div>

          {/* Coupon Code */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '16px', marginBottom: '25px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '15px' }}>Apply Coupon</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                style={{
                  flex: 1,
                  padding: '12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={applyCoupon}
                disabled={applyingCoupon}
                style={{
                  padding: '12px 24px',
                  background: applyingCoupon ? '#9ca3af' : '#6366f1',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: applyingCoupon ? 'not-allowed' : 'pointer',
                  fontWeight: '500'
                }}
              >
                {applyingCoupon ? 'Applying...' : 'Apply'}
              </button>
            </div>
            {discount > 0 && (
              <div style={{ marginTop: '10px', padding: '10px', background: '#d1fae5', borderRadius: '8px', color: '#065f46', fontSize: '14px' }}>
                <FaCheckCircle style={{ marginRight: '8px' }} />
                Coupon applied! You saved ₹{discount.toFixed(2)}
              </div>
            )}
          </div>

          {/* Payment Method */}
          <div style={{ background: 'white', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Select Payment Method</h2>
            <div className="payment-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px' }}>
              {paymentGateways.map((gateway) => (
                <div
                  key={gateway.id}
                  onClick={() => setPaymentMethod(gateway.id)}
                  style={{
                    padding: '20px',
                    border: `2px solid ${paymentMethod === gateway.id ? gateway.color : '#e5e7eb'}`,
                    borderRadius: '12px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    background: paymentMethod === gateway.id ? `${gateway.color}10` : 'white',
                    position: 'relative'
                  }}
                >
                  <div style={{ color: gateway.color, marginBottom: '10px', display: 'flex', justifyContent: 'center' }}>
                    {gateway.icon}
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '500', color: '#1f2937' }}>
                    {gateway.name}
                  </div>
                  {gateway.id === 'wallet' && (
                    <div style={{ 
                      fontSize: '12px', 
                      marginTop: '5px', 
                      color: walletBalance >= finalAmount ? '#10B981' : '#EF4444',
                      fontWeight: '600'
                    }}>
                      ₹{parseFloat(walletBalance).toFixed(2)}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {paymentMethod === 'wallet' && walletBalance < finalAmount && (
              <div style={{ 
                marginTop: '15px', 
                padding: '12px', 
                background: '#fee2e2', 
                borderRadius: '8px', 
                color: '#991b1b', 
                fontSize: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <span>⚠️</span>
                <span>
                  Insufficient balance! Need ₹{finalAmount.toFixed(2)}, have ₹{walletBalance.toFixed(2)}.
                  <button 
                    onClick={() => navigate('/wallet')}
                    style={{
                      marginLeft: '10px',
                      padding: '4px 12px',
                      background: '#dc2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}
                  >
                    Add Money
                  </button>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Price Summary Sidebar */}
        <div>
          <div className="price-summary" style={{ 
            background: 'white', 
            padding: '25px', 
            borderRadius: '16px', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
            position: 'sticky', 
            top: '20px' 
          }}>
            <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '20px' }}>Price Summary</h2>
            
            <div style={{ display: 'grid', gap: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>Plan Price</span>
                <span style={{ fontWeight: '500' }}>₹{planPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                <span style={{ color: '#6b7280' }}>GST (18%)</span>
                <span style={{ fontWeight: '500' }}>₹{gstAmount.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', color: '#10B981' }}>
                  <span>Discount</span>
                  <span style={{ fontWeight: '500' }}>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 'bold' }}>
                  <span>Total Amount</span>
                  <span style={{ color: '#6366f1' }}>₹{finalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={processing || !paymentMethod}
              style={{
                width: '100%',
                padding: '16px',
                background: processing || !paymentMethod ? '#9ca3af' : '#6366f1',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: processing || !paymentMethod ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px'
              }}
            >
              <FaRupeeSign />
              {processing ? 'Processing...' : 'Pay Now'}
            </button>

            <div style={{ marginTop: '15px', padding: '12px', background: '#f3f4f6', borderRadius: '8px', fontSize: '12px', color: '#6b7280', textAlign: 'center' }}>
              🔒 Secure payment powered by industry-leading payment gateways
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
