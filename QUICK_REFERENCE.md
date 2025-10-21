# 🚀 Quick Reference Card - Advanced Features

## Database Setup (MUST DO FIRST!)

```bash
# Run this command in terminal/command prompt:
mysql -u root -p sml_library < database/advanced_features.sql

# OR use phpMyAdmin:
# 1. Open http://localhost/phpmyadmin
# 2. Select sml_library database
# 3. Import > Choose file: database/advanced_features.sql
# 4. Click Go
```

---

## 💰 Refund System

### Quick Access:
- **Page:** `/admin/refunds`
- **Button:** On Payments page - "Refund" button

### Process Refund:
```
1. Payments page → Find payment → Click "Refund"
2. Select: Full/Partial
3. Choose: Wallet (instant) / Original / Bank Transfer
4. Enter: Reason (required)
5. Submit → Done!
```

### Auto-Refund Rules:
```
7+ days before booking  = 100% refund ✅
3-7 days before booking =  50% refund ⚠️
< 3 days before booking =   0% refund ❌
```

---

## 👥 Admin User Control

### Quick Actions (Members Page):
```
➕ Add Money     → Credit user wallet
➖ Deduct Money  → Debit user wallet
📋 View Bookings → See all user bookings
🔐 Login as User → Impersonate user
🚫 Block/Unblock → Block or unblock user
```

### Wallet Operations:
```javascript
// Credit Example:
Amount: ₹500
Reason: "Refund for service issue"
→ User wallet increased
→ Notification sent
→ Logged in audit

// Debit Example:
Amount: ₹100
Reason: "Penalty for late cancellation"
→ User wallet decreased
→ Notification sent
→ Logged in audit
```

### Booking Operations:
```
Extend: Add X days to booking end date
Change Seat: Move user to different seat
Cancel: Cancel booking + optional auto-refund
```

---

## 🔐 Login as User (Impersonation)

### How to Use:
```
1. Members page → Find user
2. Click 🔐 "Login as User"
3. You're now in user's account
4. Test/debug as needed
5. Click "Return to Admin"
```

### Security:
```
✓ Session expires in 2 hours
✓ All actions logged
✓ IP address tracked
✓ Cannot impersonate blocked users
```

---

## 📊 Audit Logs

### Quick Access:
- **Page:** `/admin/audit-logs`

### Filters:
```
Action Type: All / Specific action
Date Range: Start date → End date
Export: Download as CSV
```

### What's Tracked:
```
✓ User block/unblock
✓ Wallet credit/debit
✓ Booking extend/cancel
✓ Seat changes
✓ Refund processing
✓ Login as user
✓ Payment updates
✓ And more...
```

---

## 🗂️ Database Tables (New)

```sql
refunds              -- Refund records
admin_action_logs    -- All admin actions
admin_user_sessions  -- Impersonation sessions
booking_modifications -- Booking change history
auto_refund_rules    -- Refund calculation rules
```

---

## 🔗 API Endpoints

### Refunds:
```
POST /api/admin/refunds/process
GET  /api/admin/refunds
GET  /api/admin/refunds/stats/summary
```

### User Control:
```
POST /api/admin/user-control/:userId/wallet/credit
POST /api/admin/user-control/:userId/wallet/debit
GET  /api/admin/user-control/:userId/bookings
POST /api/admin/user-control/:userId/bookings/:id/extend
POST /api/admin/user-control/:userId/bookings/:id/change-seat
POST /api/admin/user-control/:userId/bookings/:id/cancel
```

### Impersonation:
```
POST /api/admin/impersonation/impersonate/:userId
POST /api/admin/impersonation/exit-impersonation/:sessionId
GET  /api/admin/impersonation/active-sessions
```

### Audit:
```
GET  /api/admin/audit-logs
GET  /api/admin/audit-logs/stats
GET  /api/admin/audit-logs/export/csv
```

---

## 🎨 Admin Sidebar Menu (Updated)

```
📊 Dashboard
👥 User Management      ← Enhanced with controls
🪑 Seats
📋 Plans
🏢 Facilities
💳 Payments             ← Refund button added
💰 Refunds              ← NEW PAGE
🖼️ Gallery
🎨 Banners
📢 Notices
🎫 Coupons
🎁 Offers
📅 Advance Bookings
🎧 Support Tickets
🔔 Notifications
📈 Reports
💸 Expenses
📜 Audit Logs           ← NEW PAGE
⚙️ Settings
```

---

## ✅ Testing Checklist

```
Database Setup:
[ ] Run SQL migration
[ ] Verify 5 new tables created
[ ] Check stored procedure exists

Refund System:
[ ] Process wallet refund
[ ] Process partial refund
[ ] View refund history
[ ] Check statistics

User Control:
[ ] Add ₹100 to wallet
[ ] Deduct ₹50 from wallet
[ ] View user bookings
[ ] Extend a booking

Impersonation:
[ ] Login as user
[ ] Perform user actions
[ ] Return to admin
[ ] Check session logs

Audit Logs:
[ ] View all logs
[ ] Apply filters
[ ] Export to CSV
[ ] Check statistics
```

---

## 🚨 Important Commands

### Start Server:
```bash
npm start
```

### Check Database:
```bash
mysql -u root -p
USE sml_library;
SHOW TABLES;
```

### View Logs:
```bash
# Check server console for errors
# Check browser console for frontend errors
```

---

## 📱 Page URLs

```
Admin Login:        /admin/login
Dashboard:          /admin/dashboard
Members:            /admin/members
Payments:           /admin/payments
Refunds:            /admin/refunds          ← NEW
Audit Logs:         /admin/audit-logs       ← NEW
```

---

## 🔒 Security Features

```
✓ JWT Authentication
✓ Admin role verification
✓ Action logging (audit trail)
✓ IP address tracking
✓ Time-limited sessions (2h)
✓ Transaction rollback on errors
✓ Input validation
✓ SQL injection protection
```

---

## 📊 Statistics & Metrics

### Refunds Page Shows:
```
• Total refunds processed
• Completed refunds count
• Total refund amount
• Completed refund amount
```

### Audit Logs Shows:
```
• Total actions logged
• Actions by admin
• Actions by type
• Daily activity trends
• Most affected users
```

---

## 💡 Quick Tips

1. **Always provide reasons** for wallet operations
2. **Use filters** in audit logs to find specific actions
3. **Export audit logs** regularly for compliance
4. **Check refund rules** before making changes
5. **Test impersonation** in non-production first
6. **Monitor audit logs** for suspicious activity
7. **Backup database** before major operations

---

## 🐛 Troubleshooting

### Error: Tables not found
```
Solution: Run database migration
File: database/advanced_features.sql
```

### Error: Refund not processing
```
Check: Payment status = 'completed'
Check: Refund amount ≤ Payment amount
```

### Error: Session expired
```
Reason: Impersonation sessions expire after 2h
Solution: Start new session
```

### Error: Unauthorized
```
Check: Admin logged in
Check: Valid JWT token
Check: Admin permissions
```

---

## 📞 Support Files

```
Complete Guide:     ADVANCED_FEATURES_COMPLETE.md
Setup Instructions: SETUP_ADVANCED_FEATURES.md
Visual Summary:     FEATURES_VISUAL_SUMMARY.txt
Hindi Guide:        HINDI_SUMMARY.md
This Card:          QUICK_REFERENCE.md
```

---

## ✨ Status

```
✅ Backend:     Complete
✅ Frontend:    Complete
✅ Database:    Complete
✅ Security:    Complete
✅ Docs:        Complete

⏳ Migration:   Pending (Run SQL)
⏳ Testing:     Ready (After DB setup)
```

---

## 🎯 Next Steps

```
1. Run database migration (CRITICAL!)
2. Start server: npm start
3. Login to admin
4. Test each feature
5. Review audit logs
6. Deploy to production
```

---

**Quick Start:**
```bash
# 1. Database
mysql -u root -p sml_library < database/advanced_features.sql

# 2. Server
npm start

# 3. Test
Open: http://localhost:3000/admin/login
```

**Status:** 🚀 Ready to Deploy (after DB setup)

