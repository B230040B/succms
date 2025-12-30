# Supabase Integration Guide for SUCCMS Learn 4.0

## Overview

This guide walks you through setting up Supabase for the SUCCMS e-learning platform. The integration includes user authentication, course management, assignments, posts, stories, and comprehensive leaderboards.

## Prerequisites

- Supabase account (https://supabase.com)
- Node.js 16+ installed locally
- Git for version control

---

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in to your account
2. Click **"New project"** or **"+ New"**
3. Fill in the project details:
   - **Name**: `SUCCMS Learn 4.0`
   - **Database Password**: Create a strong password (save this securely)
   - **Region**: Choose the closest region to your users (e.g., `us-east-1`)
   - **Pricing Plan**: Start with "Free" (sufficient for development)
4. Click **"Create new project"** and wait for it to initialize (~5-10 minutes)

---

## Step 2: Get Your API Keys

Once your project is created:

1. Go to **Settings** (gear icon, bottom-left)
2. Click **API** in the left sidebar
3. You'll see your credentials:
   - **Project URL**: Copy this (your `VITE_SUPABASE_URL`)
   - **Anon Key**: Copy this (your `VITE_SUPABASE_ANON_KEY`)
   - **Service Role Key**: Save this securely (only for backend/admin operations)

---

## Step 3: Set Up Environment Variables

Create a `.env.local` file in `/workspaces/succms/succms/`:

```bash
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**DO NOT commit `.env.local` to git** - add it to `.gitignore`.

---

## Step 4: Install Dependencies

```bash
cd /workspaces/succms/succms
npm install
```

This will install the Supabase packages we added to `package.json`:
- `@supabase/supabase-js`
- `@supabase/auth-helpers-react`

---

## Step 5: Run the SQL Migration

1. In your Supabase dashboard, go to **SQL Editor** (top-left)
2. Click **"New query"**
3. Copy the entire contents of `/workspaces/succms/succms/supabase/schema.sql`
4. Paste it into the SQL editor
5. Click **"Run"** (Execute button)

This will create:
- All database tables
- Relationships and constraints
- Row-Level Security (RLS) policies
- Indexes for performance
- Triggers and functions
- Views for easier querying

⚠️ **Important**: If you get errors, it may be because the schema includes some Postgres-specific extensions. The key tables should still be created.

---

## Step 6: Enable Authentication

1. In your Supabase dashboard, go to **Authentication** (left sidebar)
2. Click **"Providers"**
3. Enable **Email** (should be enabled by default)
4. Optional: Enable Google, GitHub for social auth
5. Go to **Policies** and verify:
   - **Disable sign ups** if you want to control who registers
   - Or **Enable sign ups** with **Email confirmation** for production

---

## Step 7: Set Up RLS Policies (Already Included in Schema)

The `schema.sql` file includes all necessary RLS policies:

- **Students** can only see their own grades, attendance, and submissions
- **Lecturers** can view their courses, submissions, and mark attendance
- **Admins** can view and manage everything
- **Public viewing** for posts, announcements, and leaderboards (with authentication required)

These policies ensure security without additional configuration.

---

## Step 8: Integrate Auth into React

### A. Update `main.tsx`

Replace your `src/main.tsx` with:

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { AuthProvider } from '@/contexts/AuthContext.tsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>,
)
```

### B. Update `App.tsx`

Modify your `App.tsx` to use the `useAuth` hook:

```tsx
import { useAuth } from '@/contexts/AuthContext'

export default function App() {
  const { user, profile, isLoading, isAuthenticated, userRole } = useAuth()

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Login />
  }

  return (
    <div>
      {/* Your authenticated app content */}
      {userRole === 'student' && <StudentDashboard />}
      {userRole === 'lecturer' && <LecturerDashboard />}
      {userRole === 'admin' && <AdminDashboard />}
    </div>
  )
}
```

### C. Update `Login.tsx`

Add Supabase sign-up and sign-in:

```tsx
import { useAuth } from '@/contexts/AuthContext'

export function Login() {
  const { signIn, signUp } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'student' | 'lecturer'>('student')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSignUp) {
      const { data, error } = await signUp(email, password, fullName, role)
      if (error) {
        console.error('Sign up error:', error.message)
      } else {
        console.log('Sign up successful:', data)
      }
    } else {
      const { data, error } = await signIn(email, password)
      if (error) {
        console.error('Sign in error:', error.message)
      } else {
        console.log('Signed in:', data)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {isSignUp && (
        <>
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <select value={role} onChange={(e) => setRole(e.target.value as any)}>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
          </select>
        </>
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">{isSignUp ? 'Sign Up' : 'Sign In'}</button>
      <button
        type="button"
        onClick={() => setIsSignUp(!isSignUp)}
      >
        {isSignUp ? 'Already have an account?' : 'Need an account?'}
      </button>
    </form>
  )
}
```

---

## Step 9: Test the Integration

1. Start the dev server:
   ```bash
   cd /workspaces/succms/succms
   npm run dev
   ```

2. Try signing up with an email and password
3. Check the Supabase **Auth** section to see the new user
4. Check the **user_profiles** table in the SQL Editor to verify the profile was created

---

## Common Database Operations

### Create a Course (Lecturer)

```ts
import { supabase } from '@/lib/supabase'

const createCourse = async (courseData) => {
  const { data, error } = await supabase
    .from('courses')
    .insert([{
      code: 'CS301',
      name: 'Database Systems',
      description: 'Learn database design and SQL',
      lecturer_id: userId,
      semester: 'Spring 2024',
    }])
    .select()

  if (error) console.error(error)
  return data
}
```

### Enroll a Student in a Course

```ts
const enrollStudent = async (courseId: string, studentId: string) => {
  const { data, error } = await supabase
    .from('course_enrollments')
    .insert([{ course_id: courseId, student_id: studentId }])
    .select()

  if (error) console.error(error)
  return data
}
```

### Submit an Assignment

```ts
const submitAssignment = async (assignmentId: string, studentId: string, submissionFile: string) => {
  const { data, error } = await supabase
    .from('assignment_submissions')
    .insert([{
      assignment_id: assignmentId,
      student_id: studentId,
      submission_file_url: submissionFile,
    }])
    .select()

  if (error) console.error(error)
  return data
}
```

### Create a Forum Post

```ts
const createPost = async (courseId: string, authorId: string, title: string, content: string) => {
  const { data, error } = await supabase
    .from('posts')
    .insert([{
      course_id: courseId,
      author_id: authorId,
      title,
      content,
    }])
    .select()

  if (error) console.error(error)
  return data
}
```

### Get User Leaderboard Ranking

```ts
const getLeaderboard = async (courseId?: string) => {
  let query = supabase.from('leaderboard').select('*')
  
  if (courseId) {
    query = query.eq('course_id', courseId)
  }
  
  const { data, error } = await query.order('rank', { ascending: true })

  if (error) console.error(error)
  return data
}
```

---

## File Structure

```
/workspaces/succms/succms/
├── supabase/
│   └── schema.sql          # Complete database schema
├── src/
│   ├── lib/
│   │   └── supabase.ts     # Supabase client configuration
│   ├── contexts/
│   │   └── AuthContext.tsx # Auth provider and useAuth hook
│   ├── App.tsx             # Main app (update to use useAuth)
│   ├── main.tsx            # Entry point (update to wrap with AuthProvider)
│   └── components/
│       ├── Login.tsx       # Login form (update to use Supabase)
│       └── ...other components
├── .env.local              # Environment variables (NOT in git)
└── package.json            # Updated with Supabase packages
```

---

## Troubleshooting

### Issue: "Cannot find module '@supabase/supabase-js'"

**Solution**: Run `npm install` again to ensure packages are installed.

### Issue: RLS policies are blocking access

**Solution**: Check the Supabase **Authentication** → **Policies** section. Verify that your user role matches the policy conditions.

### Issue: Data not appearing in tables

**Solution**: 
1. Check that RLS is enabled correctly
2. Verify the user's role in the `user_profiles` table
3. Check Supabase **Logs** (Settings → Logs) for specific errors

### Issue: "unauthorized" or "403" errors

**Solution**: 
1. Verify your `VITE_SUPABASE_ANON_KEY` is correct in `.env.local`
2. Check RLS policies allow the action
3. Ensure the user is authenticated

---

## Next Steps

1. **Customize RLS policies** based on your specific security needs
2. **Add storage** for file uploads (course materials, assignment submissions)
3. **Create functions** for automated GPA calculations
4. **Set up notifications** using Supabase Realtime
5. **Deploy** to production with environment variables configured

---

## Database Schema Summary

| Table | Purpose |
|-------|---------|
| `user_profiles` | User data with roles |
| `courses` | Course information |
| `course_enrollments` | Student-course relationships |
| `assignments` | Assignment details |
| `assignment_submissions` | Student submissions |
| `student_grades` | Grade records |
| `attendance` | Attendance tracking |
| `posts` | Forum posts |
| `post_comments` | Post replies |
| `post_likes` | Post engagement |
| `reactions` | Emoji reactions |
| `stories` | Temporary user stories |
| `announcements` | Admin announcements |
| `leaderboard` | Student rankings |

---

## Support & Documentation

- [Supabase Official Docs](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Realtime Database](https://supabase.com/docs/guides/realtime)

