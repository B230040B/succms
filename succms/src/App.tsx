import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "/workspaces/succms/succms/src/lib/supabase.ts"; // Added Supabase import
import { useAuth } from "/workspaces/succms/succms/src/contexts/AuthContext.tsx";
import { Login } from "./components/Login";
import { StudentDashboard } from "./components/StudentDashboard";
import { StudentCourses } from "./components/StudentCourses";
import { LecturerDashboard } from "./components/LecturerDashboard";
import { AdminDashboard } from "./components/AdminDashboard";
import { UserProfile } from "./components/UserProfile";
import { CourseManagement } from "./components/CourseManagement"; 
import { Forum } from "./components/Forum";
import { Assignments } from "./components/Assignments";
import { Gamification } from "./components/Gamification";
import { Button } from "./components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Badge } from "./components/ui/badge";
import {
  LayoutDashboard, BookOpen, MessageSquare, FileText, Trophy,
  Settings, HelpCircle, LogOut, Menu, X, Search, Moon, Sun,
  Shield, GraduationCap, UserCog, ClipboardList, BarChart3
} from "lucide-react";

// Types
type UserRole = 'student' | 'lecturer' | 'admin';

type NavigationItem = {
  id: string; // Used as the URL path
  label: string;
  icon: any;
  description: string;
  badge?: string;
};

export default function App() {
  const { user, profile, isLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation(); 
  
  // Local UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [onlineCount, setOnlineCount] = useState(142);
  
  // Notification State
  const [crucialCount, setCrucialCount] = useState(0);

  // Derived State
  const userRole = (profile?.role as UserRole) || 'student';
  
  const userData = profile ? {
    id: profile.id,
    name: profile.full_name || user?.email,
    program: profile.programme || 'General',
    department: profile.faculty || 'General',
    avatar: profile.avatar_url
  } : null;

  useEffect(() => {
    const interval = setInterval(() => setOnlineCount(Math.floor(Math.random() * 50) + 120), 5000);
    return () => clearInterval(interval);
  }, []);

  // --- CRUCIAL ASSIGNMENTS CHECKER ---
  useEffect(() => {
    const fetchCrucialStats = async () => {
      // Only run for students
      if (!user || userRole !== 'student') return;

      try {
        // 1. Get Enrolled Courses
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id')
          .eq('user_id', user.id);

        if (!enrollments || enrollments.length === 0) return;
        const courseIds = enrollments.map(e => e.course_id);

        // 2. Find Assignments Due Soon (Next 48 Hours)
        const now = new Date();
        const twoDaysLater = new Date();
        twoDaysLater.setDate(now.getDate() + 2);

        const { data: assignments } = await supabase
          .from('course_assignments')
          .select('id')
          .in('course_id', courseIds)
          .gt('due_date', now.toISOString())         // Due in future
          .lt('due_date', twoDaysLater.toISOString()); // But within 48h
        
        if (!assignments || assignments.length === 0) {
            setCrucialCount(0);
            return;
        }

        // 3. Filter out ones ALREADY submitted
        const assignmentIds = assignments.map(a => a.id);
        const { data: submissions } = await supabase
            .from('assignment_submissions')
            .select('assignment_id')
            .eq('student_id', user.id)
            .in('assignment_id', assignmentIds);

        const submittedIds = new Set(submissions?.map(s => s.assignment_id));
        
        // Count only pending ones
        const pendingCount = assignments.filter(a => !submittedIds.has(a.id)).length;
        setCrucialCount(pendingCount);

      } catch (e) {
        console.error("Error fetching notification count", e);
      }
    };

    fetchCrucialStats();
  }, [user, userRole]); // Re-run if user changes

  if (isLoading) return <div className="min-h-screen flex items-center justify-center bg-background"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>;

  if (!user) return <Login />;

  // --- NAVIGATION CONFIG ---
  const studentNavigationItems: NavigationItem[] = [
    { id: '', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & AI insights' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, description: 'Enrolled courses & materials' },
    { 
        id: 'assignments', 
        label: 'Assignments', 
        icon: FileText, 
        description: 'Submit & track assignments', 
        badge: crucialCount > 0 ? crucialCount.toString() : undefined // Dynamic Badge
    },
    { id: 'forum', label: 'Discussions', icon: MessageSquare, description: 'Course discussions & Q&A' },
    { id: 'progress', label: 'My Progress', icon: Trophy, description: 'Grades & peer benchmarking' }
  ];

  const lecturerNavigationItems: NavigationItem[] = [
    { id: '', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & AI insights' },
    { id: 'courses', label: 'Courses', icon: BookOpen, description: 'Manage course content' },
    { id: 'assignments', label: 'Assignments', icon: ClipboardList, description: 'Create & grade assignments', badge: '12' }, // Hardcoded for demo (or connect to ungraded count)
    { id: 'forum', label: 'Forums', icon: MessageSquare, description: 'Moderate discussions' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Student progress reports' }
  ];

  const adminNavigationItems: NavigationItem[] = [
    { id: '', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & AI insights' }
  ];

  const navigationItems = userRole === 'student' ? studentNavigationItems : userRole === 'lecturer' ? lecturerNavigationItems : adminNavigationItems;
  
  const isActive = (path: string) => {
    if (path === '') return location.pathname === '/';
    return location.pathname.startsWith('/' + path);
  };

  const handleLogout = async () => {
    await signOut();
    setSidebarOpen(false);
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const RoleIcon = userRole === 'student' ? GraduationCap : userRole === 'lecturer' ? UserCog : Shield;
  const roleLabel = userRole === 'student' ? 'Student' : userRole === 'lecturer' ? 'Lecturer' : 'Admin';

  return (
    <div className={`min-h-screen bg-background ${darkMode ? 'dark' : ''}`}>
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

        {/* Sidebar */}
        <aside className={`fixed top-0 left-0 z-50 h-full w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-sidebar-border">
              <div className="flex items-center justify-between">
                <div onClick={() => { navigate('/'); setSidebarOpen(false); }} className="flex items-center gap-3 cursor-pointer">
                  <div className="w-28 sm:w-32 h-10 rounded-md flex-shrink-0 flex items-center justify-center p-1 bg-white border border-gray-200 shadow-md">
                    <img src="/suclogo.png" alt="SUC logo" className="h-full w-auto object-contain" />
                  </div>
                  <div>
                    <h2 className="text-sidebar-foreground">SUCCMS Learn</h2>
                    <p className="text-xs text-sidebar-foreground/60">College LMS</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden"><X className="h-4 w-4" /></Button>
              </div>
            </div>

            {/* User Profile in Sidebar */}
            <button
              className="p-4 border-b border-sidebar-border w-full text-left bg-transparent hover:bg-sidebar-accent/30"
              onClick={() => { navigate(`/profile/${user.id}`); setSidebarOpen(false); }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={userData?.avatar || ''} />
                    <AvatarFallback>{userData?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'U'}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-sidebar-foreground font-medium truncate">{userData?.name || 'User'}</p>
                  <div className="flex items-center gap-2">
                    <RoleIcon className="h-3 w-3 text-sidebar-foreground/60" />
                    <span className="text-xs text-sidebar-foreground/60 truncate max-w-[80px]">{userData?.program}</span>
                    <Badge className="text-xs h-4 px-1">{roleLabel}</Badge>
                  </div>
                </div>
              </div>
            </button>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-2">
                {navigationItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { navigate(`/${item.id}`); setSidebarOpen(false); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${isActive(item.id) ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-foreground hover:bg-sidebar-accent/50'}`}
                    >
                      <item.icon className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{item.label}</span>
                          {item.badge && <Badge className="text-xs h-4 px-1.5 bg-red-500 text-white hover:bg-red-600">{item.badge}</Badge>}
                        </div>
                        <p className="text-xs text-sidebar-foreground/60">{item.description}</p>
                      </div>
                    </button>
                  ))}
              </div>
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-sidebar-border space-y-2">
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-700">Campus Activity</span>
                </div>
                <Badge className="bg-green-100 text-green-800 text-xs">{onlineCount} online</Badge>
              </div>
              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
                <Settings className="h-4 w-4 mr-3" /> Settings
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent">
                <HelpCircle className="h-4 w-4 mr-3" /> Help & Support
              </Button>
              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-3" /> Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-0 min-w-0">
          <header className="bg-background border-b sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden"><Menu className="h-5 w-5" /></Button>
                <div className="hidden sm:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input type="text" placeholder="Search..." className="pl-10 pr-4 py-2 bg-muted rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-ring text-sm w-64" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={toggleTheme}>{darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}</Button>
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground"><span className="truncate max-w-[150px]">{userData?.name}</span></div>
                <Avatar className="h-8 w-8 cursor-pointer" onClick={() => navigate(`/profile/${user.id}`)}>
                  <AvatarImage src={userData?.avatar || ''} />
                  <AvatarFallback>{userData?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Routes>
              {/* Common Routes */}
              <Route path="/profile/:userId" element={<UserProfile />} />

              {/* Student Routes */}
              {userRole === 'student' && (
                <>
                  <Route path="/" element={<StudentDashboard />} />
                  <Route path="/courses" element={<StudentCourses />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/forum" element={<Forum />} />
                  <Route path="/progress" element={<Gamification />} />
                </>
              )}

              {/* Lecturer Routes */}
              {userRole === 'lecturer' && (
                <>
                  <Route path="/" element={<LecturerDashboard />} />
                  <Route path="/courses" element={<CourseManagement />} />
                  <Route path="/assignments" element={<Assignments />} />
                  <Route path="/forum" element={<Forum />} />
                  <Route path="/analytics" element={<div className="p-8 text-center text-muted-foreground">Analytics coming soon...</div>} />
                </>
              )}

              {/* Admin Routes */}
              {userRole === 'admin' && (
                 <Route path="/" element={<AdminDashboard />} />
              )}

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </div>
  );
}