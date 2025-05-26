# tRPC Migration Documentation

This document outlines the migration from REST API endpoints to tRPC for type-safe API calls in the Lego Planner application.

## Overview

We've successfully migrated from REST API endpoints to tRPC to achieve:
- End-to-end type safety
- Better developer experience with IntelliSense
- Consistent validation using ArkType
- React Query integration for caching and loading states
- Real-time updates with optimistic updates and cache invalidation
- Reduced boilerplate code

## Migration Status

### ✅ Completed Migrations

#### Team API (`/api/team-members`)
- **Router**: `src/server/routers/team.ts`
- **Procedures**:
  - `getTeamMembers` - Fetch all team members with optional filtering
  - `createTeamMember` - Create a new team member
  - `updateTeamMemberRole` - Update a team member's role
- **Components migrated**:
  - `src/components/team-members-list.tsx`
  - `src/components/new-team-member-dialog.tsx`
  - `src/components/planner-selection.tsx`
  - `src/components/new-project-dialog.tsx`
  - `src/components/projects-page-content.tsx`
- **Status**: ✅ Complete - REST API endpoint removed

#### Projects API (`/api/projects`)
- **Router**: `src/server/routers/project.ts`
- **Procedures**:
  - `getProjects` - Fetch all projects with filtering (search, type, quarter, priorities, areas, leads, includeArchived)
  - `getProjectById` - Fetch a single project by ID
  - `createProject` - Create a new project
  - `updateProject` - Full update of a project
  - `patchProject` - Partial update of a project
  - `deleteProject` - Delete a project
- **Components migrated**:
  - `src/components/projects-page-content.tsx`
  - `src/components/new-project-dialog.tsx`
  - `src/components/planner-selection.tsx`
  - `src/components/edit-project-form.tsx`
- **Status**: ✅ Complete - REST API endpoints removed

#### Planner API (`/api/planner`)
- **Router**: `src/server/routers/planner.ts`
- **Procedures**:
  - `getPlanners` - Fetch all planners with optional year/quarter filtering
  - `getPlannerById` - Fetch a single planner by ID
  - `createPlanner` - Create a new planner
  - `updatePlanner` - Update an existing planner
  - `deletePlanner` - Delete a planner
- **Components migrated**:
  - `src/components/planner-selection.tsx`
  - `src/app/planner/lego/[id]/page.tsx`
- **Status**: ✅ Complete - REST API endpoints removed

### 🔄 Pending Migrations

None - All major API endpoints have been migrated to tRPC.

## tRPC Setup

### Core Files

1. **tRPC Configuration** (`src/server/trpc.ts`)
   - Initializes tRPC with context
   - Exports router and procedure builders

2. **Context** (`src/server/context.ts`)
   - Defines the context interface for NextRequest

3. **Main App Router** (`src/server/routers/_app.ts`)
   - Combines all sub-routers
   - Exports the main AppRouter type

4. **HTTP Handler** (`src/app/api/trpc/[trpc]/route.ts`)
   - Handles HTTP requests for App Router
   - Uses fetchRequestHandler

5. **Client Setup** (`src/utils/trpc.ts`)
   - Creates tRPC React hooks
   - Configures the client

6. **Provider** (`src/components/providers/trpc-provider.tsx`)
   - Wraps the app with tRPC and QueryClient providers

### Validation

All input validation uses **ArkType** instead of Zod for consistency with the existing codebase:

```typescript
import { type } from 'arktype';

const getTeamMembersInput = type({
  'search?': 'string',
  'department?': 'string',
});

const createTeamMemberInput = type({
  name: 'string >= 1',
  role: 'string >= 1',
  'department?': 'string',
  type: "'person' | 'team' | 'dependency' | 'event'",
});
```

## Usage Examples

### Client-side Usage

```typescript
import { trpc } from '@/utils/trpc';

// Query
const { data, isLoading, error } = trpc.team.getTeamMembers.useQuery({
  search: 'john',
  department: 'engineering'
});

// Mutation with cache invalidation
const utils = trpc.useUtils();
const createMutation = trpc.team.createTeamMember.useMutation({
  onSuccess: () => {
    utils.team.getTeamMembers.invalidate();
  }
});

// Projects with filtering
const { data: projects } = trpc.project.getProjects.useQuery({
  search: 'api',
  type: 'regular',
  priorities: ['high', 'urgent'],
  includeArchived: false
});

// Planners with year/quarter filtering
const { data: planners } = trpc.planner.getPlanners.useQuery({
  year: 2024,
  quarter: 1
});

// Create planner with toast notifications
const createPlannerMutation = trpc.planner.createPlanner.useMutation({
  onSuccess: () => {
    utils.planner.getPlanners.invalidate();
    toast({
      title: 'Success',
      description: 'New planner created successfully',
    });
  },
  onError: (error) => {
    toast({
      title: 'Error',
      description: 'Failed to create new planner',
      variant: 'destructive',
    });
  },
});
```

### Server-side Usage

```typescript
// In a router
export const teamRouter = router({
  getTeamMembers: publicProcedure
    .input(getTeamMembersInput)
    .query(async ({ input }) => {
      // Implementation
    }),
});
```

## Testing

Tests are located in:
- `src/server/routers/__tests__/team.test.ts`
- `src/server/routers/__tests__/team-validation.test.ts`
- `src/server/routers/__tests__/project.test.ts`
- `src/server/routers/__tests__/planner.test.ts`

Run tests with:
```bash
bun test
```

## Benefits Achieved

1. **Type Safety**: Full end-to-end type safety from client to server
2. **Developer Experience**: IntelliSense and auto-completion for all API calls
3. **Validation**: Consistent ArkType validation across all endpoints
4. **Caching**: Built-in React Query caching and background refetching
5. **Real-time Updates**: Optimistic updates and automatic cache invalidation
6. **Error Handling**: Consistent error handling with proper TypeScript types
7. **Performance**: Reduced bundle size and improved performance with tree-shaking

## Migration Checklist

- [x] Set up tRPC infrastructure
- [x] Create team router with all CRUD operations
- [x] Create project router with all CRUD operations
- [x] Migrate team-related components
- [x] Migrate project-related components
- [x] Add comprehensive tests
- [x] Remove old REST API endpoints
- [x] Update documentation
- [x] Verify TypeScript compilation
- [x] Ensure all tests pass

## Next Steps

The tRPC migration is now complete! All major API endpoints have been migrated to provide:
- Type-safe API calls
- Better developer experience
- Consistent validation
- Improved performance
- Real-time updates

Future API endpoints should be built using tRPC following the established patterns in the existing routers. 