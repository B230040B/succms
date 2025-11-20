import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Trophy, 
  Target, 
  Zap, 
  Star, 
  Flame, 
  Award, 
  TrendingUp, 
  Calendar,
  Users,
  BookOpen,
  Clock,
  CheckCircle
} from "lucide-react";

export function Gamification() {
  const userStats = {
    level: 12,
    xp: 2840,
    xpToNext: 3200,
    streak: 12,
    rank: 47,
    totalUsers: 2847,
    badges: 15,
    coursesCompleted: 3,
    studyHours: 124
  };

  const achievements = [
    {
      id: 1,
      name: "First Steps",
      description: "Complete your first lesson",
      icon: "🎯",
      earned: true,
      rarity: "common",
      earnedDate: "2025-07-15",
      xpReward: 50
    },
    {
      id: 2,
      name: "Speed Demon",
      description: "Complete 5 lessons in one day",
      icon: "⚡",
      earned: true,
      rarity: "rare",
      earnedDate: "2025-08-10",
      xpReward: 200
    },
    {
      id: 3,
      name: "Discussion Master",
      description: "Get 50+ likes on forum posts",
      icon: "💬",
      earned: true,
      rarity: "epic",
      earnedDate: "2025-08-18",
      xpReward: 500
    },
    {
      id: 4,
      name: "Perfect Score",
      description: "Score 100% on 3 consecutive quizzes",
      icon: "🎯",
      earned: false,
      rarity: "legendary",
      earnedDate: null,
      xpReward: 1000
    },
    {
      id: 5,
      name: "Mentor",
      description: "Help 25 students in forums",
      icon: "🎓",
      earned: false,
      rarity: "epic",
      earnedDate: null,
      xpReward: 750
    }
  ];

  const leaderboard = [
    { rank: 1, name: "Sarah Chen", xp: 15420, level: 28, badge: "🏆" },
    { rank: 2, name: "Mike Johnson", xp: 14850, level: 27, badge: "🥈" },
    { rank: 3, name: "Elena Rodriguez", xp: 13940, level: 26, badge: "🥉" },
    { rank: 4, name: "David Kim", xp: 12200, level: 24, badge: "" },
    { rank: 5, name: "Anna Schmidt", xp: 11800, level: 23, badge: "" },
    { rank: 47, name: "You", xp: 2840, level: 12, badge: "", isUser: true }
  ];

  const challenges = [
    {
      id: 1,
      title: "7-Day Streak Master",
      description: "Study for 7 consecutive days",
      progress: 5,
      target: 7,
      xpReward: 500,
      timeLeft: "2 days",
      type: "streak"
    },
    {
      id: 2,
      title: "Quiz Champion",
      description: "Score 90%+ on 5 quizzes this week",
      progress: 2,
      target: 5,
      xpReward: 300,
      timeLeft: "4 days",
      type: "performance"
    },
    {
      id: 3,
      title: "Community Helper",
      description: "Answer 10 forum questions",
      progress: 7,
      target: 10,
      xpReward: 400,
      timeLeft: "1 week",
      type: "social"
    }
  ];

  const motivationalQuotes = [
    "You're making great progress! 🚀",
    "Consistency is key - keep up your streak! 🔥",
    "You're in the top 20% of learners this week! ⭐",
    "Challenge yourself with harder topics! 💪"
  ];

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "common": return "bg-gray-100 text-gray-800";
      case "rare": return "bg-blue-100 text-blue-800";
      case "epic": return "bg-purple-100 text-purple-800";
      case "legendary": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "streak": return <Flame className="h-4 w-4" />;
      case "performance": return <Target className="h-4 w-4" />;
      case "social": return <Users className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Your Learning Journey</h1>
        <p className="text-muted-foreground">Track progress, earn rewards, and compete with peers</p>
      </div>

      {/* User Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl font-bold text-primary">Level {userStats.level}</div>
              <p className="text-sm text-muted-foreground">Current Level</p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>{userStats.xp} XP</span>
                  <span>{userStats.xpToNext} XP</span>
                </div>
                <Progress value={(userStats.xp / userStats.xpToNext) * 100} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl">🔥</div>
              <div className="text-2xl font-bold">{userStats.streak}</div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl">🏆</div>
              <div className="text-2xl font-bold">#{userStats.rank}</div>
              <p className="text-sm text-muted-foreground">Global Rank</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <div className="space-y-2">
              <div className="text-2xl">⭐</div>
              <div className="text-2xl font-bold">{userStats.badges}</div>
              <p className="text-sm text-muted-foreground">Badges Earned</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Motivational Nudge */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Zap className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-blue-900">Daily Motivation</h3>
              <p className="text-blue-700">{motivationalQuotes[0]}</p>
            </div>
            <Button variant="outline" className="border-blue-300 text-blue-700">
              Keep Going!
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="achievements">
        <TabsList>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="challenges">Active Challenges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`${achievement.earned ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'opacity-75'}`}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="text-3xl">{achievement.icon}</div>
                      <Badge className={getRarityColor(achievement.rarity)}>
                        {achievement.rarity}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className={achievement.earned ? 'text-yellow-900' : 'text-muted-foreground'}>
                        {achievement.name}
                      </h4>
                      <p className={`text-sm ${achievement.earned ? 'text-yellow-700' : 'text-muted-foreground'}`}>
                        {achievement.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        <span>{achievement.xpReward} XP</span>
                      </div>
                      {achievement.earned && achievement.earnedDate && (
                        <span className="text-yellow-600 text-xs">
                          Earned {new Date(achievement.earnedDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {achievement.earned && (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4" />
                        <span>Completed</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="challenges" className="space-y-4">
          {challenges.map((challenge) => (
            <Card key={challenge.id}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {getChallengeIcon(challenge.type)}
                  </div>
                  
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4>{challenge.title}</h4>
                        <p className="text-sm text-muted-foreground">{challenge.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{challenge.xpReward} XP</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{challenge.timeLeft} left</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{challenge.progress}/{challenge.target}</span>
                      </div>
                      <Progress value={(challenge.progress / challenge.target) * 100} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Leaderboard</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.map((user) => (
                <div
                  key={user.rank}
                  className={`flex items-center gap-4 p-3 rounded-lg ${
                    user.isUser ? 'bg-primary/10 border border-primary/20' : 'hover:bg-accent'
                  }`}
                >
                  <div className="text-center w-8">
                    <span className={`text-sm ${user.rank <= 3 ? 'font-bold' : ''}`}>
                      {user.badge || `#${user.rank}`}
                    </span>
                  </div>
                  
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {user.name === "You" ? "Y" : user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <p className={`font-medium ${user.isUser ? 'text-primary' : ''}`}>
                      {user.name}
                    </p>
                    <p className="text-sm text-muted-foreground">Level {user.level}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-medium">{user.xp.toLocaleString()} XP</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Study Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Study Goals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Daily Study Streak</span>
                      <span>12/30 days</span>
                    </div>
                    <Progress value={40} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Monthly Study Hours</span>
                      <span>24/40 hours</span>
                    </div>
                    <Progress value={60} />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Courses Completed</span>
                      <span>3/5 courses</span>
                    </div>
                    <Progress value={60} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-accent rounded-lg">
                    <div className="text-xl font-bold text-green-600">87%</div>
                    <p className="text-xs text-muted-foreground">Avg Quiz Score</p>
                  </div>
                  <div className="text-center p-3 bg-accent rounded-lg">
                    <div className="text-xl font-bold text-blue-600">92%</div>
                    <p className="text-xs text-muted-foreground">Completion Rate</p>
                  </div>
                  <div className="text-center p-3 bg-accent rounded-lg">
                    <div className="text-xl font-bold text-purple-600">15</div>
                    <p className="text-xs text-muted-foreground">Forum Answers</p>
                  </div>
                  <div className="text-center p-3 bg-accent rounded-lg">
                    <div className="text-xl font-bold text-orange-600">4.2</div>
                    <p className="text-xs text-muted-foreground">Peer Rating</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Milestone Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Learning Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Completed JavaScript Fundamentals</p>
                    <p className="text-sm text-muted-foreground">August 15, 2025</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Started Advanced React Development</p>
                    <p className="text-sm text-muted-foreground">August 18, 2025</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 p-3 bg-yellow-50 rounded-lg border-l-4 border-yellow-500">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Earned Discussion Leader Badge</p>
                    <p className="text-sm text-muted-foreground">August 19, 2025</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}