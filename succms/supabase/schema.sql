-- SUCCMS Learn 4.0 - Complete Database Schema
-- This schema supports user authentication, courses, assignments, posts, stories, and leaderboards

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS & AUTHENTICATION
-- ============================================================================

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('student', 'lecturer', 'admin')),
  program_or_department TEXT, -- e.g., "Computer Science" or "Faculty of Engineering"
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ
);

-- ============================================================================
-- COURSES & ASSIGNMENTS
-- ============================================================================

-- Courses table
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL, -- e.g., "CS301"
  name TEXT NOT NULL,
  description TEXT,
  lecturer_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  semester TEXT, -- e.g., "Spring 2024"
  credits INTEGER DEFAULT 3,
  max_students INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Course enrollments (students enrolled in courses)
CREATE TABLE IF NOT EXISTS public.course_enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, student_id)
);

-- Course materials (documents, videos, etc.)
CREATE TABLE IF NOT EXISTS public.course_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  file_url TEXT NOT NULL,
  file_type TEXT, -- e.g., "pdf", "video", "document"
  uploaded_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  downloads_count INTEGER DEFAULT 0
);

-- Assignments
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  due_date TIMESTAMPTZ NOT NULL,
  max_score INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  submission_file_url TEXT,
  submission_text TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_late BOOLEAN DEFAULT FALSE,
  UNIQUE(assignment_id, student_id)
);

-- ============================================================================
-- GRADES & ATTENDANCE
-- ============================================================================

-- Student grades
CREATE TABLE IF NOT EXISTS public.student_grades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE SET NULL,
  score INTEGER NOT NULL,
  max_score INTEGER DEFAULT 100,
  graded_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  feedback TEXT,
  graded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(course_id, student_id, assignment_id)
);

-- Attendance tracking
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  class_date DATE NOT NULL,
  marked_present BOOLEAN DEFAULT FALSE,
  marked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  marked_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  UNIQUE(course_id, student_id, class_date)
);

-- Student GPA summary (cached for performance)
CREATE TABLE IF NOT EXISTS public.student_gpa (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  gpa DECIMAL(3, 2) DEFAULT 0.0,
  total_credits INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- POSTS, COMMENTS, LIKES & REACTIONS
-- ============================================================================

-- Forum posts
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  is_pinned BOOLEAN DEFAULT FALSE,
  is_locked BOOLEAN DEFAULT FALSE
);

-- Comments on posts
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  parent_comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE, -- For nested replies
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Likes on posts
CREATE TABLE IF NOT EXISTS public.post_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Reactions on posts/comments (emoji reactions)
CREATE TABLE IF NOT EXISTS public.reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES public.post_comments(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL, -- e.g., "👍", "❤️", "😂", "😢", "🔥"
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK ((post_id IS NOT NULL AND comment_id IS NULL) OR (post_id IS NULL AND comment_id IS NOT NULL)),
  UNIQUE(post_id, comment_id, user_id, reaction_type)
);

-- Post views tracking
CREATE TABLE IF NOT EXISTS public.post_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ============================================================================
-- STORIES
-- ============================================================================

-- User stories (Instagram-like stories that expire after 24 hours)
CREATE TABLE IF NOT EXISTS public.stories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  content_type TEXT NOT NULL CHECK (content_type IN ('image', 'video', 'text', 'assignment', 'grade', 'course')),
  media_url TEXT,
  title TEXT,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL, -- 24 hours from creation
  is_active BOOLEAN DEFAULT TRUE
);

-- Story views
CREATE TABLE IF NOT EXISTS public.story_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  story_id UUID NOT NULL REFERENCES public.stories(id) ON DELETE CASCADE,
  viewed_by UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(story_id, viewed_by)
);

-- ============================================================================
-- ANNOUNCEMENTS
-- ============================================================================

-- Admin announcements
CREATE TABLE IF NOT EXISTS public.announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE
);

-- Announcement reads (track who has read which announcement)
CREATE TABLE IF NOT EXISTS public.announcement_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID NOT NULL REFERENCES public.announcements(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(announcement_id, user_id)
);

-- ============================================================================
-- LEADERBOARD
-- ============================================================================

-- Leaderboard (cached table for performance)
CREATE TABLE IF NOT EXISTS public.leaderboard (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID UNIQUE NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE, -- NULL for overall leaderboard
  average_score DECIMAL(5, 2) DEFAULT 0.0,
  rank INTEGER,
  total_assignments_completed INTEGER DEFAULT 0,
  attendance_percentage DECIMAL(5, 2) DEFAULT 0.0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_courses_lecturer_id ON public.courses(lecturer_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_student_id ON public.course_enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_course_id ON public.course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignment_submissions_student_id ON public.assignment_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_student_id ON public.student_grades(student_id);
CREATE INDEX IF NOT EXISTS idx_student_grades_course_id ON public.student_grades(course_id);
CREATE INDEX IF NOT EXISTS idx_attendance_student_id ON public.attendance(student_id);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON public.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_course_id ON public.posts(course_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_reactions_post_id ON public.reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_stories_user_id ON public.stories(user_id);
CREATE INDEX IF NOT EXISTS idx_stories_expires_at ON public.stories(expires_at);
CREATE INDEX IF NOT EXISTS idx_story_views_story_id ON public.story_views(story_id);
CREATE INDEX IF NOT EXISTS idx_announcements_admin_id ON public.announcements(admin_id);
CREATE INDEX IF NOT EXISTS idx_leaderboard_student_id ON public.leaderboard(student_id);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_gpa ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.story_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

-- USER_PROFILES RLS Policies
-- Users can view all profiles
CREATE POLICY "Allow all authenticated users to view user profiles"
  ON public.user_profiles FOR SELECT
  USING (auth.role() = 'authenticated');

-- Users can update their own profile
CREATE POLICY "Allow users to update their own profile"
  ON public.user_profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only admins can insert new profiles (via trigger on auth.users)
CREATE POLICY "Allow admins to manage profiles"
  ON public.user_profiles FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM public.user_profiles WHERE role = 'admin'
    )
  );

-- COURSES RLS Policies
-- All authenticated users can view courses
CREATE POLICY "Allow all authenticated users to view courses"
  ON public.courses FOR SELECT
  USING (auth.role() = 'authenticated');

-- Lecturers can create and edit their own courses
CREATE POLICY "Allow lecturers to manage their courses"
  ON public.courses FOR ALL
  USING (
    auth.uid() = lecturer_id OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- COURSE_ENROLLMENTS RLS Policies
-- Students can view their own enrollments
CREATE POLICY "Allow students to view their enrollments"
  ON public.course_enrollments FOR SELECT
  USING (
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT lecturer_id FROM public.courses WHERE id = course_id
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- Students can enroll themselves, lecturers can enroll students
CREATE POLICY "Allow students and lecturers to manage enrollments"
  ON public.course_enrollments FOR INSERT
  WITH CHECK (
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT lecturer_id FROM public.courses WHERE id = course_id
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- COURSE_MATERIALS RLS Policies
-- All authenticated users can view course materials if enrolled
CREATE POLICY "Allow enrolled students and lecturers to view materials"
  ON public.course_materials FOR SELECT
  USING (
    auth.uid() IN (
      SELECT student_id FROM public.course_enrollments WHERE course_id = course_id
    ) OR
    auth.uid() IN (
      SELECT lecturer_id FROM public.courses WHERE id = course_id
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- Only uploaders and lecturers can insert/update materials
CREATE POLICY "Allow lecturers to manage materials"
  ON public.course_materials FOR ALL
  USING (
    auth.uid() = uploaded_by OR
    auth.uid() IN (
      SELECT lecturer_id FROM public.courses WHERE id = course_id
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- ASSIGNMENTS RLS Policies
-- All authenticated users can view assignments for enrolled courses
CREATE POLICY "Allow enrolled users to view assignments"
  ON public.assignments FOR SELECT
  USING (
    auth.uid() IN (
      SELECT student_id FROM public.course_enrollments WHERE course_id = course_id
    ) OR
    auth.uid() IN (
      SELECT lecturer_id FROM public.courses WHERE id = course_id
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- Lecturers can create and edit assignments for their courses
CREATE POLICY "Allow lecturers to manage assignments"
  ON public.assignments FOR ALL
  USING (
    auth.uid() IN (
      SELECT lecturer_id FROM public.courses WHERE id = course_id
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- ASSIGNMENT_SUBMISSIONS RLS Policies
-- Students can view their own submissions
CREATE POLICY "Allow students to view their submissions"
  ON public.assignment_submissions FOR SELECT
  USING (
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT created_by FROM public.assignments WHERE id = assignment_id
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- Students can submit assignments
CREATE POLICY "Allow students to submit assignments"
  ON public.assignment_submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own submissions
CREATE POLICY "Allow students to update their submissions"
  ON public.assignment_submissions FOR UPDATE
  USING (auth.uid() = student_id)
  WITH CHECK (auth.uid() = student_id);

-- STUDENT_GRADES RLS Policies
-- Students can view their own grades
CREATE POLICY "Allow students to view their grades"
  ON public.student_grades FOR SELECT
  USING (
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT lecturer_id FROM public.courses WHERE id = course_id
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- Lecturers can create and update grades
CREATE POLICY "Allow lecturers to manage grades"
  ON public.student_grades FOR ALL
  USING (
    auth.uid() = graded_by OR
    auth.uid() IN (
      SELECT lecturer_id FROM public.courses WHERE id = course_id
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- ATTENDANCE RLS Policies
-- Students can view their own attendance
CREATE POLICY "Allow students to view their attendance"
  ON public.attendance FOR SELECT
  USING (
    auth.uid() = student_id OR
    auth.uid() IN (
      SELECT lecturer_id FROM public.courses WHERE id = course_id
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- Lecturers can mark attendance
CREATE POLICY "Allow lecturers to mark attendance"
  ON public.attendance FOR ALL
  USING (
    auth.uid() IN (
      SELECT lecturer_id FROM public.courses WHERE id = course_id
    ) OR
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- POSTS RLS Policies
-- All authenticated users can view posts
CREATE POLICY "Allow all authenticated users to view posts"
  ON public.posts FOR SELECT
  USING (auth.role() = 'authenticated');

-- Any authenticated user can create posts
CREATE POLICY "Allow authenticated users to create posts"
  ON public.posts FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Allow users to update their own posts"
  ON public.posts FOR UPDATE
  USING (auth.uid() = author_id OR auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() = author_id OR auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin'));

-- POST_COMMENTS RLS Policies
-- All authenticated users can view comments
CREATE POLICY "Allow all authenticated users to view comments"
  ON public.post_comments FOR SELECT
  USING (auth.role() = 'authenticated');

-- Any authenticated user can create comments
CREATE POLICY "Allow authenticated users to create comments"
  ON public.post_comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own comments
CREATE POLICY "Allow users to update their own comments"
  ON public.post_comments FOR UPDATE
  USING (auth.uid() = author_id OR auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin'))
  WITH CHECK (auth.uid() = author_id OR auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin'));

-- POST_LIKES RLS Policies
-- All authenticated users can view post likes
CREATE POLICY "Allow all authenticated users to view likes"
  ON public.post_likes FOR SELECT
  USING (auth.role() = 'authenticated');

-- Any authenticated user can like posts
CREATE POLICY "Allow authenticated users to like posts"
  ON public.post_likes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own likes
CREATE POLICY "Allow users to remove their own likes"
  ON public.post_likes FOR DELETE
  USING (auth.uid() = user_id);

-- REACTIONS RLS Policies
-- All authenticated users can view reactions
CREATE POLICY "Allow all authenticated users to view reactions"
  ON public.reactions FOR SELECT
  USING (auth.role() = 'authenticated');

-- Any authenticated user can add reactions
CREATE POLICY "Allow authenticated users to add reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can remove their own reactions
CREATE POLICY "Allow users to remove their own reactions"
  ON public.reactions FOR DELETE
  USING (auth.uid() = user_id);

-- POST_VIEWS RLS Policies
-- Users can record their own post views
CREATE POLICY "Allow users to record post views"
  ON public.post_views FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- STORIES RLS Policies
-- All authenticated users can view active stories
CREATE POLICY "Allow all authenticated users to view active stories"
  ON public.stories FOR SELECT
  USING (
    auth.role() = 'authenticated' AND 
    is_active = TRUE AND 
    expires_at > NOW()
  );

-- Users can create their own stories
CREATE POLICY "Allow users to create their own stories"
  ON public.stories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own stories
CREATE POLICY "Allow users to update their own stories"
  ON public.stories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- STORY_VIEWS RLS Policies
-- Users can record their own story views
CREATE POLICY "Allow users to record story views"
  ON public.story_views FOR INSERT
  WITH CHECK (auth.uid() = viewed_by);

-- Users can view their own story view records
CREATE POLICY "Allow users to view their own story views"
  ON public.story_views FOR SELECT
  USING (
    auth.uid() = viewed_by OR
    auth.uid() IN (
      SELECT user_id FROM public.stories WHERE id = story_id
    )
  );

-- ANNOUNCEMENTS RLS Policies
-- All authenticated users can view active announcements
CREATE POLICY "Allow all authenticated users to view announcements"
  ON public.announcements FOR SELECT
  USING (
    auth.role() = 'authenticated' AND 
    is_active = TRUE AND 
    (expires_at IS NULL OR expires_at > NOW())
  );

-- Only admins can manage announcements
CREATE POLICY "Allow admins to manage announcements"
  ON public.announcements FOR ALL
  USING (
    auth.uid() IN (SELECT id FROM public.user_profiles WHERE role = 'admin')
  );

-- ANNOUNCEMENT_READS RLS Policies
-- Users can record their own reads
CREATE POLICY "Allow users to record announcement reads"
  ON public.announcement_reads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own reads
CREATE POLICY "Allow users to view their own reads"
  ON public.announcement_reads FOR SELECT
  USING (auth.uid() = user_id);

-- LEADERBOARD RLS Policies
-- All authenticated users can view leaderboard
CREATE POLICY "Allow all authenticated users to view leaderboard"
  ON public.leaderboard FOR SELECT
  USING (auth.role() = 'authenticated');

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to all tables with updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at
  BEFORE UPDATE ON public.announcements
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to handle user creation (auto-insert into user_profiles)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Function to expire stories automatically
CREATE OR REPLACE FUNCTION public.expire_old_stories()
RETURNS void AS $$
BEGIN
  UPDATE public.stories
  SET is_active = FALSE
  WHERE expires_at <= NOW() AND is_active = TRUE;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VIEWS (for easier data access)
-- ============================================================================

-- View: Course summary with enrollment counts
CREATE OR REPLACE VIEW public.course_summary AS
SELECT
  c.id,
  c.code,
  c.name,
  c.lecturer_id,
  up.full_name as lecturer_name,
  COUNT(ce.id) as enrolled_students,
  c.created_at
FROM public.courses c
LEFT JOIN public.user_profiles up ON c.lecturer_id = up.id
LEFT JOIN public.course_enrollments ce ON c.id = ce.course_id
GROUP BY c.id, c.code, c.name, c.lecturer_id, up.full_name, c.created_at;

-- View: Student course summary with grades
CREATE OR REPLACE VIEW public.student_course_summary AS
SELECT
  c.id as course_id,
  c.code,
  c.name,
  up.full_name as lecturer_name,
  ce.student_id,
  COALESCE(AVG(sg.score), 0)::DECIMAL(5, 2) as average_score,
  COUNT(DISTINCT sg.id) as grades_received,
  MAX(sg.graded_at) as last_graded
FROM public.courses c
JOIN public.user_profiles up ON c.lecturer_id = up.id
JOIN public.course_enrollments ce ON c.id = ce.course_id
LEFT JOIN public.student_grades sg ON c.id = sg.course_id AND ce.student_id = sg.student_id
GROUP BY c.id, c.code, c.name, up.full_name, ce.student_id;

-- View: Post engagement summary
CREATE OR REPLACE VIEW public.post_engagement AS
SELECT
  p.id,
  p.title,
  p.author_id,
  COUNT(DISTINCT pl.id) as like_count,
  COUNT(DISTINCT pc.id) as comment_count,
  COUNT(DISTINCT pv.id) as view_count,
  MAX(GREATEST(p.created_at, COALESCE(MAX(pc.created_at), p.created_at))) as last_activity
FROM public.posts p
LEFT JOIN public.post_likes pl ON p.id = pl.post_id
LEFT JOIN public.post_comments pc ON p.id = pc.post_id
LEFT JOIN public.post_views pv ON p.id = pv.post_id
GROUP BY p.id, p.title, p.author_id;

-- View: Active stories with view counts
CREATE OR REPLACE VIEW public.active_stories_summary AS
SELECT
  s.id,
  s.user_id,
  up.full_name as user_name,
  s.content_type,
  s.created_at,
  s.expires_at,
  COUNT(DISTINCT sv.id) as view_count
FROM public.stories s
JOIN public.user_profiles up ON s.user_id = up.id
LEFT JOIN public.story_views sv ON s.id = sv.story_id
WHERE s.is_active = TRUE AND s.expires_at > NOW()
GROUP BY s.id, s.user_id, up.full_name, s.content_type, s.created_at, s.expires_at;

