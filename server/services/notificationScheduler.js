const db = require('../config/database');
const { sendNotification } = require('../utils/notificationService');
const { sendAdminNotification } = require('../utils/adminNotificationService');

/**
 * Check and send birthday notifications
 */
async function checkBirthdayNotifications() {
  try {
    const [users] = await db.query(`
      SELECT id, name, email, dob 
      FROM users 
      WHERE DATE_FORMAT(dob, '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
      AND is_blocked = FALSE
    `);

    for (const user of users) {
      // Send notification to user
      await sendNotification({
        user_id: user.id,
        title: '🎂 Happy Birthday!',
        message: `Wishing you a wonderful birthday! Enjoy your special day at Smart Library. We have a special gift for you!`,
        type: 'general'
      });

      // Notify admin about birthday
      await sendAdminNotification({
        title: '🎂 Member Birthday Today',
        message: `Today is ${user.name}'s birthday (${user.email})`,
        type: 'general',
        related_id: user.id
      });
    }

    if (users.length > 0) {
      console.log(`✅ Sent ${users.length} birthday notifications`);
    }
  } catch (error) {
    console.error('❌ Error checking birthday notifications:', error);
  }
}

/**
 * Check and send seat/plan expiry notifications
 */
async function checkExpiryNotifications() {
  try {
    // Get active bookings with their expiry days
    const [bookings] = await db.query(`
      SELECT 
        b.id, b.user_id, b.end_date,
        DATEDIFF(b.end_date, CURDATE()) as days_remaining,
        u.name, u.email,
        p.name as plan_name,
        s.seat_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN plans p ON b.plan_id = p.id
      JOIN seats s ON b.seat_id = s.id
      WHERE b.status = 'active'
      AND b.end_date >= CURDATE()
      AND DATEDIFF(b.end_date, CURDATE()) IN (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15)
    `);

    for (const booking of bookings) {
      const days = booking.days_remaining;
      let urgency = '';
      let icon = '';
      let notifyAdmin = false;

      // Categorize by urgency
      if (days >= 1 && days <= 3) {
        urgency = 'URGENT';
        icon = '🔴';
        notifyAdmin = true;
      } else if (days >= 4 && days <= 7) {
        urgency = 'HIGH';
        icon = '🟡';
        notifyAdmin = true;
      } else if (days >= 8 && days <= 15) {
        urgency = 'MEDIUM';
        icon = '🟢';
      }

      // Send notification to user
      await sendNotification({
        user_id: booking.user_id,
        title: `${icon} Plan Expiring in ${days} Day${days > 1 ? 's' : ''}`,
        message: `Your ${booking.plan_name} for Seat ${booking.seat_number} will expire on ${new Date(booking.end_date).toLocaleDateString('en-IN')}. Renew now to avoid interruption!`,
        type: 'reminder'
      });

      // Notify admin for urgent expirations
      if (notifyAdmin) {
        await sendAdminNotification({
          title: `${icon} ${urgency}: Plan Expiring in ${days} Days`,
          message: `${booking.name} (${booking.email}) - ${booking.plan_name}, Seat ${booking.seat_number} expires on ${new Date(booking.end_date).toLocaleDateString('en-IN')}`,
          type: 'plan',
          related_id: booking.id
        });
      }
    }

    if (bookings.length > 0) {
      console.log(`✅ Sent ${bookings.length} expiry reminder notifications`);
    }
  } catch (error) {
    console.error('❌ Error checking expiry notifications:', error);
  }
}

/**
 * Check and send advance booking reminders
 */
async function checkAdvanceBookingReminders() {
  try {
    // Get upcoming advance bookings
    const [bookings] = await db.query(`
      SELECT 
        ab.id, ab.user_id, ab.booking_date, ab.start_date,
        DATEDIFF(ab.booking_date, CURDATE()) as days_until,
        u.name, u.email,
        p.name as plan_name,
        s.seat_number,
        ab.notes
      FROM advance_bookings ab
      JOIN users u ON ab.user_id = u.id
      JOIN plans p ON ab.plan_id = p.id
      LEFT JOIN seats s ON ab.seat_id = s.id
      WHERE ab.booking_status = 'scheduled'
      AND ab.booking_date >= CURDATE()
      AND DATEDIFF(ab.booking_date, CURDATE()) IN (1, 3, 7, 15)
    `);

    for (const booking of bookings) {
      const days = booking.days_until;
      let icon = '';

      if (days === 1) icon = '🔴';
      else if (days === 3) icon = '🟡';
      else if (days === 7) icon = '🟢';
      else if (days === 15) icon = '🔵';

      // Send notification to user
      await sendNotification({
        user_id: booking.user_id,
        title: `${icon} Advance Booking Reminder`,
        message: `Your advance booking for ${booking.plan_name}${booking.seat_number ? ` - Seat ${booking.seat_number}` : ''} is scheduled in ${days} day${days > 1 ? 's' : ''} (${new Date(booking.booking_date).toLocaleDateString('en-IN')}). Please be ready!`,
        type: 'reminder'
      });

      // Notify admin
      await sendAdminNotification({
        title: `${icon} Advance Booking in ${days} Days`,
        message: `${booking.name} (${booking.email}) has advance booking for ${booking.plan_name}${booking.seat_number ? ` - Seat ${booking.seat_number}` : ''} on ${new Date(booking.booking_date).toLocaleDateString('en-IN')}`,
        type: 'booking',
        related_id: booking.id
      });
    }

    if (bookings.length > 0) {
      console.log(`✅ Sent ${bookings.length} advance booking reminders`);
    }
  } catch (error) {
    console.error('❌ Error checking advance booking reminders:', error);
  }
}

/**
 * Check and send notifications for expired bookings (already passed)
 */
async function checkExpiredBookings() {
  try {
    const [expiredBookings] = await db.query(`
      SELECT 
        b.id, b.user_id, b.end_date,
        u.name, u.email,
        p.name as plan_name,
        s.seat_number
      FROM bookings b
      JOIN users u ON b.user_id = u.id
      JOIN plans p ON b.plan_id = p.id
      JOIN seats s ON b.seat_id = s.id
      WHERE b.status = 'active'
      AND b.end_date = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
    `);

    for (const booking of expiredBookings) {
      // Update booking status to expired
      await db.query('UPDATE bookings SET status = ? WHERE id = ?', ['expired', booking.id]);

      // Update seat status to available
      await db.query('UPDATE seats SET seat_status = ? WHERE id = (SELECT seat_id FROM bookings WHERE id = ?)', ['available', booking.id]);

      // Notify user
      await sendNotification({
        user_id: booking.user_id,
        title: '⏰ Plan Expired',
        message: `Your ${booking.plan_name} for Seat ${booking.seat_number} has expired. Renew now to continue!`,
        type: 'reminder'
      });

      // Notify admin
      await sendAdminNotification({
        title: '⏰ Booking Expired',
        message: `${booking.name} (${booking.email}) - ${booking.plan_name}, Seat ${booking.seat_number} expired yesterday`,
        type: 'plan',
        related_id: booking.id
      });
    }

    if (expiredBookings.length > 0) {
      console.log(`✅ Processed ${expiredBookings.length} expired bookings`);
    }
  } catch (error) {
    console.error('❌ Error checking expired bookings:', error);
  }
}

/**
 * Run all notification checks
 */
async function runScheduledNotifications() {
  console.log('🔄 Running scheduled notifications check...');
  
  await checkBirthdayNotifications();
  await checkExpiryNotifications();
  await checkAdvanceBookingReminders();
  await checkExpiredBookings();
  
  console.log('✅ Scheduled notifications check completed');
}

/**
 * Start the notification scheduler
 * Runs every hour
 */
function startNotificationScheduler() {
  // Run immediately on startup
  runScheduledNotifications();
  
  // Then run every hour (3600000 ms)
  setInterval(runScheduledNotifications, 3600000);
  
  console.log('✅ Notification scheduler started (runs every hour)');
}

module.exports = {
  startNotificationScheduler,
  runScheduledNotifications,
  checkBirthdayNotifications,
  checkExpiryNotifications,
  checkAdvanceBookingReminders,
  checkExpiredBookings
};
