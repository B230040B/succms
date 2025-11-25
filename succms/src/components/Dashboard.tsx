import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { BookOpen, Trophy, Clock, TrendingUp, Brain, Users, MessageSquare, Star } from "lucide-react";

export function Dashboard() {
  const aiRecommendations = [
    {
      title: "Complete JavaScript Fundamentals",
      reason: "Based on your recent Python progress",
      progress: 67,
      difficulty: "Beginner"
    },
    {
      title: "Advanced Data Structures",
      reason: "Complements your algorithm studies",
      progress: 0,
      difficulty: "Advanced"
    },
    {
      title: "UI/UX Design Principles",
      reason: "Popular among similar learners",
      progress: 23,
      difficulty: "Intermediate"
    }
  ];

  const recentBadges = [
    { name: "Quick Learner", icon: "⚡", description: "Completed 5 lessons in one day" },
    { name: "Discussion Leader", icon: "💬", description: "Most helpful forum contributor" },
    { name: "Milestone Master", icon: "🎯", description: "Reached 50% course completion" }
  ];

  const activityFeed = [
    { user: "Sarah Chen", action: "completed", target: "React Hooks Module", time: "2 hours ago", avatar: "/avatars/sarah.jpg" },
    { user: "Mike Johnson", action: "started", target: "Machine Learning Basics", time: "4 hours ago", avatar: "/avatars/mike.jpg" },
    { user: "You", action: "earned badge", target: "Quick Learner", time: "1 day ago", avatar: "/avatars/you.jpg" },
    { user: "Elena Rodriguez", action: "posted in", target: "JavaScript Help Forum", time: "2 days ago", avatar: "/avatars/elena.jpg" }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Welcome back, Alex!</h1>
          <p className="text-muted-foreground">Ready to continue your learning journey?</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Trophy className="h-4 w-4" />
            <span>Learning Streak: 12 days</span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Courses Enrolled</p>
                <p className="text-2xl font-semibold">8</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
                <p className="text-2xl font-semibold">15</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Study Hours</p>
                <p className="text-2xl font-semibold">124</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Avg. Score</p>
                <p className="text-2xl font-semibold">87%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* AI Recommendations */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiRecommendations.map((rec, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4>{rec.title}</h4>
                      <p className="text-sm text-muted-foreground">{rec.reason}</p>
                    </div>
                    <Badge variant={rec.difficulty === 'Beginner' ? 'secondary' : rec.difficulty === 'Intermediate' ? 'default' : 'destructive'}>
                      {rec.difficulty}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{rec.progress}%</span>
                    </div>
                    <Progress value={rec.progress} />
                  </div>
                  <Button className="w-full" variant={rec.progress === 0 ? "default" : "outline"}>
                    {rec.progress === 0 ? "Start Course" : "Continue Learning"}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Badges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Recent Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {recentBadges.map((badge, index) => (
                  <div key={index} className="text-center p-4 border rounded-lg">
                    <div className="text-3xl mb-2">{badge.icon}</div>
                    <h4 className="text-sm">{badge.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">{badge.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Activity Feed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityFeed.map((activity, index) => (
              <div key={index} className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{activity.user.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm">
                    <span className={activity.user === 'You' ? 'font-semibold text-primary' : 'font-semibold'}>
                      {activity.user}
                    </span>{' '}
                    <span className="text-muted-foreground">{activity.action}</span>{' '}
                    <span>{activity.target}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}