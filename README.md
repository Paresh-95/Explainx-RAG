# Yash + WiseyAI  starter

This is an official starter of AISOLO.

## Using this example

Run the following command:

```sh
npx create-turbo@latest
```

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `docs`: a [Next.js](https://nextjs.org/) app
- `web`: another [Next.js](https://nextjs.org/) app
- `@repo/ui`: a stub React component library shared by both `web` and `docs` applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/).

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo
pnpm build
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo
pnpm dev
```

### Remote Caching

Turborepo can use a technique known as [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup), then enter the following commands:

```
cd my-turborepo
npx turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
npx turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turbo.build/repo/docs/core-concepts/monorepos/running-tasks)
- [Caching](https://turbo.build/repo/docs/core-concepts/caching)
- [Remote Caching](https://turbo.build/repo/docs/core-concepts/remote-caching)
- [Filtering](https://turbo.build/repo/docs/core-concepts/monorepos/filtering)
- [Configuration Options](https://turbo.build/repo/docs/reference/configuration)
- [CLI Usage](https://turbo.build/repo/docs/reference/command-line-reference)










# RBAC Implementation Guide

## Overview

This implementation provides a comprehensive Role-Based Access Control (RBAC) system for your space management application. The system supports four roles with granular permissions and includes invitation management, audit logging, and space forking capabilities.

## Roles & Permissions

### Role Hierarchy
- **OWNER**: Full control over space and all settings
- **MODERATOR**: Can manage members and all space content (but can't delete space)
- **MEMBER**: Can view, create, and edit materials
- **VIEWER**: Read-only access to space and materials

### Permission System
The system uses action-based permissions that are mapped to roles:
- `DELETE_SPACE`, `EDIT_SPACE_SETTINGS`, `VIEW_SPACE`
- `INVITE_MEMBERS`, `REMOVE_MEMBERS`, `CHANGE_MEMBER_ROLES`, `VIEW_MEMBERS`
- `CREATE_MATERIALS`, `EDIT_MATERIALS`, `DELETE_MATERIALS`, `VIEW_MATERIALS`, `UPLOAD_FILES`
- `FORK_SPACE`, `EXPORT_SPACE`, `VIEW_ANALYTICS`, `VIEW_AUDIT_LOG`

## Implementation Steps

### 1. Database Schema Updates

First, update your Prisma schema with the new RBAC models:

```bash
# Copy the schema updates from the artifacts
# Then run:
npx prisma db push
```

### 2. Run Migration Script

```bash
npm run migrate:rbac
```

This will:
- Create space memberships for existing space owners
- Set default values for new space settings
- Create audit log entries
- Clean up orphaned data

### 3. Update Auth Configuration

The system integrates with your existing Auth.js setup. No changes needed to the auth configuration.

### 4. API Routes Integration

Replace your existing space API routes with the RBAC-enabled versions. The new routes include:

- `GET/PATCH/DELETE /api/spaces/[spaceId]` - Space management with permission checks
- `GET/POST /api/spaces/[spaceId]/members` - Member listing and invitation
- `PATCH/DELETE /api/spaces/[spaceId]/members/[memberId]` - Member role management
- `GET/DELETE /api/spaces/[spaceId]/invitations` - Invitation management
- `GET/POST /api/invite/[token]` - Public invitation acceptance

### 5. Frontend Components

Add the member management components to your space pages:

```tsx
import { MemberManagement } from '@/components/space/MemberManagement';

// In your space page
<MemberManagement spaceId={space.id} />
```

### 6. Permission-Based UI

Use the permission hooks and components for conditional rendering:

```tsx
import { PermissionGate, usePermission } from '@/hooks/useRBAC';
import { Permission } from '@/types/rbac';

// Conditional rendering
<PermissionGate spaceId={spaceId} permission={Permission.EDIT_MATERIALS}>
  <EditButton />
</PermissionGate>

// Hook usage
const { allowed } = usePermission(spaceId, Permission.DELETE_SPACE);
```

## Key Features

### 1. Space Membership Management
- Invite users by email with specific roles
- Change member roles (with hierarchy restrictions)
- Remove members from spaces
- View all space members and pending invitations

### 2. Invitation System
- Generate secure invitation tokens
- Email-based invitations with expiry
- Custom invitation messages
- Role-specific invitation acceptance

### 3. Permission Middleware
- Server-side permission checking for all API routes
- Automatic user context resolution
- Granular permission validation
- Custom permission checks support

### 4. Audit Logging
- Track all permission changes
- Member addition/removal logs
- Role change history
- Space settings modifications

### 5. React Hooks & Components
- `usePermission` - Check single permissions
- `useSpacePermissions` - Get all user permissions
- `useSpaceMembers` - Member management operations
- `PermissionGate` - Conditional rendering component
- `withPermission` - Higher-order component wrapper

## Security Considerations

### 1. Role Hierarchy Enforcement
- Users can only manage members with lower roles
- Role assignments are validated server-side
- Owners cannot be removed or demoted by others

### 2. Permission Validation
- All API routes protected with middleware
- Client-side permissions are hints only
- Server-side validation on every request

### 3. Invitation Security
- Cryptographically secure tokens
- Email verification required
- Expiration timestamps enforced
- Single-use tokens

## Usage Examples

### Inviting a Member
```tsx
const { inviteMember } = useSpaceMembers(spaceId);

await inviteMember({
  email: 'user@example.com',
  role: SpaceRole.MEMBER,
  message: 'Welcome to our study space!'
});
```

### Checking Permissions
```tsx
const { allowed, loading } = usePermission(spaceId, Permission.DELETE_MATERIALS);

if (loading) return <Spinner />;
if (!allowed) return <AccessDenied />;
return <DeleteButton />;
```

### Server-side Permission Check
```tsx
// In a server component or API route
const { allowed } = await checkServerPermission(
  userId, 
  spaceId, 
  Permission.EDIT_SPACE_SETTINGS
);
```

## API Endpoints

### Space Management
- `GET /api/spaces/[spaceId]` - Get space with user permissions
- `PATCH /api/spaces/[spaceId]` - Update space settings (OWNER/MODERATOR)
- `DELETE /api/spaces/[spaceId]` - Delete space (OWNER only)

### Member Management
- `GET /api/spaces/[spaceId]/members` - List members
- `POST /api/spaces/[spaceId]/members` - Invite member
- `PATCH /api/spaces/[spaceId]/members/[memberId]` - Update member role
- `DELETE /api/spaces/[spaceId]/members/[memberId]` - Remove member

### Invitations
- `GET /api/spaces/[spaceId]/invitations` - List pending invitations
- `DELETE /api/spaces/[spaceId]/invitations/[invitationId]` - Cancel invitation
- `GET /api/invite/[token]` - Get invitation details
- `POST /api/invite/[token]/accept` - Accept invitation

### Context
- `GET /api/spaces/[spaceId]/context` - Get user's space context and permissions

## Error Handling

The system provides comprehensive error handling with specific error codes:
- `UNAUTHORIZED` - User not authenticated
- `ACCESS_DENIED` - User doesn't have access to space
- `INSUFFICIENT_PERMISSIONS` - User lacks required permission
- `VALIDATION_ERROR` - Invalid input data
- `NOT_FOUND` - Resource not found
- `ALREADY_MEMBER` - User is already a space member

## Testing

Test the RBAC system by:
1. Creating spaces with different users
2. Inviting members with various roles
3. Testing permission boundaries
4. Verifying audit logs
5. Testing invitation flow

## Migration Notes

When migrating existing data:
- All current space owners automatically get OWNER role
- Existing spaces get default RBAC settings
- Audit logs are created for migration actions
- No data loss occurs during migration

This RBAC system provides enterprise-grade access control while maintaining simplicity and ease of use.# Explainx-RAG
# Explainx-RAG
# Explainx-RAG
