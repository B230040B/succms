import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { OnlineActivity, PeerBenchmarking, SocialActivityFeed, StudyGroups } from "./SocialWidgets";
import { AIRecommendations, StudyInsights } from "./AIRecommendations";
import { Stories } from "./Stories";
import { AdvertisementPanel } from "./AdvertisementPanel";
import { 
  BookOpen, 
  Clock, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  Bell,
  Brain,
  Zap
} from "lucide-react";

export function StudentDashboard() {
  const enrolledCourses = [
    {
      id: 1,
      code: "CS301",
      name: "Database Systems",
      lecturer: "Dr. Sarah Chen",
      progress: 75,
      nextClass: "Today, 2:00 PM",
      room: "Lab 204",
      assignments: 2,
      status: "active",
      grade: "A-"
    },
    {
      id: 2,
      code: "CS205",
      name: "Data Structures & Algorithms",
      lecturer: "Prof. Michael Roberts",
      progress: 60,
      nextClass: "Tomorrow, 10:00 AM",
      room: "Room 301",
      assignments: 1,
      status: "active",
      grade: "B+"
    },
    {
      id: 3,
      code: "CS410",
      name: "Software Engineering",
      lecturer: "Dr. Elena Rodriguez",
      progress: 45,
      nextClass: "Wed, 9:00 AM",
      room: "Room 105",
      assignments: 3,
      status: "active",
      grade: "B"
    }
  ];

  const announcements = [
    {
      id: 1,
      title: "Midterm Exam Schedule Released",
      course: "CS301 - Database Systems",
      lecturer: "Dr. Sarah Chen",
      date: "2 hours ago",
      priority: "high",
      content: "Midterm examination will be held on March 15th, 2024 in Lab 204."
    },
    {
      id: 2,
      title: "Assignment 3 Due Date Extended",
      course: "CS410 - Software Engineering",
      lecturer: "Dr. Elena Rodriguez",
      date: "1 day ago",
      priority: "medium",
      content: "Due to popular request, Assignment 3 deadline has been extended to March 20th."
    },
    {
      id: 3,
      title: "Guest Lecture: Industry Best Practices",
      course: "CS205 - Data Structures",
      lecturer: "Prof. Michael Roberts",
      date: "2 days ago",
      priority: "low",
      content: "Special guest lecture by Google Senior Engineer this Friday."
    }
  ];

  const upcomingAssignments = [
    {
      id: 1,
      title: "Database Design Project",
      course: "CS301",
      dueDate: "2024-03-18",
      daysLeft: 3,
      status: "pending",
      type: "project"
    },
    {
      id: 2,
      title: "Algorithm Analysis Report",
      course: "CS205",
      dueDate: "2024-03-22",
      daysLeft: 7,
      status: "in_progress",
      type: "report"
    },
    {
      id: 3,
      title: "System Requirements Document",
      course: "CS410",
      dueDate: "2024-03-25",
      daysLeft: 10,
      status: "pending",
      type: "document"
    }
  ];

  const recentGrades = [
    { course: "CS301", assignment: "Quiz 2", grade: "A-", points: "28/30" },
    { course: "CS205", assignment: "Lab Exercise 4", grade: "B+", points: "87/100" },
    { course: "CS410", assignment: "Requirements Analysis", grade: "A", points: "95/100" }
  ];

  const studyStreakData = {
    currentStreak: 12,
    longestStreak: 18,
    weeklyGoal: 5,
    completedDays: 4
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header with AI Quick Insights */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Welcome back, Alex!</h1>
          <p className="text-muted-foreground">Here's what's happening in your courses today</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-purple-100 text-purple-800">
            <Brain className="h-3 w-3 mr-1" />
            AI Study Plan Ready
          </Badge>
          <Badge className="bg-green-100 text-green-800">
            <Zap className="h-3 w-3 mr-1" />
            {studyStreakData.currentStreak}-day streak
          </Badge>
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
                <p className="text-sm text-muted-foreground">Enrolled Courses</p>
                <p className="text-2xl font-semibold">{enrolledCourses.length}</p>
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
                <p className="text-sm text-muted-foreground">Pending Assignments</p>
                <p className="text-2xl font-semibold">{upcomingAssignments.filter(a => a.status === 'pending').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Grade</p>
                <p className="text-2xl font-semibold">B+</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Streak</p>
                <p className="text-2xl font-semibold">{studyStreakData.currentStreak} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-red-100 rounded-lg">
                <Bell className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">New Announcements</p>
                <p className="text-2xl font-semibold">{announcements.filter(a => a.priority === 'high').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
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
                      <Badge className={getGradeColor(course.grade)}>
                        {course.grade}
                      </Badge>
                      <Badge className={getStatusColor(course.status)}>
                        {course.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Course Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{course.nextClass}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{course.room}</span>
                      </div>
                    </div>
                    {course.assignments > 0 && (
                      <Badge variant="secondary">
                        {course.assignments} pending assignments
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* AI Recommendations */}
          <AIRecommendations 
            userRole="student" 
            currentCourses={enrolledCourses.map(c => c.code)}
            performanceData={{ averageGrade: "B+", weakAreas: ["SQL Joins", "Algorithm Complexity"] }}
          />

          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentGrades.map((grade, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{grade.assignment}</p>
                      <p className="text-sm text-muted-foreground">{grade.course}</p>
                    </div>
                    <div className="text-right">
                      <Badge className={getGradeColor(grade.grade)}>
                        {grade.grade}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">{grade.points}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Online Activity */}
          <OnlineActivity userRole="student" />

          {/* Peer Benchmarking */}
          <PeerBenchmarking 
            currentGrade="B+" 
            courseProgress={60} 
          />

          {/* AI Study Insights */}
          <StudyInsights />

          {/* Announcements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Announcements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {announcements.slice(0, 2).map((announcement) => (
                <div key={announcement.id} className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Badge className={getPriorityColor(announcement.priority)}>
                      {announcement.priority}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">{announcement.title}</h4>
                    <p className="text-xs text-muted-foreground">{announcement.course}</p>
                    <p className="text-xs text-muted-foreground">{announcement.date}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{announcement.content}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Study Groups */}
          <StudyGroups />

          {/* Social Activity Feed */}
          <SocialActivityFeed />

          {/* Upcoming Assignments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Upcoming Assignments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingAssignments.slice(0, 3).map((assignment) => (
                <div key={assignment.id} className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-medium">{assignment.title}</h4>
                      <p className="text-xs text-muted-foreground">{assignment.course}</p>
                    </div>
                    <Badge className={getStatusColor(assignment.status)}>
                      {assignment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">
                      Due: {new Date(assignment.dueDate).toLocaleDateString()}
                    </span>
                    <span className={`${assignment.daysLeft <= 3 ? 'text-red-600' : 'text-muted-foreground'}`}>
                      {assignment.daysLeft} days left
                    </span>
                  </div>
                  {assignment.daysLeft <= 3 && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3 w-3" />
                      <span>Due soon!</span>
                    </div>
                  )}
                </div>
              ))}
              <Button className="w-full" variant="outline" size="sm">
                View All Assignments
              </Button>
            </CardContent>
          </Card>

          {/* Advertisement Panel */}
          <AdvertisementPanel />
        </div>
      </div>
    </div>
  );
}