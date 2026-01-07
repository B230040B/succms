import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { OnlineActivity } from "./SocialWidgets";
import { AIRecommendations } from "./AIRecommendations";
import { Stories } from "./Stories";
import { useAuth } from "@/contexts/AuthContext";
import { 
  BookOpen, 
  Users, 
  FileText, 
  MessageSquare, 
  Clock, 
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  BarChart3,
  GraduationCap,
  Plus,
  Brain,
  Zap,
  Target,
  ThumbsUp,
  ThumbsDown,
  Eye
} from "lucide-react";

export function LecturerDashboard() {
  const { profile } = useAuth();
  const myCourses = [
    {
      id: 1,
      code: "CS301",
      name: "Database Systems",
      semester: "Spring 2024",
      enrolledStudents: 45,
      totalStudents: 50,
      completionRate: 78,
      nextClass: "Today, 2:00 PM",
      room: "Lab 204",
      pendingGrades: 8,
      recentActivity: "3 new submissions",
      averageGrade: "B+",
      engagement: 85
    },
    {
      id: 2,
      code: "CS410",
      name: "Software Engineering",
      semester: "Spring 2024",
      enrolledStudents: 38,
      totalStudents: 40,
      completionRate: 65,
      nextClass: "Wed, 9:00 AM",
      room: "Room 105",
      pendingGrades: 12,
      recentActivity: "5 forum posts",
      averageGrade: "B",
      engagement: 72
    },
    {
      id: 3,
      code: "CS550",
      name: "Advanced Databases",
      semester: "Spring 2024",
      enrolledStudents: 25,
      totalStudents: 30,
      completionRate: 82,
      nextClass: "Thu, 11:00 AM",
      room: "Lab 301",
      pendingGrades: 3,
      recentActivity: "1 new submission",
      averageGrade: "A-",
      engagement: 92
    }
  ];

  const pendingTasks = [
    {
      id: 1,
      type: "grading",
      title: "Grade Database Design Projects",
      course: "CS301",
      count: 8,
      dueDate: "2024-03-20",
      priority: "high",
      timeEstimate: "2 hours",
      aiSuggestion: "AI-assisted rubric available"
    },
    {
      id: 2,
      type: "grading",
      title: "Review System Requirements Documents",
      course: "CS410",
      count: 12,
      dueDate: "2024-03-22",
      priority: "medium",
      timeEstimate: "3 hours",
      aiSuggestion: "Similar patterns detected in submissions"
    },
    {
      id: 3,
      type: "forum",
      title: "Respond to Student Questions",
      course: "CS301",
      count: 5,
      dueDate: "Today",
      priority: "high",
      timeEstimate: "30 minutes",
      aiSuggestion: "Draft responses generated"
    },
    {
      id: 4,
      type: "preparation",
      title: "Prepare Advanced SQL Lecture",
      course: "CS550",
      count: 1,
      dueDate: "2024-03-21",
      priority: "medium",
      timeEstimate: "1 hour",
      aiSuggestion: "Interactive examples recommended"
    }
  ];

  const recentActivity = [
    {
      student: "Alex Johnson",
      action: "submitted",
      item: "Database Design Project",
      course: "CS301",
      time: "2 hours ago",
      needsGrading: true,
      grade: null,
      quality: "high"
    },
    {
      student: "Sarah Kim",
      action: "posted question in",
      item: "Software Architecture Forum",
      course: "CS410",
      time: "4 hours ago",
      needsGrading: false,
      grade: null,
      quality: "medium"
    },
    {
      student: "Mike Chen",
      action: "submitted",
      item: "Algorithm Analysis Report",
      course: "CS410",
      time: "1 day ago",
      needsGrading: true,
      grade: null,
      quality: "high"
    },
    {
      student: "Elena Rodriguez",
      action: "completed",
      item: "Advanced Query Lab",
      course: "CS550",
      time: "1 day ago",
      needsGrading: false,
      grade: "A",
      quality: "excellent"
    }
  ];

  const upcomingClasses = [
    {
      course: "CS301 - Database Systems",
      time: "Today, 2:00 PM",
      room: "Lab 204",
      topic: "Advanced SQL Queries",
      studentsExpected: 42,
      materialsReady: true,
      aiInsights: "Students struggling with joins - prepare extra examples"
    },
    {
      course: "CS410 - Software Engineering",
      time: "Wed, 9:00 AM",
      room: "Room 105",
      topic: "Design Patterns",
      studentsExpected: 35,
      materialsReady: false,
      aiInsights: "High engagement expected - interactive session recommended"
    },
    {
      course: "CS550 - Advanced Databases",
      time: "Thu, 11:00 AM",
      room: "Lab 301",
      topic: "Database Optimization",
      studentsExpected: 23,
      materialsReady: true,
      aiInsights: "Advanced topic - consider splitting into two sessions"
    }
  ];

  const studentEngagementMetrics = {
    totalStudents: 108,
    activeToday: 89,
    avgSessionTime: "45 min",
    forumPosts: 23,
    assignmentSubmissions: 15,
    officeHoursVisits: 7
  };

  const aiInsights = [
    {
      type: "performance",
      title: "CS301 Assignment Quality Declining",
      description: "Recent submissions show 25% drop in quality. Consider review session.",
      confidence: 88,
      actionable: true,
      course: "CS301"
    },
    {
      type: "engagement",
      title: "Forum Activity Peak at 8 PM",
      description: "Students most active in evening. Consider scheduled Q&A sessions.",
      confidence: 92,
      actionable: true,
      course: "All"
    },
    {
      type: "prediction",
      title: "Midterm Performance Forecast",
      description: "CS410 students may struggle with design patterns. Early intervention recommended.",
      confidence: 78,
      actionable: true,
      course: "CS410"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'grading': return FileText;
      case 'forum': return MessageSquare;
      case 'preparation': return BookOpen;
      default: return Clock;
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case 'excellent': return 'text-green-600';
      case 'high': return 'text-blue-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getEngagementColor = (engagement: number) => {
    if (engagement >= 85) return 'text-green-600';
    if (engagement >= 70) return 'text-blue-600';
    if (engagement >= 55) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Welcome, {profile?.full_name || 'Lecturer'}</h1>
          <p className="text-muted-foreground">Manage your courses and track student progress</p>
        </div>
      </div>

      {/* Stories Feature */}
      <Card>
        <CardContent className="p-6">
          <Stories />
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Courses</p>
                <p className="text-2xl font-semibold">{myCourses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Students</p>
                <p className="text-2xl font-semibold">{studentEngagementMetrics.totalStudents}</p>
                <p className="text-xs text-green-600">{studentEngagementMetrics.activeToday} active today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FileText className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Grades</p>
                <p className="text-2xl font-semibold">
                  {myCourses.reduce((acc, course) => acc + course.pendingGrades, 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Forum Posts</p>
                <p className="text-2xl font-semibold">{studentEngagementMetrics.forumPosts}</p>
                <p className="text-xs text-muted-foreground">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Engagement</p>
                <p className="text-2xl font-semibold">
                  {Math.round(myCourses.reduce((acc, course) => acc + course.engagement, 0) / myCourses.length)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* My Courses */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {myCourses.map((course) => (
                <div key={course.id} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{course.code}</Badge>
                        <h4>{course.name}</h4>
                      </div>
                      <p className="text-sm text-muted-foreground">{course.semester}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-sm font-medium">{course.enrolledStudents}/{course.totalStudents} students</p>
                      <div className="flex items-center gap-2">
                        <Badge className="text-xs">Avg: {course.averageGrade}</Badge>
                        <span className={`text-xs ${getEngagementColor(course.engagement)}`}>
                          {course.engagement}% engaged
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Course Completion</span>
                      <span>{course.completionRate}%</span>
                    </div>
                    <Progress value={course.completionRate} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.nextClass}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>{course.room}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {course.pendingGrades > 0 && (
                        <Badge variant="destructive">
                          {course.pendingGrades} to grade
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {course.recentActivity}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View Course
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="h-3 w-3 mr-1" />
                      Grade Assignments
                    </Button>
                    <Button size="sm" variant="outline">
                      <BarChart3 className="h-3 w-3 mr-1" />
                      Analytics
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Teaching Recommendations */}
          <AIRecommendations 
            userRole="lecturer" 
            currentCourses={myCourses.map(c => c.code)}
          />

          {/* Pending Tasks with AI Assistance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Pending Tasks
                <Badge className="bg-purple-100 text-purple-800 ml-auto">
                  <Zap className="h-3 w-3 mr-1" />
                  AI Assisted
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {pendingTasks.map((task) => {
                const Icon = getTaskIcon(task.type);
                return (
                  <div key={task.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-muted rounded-lg">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-muted-foreground">{task.course}</p>
                        </div>
                      </div>
                      <Badge className={getPriorityColor(task.priority)}>
                        {task.priority}
                      </Badge>
                    </div>
                    
                    {task.aiSuggestion && (
                      <div className="mb-3 p-2 bg-purple-50 border border-purple-200 rounded text-sm">
                        <Brain className="h-3 w-3 inline mr-1 text-purple-600" />
                        <span className="text-purple-700">{task.aiSuggestion}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-4">
                        <span>{task.count} {task.type === 'grading' ? 'submissions' : 'items'}</span>
                        <span className="text-muted-foreground">Est. {task.timeEstimate}</span>
                      </div>
                      <span className="text-muted-foreground">Due: {task.dueDate}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-3">
                      <Button size="sm" className="flex-1">
                        Start Task
                      </Button>
                      {task.aiSuggestion && (
                        <Button size="sm" variant="outline">
                          <Brain className="h-3 w-3 mr-1" />
                          AI Assist
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Online Activity */}
          <OnlineActivity userRole="lecturer" />

          {/* Upcoming Classes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Classes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingClasses.map((class_, index) => (
                <div key={index} className="space-y-3 p-3 border rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium">{class_.course}</h4>
                    <p className="text-xs text-muted-foreground">{class_.time} • {class_.room}</p>
                  </div>
                  <p className="text-sm">{class_.topic}</p>
                  
                  {class_.aiInsights && (
                    <div className="p-2 bg-blue-50 border border-blue-200 rounded text-xs">
                      <Brain className="h-3 w-3 inline mr-1 text-blue-600" />
                      <span className="text-blue-700">{class_.aiInsights}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{class_.studentsExpected} students expected</span>
                    <div className="flex items-center gap-1">
                      {class_.materialsReady ? (
                        <CheckCircle2 className="h-3 w-3 text-green-600" />
                      ) : (
                        <AlertCircle className="h-3 w-3 text-orange-600" />
                      )}
                      <span className={class_.materialsReady ? 'text-green-600' : 'text-orange-600'}>
                        {class_.materialsReady ? 'Ready' : 'Prep needed'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Student Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {activity.student.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">
                      <span className="font-medium">{activity.student}</span>{' '}
                      <span className="text-muted-foreground">{activity.action}</span>{' '}
                      <span>{activity.item}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">{activity.course} • {activity.time}</p>
                      <div className="flex items-center gap-2">
                        {activity.grade && (
                          <Badge variant="secondary" className="text-xs">
                            {activity.grade}
                          </Badge>
                        )}
                        <span className={`text-xs ${getQualityColor(activity.quality)}`}>
                          {activity.quality}
                        </span>
                        {activity.needsGrading && (
                          <Badge variant="destructive" className="text-xs">
                            Needs grading
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}