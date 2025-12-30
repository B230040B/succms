import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { supabase } from "@/lib/supabase.ts";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { BookOpen, Clock, TrendingUp, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { Stories } from "./Stories";

export function Dashboard() {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    coursesCount: 0,
    assignmentsPending: 0,
    completedAssignments: 0
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      if (!user) return;

      const table = profile?.role === 'lecturer' ? 'course_instructors' : 'enrollments';
      const userIdColumn = profile?.role === 'lecturer' ? 'user_id' : 'user_id'; 
      
      const { count: courseCount } = await supabase
        .from(table) 
        .select('*', { count: 'exact', head: true })
        .eq(userIdColumn, user.id); 

      const { count: submissionCount } = await supabase
        .from('assignment_submissions')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', user.id);

      setStats({
        coursesCount: courseCount || 0,
        assignmentsPending: 0, 
        completedAssignments: submissionCount || 0
      });

      setRecentActivity([
        { action: "Logged in", target: "System", time: new Date().toLocaleDateString() },
      ]);

    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}!</h1>
          <p className="text-muted-foreground">
            {profile?.role === 'lecturer' ? 'Ready to inspire your students today?' : 'Ready to continue your learning journey?'}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
          <Calendar className="h-4 w-4" />
          <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Stories 
            currentUserName={profile?.full_name || "Your Story"}
            currentUserInitials={(profile?.full_name || "YS").split(" ").map(s=>s[0]).join("")}
            currentUserAvatar={profile?.avatar_url}
          />
        </CardContent>
      </Card>

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
                <p className="text-2xl font-bold">--</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
             <div className="flex gap-3 p-4 border rounded-lg bg-blue-50/50">
                <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                <div className="text-sm">
                   <p className="font-semibold text-blue-900">Complete your profile</p>
                   <p className="text-blue-700 mt-1">Add a bio and profile picture to help others recognize you.</p>
                </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}