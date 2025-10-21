import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaChair, FaCalendarAlt, FaRupeeSign, FaCreditCard, FaDownload, FaHome } from 'react-icons/fa';
import confetti from 'canvas-confetti';

const PaymentSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { booking } = location.state || {};

  useEffect(() => {
    if (!booking) {
      navigate('/');
      return;
    }

    // Confetti animation
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const colors = ['#6366f1', '#10B981', '#F59E0B', '#EF4444'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();
    // eslint-disable-next-line
  }, []);

  const downloadInvoice = () => {
    // Create invoice content
    const invoiceContent = `
      SMART LIBRARY - BOOKING INVOICE
      ================================
      
      Booking ID: ${booking.id}
      Date: ${new Date().toLocaleDateString()}
      
      Customer Details:
      -----------------
      Booking for seat reservation
      
      Booking Details:
      ----------------
      Seat Number: ${booking.seat}
      Plan: ${booking.plan}
      Start Date: ${new Date(booking.startDate).toLocaleDateString()}
      Duration: ${booking.duration} days
      
      Payment Details:
      ----------------
      Payment Method: ${booking.paymentMethod.toUpperCase()}
      Amount Paid: ₹${booking.amount.toFixed(2)}
      Status: PAID
      
      ================================
      Thank you for choosing Smart Library!
    `;

    const blob = new Blob([invoiceContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Invoice_${booking.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!booking) return null;

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center', width: '100%' }}>
        {/* Success Icon */}
        <div style={{
          width: '120px',
          height: '120px',
          background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 30px',
          boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
          animation: 'scaleIn 0.5s ease-out'
        }}>
          <FaCheckCircle size={70} color="white" />
        </div>

        <style>{`
          @keyframes scaleIn {
            from { transform: scale(0); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
          }
          @keyframes slideUp {
            from { transform: translateY(20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>

        {/* Success Message */}
        <h1 style={{ fontSize: '42px', fontWeight: 'bold', color: '#1f2937', marginBottom: '15px', animation: 'slideUp 0.6s ease-out 0.2s both' }}>
          Payment Successful!
        </h1>
        <p style={{ fontSize: '18px', color: '#6b7280', marginBottom: '40px', animation: 'slideUp 0.6s ease-out 0.3s both' }}>
          Your seat has been reserved successfully
        </p>

        {/* Booking Details Card */}
        <div style={{
          background: 'white',
          padding: '30px',
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
          marginBottom: '30px',
          animation: 'slideUp 0.6s ease-out 0.4s both'
        }}>
          <div style={{ display: 'grid', gap: '20px' }}>
            <div style={{ paddingBottom: '20px', borderBottom: '2px solid #f3f4f6' }}>
              <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Booking ID</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6366f1' }}>#{booking.id}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px', textAlign: 'left' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FaChair size={20} color="#6366f1" />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Seat Number</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{booking.seat}</div>
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <FaCalendarAlt size={20} color="#6366f1" />
                  <span style={{ fontSize: '14px', color: '#6b7280' }}>Duration</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937' }}>{booking.duration} days</div>
              </div>
            </div>

            <div style={{ background: '#f9fafb', padding: '20px', borderRadius: '12px' }}>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Plan</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>{booking.plan}</div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Start Date</div>
                <div style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
                  {new Date(booking.startDate).toLocaleDateString('en-IN', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '5px' }}>Payment Method</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCreditCard size={16} color="#6366f1" />
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#1f2937', textTransform: 'uppercase' }}>
                    {booking.paymentMethod}
                  </span>
                </div>
              </div>
            </div>

            <div style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              padding: '20px',
              borderRadius: '12px',
              color: 'white'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>Amount Paid</div>
                  <div style={{ fontSize: '32px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <FaRupeeSign size={24} />
                    {booking.amount.toFixed(2)}
                  </div>
                </div>
                <div style={{
                  width: '60px',
                  height: '60px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <FaCheckCircle size={36} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap', animation: 'slideUp 0.6s ease-out 0.5s both' }}>
          <button
            onClick={downloadInvoice}
            style={{
              padding: '14px 28px',
              background: 'white',
              color: '#6366f1',
              border: '2px solid #6366f1',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#6366f1';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.color = '#6366f1';
            }}
          >
            <FaDownload /> Download Invoice
          </button>

          <button
            onClick={() => navigate('/my-bookings')}
            style={{
              padding: '14px 28px',
              background: '#10B981',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#059669'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#10B981'}
          >
            View My Bookings
          </button>

          <button
            onClick={() => navigate('/')}
            style={{
              padding: '14px 28px',
              background: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#5a6268'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#6c757d'}
          >
            <FaHome /> Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
