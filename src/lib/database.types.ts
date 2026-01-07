// Supabase Database Types
// Auto-generated based on schema.sql

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          role: 'student' | 'lecturer' | 'admin';
          program_or_department: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
          is_active: boolean;
          last_login_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          role: 'student' | 'lecturer' | 'admin';
          program_or_department?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          last_login_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string;
          role?: 'student' | 'lecturer' | 'admin';
          program_or_department?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
          is_active?: boolean;
          last_login_at?: string | null;
        };
      };
      courses: {
        Row: {
          id: string;
          code: string;
          name: string;
          chinese_name: string | null;
          faculty: string | null;
          programme: string | null;
          course_type: 'common_core' | 'discipline_core' | 'elective_open' | 'elective_core' | null;
          credit_hours: number | null;
          max_capacity: number | null;
          enrollment_key: string | null;
          status: 'active' | 'unavailable' | 'full' | 'open' | null;
          semester: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          chinese_name?: string | null;
          faculty?: string | null;
          programme?: string | null;
          course_type?: 'common_core' | 'discipline_core' | 'elective_open' | 'elective_core' | null;
          credit_hours?: number | null;
          max_capacity?: number | null;
          enrollment_key?: string | null;
          status?: 'active' | 'unavailable' | 'full' | 'open' | null;
          semester?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          chinese_name?: string | null;
          faculty?: string | null;
          programme?: string | null;
          course_type?: 'common_core' | 'discipline_core' | 'elective_open' | 'elective_core' | null;
          credit_hours?: number | null;
          max_capacity?: number | null;
          enrollment_key?: string | null;
          status?: 'active' | 'unavailable' | 'full' | 'open' | null;
          semester?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      course_enrollments: {
        Row: {
          id: string;
          course_id: string;
          student_id: string;
          enrolled_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          student_id: string;
          enrolled_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          student_id?: string;
          enrolled_at?: string;
        };
      };
      assignments: {
        Row: {
          id: string;
          course_id: string;
          title: string;
          description: string | null;
          created_by: string;
          due_date: string;
          max_score: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          title: string;
          description?: string | null;
          created_by: string;
          due_date: string;
          max_score?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          title?: string;
          description?: string | null;
          created_by?: string;
          due_date?: string;
          max_score?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      assignment_submissions: {
        Row: {
          id: string;
          assignment_id: string;
          student_id: string;
          submission_file_url: string | null;
          submission_text: string | null;
          submitted_at: string;
          is_late: boolean;
          files: Array<{name: string, path: string}> | null;
          grade: number | null;
          feedback: string | null;
        };
        Insert: {
          id?: string;
          assignment_id: string;
          student_id: string;
          submission_file_url?: string | null;
          submission_text?: string | null;
          submitted_at?: string;
          is_late?: boolean;
          files?: Array<{name: string, path: string}> | null;
          grade?: number | null;
          feedback?: string | null;
        };
        Update: {
          id?: string;
          assignment_id?: string;
          student_id?: string;
          submission_file_url?: string | null;
          submission_text?: string | null;
          submitted_at?: string;
          is_late?: boolean;
          files?: Array<{name: string, path: string}> | null;
          grade?: number | null;
          feedback?: string | null;
        };
      };
      student_grades: {
        Row: {
          id: string;
          course_id: string;
          student_id: string;
          assignment_id: string | null;
          score: number;
          max_score: number;
          graded_by: string;
          feedback: string | null;
          graded_at: string;
        };
        Insert: {
          id?: string;
          course_id: string;
          student_id: string;
          assignment_id?: string | null;
          score: number;
          max_score?: number;
          graded_by: string;
          feedback?: string | null;
          graded_at?: string;
        };
        Update: {
          id?: string;
          course_id?: string;
          student_id?: string;
          assignment_id?: string | null;
          score?: number;
          max_score?: number;
          graded_by?: string;
          feedback?: string | null;
          graded_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          course_id: string | null;
          author_id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
          is_pinned: boolean;
          is_locked: boolean;
        };
        Insert: {
          id?: string;
          course_id?: string | null;
          author_id: string;
          title: string;
          content: string;
          created_at?: string;
          updated_at?: string;
          is_pinned?: boolean;
          is_locked?: boolean;
        };
        Update: {
          id?: string;
          course_id?: string | null;
          author_id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
          is_pinned?: boolean;
          is_locked?: boolean;
        };
      };
      post_comments: {
        Row: {
          id: string;
          post_id: string;
          author_id: string;
          parent_comment_id: string | null;
          content: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          author_id: string;
          parent_comment_id?: string | null;
          content: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          author_id?: string;
          parent_comment_id?: string | null;
          content?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      stories: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          content_type: 'image' | 'video' | 'text' | 'assignment' | 'grade' | 'course';
          media_url: string | null;
          title: string | null;
          description: string | null;
          created_at: string;
          expires_at: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          content_type: 'image' | 'video' | 'text' | 'assignment' | 'grade' | 'course';
          media_url?: string | null;
          title?: string | null;
          description?: string | null;
          created_at?: string;
          expires_at: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          content_type?: 'image' | 'video' | 'text' | 'assignment' | 'grade' | 'course';
          media_url?: string | null;
          title?: string | null;
          description?: string | null;
          created_at?: string;
          expires_at?: string;
          is_active?: boolean;
        };
      };
      announcements: {
        Row: {
          id: string;
          admin_id: string;
          title: string;
          content: string;
          priority: 'low' | 'medium' | 'high';
          created_at: string;
          updated_at: string;
          expires_at: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          admin_id: string;
          title: string;
          content: string;
          priority?: 'low' | 'medium' | 'high';
          created_at?: string;
          updated_at?: string;
          expires_at?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          admin_id?: string;
          title?: string;
          content?: string;
          priority?: 'low' | 'medium' | 'high';
          created_at?: string;
          updated_at?: string;
          expires_at?: string | null;
          is_active?: boolean;
        };
      };
      leaderboard: {
        Row: {
          id: string;
          student_id: string;
          course_id: string | null;
          average_score: number;
          rank: number | null;
          total_assignments_completed: number;
          attendance_percentage: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          course_id?: string | null;
          average_score?: number;
          rank?: number | null;
          total_assignments_completed?: number;
          attendance_percentage?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          course_id?: string | null;
          average_score?: number;
          rank?: number | null;
          total_assignments_completed?: number;
          attendance_percentage?: number;
          updated_at?: string;
        };
      };
    };
    Views: {
      course_summary: {
        Row: {
          id: string;
          code: string;
          name: string;
          lecturer_id: string;
          lecturer_name: string | null;
          enrolled_students: number | null;
          created_at: string;
        };
      };
      student_course_summary: {
        Row: {
          course_id: string;
          code: string;
          name: string;
          lecturer_name: string | null;
          student_id: string;
          average_score: number;
          grades_received: number | null;
          last_graded: string | null;
        };
      };
      post_engagement: {
        Row: {
          id: string;
          title: string;
          author_id: string;
          like_count: number | null;
          comment_count: number | null;
          view_count: number | null;
          last_activity: string;
        };
      };
      active_stories_summary: {
        Row: {
          id: string;
          user_id: string;
          user_name: string;
          content_type: string;
          created_at: string;
          expires_at: string;
          view_count: number | null;
        };
      };
    };
  };
};
