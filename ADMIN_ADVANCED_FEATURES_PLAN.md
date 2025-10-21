# 🎯 Admin Advanced Features - Implementation Plan

## ✅ Features to Implement:

### **1. User Wallet Header - Fixed** ✅
**Issue:** Wallet icon not clickable
**Solution:** Added onClick to navigate to /wallet page

### **2. Refund Management System** 🔄
**Requirements:**
- Admin can issue refunds (manual)
- Auto-refund on booking cancellation
- Refund types: Full, Partial
- Refund destinations: Wallet, Original payment method
- Track refund history
- Show refund status in payments

**Components Needed:**
- Refund button in PaymentManagement
- Refund modal with amount input
- Refund history table
- Auto-refund trigger on booking cancellation

### **3. Admin User Control Panel** 🔄
**Requirements:**
Admin should be able to:
- View user wallet balance
- Add money to user wallet (manual credit)
- Deduct money from wallet
- View wallet transaction history
- Modify user bookings
- Extend/shorten plan duration
- Change assigned seat
- Block/unblock user
- **Login as user** (impersonate without password)

**Components Needed:**
- Enhanced Members page with wallet management
- Wallet transaction modal
- Booking management modal
- "Login as User" button

### **4. Login as User Feature** 🔄
**Requirements:**
- Admin can click "Login as User" button
- System generates temporary token
- Admin sees user dashboard
- All actions performed as that user
- "Return to Admin" button to go back

**Security:**
- Log all admin impersonation actions
- Time-limited impersonation session
- Audit trail in database

---

## 📋 Files to Create/Modify:

### **Backend:**
1. `server/routes/adminUserControlRoutes.js` - User control API
2. `server/routes/refundRoutes.js` - Refund management
3. `server/middleware/impersonation.js` - Login as user
4. Update `paymentRoutes.js` - Add refund endpoints
5. Update `walletRoutes.js` - Admin wallet operations

### **Frontend:**
1. Update `client/src/pages/admin/Members.js` - Add controls
2. Create `client/src/pages/admin/WalletManagement.js` - Wallet control
3. Update `client/src/pages/admin/PaymentManagement.js` - Refunds
4. Update `client/src/services/api.js` - New endpoints

### **Database:**
1. `database/refunds_table.sql` - Refund tracking
2. `database/admin_actions_log.sql` - Audit trail
3. Update wallet_transactions table - Add admin_initiated field

---

## 🎯 Implementation Priority:

**Phase 1: Quick Fixes** (Now)
- ✅ Fix wallet header button

**Phase 2: Refund System** (Next)
- Create refund routes
- Add refund UI in payments
- Auto-refund on cancellation

**Phase 3: Admin User Control** (After)
- Wallet management
- Booking modifications
- Seat changes

**Phase 4: Impersonation** (Final)
- Login as user
- Audit logging
- Session management

---

## 🚀 Let's Start with Phase 2: Refund System

This will provide immediate value and is most requested.
