# Admin Portal Setup Guide

This guide explains how to set up and use the new Admin Portal for PuntTracker.

## Overview

The Admin Portal provides comprehensive user management, analytics, and administrative tools for managing your PuntTracker platform.

## Features

1. **Admin Authentication** - Secure password-based admin access
2. **Dashboard** - Overview statistics and metrics
3. **User Management** - Search, filter, and manage users
4. **Grant Access** - Grant/update user subscriptions and special pricing
5. **Audit Log** - Track all admin actions
6. **Bulk Actions** - Perform bulk operations on users
7. **User Detail View** - Detailed view of individual users
8. **Metrics Dashboard** - Analytics and charts

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env.local` file:

```env
ADMIN_SECRET_KEY=your-random-32-character-secret-key-here
```

**Important:** Generate a secure random 32-character string for `ADMIN_SECRET_KEY`. You can use:

```bash
# Generate a random secret key
openssl rand -hex 16
```

### 2. Database Setup

Run the following SQL script in your Supabase SQL Editor to create the audit log table:

```sql
-- Run admin-audit-log-schema.sql
```

The file `admin-audit-log-schema.sql` contains the schema for the `admin_audit_log` table.

### 3. Access the Admin Portal

1. Navigate to `/admin/login`
2. Enter your `ADMIN_SECRET_KEY` as the password
3. You'll be redirected to `/admin/dashboard`

## Admin Portal Routes

- `/admin/login` - Admin login page
- `/admin/dashboard` - Overview dashboard with statistics
- `/admin/users` - User management table
- `/admin/users/[userId]` - Individual user detail view
- `/admin/bulk-actions` - Bulk operations
- `/admin/audit-log` - Audit log of all admin actions
- `/admin/metrics` - Analytics and metrics dashboard

## API Routes

All admin API routes are protected and require admin authentication:

- `POST /api/admin/login` - Admin login
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - Get users list
- `GET /api/admin/users/[userId]` - Get user details
- `POST /api/admin/grant-access` - Grant/update user access
- `GET /api/admin/audit-log` - Get audit log entries
- `POST /api/admin/bulk-actions` - Perform bulk actions
- `GET /api/admin/metrics` - Get metrics data

## Security Features

1. **Password Protection** - Admin routes require password authentication
2. **HTTP-Only Cookies** - Admin session stored in secure HTTP-only cookies
3. **Middleware Protection** - All `/admin/*` routes (except login) are protected
4. **Audit Logging** - All admin actions are logged
5. **CSRF Protection** - Uses same-site cookies

## Usage Examples

### Granting Access to a User

1. Navigate to `/admin/users`
2. Find the user you want to grant access to
3. Click "Grant Access" button
4. Fill in the form:
   - Select new tier (free, pro, elite)
   - Optionally select special pricing type
   - Optionally set custom price
   - Enter reason for change
5. Click "Save Changes"

### Bulk Actions

1. Navigate to `/admin/bulk-actions`
2. Choose an action:
   - **Grant All Beta Testers Pro Access** - Upgrades all beta testers to Pro
   - **Lock Founding Member Pricing** - Grants founding member pricing to early users
   - **Revoke Access** - Downgrades a specific user

### Viewing Audit Log

1. Navigate to `/admin/audit-log`
2. Filter by:
   - Action type
   - Date range
3. Export to CSV for record keeping

## Email Notifications

When admin grants access to a user, an email notification is automatically sent to the user informing them of their upgrade.

## Notes

- Admin sessions last 7 days
- All admin actions are logged in the audit log
- The admin portal is mobile-responsive but optimized for desktop use
- Charts and metrics use Recharts library (already in dependencies)

## Troubleshooting

### Can't access admin routes

- Check that `ADMIN_SECRET_KEY` is set in environment variables
- Clear cookies and try logging in again
- Check browser console for errors

### Audit log not showing

- Ensure `admin_audit_log` table exists in database
- Check that the table has proper RLS policies (service role should bypass RLS)

### Email notifications not sending

- Check that `RESEND_API_KEY` and `FROM_EMAIL` are configured
- Check Resend dashboard for email delivery status

## Future Enhancements

Potential improvements:
- Multi-admin support with individual admin accounts
- Role-based permissions
- Advanced filtering and search
- Scheduled bulk actions
- Email templates customization
- Export capabilities for all data

