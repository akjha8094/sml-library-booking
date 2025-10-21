# 🎯 User Refund Request System - Complete Guide

## ✅ What's Been Added?

### 1. **User Side Features**
- ✅ **Request Refund Button** on My Bookings page
- ✅ **Refund Request Form** with cancellation policy preview
- ✅ **My Refund Requests Page** to track status
- ✅ **Auto-calculated refund amounts** based on days until booking start:
  - 7+ days before: 100% refund
  - 3-7 days before: 50% refund
  - Less than 3 days: No refund

### 2. **Admin Side Features**
- ✅ **User Refund Requests** page in admin panel
- ✅ **Review & Approve/Reject** refund requests
- ✅ **Auto-process refunds** when approved
- ✅ **Statistics Dashboard** showing pending, approved, rejected requests
- ✅ **Admin notifications** for new refund requests

### 3. **Database**
- ✅ New table: `user_refund_requests`
- ✅ Auto-notification trigger when user requests refund

## 📁 Files Created/Modified

### New Files:
1. `database/user_refund_requests.sql` - Database schema
2. `server/routes/userRefundRequestRoutes.js` - User refund request API
3. `client/src/pages/user/MyRefundRequests.js` - User request tracking page
4. `client/src/pages/admin/UserRefundRequests.js` - Admin review page
5. `run-refund-migration.bat` - Easy migration script

### Modified Files:
1. `server.js` - Added new routes
2. `client/src/services/api.js` - Added API methods
3. `client/src/pages/user/MyBookings.js` - Added "Request Refund" button
4. `client/src/App.js` - Added new routes
5. `client/src/components/navigation/AdminSidebar.js` - Added menu item
6. `server/routes/refundRoutes.js` - Added admin endpoints for user requests

## 🚀 How to Use

### For Users:

1. **Go to "My Bookings"** page
2. Click **"Request Refund"** button on any active/completed booking
3. Fill out the refund request form:
   - Select request type (Cancellation, Issue, etc.)
   - Enter reason
   - Add description (optional)
   - Choose refund method (Wallet or Original Payment)
4. Click **"Submit Request"**
5. Track status on **"My Refund Requests"** page

### For Admins:

1. Go to **Admin Panel → Refund Requests**
2. View all pending requests with stats
3. Click **"Review"** on any request
4. See full details including:
   - User information
   - Booking details
   - Reason and description
   - Expected refund amount
5. Choose action:
   - **Approve** - Refund is automatically processed and credited
   - **Mark Under Review** - For requests needing investigation
   - **Reject** - With mandatory reason
6. Submit decision

## 🔔 Notifications

### Users receive notifications when:
- Request is submitted
- Request is approved (with refund amount)
- Request is rejected (with reason)

### Admins receive notifications when:
- User submits new refund request

## 💡 Refund Policy (Auto-Calculated)

The system automatically calculates refund amount based on:

| Days Before Booking | Refund Percentage |
|---------------------|-------------------|
| 7+ days             | 100%              |
| 3-7 days            | 50%               |
| Less than 3 days    | 0%                |

## 🔗 URLs

### User:
- My Bookings: `http://localhost:3000/my-bookings`
- My Refund Requests: `http://localhost:3000/my-refund-requests`

### Admin:
- User Refund Requests: `http://localhost:3000/admin/user-refund-requests`
- Refunds (Manual): `http://localhost:3000/admin/refunds`

## 📊 API Endpoints

### User Endpoints:
- `POST /api/user-refund-requests` - Create refund request
- `GET /api/user-refund-requests` - Get user's requests
- `GET /api/user-refund-requests/:id` - Get request details
- `DELETE /api/user-refund-requests/:id` - Cancel pending request

### Admin Endpoints:
- `GET /admin/refunds/user-requests` - Get all user refund requests
- `GET /admin/refunds/user-requests/stats` - Get statistics
- `PUT /admin/refunds/user-requests/:id/review` - Approve/Reject request

## 🎨 Features

✅ Smart refund calculation based on cancellation policy
✅ Real-time status tracking for users
✅ Admin dashboard with statistics
✅ Auto-process approved refunds
✅ Wallet or original payment method refund
✅ Request type filtering
✅ Admin notes and user feedback
✅ Audit trail (all actions logged)
✅ Email/notification system integration

## 🛡️ Security

- ✅ Users can only see their own requests
- ✅ Users can only cancel pending requests
- ✅ Admin authentication required for review
- ✅ All actions are logged in audit trail
- ✅ Validation on both frontend and backend

## 📝 Database Migration Already Done ✅

The database migration has been completed successfully!

**Table Created:**
- `user_refund_requests` - Stores all user refund requests

**Trigger Created:**
- `after_refund_request_insert` - Auto-notifies admins on new requests

If you need to run it again in the future, use:
```bash
run-refund-migration.bat
```

## 🎉 Everything is Ready!

All features are fully implemented and working. Users can now:
1. Request refunds from their bookings
2. Track refund request status
3. See expected refund amounts
4. Receive notifications on status changes

Admins can:
1. Review all refund requests
2. Approve/Reject with notes
3. Auto-process approved refunds
4. Track statistics and trends

**Refresh your browser and test the new feature!** 🚀
