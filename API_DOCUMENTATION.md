# Discord Admin Panel - Complete API Documentation

## 🚀 Overview

A comprehensive Discord server management and moderation platform with advanced role-based access control, infraction management, appeals processing, and detailed analytics.

## 📊 API Statistics

- **Total Endpoints**: 34
- **API Categories**: 7
- **Authentication**: Session-based (Better Auth)
- **Database**: PostgreSQL with Drizzle ORM

## 🔑 Core Features

### 1. Infraction Management
- Create, read, update, delete infractions
- Multiple infraction types (warning, mute, kick, ban, strike)
- Point-based severity system
- Search and filter infractions
- Bulk infraction operations
- Appeal eligibility tracking

### 2. Appeals System
- User-submitted appeal creation
- Staff review and approval/denial workflow
- Appeal tracking and statistics
- Appeal reason documentation
- Resolution tracking

### 3. Reports System
- User reports for rule violations
- Report categorization
- Status tracking (pending, reviewing, resolved, archived)
- Assignment to staff members
- Detailed report history

### 4. Audit & Access Logs
- Comprehensive action logging
- IP address and user agent tracking
- Success/failure tracking
- Filterable by action, user, date range
- Audit trail purging for old logs

### 5. Staff Management
- Role-based access control
- Staff member promotion/demotion
- Individual staff statistics
- Performance metrics
- Staff removal tracking

### 6. Advanced Analytics
- Infraction trends and statistics
- Appeal approval rates
- Staff performance metrics
- Report resolution times
- Daily activity tracking
- User violation history

### 7. Moderation Utilities
- Warning templates library
- Scheduled moderation actions
- Data export (JSON, CSV)
- Notification settings
- Permission validation

## 📡 API Endpoints

### Infractions Endpoints
```
GET    /api/infractions
POST   /api/infractions
GET    /api/infractions/[id]
PUT    /api/infractions/[id]
DELETE /api/infractions/[id]
GET    /api/infractions/search
POST   /api/infractions/bulk
```

### Reports Endpoints
```
GET    /api/reports
POST   /api/reports
GET    /api/reports/[id]
PATCH  /api/reports/[id]
DELETE /api/reports/[id]
```

### Appeals Endpoints
```
GET    /api/appeals
POST   /api/appeals
GET    /api/appeals/[id]
PATCH  /api/appeals/[id]
```

### Audit & Logs Endpoints
```
GET    /api/audit/logs
POST   /api/audit/logs
GET    /api/audit/detailed
DELETE /api/audit/detailed
```

### Staff Management Endpoints
```
GET    /api/staff
GET    /api/staff/[id]
PATCH  /api/staff/[id]
DELETE /api/staff/[id]
GET    /api/staff/stats
POST   /api/roles/bulk-assign
```

### Members & Users Endpoints
```
GET    /api/members/[id]
GET    /api/users/[id]/history
```

### Analytics Endpoints
```
GET    /api/analytics/infractions
GET    /api/analytics/comprehensive
GET    /api/dashboard/overview
```

### Utility Endpoints
```
GET    /api/export
GET    /api/templates
POST   /api/templates
GET    /api/scheduled-actions
POST   /api/scheduled-actions
PATCH  /api/scheduled-actions
GET    /api/permissions/check
GET    /api/notifications/settings
POST   /api/notifications/settings
GET    /api/docs
GET    /api/health
```

## 🔐 Authentication & Permissions

All endpoints (except `/api/health` and `/api/docs`) require:
1. Valid user session (Better Auth)
2. Appropriate permissions for the resource

### Role Types
- **Owner**: Full access to all features
- **Manager**: Can manage staff, review appeals, view analytics
- **Moderator**: Can create infractions, view reports
- **Staff**: Limited moderation capabilities
- **Member**: No admin access

## 📋 Database Schema

### Core Tables
- `infractions_detailed` - All infraction records
- `appeals` - Appeal submissions and reviews
- `reports` - User reports and investigations
- `access_logs` - Audit trail of actions
- `user_roles` - Staff role assignments
- `role_permissions` - Permission definitions
- `staff_points` - Staff member metrics
- `warning_templates` - Template library
- `scheduled_actions` - Queued moderation actions

## 🚀 Quick Start

### 1. Environment Setup
```bash
export DATABASE_URL="your-postgres-url"
export BETTER_AUTH_SECRET="your-secret-key"
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Run Migrations
```bash
# Database schema is already in schema.ts
# Connect to your PostgreSQL instance
```

### 4. Start Development Server
```bash
pnpm dev
```

### 5. Access API
```bash
# Check health
curl http://localhost:3000/api/health

# View API documentation
curl http://localhost:3000/api/docs

# All other endpoints require authentication
```

## 📊 Example API Requests

### Create an Infraction
```bash
curl -X POST http://localhost:3000/api/infractions \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": "server-id",
    "targetUserId": "user-id",
    "targetUsername": "username",
    "infractionType": "warning",
    "reason": "Rule violation",
    "appealable": true
  }'
```

### Search Infractions
```bash
curl http://localhost:3000/api/infractions/search \
  -H "Content-Type: application/json" \
  -d "?serverId=server-id&q=username&type=warning"
```

### Bulk Operations
```bash
curl -X POST http://localhost:3000/api/infractions/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "serverId": "server-id",
    "operation": "warn",
    "targetUserIds": ["user1", "user2", "user3"],
    "reason": "Spam warning"
  }'
```

### Export Data
```bash
# JSON export
curl http://localhost:3000/api/export \
  ?serverId=server-id&type=infractions&format=json

# CSV export
curl http://localhost:3000/api/export \
  ?serverId=server-id&type=infractions&format=csv
```

### Get Analytics
```bash
curl http://localhost:3000/api/analytics/comprehensive \
  ?serverId=server-id
```

## 🧪 Testing

### API Health Check
```bash
curl http://localhost:3000/api/health
```

### API Documentation
```bash
curl http://localhost:3000/api/docs | jq .
```

### Test Suite
Run the comprehensive test suite:
```bash
node lib/test-suite.ts
```

## 📈 Performance Metrics

- Response time target: < 200ms
- Audit logging: Real-time
- Data export: Supports 10,000+ records
- Bulk operations: Up to 100 users per request

## 🔒 Security Features

- Session-based authentication
- Role-based access control (RBAC)
- IP tracking and user agent logging
- Input validation and sanitization
- SQL injection prevention (parameterized queries)
- Permission checks on every API call
- Audit trail for all modifications

## 🛠️ Implementation Details

### API Conventions
- RESTful API design
- JSON request/response format
- Standard HTTP status codes
- Error responses with descriptive messages
- Pagination support (limit/offset)

### Database Transactions
- ACID compliance via PostgreSQL
- Foreign key constraints
- Cascade delete policies
- Soft deletes for historical data

### Logging & Monitoring
- Comprehensive access logs
- Action audit trail
- Error tracking
- Permission denial logging

## 📝 Development Notes

### Adding New Endpoints
1. Create route file: `app/api/[resource]/route.ts`
2. Implement GET/POST/PATCH/DELETE handlers
3. Add permission checks via `hasPermission()`
4. Log all actions to `access_logs`
5. Return proper HTTP status codes
6. Document in this README

### Common Patterns
```typescript
// Authentication check
const session = await getSession()
if (!session) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

// Permission check
const canAccess = await hasPermission(session.userId, serverId, 'permission_code')
if (!canAccess) {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
}

// Audit logging
await db.insert(access_logs).values({
  id: nanoid(),
  userId: session.userId,
  serverId,
  action: 'action_name',
  resource: 'resource:id',
  ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
  userAgent: request.headers.get('user-agent') || 'unknown',
  success: true,
  createdAt: new Date(),
})
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` environment variable
- Check PostgreSQL is running
- Verify credentials and network access

### Authentication Errors
- Ensure `BETTER_AUTH_SECRET` is set
- Check session cookie in browser
- Verify user is logged in

### Permission Denied Errors
- Check user's role in `user_roles` table
- Verify permissions in `role_permissions` table
- Check `serverId` matches

## 📞 Support

For issues or questions:
1. Check API documentation at `/api/docs`
2. Review error messages and status codes
3. Check audit logs at `/api/audit/logs`
4. Verify permissions with `/api/permissions/check`

## 📄 License

This project is part of the Discord Admin Panel system.

---

**API Version**: 1.0.0  
**Last Updated**: 2026-05-30  
**Status**: Production Ready
