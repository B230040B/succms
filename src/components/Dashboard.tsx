import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  BookOpen, Clock, TrendingUp, Calendar, AlertCircle, Loader2, 
  Sparkles, Youtube, ExternalLink, PlayCircle, Zap, BrainCircuit, ArrowRight 
} from "lucide-react";
import { Stories } from "./Stories";

// Types for our real data
interface Recommendation {
  id: string;
  title: string;
  type: 'video' | 'article' | 'documentation' | 'productivity';
  url: string;
  topic: string;
  reason?: string;
}

interface CourseActivity {
  courseCode: string;
  courseName: string;
  lastAccessed: Date;
  progress: number;
}

export function Dashboard() {
  const { profile, user } = useAuth();
  
  // Real Data State
  const [recommendations, setRecommendations] = useState<{
    recentCourses: CourseActivity[];
    studyMaterials: Recommendation[];
    motivation: Recommendation[];
  }>({ recentCourses: [], studyMaterials: [], motivation: [] });

  const [stats, setStats] = useState({
    coursesCount: 0,
    assignmentsPending: 0,
    completedAssignments: 0
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [greeting, setGreeting] = useState("Welcome back");

  useEffect(() => {
    if (user) {
      loadRealData();
      determineGreeting();
    }
  }, [user]);

  const determineGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 18) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  };

  // --- THE "AI" LOGIC FUNCTION ---
  const loadRealData = async () => {
    setIsLoading(true);
    try {
      if (!user) return;

      // 1. Fetch Core Stats (Enrollments & Submissions)
      const table = profile?.role === 'lecturer' ? 'course_instructors' : 'enrollments';
      const userIdColumn = 'user_id';
      
      const { count: courseCount } = await supabase
        .from(table) 
        .select('*', { count: 'exact', head: true })
        .eq(userIdColumn, user.id); 

      const { count: submissionCount } = await supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user.id);

      // 2. Fetch User's Recent Activity to determine context
      // (Falling back to dummy data if table is empty for demo purposes)
      const { data: activityLog } = await supabase
        .from('user_activity_log')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      // 3. Fetch Available Resources from our new table
      const { data: allResources } = await supabase
        .from('ai_resources')
        .select('*');

      // --- RUN RECOMMENDATION ALGORITHM ---
      // This runs locally on the client to simulate AI decision making
      
      // A. Identify Active Topics based on Enrollments (Mocked for demo if no real courses DB yet)
      const activeTopics = ['Database Systems', 'Web Development']; // In real app, derived from course names
      
      // B. Filter Study Materials
      const relevantMaterials = (allResources || []).filter(r => 
        activeTopics.some(topic => r.topic.includes(topic)) && r.type !== 'productivity'
      ).map(r => ({
        ...r,
        reason: `Recommended because you're studying ${r.topic}`
      })).slice(0, 3);

      // C. Filter Productivity/Motivation
      const motivationPicks = (allResources || []).filter(r => 
        r.type === 'productivity'
      ).slice(0, 2);

      // D. Construct "Jump Back In" (Simulated from activity log)
      const jumpBackIn: CourseActivity[] = [
        { courseCode: 'CS301', courseName: 'Database Systems', lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 2), progress: 78 },
        { courseCode: 'CS405', courseName: 'Web App Dev', lastAccessed: new Date(Date.now() - 1000 * 60 * 60 * 24), progress: 45 }
      ];

      setRecommendations({
        recentCourses: jumpBackIn,
        studyMaterials: relevantMaterials,
        motivation: motivationPicks
      });

      setStats({
        coursesCount: courseCount || 0,
        assignmentsPending: 3, 
        completedAssignments: submissionCount || 0
      });

      setRecentActivity(
        activityLog && activityLog.length > 0 
        ? activityLog.map(a => ({ action: "Viewed", target: a.target_id, time: new Date(a.created_at).toLocaleDateString() }))
        : [{ action: "Logged in", target: "System", time: new Date().toLocaleDateString() }]
      );

    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 p-6 animate-in fade-in duration-500">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {profile?.full_name?.split(' ')[0] || 'User'}!
          </h1>
          <p className="text-muted-foreground flex items-center gap-2 mt-1">
            <Sparkles className="h-4 w-4 text-purple-500" />
            AI Assistant: "I've found {recommendations.studyMaterials.length} new resources for you."
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full border">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* STORIES */}
      <Card className="overflow-hidden bg-gradient-to-r from-gray-50 to-white dark:from-zinc-900 dark:to-zinc-950">
        <CardContent className="pt-6">
          <Stories 
            currentUserName={profile?.full_name || "Your Story"}
            currentUserInitials={(profile?.full_name || "YS").split(" ").map(s=>s[0]).join("")}
            currentUserAvatar={profile?.avatar_url}
          />
        </CardContent>
      </Card>

      {/* AI RECOMMENDATIONS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 1. Jump Back In */}
        <Card className="col-span-1 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Jump Back In
            </CardTitle>
            <CardDescription>Recent active courses</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.recentCourses.map(course => (
              <div key={course.courseCode} className="group p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-sm">{course.courseName}</h4>
                    <p className="text-[10px] text-muted-foreground">Last active: {course.lastAccessed.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{course.courseCode}</Badge>
                </div>
                <div className="space-y-1">
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${course.progress}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* 2. AI Smart Picks */}
        <Card className="col-span-1 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BrainCircuit className="h-5 w-5 text-purple-500" />
              Smart Study Picks
            </CardTitle>
            <CardDescription>Curated based on your subjects</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.studyMaterials.length > 0 ? (
              recommendations.studyMaterials.map(item => (
                <a href={item.url} target="_blank" rel="noreferrer" key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors cursor-pointer border border-transparent hover:border-purple-100">
                  <div className={`p-2 rounded-md shrink-0 ${item.type === 'video' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                    {item.type === 'video' ? <Youtube className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-tight">{item.title}</p>
                    <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">{item.reason}</p>
                  </div>
                </a>
              ))
            ) : (
              <div className="text-sm text-muted-foreground p-4 text-center">No new recommendations yet. Check back after enrolling!</div>
            )}
          </CardContent>
        </Card>

        {/* 3. Motivation Engine */}
        <Card className="col-span-1 border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow bg-gradient-to-br from-amber-50/30 to-transparent dark:from-amber-950/10">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Motivation Zone
            </CardTitle>
            <CardDescription>Fuel for your study session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.motivation.map(video => (
              <a href={video.url} target="_blank" rel="noreferrer" key={video.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/60 dark:hover:bg-black/20 cursor-pointer transition-all">
                 <div className="h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
                    <PlayCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                 </div>
                 <div className="flex-1">
                    <p className="text-sm font-semibold line-clamp-1">{video.title}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">{video.type}</p>
                 </div>
                 <ExternalLink className="h-3 w-3 text-muted-foreground" />
              </a>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{profile?.role === 'lecturer' ? 'Courses Teaching' : 'Enrolled Courses'}</p>
                <p className="text-2xl font-bold">{stats.coursesCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Assignments Submitted</p>
                <p className="text-2xl font-bold">{stats.completedAssignments}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Clock className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Tasks</p>
                <p className="text-2xl font-bold">{stats.assignmentsPending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{profile?.full_name?.[0]}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      You {activity.action.toLowerCase()} <span className="text-primary">{activity.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
              <div className="text-sm text-center text-muted-foreground pt-4">
                No other recent activity found.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex gap-3 p-4 border rounded-lg bg-blue-50/50 dark:bg-blue-900/20">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="text-sm">
                   <p className="font-semibold text-blue-900 dark:text-blue-300">Complete your profile</p>
                   <p className="text-blue-700 dark:text-blue-400 mt-1">Add a bio and profile picture to help others recognize you.</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}