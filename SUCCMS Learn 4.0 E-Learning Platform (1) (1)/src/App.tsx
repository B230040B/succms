import { useState, useEffect } from "react";
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
  Users,
  BarChart3,
  GraduationCap,
  UserCog,
  Calendar,
  ClipboardList,
  Activity,
  Brain,
  Shield,
  User
} from "lucide-react";

type UserRole = 'student' | 'lecturer' | 'admin';
type StudentPage = 'dashboard' | 'courses' | 'assignments' | 'forum' | 'progress' | 'profile';
type LecturerPage = 'dashboard' | 'course-management' | 'assignment-management' | 'forum-management' | 'analytics' | 'profile';
type AdminPage = 'dashboard' | 'profile';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('student');
  const [userData, setUserData] = useState<any>(null);
  const [currentStudentPage, setCurrentStudentPage] = useState<StudentPage>('dashboard');
  const [currentLecturerPage, setCurrentLecturerPage] = useState<LecturerPage>('dashboard');
  const [currentAdminPage, setCurrentAdminPage] = useState<AdminPage>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [onlineCount, setOnlineCount] = useState(142);

  // Simulate real-time online count updates
  useEffect(() => {
    const interval = setInterval(() => {
      setOnlineCount(Math.floor(Math.random() * 50) + 120);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const studentNavigationItems = [
    { 
      id: 'dashboard' as StudentPage, 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Overview & AI insights'
    },
    { 
      id: 'courses' as StudentPage, 
      label: 'My Courses', 
      icon: BookOpen,
      description: 'Enrolled courses & materials'
    },
    { 
      id: 'assignments' as StudentPage, 
      label: 'Assignments', 
      icon: FileText,
      description: 'Submit & track assignments',
      badge: '3'
    },
    { 
      id: 'forum' as StudentPage, 
      label: 'Discussions', 
      icon: MessageSquare,
      description: 'Course discussions & Q&A',
      badge: '5'
    },
    { 
      id: 'progress' as StudentPage, 
      label: 'My Progress', 
      icon: Trophy,
      description: 'Grades & peer benchmarking'
    },
    { 
      id: 'profile' as StudentPage, 
      label: 'Profile', 
      icon: User,
      description: 'View & edit your profile'
    }
  ];

  const lecturerNavigationItems = [
    { 
      id: 'dashboard' as LecturerPage, 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Overview & AI insights'
    },
    { 
      id: 'course-management' as LecturerPage, 
      label: 'Courses', 
      icon: BookOpen,
      description: 'Manage course content'
    },
    { 
      id: 'assignment-management' as LecturerPage, 
      label: 'Assignments', 
      icon: ClipboardList,
      description: 'Create & grade assignments',
      badge: '12'
    },
    { 
      id: 'forum-management' as LecturerPage, 
      label: 'Forums', 
      icon: MessageSquare,
      description: 'Moderate discussions'
    },
    { 
      id: 'analytics' as LecturerPage, 
      label: 'Analytics', 
      icon: BarChart3,
      description: 'Student progress reports'
    },
    { 
      id: 'profile' as LecturerPage, 
      label: 'Profile', 
      icon: User,
      description: 'View & edit your profile'
    }
  ];

  const adminNavigationItems = [
    { 
      id: 'dashboard' as AdminPage, 
      label: 'Dashboard', 
      icon: LayoutDashboard,
      description: 'Overview & AI insights'
    },
    { 
      id: 'profile' as AdminPage, 
      label: 'Profile', 
      icon: User,
      description: 'View & edit your profile'
    }
  ];

  const handleLogin = (role: UserRole, user: any) => {
    setIsAuthenticated(true);
    setUserRole(role);
    setUserData(user);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole('student');
    setUserData(null);
    setCurrentStudentPage('dashboard');
    setCurrentLecturerPage('dashboard');
    setCurrentAdminPage('dashboard');
    setSidebarOpen(false);
  };

  const renderStudentPage = () => {
    switch (currentStudentPage) {
      case 'dashboard':
        return <StudentDashboard />;
      case 'courses':
        return <StudentCourses />;
      case 'assignments':
        return <Assignments />;
      case 'forum':
        return <Forum />;
      case 'progress':
        return <Gamification />;
      case 'profile':
        return <UserProfile userId={userData?.id || 12345} userRole="student" isOwnProfile={true} />;
      default:
        return <StudentDashboard />;
    }
  };

  const renderLecturerPage = () => {
    switch (currentLecturerPage) {
      case 'dashboard':
        return <LecturerDashboard />;
      case 'course-management':
        return <CourseManagement />;
      case 'assignment-management':
        return <Assignments />; // Will create lecturer-specific version
      case 'forum-management':
        return <Forum />; // Will create lecturer-specific version
      case 'analytics':
        return <div className="p-8 text-center text-muted-foreground">Analytics page coming soon...</div>;
      case 'profile':
        return <UserProfile userId={userData?.id || 98765} userRole="lecturer" isOwnProfile={true} />;
      default:
        return <LecturerDashboard />;
    }
  };

  const renderAdminPage = () => {
    switch (currentAdminPage) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'profile':
        return <UserProfile userId={userData?.id || 1} userRole="admin" isOwnProfile={true} />;
      default:
        return <AdminDashboard />;
    }
  };

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

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
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <BookOpen className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <h2 className="text-sidebar-foreground">SUCCMS Learn 4.0</h2>
                    <p className="text-xs text-sidebar-foreground/60">College LMS</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                  className="lg:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* User Profile */}
            <div className="p-4 border-b border-sidebar-border">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>
                    {userData?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="text-sm text-sidebar-foreground">{userData?.name || 'User'}</p>
                  <div className="flex items-center gap-2">
                    <RoleIcon className="h-3 w-3 text-sidebar-foreground/60" />
                    <span className="text-xs text-sidebar-foreground/60">
                      {userRole === 'student' ? userData?.program : userData?.department}
                    </span>
                    <Badge className="text-xs h-4 px-1">{roleLabel}</Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id);
                        setSidebarOpen(false);
                      }}
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

            {/* Footer with Online Activity */}
            <div className="p-4 border-t border-sidebar-border space-y-2">
              {/* Online Activity Indicator */}
              <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-green-700">Campus Activity</span>
                </div>
                <Badge className="bg-green-100 text-green-800 text-xs">
                  {onlineCount} online
                </Badge>
              </div>

              <Button 
                variant="ghost" 
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <Settings className="h-4 w-4 mr-3" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
              >
                <HelpCircle className="h-4 w-4 mr-3" />
                Help & Support
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-3" />
                Sign Out
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 lg:ml-0">
          {/* Top Header */}
          <header className="bg-background border-b sticky top-0 z-30">
            <div className="flex items-center justify-between px-4 sm:px-6 py-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </Button>
                
                <div className="hidden sm:block">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={userRole === 'student' ? "Search courses, resources..." : "Search students, courses..."}
                      className="pl-10 pr-4 py-2 bg-muted rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-ring text-sm w-64"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* AI Insights Indicator */}
                <Button variant="ghost" size="sm" className="hidden sm:flex">
                  <Brain className="h-4 w-4 mr-1" />
                  <span className="text-xs">AI Insights</span>
                  <Badge className="ml-1 bg-purple-100 text-purple-800 text-xs">3</Badge>
                </Button>

                {/* Online Activity for mobile */}
                <Button variant="ghost" size="sm" className="sm:hidden">
                  <Activity className="h-4 w-4" />
                  <Badge className="ml-1 bg-green-100 text-green-800 text-xs">{onlineCount}</Badge>
                </Button>

                <Button variant="ghost" size="sm" onClick={toggleTheme}>
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                
                <div className="relative">
                  <Button variant="ghost" size="sm">
                    <Bell className="h-4 w-4" />
                  </Button>
                  <span className="absolute -top-1 -right-1 h-2 w-2 bg-red-500 rounded-full" />
                </div>
                
                <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
                  <RoleIcon className="h-4 w-4" />
                  <span>{userData?.id}</span>
                </div>
                
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {userData?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {userRole === 'student' ? renderStudentPage() : userRole === 'lecturer' ? renderLecturerPage() : renderAdminPage()}
          </main>
        </div>
      </div>
    </div>
  );
}