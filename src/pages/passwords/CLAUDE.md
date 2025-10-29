# CLAUDE.md - Passwords Module Integration Guide

This file provides guidance for Claude Code (claude.ai/code) when integrating the passwords module into a new tenant site.

## Module Overview

The Passwords module provides a secure credential management system for issuing and sharing passwords with employees and clients. It features SMS-based authentication for public access, 2FA support, access logging, and expiration management.

## Key Features

1. **Password Management:**
   - Issue passwords to specific users
   - Set expiration dates
   - Store 2FA secrets and backup codes
   - Add notes and instructions
   - Track login and dashboard URLs

2. **Access Control:**
   - SMS verification for public access
   - Role-based permissions (PASSWORD_ADMIN, PASSWORD_USER)
   - Password sharing with multiple users
   - Access logging for audit trails

3. **Security Features:**
   - Passwords hidden by default
   - Copy to clipboard functionality
   - Expiration tracking
   - 2FA support with TOTP
   - Secure public access links

## Module Dependencies

### Backend Requirements

The passwords module requires these GraphQL operations:

1. **Queries:**
   - `myPasswords` - Get passwords for current user
   - `passwords` - Admin view of all passwords
   - `password(id: ID!)` - Single password with access logging
   - `publicPasswordAccess` - Public access with SMS verification
   - `passwordAccessLogs` - View access history

2. **Mutations:**
   - `createPassword` - Issue new password
   - `updatePassword` - Update password details
   - `deactivatePassword` - Soft delete
   - `sharePassword` - Share with additional users
   - `generatePasswordLink` - Create secure access link

3. **Required Backend Models:**
   - Password (main entity)
   - PasswordAccessLog (audit trail)
   - Client (for user references)

### Frontend Dependencies

```bash
# Required packages
yarn add date-fns    # Date formatting
```

### External Components Required

1. **Authentication:**
   - `src/pages/authentication/components/LoginWithSmsModal.tsx`
   - `src/pages/authentication/components/CaptureUserDetailsModal.tsx`
   - `src/contexts/AuthContext.tsx`

2. **UI Components:**
   - Chakra UI components
   - Brand configuration
   - Navbar and Footer components

## Public Access Flow

The public password access feature (`/passwords/access/:id`) works as follows:

1. User receives a link to access a password
2. Page loads and checks authentication status
3. If not authenticated, shows SMS login modal
4. User enters mobile number and receives SMS code
5. After verification, checks if user details are complete
6. If missing details, shows capture details modal
7. Once fully authenticated, fetches and displays password
8. All access is logged for audit purposes

## Security Considerations

1. **Access Control:**
   - Passwords can only be viewed by:
     - The user it was issued to
     - Users explicitly shared with
     - Administrators with PASSWORD_ADMIN permission

2. **Public Access:**
   - Requires SMS verification
   - Links can have expiration times
   - All access is logged with IP and user agent

3. **Data Protection:**
   - Passwords hidden by default
   - 2FA secrets protected
   - Clipboard operations use secure API

## Permission Structure

```typescript
// Required permissions in Client model
export enum ClientPermission {
  // ... existing permissions
  PASSWORD_ADMIN = "PASSWORD_ADMIN",  // Can issue and manage all passwords
  PASSWORD_USER = "PASSWORD_USER",    // Can view assigned passwords
}
```

## Integration Checklist

When integrating the passwords module:

### 1. Backend Setup
- [ ] Password entity created with all fields
- [ ] PasswordAccessLog entity for audit trail
- [ ] Resolver with all queries and mutations
- [ ] Permissions added to ClientPermission enum
- [ ] Resolver registered in server.ts

### 2. Frontend Setup
- [ ] Module config imported in App.tsx
- [ ] Added to modules array for dynamic routing
- [ ] SMS authentication components available
- [ ] Auth context properly configured

### 3. Email Notifications
- [ ] Password issued notification template
- [ ] Password updated notification template
- [ ] Password shared notification template

### 4. Testing
- [ ] Test password creation and viewing
- [ ] Test public access with SMS verification
- [ ] Test access logging
- [ ] Test expiration handling
- [ ] Test 2FA secret storage

## Common Use Cases

1. **Issuing a Company Password:**
   - Admin creates password with service details
   - Sets appropriate expiration
   - Adds 2FA secret if available
   - Employee receives email with secure link

2. **Shared Team Password:**
   - Admin creates password
   - Uses sharePassword mutation to add team members
   - All team members can access via their dashboard

3. **Temporary Access:**
   - Create password with expiration date
   - Share secure link
   - Password auto-expires after set time

## Future Enhancements

Consider implementing:
- Password rotation reminders
- Bulk password import/export
- Integration with password managers
- QR code generation for 2FA
- Password strength indicators
- Encrypted storage at rest
- Team/group-based sharing
- Password categories/tags

## Troubleshooting

1. **SMS Verification Not Working:**
   - Check SMS service configuration
   - Verify mobile number format
   - Check tenant SMS API keys

2. **Password Not Accessible:**
   - Verify user permissions
   - Check expiration date
   - Confirm sharing settings

3. **2FA Issues:**
   - Ensure secret is properly formatted
   - Check TOTP time sync
   - Verify backup codes format

---

**For Claude Code:** This module requires careful attention to security. Always ensure proper authentication, use the access logging features, and handle sensitive data appropriately. The public access feature should always require SMS verification.