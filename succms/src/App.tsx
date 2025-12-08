import { useState, useEffect } from "react";
import { useAuth } from "./contexts/AuthContext"; // Import Auth Hook
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
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import { Badge } from "./components/ui/badge";
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  FileText,
  Trophy,
  Settings,
  HelpCircle,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
  Moon,
  Sun,
  Activity,
  Brain,
  Shield,
  GraduationCap,
  UserCog,
  ClipboardList,
  BarChart3
} from "lucide-react";

// Types
type UserRole = 'student' | 'lecturer' | 'admin';
type StudentPage = 'dashboard' | 'courses' | 'assignments' | 'forum' | 'progress' | 'profile';
type LecturerPage = 'dashboard' | 'course-management' | 'assignment-management' | 'forum-management' | 'analytics' | 'profile';
type AdminPage = 'dashboard' | 'profile';

type NavigationItem<T> = {
  id: T;
  label: string;
  icon: any;
  description: string;
  badge?: string;
};

export default function App() {
  // 1. REPLACED: Local state with Global Auth State
  const { user, profile, isLoading, signOut } = useAuth();
  
  // 2. Local UI state
  const [currentStudentPage, setCurrentStudentPage] = useState<StudentPage>('dashboard');
  const [currentLecturerPage, setCurrentLecturerPage] = useState<LecturerPage>('dashboard');
  const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [onlineCount, setOnlineCount] = useState(142);

  // 3. Derived State from Profile
  const userRole = (profile?.role as UserRole) || 'student';
  
  // Map Supabase profile to the structure your components expect
  const userData = profile ? {
    id: profile.id,
    name: profile.full_name || user?.email,
    program: profile.program_or_department || 'General', // for students
    department: profile.program_or_department || 'General', // for lecturers
    avatar: profile.avatar_url
  } : null;

  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(Math.floor(Math.random() * 50) + 120);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // 4. Handle Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-muted-foreground animate-pulse">Loading SUCCMS...</p>
        </div>
      </div>
    );
  }

  // 5. Handle Unauthenticated State
  if (!user) {
    return <Login />;
  }

  // Navigation Items Definitions...
  const studentNavigationItems: NavigationItem<StudentPage>[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & AI insights' },
    { id: 'courses', label: 'My Courses', icon: BookOpen, description: 'Enrolled courses & materials' },
    { id: 'assignments', label: 'Assignments', icon: FileText, description: 'Submit & track assignments', badge: '3' },
    { id: 'forum', label: 'Discussions', icon: MessageSquare, description: 'Course discussions & Q&A', badge: '5' },
    { id: 'progress', label: 'My Progress', icon: Trophy, description: 'Grades & peer benchmarking' }
  ];

  const lecturerNavigationItems: NavigationItem<LecturerPage>[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & AI insights' },
    { id: 'course-management', label: 'Courses', icon: BookOpen, description: 'Manage course content' },
    { id: 'assignment-management', label: 'Assignments', icon: ClipboardList, description: 'Create & grade assignments', badge: '12' },
    { id: 'forum-management', label: 'Forums', icon: MessageSquare, description: 'Moderate discussions' },
    { id: 'analytics', label: 'Analytics', icon: BarChart3, description: 'Student progress reports' }
  ];

  const adminNavigationItems: NavigationItem<AdminPage>[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, description: 'Overview & AI insights' }
  ];

  const handleLogout = async () => {
    try {
      console.debug('[App] calling signOut');
      await signOut();
      console.debug('[App] signOut completed');
      // Small delay to ensure state updates propagate
      await new Promise(resolve => setTimeout(resolve, 100));
    } catch (err) {
      console.error('Error signing out:', err);
    } finally {
      setSidebarOpen(false);
    }
  };

  const renderStudentPage = () => {
    switch (currentStudentPage) {
      case 'dashboard': return <StudentDashboard />;
      case 'courses': return <StudentCourses />;
      case 'assignments': return <Assignments />;
      case 'forum': return <Forum />;
      case 'progress': return <Gamification />;
      case 'profile': return <UserProfile userId={user.id} userRole="student" isOwnProfile={true} />;
      default: return <StudentDashboard />;
    }
  };

  const renderLecturerPage = () => {
    switch (currentLecturerPage) {
      case 'dashboard': return <LecturerDashboard />;
      case 'course-management': return <CourseManagement />;
      case 'assignment-management': return <Assignments />;
      case 'forum-management': return <Forum />;
      case 'analytics': return <div className="p-8 text-center text-muted-foreground">Analytics page coming soon...</div>;
      case 'profile': return <UserProfile userId={user.id} userRole="lecturer" isOwnProfile={true} />;
      default: return <LecturerDashboard />;
    }
  };

  const renderAdminPage = () => {
    switch (currentAdminPage) {
      case 'dashboard': return <AdminDashboard />;
      case 'profile': return <UserProfile userId={user.id} userRole="admin" isOwnProfile={true} />;
      default: return <AdminDashboard />;
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  const navigationItems = userRole === 'student' ? studentNavigationItems : userRole === 'lecturer' ? lecturerNavigationItems : adminNavigationItems;
  const currentPage = userRole === 'student' ? currentStudentPage : userRole === 'lecturer' ? currentLecturerPage : currentAdminPage;
  const setCurrentPage = userRole === 'student' 
    ? (page: string) => setCurrentStudentPage(page as StudentPage)
    : userRole === 'lecturer'
      ? (page: string) => setCurrentLecturerPage(page as LecturerPage)
      : (page: string) => setCurrentAdminPage(page as AdminPage);

  const roleIcon = userRole === 'student' ? GraduationCap : userRole === 'lecturer' ? UserCog : Shield;
  const roleLabel = userRole === 'student' ? 'Student' : userRole === 'lecturer' ? 'Lecturer' : 'Admin';
  const RoleIcon = roleIcon;

  return (
    <div className={`min-h-screen bg-background ${darkMode ? 'dark' : ''}`}>
      <div className="flex">
        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`
          fixed top-0 left-0 z-50 h-full w-72 bg-sidebar border-r border-sidebar-border transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}>
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-sidebar-border">
              <div className="flex items-center justify-between">
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => { setCurrentPage('dashboard'); setSidebarOpen(false); }}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <div className="w-28 sm:w-32 h-10 rounded-md flex-shrink-0 flex items-center justify-center p-1 bg-white border border-gray-200 shadow-md">
                    <img src="/suclogo.png" alt="SUC logo" className="h-full w-auto object-contain brightness-125 saturate-150 contrast-125 drop-shadow-lg" />
                  </div>
                  <div>
                    <h2 className="text-sidebar-foreground">SUCCMS Learn</h2>
                    <p className="text-xs text-sidebar-foreground/60">College LMS</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(false)} className="lg:hidden">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* User Profile in Sidebar */}
            <button
              className="p-4 border-b border-sidebar-border w-full text-left bg-transparent hover:bg-sidebar-accent/30"
              onClick={() => {
                if (userRole === 'student') setCurrentStudentPage('profile');
                else if (userRole === 'lecturer') setCurrentLecturerPage('profile');
                else setCurrentAdminPage('profile');
                setSidebarOpen(false);
              }}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {userData?.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-sidebar-foreground font-medium truncate">{userData?.name || 'User'}</p>
                  <div className="flex items-center gap-2">
                    <RoleIcon className="h-3 w-3 text-sidebar-foreground/60" />
                    <span className="text-xs text-sidebar-foreground/60 truncate max-w-[80px]">
                      {userData?.program}
                    </span>
                    <Badge className="text-xs h-4 px-1">{roleLabel}</Badge>
                  </div>
                </div>
              </div>
            </button>

            {/* Navigation */}
            <nav className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => { setCurrentPage(item.id); setSidebarOpen(false); }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors
                        ${isActive 
                          ? 'bg-sidebar-accent text-sidebar-accent-foreground' 
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{item.label}</span>
                          {item.badge && (
                            <Badge className="text-xs h-4 px-1.5 bg-red-500 text-white">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-sidebar-foreground/60">{item.description}</p>
                      </div>
                    </button>
                  );
                })}
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

              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => { setCurrentPage('profile'); setSidebarOpen(false); }}>
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Button>

              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => { window.location.href = 'mailto:cco@university.edu'; }}>
                <HelpCircle className="h-4 w-4 mr-3" />
                Support
              </Button>

              <Button variant="ghost" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 lg:ml-0 min-w-0">
          <header className="bg-background border-b sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(true)} className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
                
                <div className="hidden sm:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 bg-muted rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-ring text-sm w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                   <span className="truncate max-w-[150px]">{userData?.name}</span>
                </div>
                
                <Avatar className="h-8 w-8 cursor-pointer" onClick={() => {
                    if (userRole === 'student') setCurrentStudentPage('profile');
                    else if (userRole === 'lecturer') setCurrentLecturerPage('profile');
                    else setCurrentAdminPage('profile');
                }}>
                  <AvatarFallback>{userData?.name?.charAt(0) || 'U'}</AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {userRole === 'student' ? renderStudentPage() : userRole === 'lecturer' ? renderLecturerPage() : renderAdminPage()}
          </main>
        </div>
      </div>
    </div>
  );
}