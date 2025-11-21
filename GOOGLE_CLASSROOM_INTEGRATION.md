# Google Classroom Integration Guide for Simple RubriQ

## Overview
Integrating Simple RubriQ with Google Classroom enables automatic roster sync, assignment import, and feedback delivery. This guide outlines the technical implementation path.

## Core Integration Points

### 1. Roster Sync (Students)
- **API**: Google Classroom Courses API + Students API
- **Flow**: 
  1. Teacher authorizes via Google OAuth 2.0
  2. Fetch courses: `GET /v1/courses`
  3. For each course, fetch students: `GET /v1/courses/{courseId}/students`
  4. Sync to Simple RubriQ `students` table
- **Mapping**:
  - `course.name` → `class_section`
  - `student.profile.name.fullName` → `name`
  - `student.profile.emailAddress` → `email`
  - `student.userId` → store as `google_classroom_id` (new column)

### 2. Assignment Import
- **API**: Google Classroom Coursework API
- **Flow**:
  1. Fetch assignments: `GET /v1/courses/{courseId}/courseWork`
  2. Filter for essay/writing assignments
  3. Create corresponding essays in Simple RubriQ with metadata
- **Mapping**:
  - `courseWork.title` → essay `title`
  - `courseWork.description` → essay metadata
  - `courseWork.dueDate` → deadline tracking
  - Link to rubric if specified in assignment

### 3. Submission Collection
- **API**: Google Classroom StudentSubmissions API
- **Flow**:
  1. Fetch submissions: `GET /v1/courses/{courseId}/courseWork/{courseWorkId}/studentSubmissions`
  2. Download attachments (Google Drive API for Docs/PDFs)
  3. Extract text content
  4. Create essay records with student association
- **Content Extraction**:
  - Google Docs: Use Drive API `export` with `text/plain` format
  - PDFs: Use Drive API + text extraction library
  - Plain text: Direct ingestion

### 4. Feedback Delivery (Return Grades & Comments)
- **API**: Google Classroom StudentSubmissions API (PATCH)
- **Flow**:
  1. Generate feedback in Simple RubriQ
  2. Format as private comment or attachment
  3. Patch submission: `PATCH /v1/courses/{courseId}/courseWork/{courseWorkId}/studentSubmissions/{id}`
  4. Optionally attach PDF export as Drive file
- **Data Sent**:
  - `assignedGrade` (overall score)
  - `draftGrade` (before final publish)
  - Private comments with AO breakdown + feedback text

## Technical Implementation Steps

### Step 1: Google Cloud Project Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Simple RubriQ"
3. Enable APIs:
   - Google Classroom API
   - Google Drive API
   - Google People API (for profile data)
4. Configure OAuth consent screen:
   - User type: External
   - Scopes: `classroom.courses.readonly`, `classroom.rosters.readonly`, `classroom.coursework.students`, `classroom.student-submissions.students.readonly`, `classroom.student-submissions.me.readonly`, `drive.readonly`
5. Create OAuth 2.0 credentials (Web application)
6. Add authorized redirect URIs: `https://yourdomain.com/auth/google/callback`

### Step 2: Database Schema Extension
Add to Supabase migration:

```sql
-- Add Google Classroom linking columns
ALTER TABLE public.students
ADD COLUMN IF NOT EXISTS google_classroom_id text UNIQUE,
ADD COLUMN IF NOT EXISTS course_id text;

CREATE TABLE IF NOT EXISTS public.google_classroom_sync (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references auth.users(id),
  course_id text not null,
  course_name text,
  sync_enabled boolean default true,
  last_sync_at timestamptz,
  access_token_encrypted text, -- Store encrypted refresh token
  created_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS public.assignment_links (
  id uuid primary key default gen_random_uuid(),
  essay_id uuid references public.essays(id),
  course_id text not null,
  coursework_id text not null,
  submission_id text,
  synced_at timestamptz default now()
);

CREATE INDEX IF NOT EXISTS idx_students_google_id ON public.students(google_classroom_id);
CREATE INDEX IF NOT EXISTS idx_assignment_links_coursework ON public.assignment_links(coursework_id);
```

### Step 3: OAuth Flow Implementation

**Backend (Supabase Edge Function or Node.js API):**

```typescript
// utils/googleClassroomAuth.ts
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export async function getAuthUrl() {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/classroom.courses.readonly',
      'https://www.googleapis.com/auth/classroom.rosters.readonly',
      'https://www.googleapis.com/auth/classroom.coursework.students',
      'https://www.googleapis.com/auth/classroom.student-submissions.students.readonly',
      'https://www.googleapis.com/auth/drive.readonly'
    ],
    prompt: 'consent'
  });
}

export async function handleCallback(code: string) {
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  // Store refresh_token encrypted in google_classroom_sync table
  return tokens;
}
```

**Frontend (Settings Page):**

```tsx
// pages/GoogleClassroomSettings.tsx
const handleConnectClassroom = async () => {
  const authUrl = await fetch('/api/google-classroom/auth-url').then(r => r.json());
  window.location.href = authUrl.url;
};
```

### Step 4: Sync Services

**Roster Sync:**

```typescript
// utils/googleClassroomSync.ts
import { classroom_v1, google } from 'googleapis';

async function syncRoster(auth: any, courseId: string, teacherId: string) {
  const classroom = google.classroom({ version: 'v1', auth });
  
  const { data } = await classroom.courses.students.list({ courseId });
  
  for (const student of data.students || []) {
    await supabase.from('students').upsert({
      teacher_id: teacherId,
      google_classroom_id: student.userId,
      name: student.profile?.name?.fullName,
      email: student.profile?.emailAddress,
      course_id: courseId,
      class_section: courseId // or map course name
    }, { onConflict: 'google_classroom_id' });
  }
}
```

**Assignment Import:**

```typescript
async function importAssignments(auth: any, courseId: string, teacherId: string) {
  const classroom = google.classroom({ version: 'v1', auth });
  const drive = google.drive({ version: 'v3', auth });
  
  const { data } = await classroom.courses.courseWork.list({ courseId });
  
  for (const work of data.courseWork || []) {
    // Fetch submissions
    const submissions = await classroom.courses.courseWork.studentSubmissions.list({
      courseId,
      courseWorkId: work.id
    });
    
    for (const sub of submissions.data.studentSubmissions || []) {
      if (sub.state !== 'TURNED_IN') continue;
      
      // Extract content from attachments
      const attachment = sub.assignmentSubmission?.attachments?.[0];
      let content = '';
      
      if (attachment?.driveFile) {
        const fileId = attachment.driveFile.id;
        const file = await drive.files.export({
          fileId,
          mimeType: 'text/plain'
        });
        content = file.data as string;
      }
      
      // Create essay
      const { data: essay } = await supabase.from('essays').insert({
        teacher_id: teacherId,
        student_id: (await getStudentByGoogleId(sub.userId!))?.id,
        title: work.title,
        content,
        word_count: content.split(/\s+/).length
      }).select().single();
      
      // Link assignment
      await supabase.from('assignment_links').insert({
        essay_id: essay.id,
        course_id: courseId,
        coursework_id: work.id,
        submission_id: sub.id
      });
    }
  }
}
```

**Feedback Return:**

```typescript
async function returnFeedback(auth: any, assignmentLink: any, feedback: any) {
  const classroom = google.classroom({ version: 'v1', auth });
  
  await classroom.courses.courseWork.studentSubmissions.patch({
    courseId: assignmentLink.course_id,
    courseWorkId: assignmentLink.coursework_id,
    id: assignmentLink.submission_id,
    updateMask: 'assignedGrade,draftGrade',
    requestBody: {
      assignedGrade: feedback.overall_score,
      draftGrade: feedback.overall_score
    }
  });
  
  // Add private comment with AO breakdown
  await classroom.courses.courseWork.studentSubmissions.modifyAttachments({
    courseId: assignmentLink.course_id,
    courseWorkId: assignmentLink.coursework_id,
    id: assignmentLink.submission_id,
    requestBody: {
      addAttachments: [{
        // Upload PDF to Drive first, then attach
      }]
    }
  });
}
```

### Step 5: UI Components

**Settings Page Integration:**

```tsx
// pages/AccountSettings.tsx - Add section
<div className="border rounded p-4">
  <h3 className="font-semibold mb-2">Google Classroom</h3>
  {!isConnected ? (
    <button onClick={handleConnectClassroom} className="bg-blue-600 text-white px-4 py-2 rounded">
      Connect Google Classroom
    </button>
  ) : (
    <>
      <p className="text-green-600 mb-2">✓ Connected</p>
      <button onClick={handleSyncNow} className="bg-gray-600 text-white px-3 py-1 rounded mr-2">
        Sync Now
      </button>
      <button onClick={handleDisconnect} className="text-red-600">
        Disconnect
      </button>
    </>
  )}
</div>
```

**Batch Import from Classroom:**

```tsx
// pages/BatchProcessor.tsx - Add tab
<div className="mb-4">
  <h3 className="font-semibold">Import from Google Classroom</h3>
  <select onChange={e => setCourseId(e.target.value)}>
    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
  </select>
  <select onChange={e => setAssignmentId(e.target.value)}>
    {assignments.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
  </select>
  <button onClick={handleImportSubmissions}>Import Submissions</button>
</div>
```

## Security Considerations

1. **Token Storage**: Encrypt refresh tokens using Supabase Vault or AES-256
2. **Scopes**: Request minimum necessary scopes
3. **Rate Limits**: Google Classroom API has quotas (10,000 requests/day for free tier)
4. **Data Privacy**: Comply with FERPA, GDPR when syncing student data
5. **Audit Logs**: Track all sync operations in activity logs

## Deployment Checklist

- [ ] Google Cloud project configured
- [ ] OAuth credentials generated
- [ ] Scopes reviewed with school IT/compliance
- [ ] Database migration applied
- [ ] Edge functions deployed (auth callback, sync endpoints)
- [ ] Frontend UI added (Settings + Batch import)
- [ ] Token encryption implemented
- [ ] Rate limiting + retry logic added
- [ ] Error handling for revoked tokens
- [ ] User documentation written

## Future Enhancements

- **Bidirectional Sync**: Auto-create assignments in Classroom from Simple RubriQ rubrics
- **Real-time Webhooks**: Use Classroom Push Notifications for instant submission updates
- **Gradebook Integration**: Sync scores directly to Classroom gradebook
- **Parent Access**: Share feedback summaries via Classroom guardian features
- **Attachment Support**: Handle multi-file submissions (Google Slides, Sheets)

## References

- [Google Classroom API Docs](https://developers.google.com/classroom)
- [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
- [Drive API Export Formats](https://developers.google.com/drive/api/guides/ref-export-formats)
- [Classroom Scopes Reference](https://developers.google.com/classroom/guides/auth)

---

This integration typically takes 2-4 weeks to implement end-to-end, including testing and compliance review.
