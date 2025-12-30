# SUCCMS Supabase Implementation Examples

This file contains ready-to-use code snippets for implementing various features with Supabase.

---

## 1. Login/Sign-Up Component Integration

### Update your Login.tsx

```tsx
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'student' | 'lecturer'>('student');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          setError(error.message || 'Sign up failed');
        } else {
          setError('Check your email to confirm your account');
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          setError(error.message || 'Sign in failed');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 border rounded-lg">
      <h2 className="text-2xl font-bold mb-6">
        {isSignUp ? 'Create Account' : 'Sign In'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp && (
          <>
            <input
              type="text"
              placeholder="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full p-2 border rounded"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as any)}
              className="w-full p-2 border rounded"
            >
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
          className="w-full p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          disabled={isLoading}
          className="w-full p-2 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
      </form>

      <button
        onClick={() => setIsSignUp(!isSignUp)}
        className="mt-4 text-blue-600 hover:underline"
      >
        {isSignUp
          ? 'Already have an account? Sign in'
          : 'Need an account? Sign up'}
      </button>
    </div>
  );
}
```

---

## 2. Course Management (Lecturer)

### Create a Course

```tsx
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function CreateCourse() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    semester: '',
    credits: 3,
  });

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase
      .from('courses')
      .insert([
        {
          ...formData,
          lecturer_id: user?.id,
        },
      ])
      .select();

    if (error) {
      console.error('Error creating course:', error);
    } else {
      console.log('Course created:', data);
      // Reset form or redirect
    }
  };

  return (
    <form onSubmit={handleCreateCourse} className="space-y-4">
      <input
        type="text"
        placeholder="Course Code (e.g., CS301)"
        value={formData.code}
        onChange={(e) =>
          setFormData({ ...formData, code: e.target.value })
        }
        required
      />
      <input
        type="text"
        placeholder="Course Name"
        value={formData.name}
        onChange={(e) =>
          setFormData({ ...formData, name: e.target.value })
        }
        required
      />
      <textarea
        placeholder="Course Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Semester (e.g., Spring 2024)"
        value={formData.semester}
        onChange={(e) =>
          setFormData({ ...formData, semester: e.target.value })
        }
      />
      <input
        type="number"
        placeholder="Credits"
        value={formData.credits}
        onChange={(e) =>
          setFormData({ ...formData, credits: parseInt(e.target.value) })
        }
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Create Course
      </button>
    </form>
  );
}
```

### Enroll a Student

```tsx
export function EnrollStudent({ courseId }: { courseId: string }) {
  const [studentEmail, setStudentEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEnroll = async () => {
    setIsLoading(true);
    try {
      // First, get the student by email
      const { data: studentData, error: studentError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('email', studentEmail)
        .single();

      if (studentError) throw studentError;

      // Then enroll them
      const { error: enrollError } = await supabase
        .from('course_enrollments')
        .insert([
          {
            course_id: courseId,
            student_id: studentData.id,
          },
        ]);

      if (enrollError) throw enrollError;
      console.log('Student enrolled successfully');
      setStudentEmail('');
    } catch (error) {
      console.error('Error enrolling student:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="email"
        placeholder="Student email"
        value={studentEmail}
        onChange={(e) => setStudentEmail(e.target.value)}
      />
      <button
        onClick={handleEnroll}
        disabled={isLoading}
        className="px-4 py-2 bg-green-600 text-white rounded disabled:opacity-50"
      >
        {isLoading ? 'Enrolling...' : 'Enroll Student'}
      </button>
    </div>
  );
}
```

---

## 3. Assignments

### Create an Assignment

```tsx
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function CreateAssignment({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    max_score: 100,
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('assignments')
      .insert([
        {
          ...formData,
          course_id: courseId,
          created_by: user?.id,
          due_date: new Date(formData.due_date).toISOString(),
        },
      ]);

    if (error) {
      console.error('Error creating assignment:', error);
    } else {
      console.log('Assignment created');
      // Reset form
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-4">
      <input
        type="text"
        placeholder="Assignment Title"
        value={formData.title}
        onChange={(e) =>
          setFormData({ ...formData, title: e.target.value })
        }
        required
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />
      <input
        type="datetime-local"
        value={formData.due_date}
        onChange={(e) =>
          setFormData({ ...formData, due_date: e.target.value })
        }
        required
      />
      <input
        type="number"
        placeholder="Max Score"
        value={formData.max_score}
        onChange={(e) =>
          setFormData({ ...formData, max_score: parseInt(e.target.value) })
        }
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Create Assignment
      </button>
    </form>
  );
}
```

### Grade a Submission

```tsx
export function GradeSubmission({
  submissionId,
  courseId,
}: {
  submissionId: string;
  courseId: string;
}) {
  const { user } = useAuth();
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleGrade = async () => {
    const { error } = await supabase
      .from('student_grades')
      .insert([
        {
          score: parseInt(score),
          feedback,
          graded_by: user?.id,
          course_id: courseId,
        },
      ]);

    if (error) {
      console.error('Error grading submission:', error);
    } else {
      console.log('Submission graded');
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded">
      <input
        type="number"
        placeholder="Score"
        value={score}
        onChange={(e) => setScore(e.target.value)}
        max={100}
      />
      <textarea
        placeholder="Feedback"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <button
        onClick={handleGrade}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        Submit Grade
      </button>
    </div>
  );
}
```

---

## 4. Forum/Posts

### Create a Post

```tsx
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function CreatePost({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('posts')
      .insert([
        {
          course_id: courseId,
          author_id: user?.id,
          title,
          content,
        },
      ]);

    if (error) {
      console.error('Error creating post:', error);
    } else {
      setTitle('');
      setContent('');
      console.log('Post created');
    }
  };

  return (
    <form onSubmit={handleCreatePost} className="space-y-4 p-4 border rounded">
      <input
        type="text"
        placeholder="Post Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
        className="w-full p-2 border rounded"
      />
      <textarea
        placeholder="Write your post..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
        className="w-full p-2 border rounded"
        rows={5}
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Post
      </button>
    </form>
  );
}
```

### Like/React to a Post

```tsx
export function PostReactions({ postId }: { postId: string }) {
  const { user } = useAuth();
  const [reactions, setReactions] = useState<string[]>([]);

  const handleReaction = async (reactionType: string) => {
    const { error } = await supabase
      .from('reactions')
      .insert([
        {
          post_id: postId,
          user_id: user?.id,
          reaction_type: reactionType,
        },
      ]);

    if (error) {
      console.error('Error adding reaction:', error);
    } else {
      setReactions([...reactions, reactionType]);
    }
  };

  return (
    <div className="flex gap-2">
      {['👍', '❤️', '😂', '😢', '🔥'].map((emoji) => (
        <button
          key={emoji}
          onClick={() => handleReaction(emoji)}
          className="text-2xl hover:scale-125 transition"
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
```

---

## 5. Stories Integration

### Create a Story

```tsx
import { useUserStories } from '@/hooks/useDatabase';
import { useAuth } from '@/contexts/AuthContext';

export function CreateStory() {
  const { user } = useAuth();
  const { createStory } = useUserStories();
  const [content, setContent] = useState('');
  const [type, setType] = useState<'text' | 'image'>('text');

  const handleCreateStory = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await createStory({
      content,
      content_type: type,
      title: 'My Story',
    });

    if (error) {
      console.error('Error creating story:', error);
    } else {
      setContent('');
      console.log('Story created');
    }
  };

  return (
    <form onSubmit={handleCreateStory} className="space-y-4">
      <select
        value={type}
        onChange={(e) => setType(e.target.value as any)}
      >
        <option value="text">Text</option>
        <option value="image">Image</option>
      </select>
      <textarea
        placeholder="What's on your mind?"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Post Story
      </button>
    </form>
  );
}
```

### View and Auto-Progress Stories (Already Integrated)

The Stories component should now:
- Display all active stories
- Auto-progress after 5 seconds
- Allow manual navigation
- Show a working close (X) button
- Mark stories as viewed

---

## 6. Announcements (Admin Only)

### Create Announcement

```tsx
export function CreateAnnouncement() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
  });

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase
      .from('announcements')
      .insert([
        {
          ...formData,
          admin_id: user?.id,
          is_active: true,
        },
      ]);

    if (error) {
      console.error('Error creating announcement:', error);
    } else {
      console.log('Announcement created');
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-4 p-4 border rounded">
      <input
        type="text"
        placeholder="Announcement Title"
        value={formData.title}
        onChange={(e) =>
          setFormData({ ...formData, title: e.target.value })
        }
        required
      />
      <textarea
        placeholder="Announcement Content"
        value={formData.content}
        onChange={(e) =>
          setFormData({ ...formData, content: e.target.value })
        }
        required
      />
      <select
        value={formData.priority}
        onChange={(e) =>
          setFormData({
            ...formData,
            priority: e.target.value as any,
          })
        }
      >
        <option value="low">Low Priority</option>
        <option value="medium">Medium Priority</option>
        <option value="high">High Priority</option>
      </select>
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Post Announcement
      </button>
    </form>
  );
}
```

---

## 7. Leaderboard

### Display Leaderboard

```tsx
import { useLeaderboard } from '@/hooks/useDatabase';

export function Leaderboard({ courseId }: { courseId?: string }) {
  const { leaderboard, isLoading } = useLeaderboard(courseId);

  if (isLoading) return <div>Loading leaderboard...</div>;

  return (
    <div className="p-4 border rounded">
      <h2 className="text-2xl font-bold mb-4">
        {courseId ? 'Course Leaderboard' : 'Overall Leaderboard'}
      </h2>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Rank</th>
            <th className="text-left py-2">Student</th>
            <th className="text-right py-2">Average Score</th>
            <th className="text-right py-2">Attendance</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((entry, index) => (
            <tr key={entry.id} className="border-b hover:bg-gray-50">
              <td className="py-2">{index + 1}</td>
              <td>{entry.student_id}</td>
              <td className="text-right">{entry.average_score}%</td>
              <td className="text-right">{entry.attendance_percentage}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## 8. Real-time Subscriptions

### Subscribe to Live Course Updates

```tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export function useRealtimeCourse(courseId: string) {
  const [course, setCourse] = useState<any>(null);

  useEffect(() => {
    // Initial fetch
    const fetchCourse = async () => {
      const { data } = await supabase
        .from('courses')
        .select('*')
        .eq('id', courseId)
        .single();
      setCourse(data);
    };

    fetchCourse();

    // Subscribe to changes
    const subscription = supabase
      .channel(`course:${courseId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'courses',
          filter: `id=eq.${courseId}`,
        },
        (payload) => {
          setCourse(payload.new);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [courseId]);

  return course;
}
```

---

## 9. File Uploads (Course Materials)

```tsx
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function UploadMaterial({ courseId }: { courseId: string }) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload file to storage
      const { data: storageData, error: storageError } = await supabase
        .storage
        .from('course-materials')
        .upload(
          `${courseId}/${Date.now()}-${file.name}`,
          file
        );

      if (storageError) throw storageError;

      // Create material record
      const { error: dbError } = await supabase
        .from('course_materials')
        .insert([
          {
            course_id: courseId,
            title,
            file_url: storageData.path,
            file_type: file.type,
            uploaded_by: user?.id,
          },
        ]);

      if (dbError) throw dbError;
      console.log('Material uploaded successfully');
      setFile(null);
      setTitle('');
    } catch (error) {
      console.error('Error uploading material:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleUpload} className="space-y-4 p-4 border rounded">
      <input
        type="text"
        placeholder="Material Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        required
      />
      <button
        type="submit"
        disabled={isUploading}
        className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {isUploading ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}
```

---

## 10. User Profile Updates

```tsx
import { useAuth } from '@/contexts/AuthContext';

export function UpdateProfile() {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || '',
    bio: profile?.bio || '',
    avatar_url: profile?.avatar_url || '',
    program_or_department: profile?.program_or_department || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await updateProfile(formData);
    if (error) {
      console.error('Error updating profile:', error);
    } else {
      console.log('Profile updated successfully');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded">
      <input
        type="text"
        placeholder="Full Name"
        value={formData.full_name}
        onChange={(e) =>
          setFormData({ ...formData, full_name: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Program/Department"
        value={formData.program_or_department}
        onChange={(e) =>
          setFormData({
            ...formData,
            program_or_department: e.target.value,
          })
        }
      />
      <textarea
        placeholder="Bio"
        value={formData.bio}
        onChange={(e) =>
          setFormData({ ...formData, bio: e.target.value })
        }
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Update Profile
      </button>
    </form>
  );
}
```

---

## Usage in Components

```tsx
import { useCourses, useAssignments } from '@/hooks/useDatabase';

export function Dashboard() {
  const { courses, isLoading } = useCourses();
  const { assignments } = useAssignments(courses[0]?.id);

  return (
    <div>
      <h1>My Courses</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <ul>
          {courses.map((course) => (
            <li key={course.id}>{course.name}</li>
          ))}
        </ul>
      )}

      {assignments.map((assignment) => (
        <div key={assignment.id}>
          <h3>{assignment.title}</h3>
          <p>Due: {new Date(assignment.due_date).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}
```

---

All these examples integrate seamlessly with your existing React app and Supabase setup!
