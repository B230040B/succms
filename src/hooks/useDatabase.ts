import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase.ts';
import { useAuth } from '@/contexts/AuthContext.tsx';

// Hook to fetch courses for a user
export function useCourses(userId?: string) {
  const [courses, setCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setIsLoading(true);
        let query = supabase.from('courses').select('*');

        if (profile?.role === 'student') {
          // Students see courses they're enrolled in
          query = supabase
            .from('course_enrollments')
            .select('courses(*)')
            .eq('student_id', user?.id);
        } else if (profile?.role === 'lecturer') {
          // Lecturers see their own courses
          query = query.eq('lecturer_id', user?.id);
        }
        // Admins see all courses

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        if (profile?.role === 'student' && Array.isArray(data)) {
          // Flatten the nested courses
          const flattenedCourses = data.map((enrollment: any) => enrollment.courses).filter(Boolean);
          setCourses(flattenedCourses);
        } else {
          setCourses(data || []);
        }
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchCourses();
    }
  }, [user, userId, profile?.role]);

  return { courses, isLoading, error };
}

// Hook to fetch assignments for a course
export function useAssignments(courseId: string) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('assignments')
          .select('*')
          .eq('course_id', courseId)
          .order('due_date', { ascending: true });

        if (fetchError) throw fetchError;
        setAssignments(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  return { assignments, isLoading, error };
}

// Hook to fetch student grades
export function useStudentGrades(studentId?: string) {
  const [grades, setGrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchGrades = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('student_grades')
          .select('*')
          .eq('student_id', studentId || user?.id)
          .order('graded_at', { ascending: false });

        if (fetchError) throw fetchError;
        setGrades(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId || user) {
      fetchGrades();
    }
  }, [studentId, user?.id]);

  return { grades, isLoading, error };
}

// Hook to fetch forum posts
export function usePosts(courseId?: string) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        let query = supabase.from('posts').select('*');

        if (courseId) {
          query = query.eq('course_id', courseId);
        }

        const { data, error: fetchError } = await query
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setPosts(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [courseId]);

  return { posts, isLoading, error };
}

// Hook to fetch active stories
export function useActiveStories() {
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('active_stories_summary')
          .select('*')
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setStories(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStories();

    // Refresh stories every 30 seconds to check for expiration
    const interval = setInterval(fetchStories, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stories, isLoading, error };
}

// Hook to fetch leaderboard
export function useLeaderboard(courseId?: string) {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setIsLoading(true);
        let query = supabase.from('leaderboard').select('*');

        if (courseId) {
          query = query.eq('course_id', courseId);
        } else {
          query = query.is('course_id', null); // Overall leaderboard
        }

        const { data, error: fetchError } = await query
          .order('rank', { ascending: true });

        if (fetchError) throw fetchError;
        setLeaderboard(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [courseId]);

  return { leaderboard, isLoading, error };
}

// Hook to fetch announcements
export function useAnnouncements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('announcements')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setAnnouncements(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnnouncements();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('announcements')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'announcements' },
        (payload) => {
          fetchAnnouncements();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { announcements, isLoading, error };
}

// Hook for real-time post updates
export function useRealtimePosts(courseId?: string) {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    const fetchInitialPosts = async () => {
      try {
        setIsLoading(true);
        let query = supabase.from('posts').select('*');

        if (courseId) {
          query = query.eq('course_id', courseId);
        }

        const { data, error: fetchError } = await query
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setPosts(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialPosts();

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('posts')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posts' },
        (payload) => {
          fetchInitialPosts();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [courseId]);

  return { posts, isLoading, error };
}

// Hook for creating/managing user stories
export function useUserStories(userId?: string) {
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setIsLoading(true);
        const { data, error: fetchError } = await supabase
          .from('stories')
          .select('*')
          .eq('user_id', userId || user?.id)
          .eq('is_active', true)
          .gt('expires_at', new Date().toISOString())
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setStories(data || []);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId || user) {
      fetchStories();
    }
  }, [userId, user?.id]);

  const createStory = async (contentData: any) => {
    try {
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now
      const { data, error: createError } = await supabase
        .from('stories')
        .insert([{
          user_id: user?.id,
          ...contentData,
          expires_at: expiresAt.toISOString(),
        }])
        .select();

      if (createError) throw createError;
      return { data, error: null };
    } catch (err) {
      return { data: null, error: err };
    }
  };

  return { stories, isLoading, error, createStory };
}
