# Transcription Service Module - Frontend Implementation Guide

## ✅ BACKEND COMPLETE

All backend components are created and registered:
- ✅ Transcription.ts entity model
- ✅ LemonFox service (lemonfox/lemonfox.service.ts)
- ✅ TranscriptionResolver with full CRUD + transcription
- ✅ Permissions added to Client.ts
- ✅ Resolver registered in server.ts

## 📋 FRONTEND TODO

### Required Components

1. **TranscriptionsList.tsx** - Main list view
   - Query: `transcriptions` or `myTranscriptions`
   - Shows: title, status, date, duration, language
   - Actions: View, Delete
   - Status badges: PENDING, UPLOADING, PROCESSING, COMPLETED, FAILED

2. **NewTranscription.tsx** - Upload and create
   - File upload using Pinata (see existing Pinata components)
   - Form: title, description, audio file
   - Mutation: `createTranscription` then `transcribeAudio`
   - Progress indicator during upload/transcription

3. **TranscriptionDetails.tsx** - View results
   - Query: `transcription(id: $id)`
   - Shows: all metadata + transcription text
   - Download transcription as .txt
   - Retry button for failed transcriptions
   - Audio player for playback

### GraphQL Operations

```graphql
# Queries
query GetTranscriptions {
  transcriptions {
    id
    title
    status
    duration
    detectedLanguage
    confidence
    createdAt
    owner {
      id
      fName
      lName
    }
  }
}

query GetTranscription($id: ID!) {
  transcription(id: $id) {
    id
    title
    description
    audioUrl
    fileName
    fileSize
    duration
    transcription
    status
    errorMessage
    detectedLanguage
    confidence
    processingTime
    createdAt
    updatedAt
    owner {
      id
      fName
      lName
    }
  }
}

# Mutations
mutation CreateTranscription($input: TranscriptionInput!) {
  createTranscription(input: $input) {
    id
    title
    status
  }
}

mutation TranscribeAudio($input: TranscriptionUploadInput!) {
  transcribeAudio(input: $input) {
    id
    status
    transcription
  }
}

mutation UpdateTranscription($id: ID!, $input: TranscriptionUpdateInput!) {
  updateTranscription(id: $id, input: $input) {
    id
    title
    description
  }
}

mutation DeleteTranscription($id: ID!) {
  deleteTranscription(id: $id)
}

mutation RetryTranscription($id: ID!) {
  retryTranscription(id: $id) {
    id
    status
  }
}
```

### File Upload Flow

1. User selects audio/video file
2. Upload to Pinata using existing `PinataMediaResolver`
3. Get back IPFS URL
4. Create transcription record with `createTranscription`
5. Call `transcribeAudio` with transcriptionId + audioUrl
6. Poll or show processing state
7. Display result when completed

### Permission Checking

```typescript
// In components, check permissions:
const hasPermission = (requiredPerms: string[]) => {
  if (!user?.permissions) return false;
  return requiredPerms.some(p => user.permissions?.includes(p));
};

// Show delete button only for admin:
{hasPermission(['ADMIN', 'TRANSCRIPTION_ADMIN']) && (
  <Button onClick={handleDelete}>Delete</Button>
)}
```

### Status Badges

```typescript
const getStatusColor = (status: string) => {
  switch (status) {
    case 'COMPLETED': return 'green';
    case 'PROCESSING': return 'blue';
    case 'UPLOADING': return 'purple';
    case 'FAILED': return 'red';
    default: return 'gray';
  }
};
```

## 🎨 UI/UX Guidelines

- Use Chakra UI components (Card, Table, Button, Badge, etc.)
- Follow brandConfig color scheme
- Show loading states during upload/transcription
- Display error messages clearly
- Auto-refresh when status is PROCESSING
- Download button for completed transcriptions

## 🔐 PERMISSIONS SUMMARY

### TRANSCRIPTION_USER
- Can create new transcriptions
- Can view own transcriptions
- Can update own transcription metadata
- Can delete own transcriptions
- Can retry own failed transcriptions

### TRANSCRIPTION_ADMIN
- All USER permissions
- Can view all transcriptions in tenant
- Can manage any transcription
- Can test LemonFox API connection

## 📝 Next Steps

1. Run `yarn codegen` in frontend to generate GraphQL types
2. Create TranscriptionsList.tsx (copy pattern from ClientsList.tsx)
3. Create NewTranscription.tsx (with file upload)
4. Create TranscriptionDetails.tsx (with download button)
5. Add module to App.tsx modules array
6. Add to FloatingNavbar allModuleConfigs array
7. Test with actual audio file

## 🧪 Testing

1. Create new transcription with audio file
2. Verify file uploads to Pinata
3. Check LemonFox transcription process
4. Download completed transcription
5. Test retry on failed transcription
6. Verify permission-based access
7. Test as both USER and ADMIN roles
