import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { OnlineActivity, PeerBenchmarking, SocialActivityFeed, StudyGroups } from "./SocialWidgets";
import { Stories } from "./Stories";
import { AdvertisementPanel } from "./AdvertisementPanel";
import { 
  BookOpen, Clock, Calendar, AlertCircle, TrendingUp, Users, FileText, 
  Bell, Brain, Zap, Sparkles, BrainCircuit, Youtube, PlayCircle, ExternalLink, ArrowRight, Music 
} from "lucide-react";

// --- 1. THE AI KNOWLEDGE BASE (Real Links) ---
// This acts as the "brain" of the AI, mapping topics to real-world resources.
const KNOWLEDGE_BASE = [
  // Database Systems Resources
  {
    id: 'db-1',
    title: 'Complete Guide to Database Normalization (1NF-3NF)',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=rBPQ5fg_kiY',
    source: 'YouTube',
    tags: ['Database', 'SQL', 'CS301', 'Data']
  },
  {
    id: 'db-2',
    title: 'SQL Indexing and Performance Tuning',
    type: 'article',
    url: 'https://use-the-index-luke.com/',
    source: 'Use The Index Luke',
    tags: ['Database', 'Performance', 'CS301']
  },
  // Software Engineering / Algorithms
  {
    id: 'se-1',
    title: 'Agile Methodology Crash Course',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=8bmS5awqzc0',
    source: 'YouTube',
    tags: ['Software', 'Agile', 'CS410', 'Project']
  },
  {
    id: 'algo-1',
    title: 'Data Structures & Algorithms - Full Course',
    type: 'video',
    url: 'https://www.youtube.com/watch?v=8hly31xKli0',
    source: 'FreeCodeCamp',
    tags: ['Algorithms', 'Data Structures', 'CS205', 'Code']
  },
  // Web Development
  {
    id: 'web-1',
    title: 'React Hooks: The Complete Guide',
    type: 'article',
    url: 'https://react.dev/reference/react',
    source: 'React Docs',
    tags: ['Web', 'React', 'Frontend', 'CS405']
  },
  // General Productivity (Always relevant)
  {
    id: 'prod-1',
    title: 'Atomic Habits: How to Get 1% Better Every Day',
    type: 'productivity',
    url: 'https://www.youtube.com/watch?v=PZ7lDrwYdZc',
    source: 'James Clear',
    tags: ['Productivity', 'General']
  },
  {
    id: 'prod-2',
    title: 'Deep Work: Rules for Focused Success',
    type: 'productivity',
    url: 'https://www.youtube.com/watch?v=d66815uVerk',
    source: 'Cal Newport',
    tags: ['Productivity', 'Focus']
  },
  {
    id: 'music-1',
    title: 'Lofi Girl - Beats to Relax/Study To',
    type: 'music',
    url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk',
    source: 'Lofi Girl Live',
    tags: ['Music', 'Focus']
  }
];

// Types
interface Recommendation {
  id: string;
  title: string;
  type: string;
  url: string;
  source?: string;
  reason?: string;
}

interface CourseActivity {
  courseCode: string;
  courseName: string;
  lastAccessed: Date;
  progress: number;
}

export function StudentDashboard() {
  const { user, profile } = useAuth();
  
  // State
  const [aiData, setAiData] = useState<{
    recentCourses: CourseActivity[];
    studyMaterials: Recommendation[];
    motivation: Recommendation[];
  }>({ recentCourses: [], studyMaterials: [], motivation: [] });
  const [isLoadingAi, setIsLoadingAi] = useState(true);

  // Mock Enrolled Courses (In a real app, this comes from DB)
  // We use these names to query the KNOWLEDGE_BASE
  const enrolledCourses = [
    { id: 1, code: "CS301", name: "Database Systems", lecturer: "Dr. Sarah Chen", progress: 75, nextClass: "Today, 2:00 PM", room: "Lab 204", assignments: 2, status: "active", grade: "A-" },
    { id: 2, code: "CS205", name: "Data Structures", lecturer: "Prof. Michael Roberts", progress: 60, nextClass: "Tomorrow, 10:00 AM", room: "Room 301", assignments: 1, status: "active", grade: "B+" },
    { id: 3, code: "CS410", name: "Software Eng.", lecturer: "Dr. Elena Rodriguez", progress: 45, nextClass: "Wed, 9:00 AM", room: "Room 105", assignments: 3, status: "active", grade: "B" }
  ];

  useEffect(() => {
    if (user) generateSmartRecommendations();
  }, [user]);

  const generateSmartRecommendations = async () => {
    setIsLoadingAi(true);
    try {
      // 1. Extract Keywords from User's Courses
      // We look at the course names and codes the user is actually enrolled in
      const userInterests = enrolledCourses.flatMap(c => [
        c.code, 
        ...c.name.split(' ') // Split "Database Systems" into ["Database", "Systems"]
      ]);

      // 2. Filter the Knowledge Base
      // The AI "scans" the database for matching tags
      const relevantMaterials = KNOWLEDGE_BASE.filter(resource => {
        if (resource.type === 'productivity' || resource.type === 'music') return false; // Handle these separately
        return resource.tags.some(tag => userInterests.includes(tag));
      }).map(res => ({
        ...res,
        reason: `Recommended for ${res.tags.find(t => userInterests.includes(t)) || 'your course'}`
      })).slice(0, 3); // Top 3 matches

      // 3. Get Productivity/Motivation picks
      const motivationPicks = KNOWLEDGE_BASE.filter(r => 
        r.type === 'productivity' || r.type === 'music'
      ).sort(() => 0.5 - Math.random()).slice(0, 2); // Randomize slightly for variety

      // 4. Construct "Jump Back In" (Simulated from recent logs)
      const jumpBackIn: CourseActivity[] = [
        { courseCode: 'CS301', courseName: 'Database Systems', lastAccessed: new Date(), progress: 75 },
        { courseCode: 'CS205', courseName: 'Data Structures', lastAccessed: new Date(Date.now() - 86400000), progress: 60 }
      ];

      setAiData({
        recentCourses: jumpBackIn,
        studyMaterials: relevantMaterials,
        motivation: motivationPicks
      });

    } catch (err) {
      console.error("AI Engine Error:", err);
    } finally {
      setIsLoadingAi(false);
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Helper to render the correct icon for resources
  const getResourceIcon = (type: string) => {
    switch(type) {
        case 'video': return <Youtube className="h-4 w-4" />;
        case 'music': return <Music className="h-4 w-4" />;
        case 'article': return <BookOpen className="h-4 w-4" />;
        default: return <PlayCircle className="h-4 w-4" />;
    }
  };

  const getResourceColor = (type: string) => {
      switch(type) {
          case 'video': return 'bg-red-100 text-red-600';
          case 'music': return 'bg-purple-100 text-purple-600';
          case 'article': return 'bg-blue-100 text-blue-600';
          default: return 'bg-amber-100 text-amber-600';
      }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name?.split(" ")[0] || 'Scholar'}!</h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Sparkles className="h-4 w-4 text-purple-500" />
            AI Assistant: "I've found {aiData.studyMaterials.length} relevant resources based on your enrollment."
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200 transition-colors cursor-pointer px-3 py-1">
            <Brain className="h-3 w-3 mr-1" />
            AI Study Plan Ready
          </Badge>
          <Badge className="bg-green-100 text-green-800 px-3 py-1">
            <Zap className="h-3 w-3 mr-1" />
            12-day streak
          </Badge>
        </div>
      </div>

      {/* Stories Feature */}
      <Card className="overflow-hidden bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950 border-dashed">
        <CardContent className="p-6">
          <Stories 
             currentUserName={profile?.full_name || "Your Story"}
             currentUserInitials={(profile?.full_name || "YS").split(" ").map(s=>s[0]).join("")}
             currentUserAvatar={profile?.avatar_url}
          />
        </CardContent>
      </Card>

      {/* --- NEW AI RECOMMENDATIONS SECTION --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Jump Back In */}
        <Card className="col-span-1 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Jump Back In
            </CardTitle>
            <CardDescription>Pick up where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiData.recentCourses.map(course => (
              <div key={course.courseCode} className="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{course.courseName}</h4>
                    <p className="text-[10px] text-muted-foreground">Last active: {course.lastAccessed.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{course.courseCode}</Badge>
                </div>
                <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: `${course.progress}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 2. Smart Study Picks (DYNAMICALLY FILTERED) */}
        <Card className="col-span-1 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              Smart Study Picks
            </CardTitle>
            <CardDescription>Curated external resources for you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiData.studyMaterials.map(item => (
              <a 
                href={item.url} 
                target="_blank" 
                rel="noreferrer" 
                key={item.id} 
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors cursor-pointer border border-transparent hover:border-purple-100 group"
              >
                <div className={`p-2 rounded-md shrink-0 ${getResourceColor(item.type)}`}>
                  {getResourceIcon(item.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-tight group-hover:underline decoration-purple-400 underline-offset-2">{item.title}</p>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{item.reason}</p>
                    <span className="text-[10px] text-muted-foreground">• {item.source}</span>
                  </div>
                </div>
                <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            ))}
            {aiData.studyMaterials.length === 0 && (
                <p className="text-sm text-muted-foreground p-2">No specific recommendations found for your current courses.</p>
            )}
          </CardContent>
        </Card>

        {/* 3. Motivation Zone */}
        <Card className="col-span-1 border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-amber-50/30 to-transparent dark:from-amber-950/10">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Motivation Zone
            </CardTitle>
            <CardDescription>Productivity boosters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {aiData.motivation.map(item => (
              <a href={item.url} target="_blank" rel="noreferrer" key={item.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 dark:hover:bg-black/20 cursor-pointer transition-all group">
                 <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${getResourceColor(item.type)}`}>
                    {getResourceIcon(item.type)}
                 </div>
                 <div className="flex-1">
                    <p className="text-sm font-semibold line-clamp-1 group-hover:text-amber-700">{item.title}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{item.source}</p>
                 </div>
                 <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            ))}
            <div className="mt-4 p-3 bg-white/50 dark:bg-black/20 rounded-lg text-xs text-center italic text-muted-foreground border">
              "Focus is not about saying yes. It's about saying no to the hundred other good ideas."
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg"><BookOpen className="h-6 w-6 text-blue-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Enrolled</p>
                <p className="text-2xl font-semibold">{enrolledCourses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg"><FileText className="h-6 w-6 text-orange-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Assignments</p>
                <p className="text-2xl font-semibold">6</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg"><TrendingUp className="h-6 w-6 text-green-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">GPA</p>
                <p className="text-2xl font-semibold">3.8</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg"><Zap className="h-6 w-6 text-purple-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Streak</p>
                <p className="text-2xl font-semibold">12 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg"><Bell className="h-6 w-6 text-red-600" /></div>
              <div>
                <p className="text-sm text-muted-foreground">Alerts</p>
                <p className="text-2xl font-semibold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrolled Courses */}
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {enrolledCourses.map((course) => (
                <div key={course.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{course.code}</Badge>
                        <h4>{course.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">by {course.lecturer}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getGradeColor(course.grade)}>{course.grade}</Badge>
                      <Badge className={getStatusColor(course.status)}>{course.status}</Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm"><span>Progress</span><span>{course.progress}%</span></div>
                    <Progress value={course.progress} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1"><Clock className="h-4 w-4" /><span>{course.nextClass}</span></div>
                      <div className="flex items-center gap-1"><Users className="h-4 w-4" /><span>{course.room}</span></div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <OnlineActivity userRole="student" />
          <PeerBenchmarking currentGrade="B+" courseProgress={60} />
          {/* Announcements Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Bell className="h-5 w-5" />Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
               <div className="space-y-2">
                  <Badge className="bg-red-100 text-red-800 border-red-200">High</Badge>
                  <div>
                    <h4 className="text-sm font-medium">Midterm Exam Schedule</h4>
                    <p className="text-xs text-muted-foreground">CS301 - 2 hours ago</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Midterm exam will be held on March 15th in Lab 204.</p>
               </div>
            </CardContent>
          </Card>
          <StudyGroups />
          <AdvertisementPanel />
        </div>
      </div>
    </div>
  );
}