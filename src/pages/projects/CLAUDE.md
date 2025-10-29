# CLAUDE.md - Projects Module Integration Guide

This file provides guidance for Claude Code (claude.ai/code) when integrating the projects module into a new tenant site.

## Module Dependencies

When deploying the projects module to a new site, ensure these dependencies are installed:

### Required NPM Packages

```bash
# Core dependencies for the projects module
yarn add react-pdf    # PDF preview functionality (v10.0.1 or later)
yarn add date-fns     # Date formatting utilities
yarn add react-icons  # Icon components
```

### Backend Requirements

The projects module requires these GraphQL operations to be available from the backend:

1. **Queries:**
   - `project(id: ID!)` - Fetch single project details
   - `projects` - List all projects
   - `clients` - List clients for team member selection

2. **Mutations:**
   - `createProject` - Create new project
   - `updateProject` - Update project details
   - `deleteProject` - Delete project
   - `createTask` - Add tasks to project
   - `updateTask` - Update task details
   - `updateTaskOrder` - Reorder tasks
   - `addProjectMember` - Add team members
   - `removeProjectMember` - Remove team members
   - `uploadToPinata` - File upload support

3. **Required Backend Models:**
   - Project (with projectGoal and projectDescription fields)
   - Task (with media support)
   - Client (for team members)

## File Structure Dependencies

### External Components Required

These components must exist outside the projects folder:

1. **Authentication:**
   - `src/pages/authentication/components/LoginWithSmsModal.tsx`
   - `src/contexts/AuthContext.tsx`

2. **UI Components:**
   - `src/components/chakra/NavbarWithCallToAction/NavbarWithCallToAction.tsx`
   - `src/components/chakra/FooterWithFourColumns/FooterWithFourColumns.tsx`

3. **Configuration:**
   - `src/brandConfig.ts` - Theme configuration
   - `src/helpers.ts` - Utility functions (normalizeMediaUrl)

### GraphQL Configuration

Ensure Apollo Client is configured with:
- File upload support (apollo-upload-client)
- Proper authentication headers
- Tenant ID headers for multi-tenant support

## PDF.js Worker Configuration

The projects module uses react-pdf for PDF previews. Each component that uses PDF preview has this configuration:

```typescript
import { Document, Page, pdfjs } from "react-pdf";

// Configure pdf.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
```

**Important:** This configuration uses unpkg CDN for Create React App compatibility.

## Integration Checklist

When integrating the projects module:

### 1. Install Dependencies
- [ ] Install react-pdf: `yarn add react-pdf`
- [ ] Verify date-fns is installed
- [ ] Verify react-icons is installed

### 2. Verify External Dependencies
- [ ] Authentication module exists at `src/pages/authentication`
- [ ] AuthContext exists at `src/contexts/AuthContext.tsx`
- [ ] Chakra UI navbar and footer components exist
- [ ] brandConfig.ts exists with proper theme configuration
- [ ] helpers.ts exists with normalizeMediaUrl function

### 3. Backend Integration
- [ ] Project entity has projectGoal field (max 17 words)
- [ ] Project entity has projectDescription field (max 70 words)
- [ ] Task entity supports media array with url, description, fileType
- [ ] File upload mutation (uploadToPinata) is available
- [ ] All required GraphQL queries and mutations are implemented

### 4. Routing Setup
Add these routes to your main router:

```typescript
<Route path="/projects" element={<Projects />} />
<Route path="/projects/new" element={<NewProject />} />
<Route path="/project/:id" element={<ProjectPage />} />
<Route path="/project/:id/timeline" element={<TimelineView />} />
```

## Common Issues and Solutions

### PDF Preview Not Working
1. **Error:** "Failed to load PDF file"
   - **Solution:** Ensure react-pdf is installed: `yarn add react-pdf`
   - **Solution:** Check browser console for CORS errors with PDF URLs
   - **Solution:** Verify normalizeMediaUrl helper is working correctly

2. **Error:** "Cannot find module 'react-pdf'"
   - **Solution:** Install the package: `yarn add react-pdf`

### Missing Components
1. **Error:** "Cannot find module '../authentication'"
   - **Solution:** Ensure authentication module is deployed
   - **Solution:** Check import paths are correct

2. **Error:** "Cannot find module '../../helpers'"
   - **Solution:** Create src/helpers.ts with normalizeMediaUrl function

### GraphQL Errors
1. **Error:** "Cannot query field 'projectDescription'"
   - **Solution:** Update backend Project model to include projectDescription field
   - **Solution:** Regenerate GraphQL types

## Features Included

The projects module provides:

1. **Project Management:**
   - Create projects with AI-enhanced descriptions
   - Edit project details inline
   - Delete projects with confirmation

2. **Team Management:**
   - Add existing clients as team members
   - Create new clients directly from project page
   - Remove team members

3. **Task Management:**
   - Create tasks with AI-enhanced descriptions (30 words max)
   - Upload evidence files (images, videos, PDFs)
   - AI-enhanced file descriptions (10 words max)
   - Drag-and-drop task reordering
   - Task status tracking (Pending, In Progress, Completed)

4. **Evidence Timeline:**
   - Visual timeline of all uploaded evidence
   - PDF, image, and video preview support
   - Chronological display with infinite scroll

5. **Authentication Integration:**
   - SMS login modal for unauthenticated users
   - Maintains current page after login
   - Role-based access control

## AI Integration

The module includes AI improvement features:

1. **Project Name:** AI enhancement with business focus
2. **Project Goal:** 17-word maximum concise goal
3. **Project Description:** 70-word detailed description
4. **Task Description:** 30-word action-oriented task description
5. **File Description:** 10-word evidence description

All AI features use these GraphQL mutations:
- `improveDescription(text: String!, context: String)`
- `improveTagline(text: String!, context: String)`

## Security Considerations

- All file uploads are normalized through normalizeMediaUrl helper
- Authentication required for all project operations
- Team members can only be added by project admins
- Tenant isolation enforced through backend middleware

---

**For Claude Code:** When integrating this module, start by installing react-pdf and verifying all external dependencies exist. The most common issue is missing the PDF dependency or incorrect import paths for the authentication module.