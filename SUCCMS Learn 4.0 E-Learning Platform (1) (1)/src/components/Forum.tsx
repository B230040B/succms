import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  MessageSquare, 
  ThumbsUp, 
  Eye, 
  Search, 
  Plus, 
  Bot, 
  TrendingUp, 
  Clock, 
  Pin,
  Heart,
  Lightbulb,
  Zap
} from "lucide-react";

export function Forum() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPost, setSelectedPost] = useState<number | null>(null);

  const categories = [
    { name: "All", count: 1247, active: true },
    { name: "JavaScript", count: 324, active: false },
    { name: "Python", count: 289, active: false },
    { name: "Web Design", count: 156, active: false },
    { name: "Career", count: 98, active: false },
    { name: "General", count: 380, active: false }
  ];

  const posts = [
    {
      id: 1,
      title: "Best practices for async/await in JavaScript?",
      author: "Mike Chen",
      authorType: "student",
      time: "2 hours ago",
      category: "JavaScript",
      views: 156,
      likes: 23,
      replies: 8,
      isPinned: false,
      isAnswered: true,
      anonymousReactions: { helpful: 12, confused: 2, celebrate: 8 },
      aiSummary: "Discussion about JavaScript async/await patterns, error handling, and performance considerations.",
      preview: "I've been working with promises and async/await but I'm not sure about the best practices..."
    },
    {
      id: 2,
      title: "How to transition from tutorial hell to building projects?",
      author: "Anonymous",
      authorType: "anonymous",
      time: "4 hours ago", 
      category: "Career",
      views: 289,
      likes: 45,
      replies: 15,
      isPinned: true,
      isAnswered: false,
      anonymousReactions: { helpful: 28, confused: 1, celebrate: 16 },
      aiSummary: "Community advice on overcoming tutorial dependency and starting real projects.",
      preview: "I've completed tons of tutorials but struggle to build anything from scratch..."
    },
    {
      id: 3,
      title: "Python vs JavaScript for a beginner - which should I choose?",
      author: "Sarah Kim",
      authorType: "student", 
      time: "1 day ago",
      category: "General",
      views: 432,
      likes: 67,
      replies: 22,
      isPinned: false,
      isAnswered: true,
      anonymousReactions: { helpful: 34, confused: 5, celebrate: 23 },
      aiSummary: "Comparison of Python and JavaScript for beginners, covering learning curve and career prospects.",
      preview: "I'm completely new to programming and trying to decide between these two languages..."
    },
    {
      id: 4,
      title: "CSS Grid vs Flexbox - when to use what?",
      author: "Alex Rivera",
      authorType: "student",
      time: "2 days ago",
      category: "Web Design", 
      views: 198,
      likes: 31,
      replies: 12,
      isPinned: false,
      isAnswered: true,
      anonymousReactions: { helpful: 18, confused: 3, celebrate: 10 },
      aiSummary: "Technical discussion on CSS layout methods with practical examples and use cases.",
      preview: "I understand both concepts but I'm still confused about when to use Grid vs Flexbox..."
    }
  ];

  const trendingTopics = [
    { name: "Machine Learning Basics", posts: 45, trend: "+12%" },
    { name: "React Hooks", posts: 38, trend: "+8%" },
    { name: "Job Interview Tips", posts: 29, trend: "+15%" },
    { name: "Git Workflow", posts: 22, trend: "+5%" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1>Community Forum</h1>
          <p className="text-muted-foreground">Connect, share, and learn together</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search discussions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Categories */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {categories.map((category) => (
                <div
                  key={category.name}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                    category.active ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  }`}
                >
                  <span className="text-sm">{category.name}</span>
                  <span className={`text-xs ${category.active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {category.count}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Trending Topics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Trending
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {trendingTopics.map((topic) => (
                <div key={topic.name} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{topic.name}</span>
                    <span className="text-xs text-green-600">{topic.trend}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          <Tabs defaultValue="recent">
            <TabsList>
              <TabsTrigger value="recent" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent
              </TabsTrigger>
              <TabsTrigger value="popular" className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Popular
              </TabsTrigger>
              <TabsTrigger value="unanswered" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Unanswered
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="space-y-4">
              {posts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {/* Post Header */}
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {post.authorType === 'anonymous' ? '?' : post.author.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                {post.isPinned && <Pin className="h-4 w-4 text-yellow-500" />}
                                <h3 className="text-lg leading-tight">{post.title}</h3>
                              </div>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span>by {post.author}</span>
                                <span>{post.time}</span>
                                <Badge variant="secondary" className="text-xs">
                                  {post.category}
                                </Badge>
                                {post.isAnswered && (
                                  <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                                    Answered
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <p className="text-muted-foreground">{post.preview}</p>

                          {/* AI Summary */}
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <Bot className="h-4 w-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-800">AI Summary</span>
                            </div>
                            <p className="text-sm text-blue-700">{post.aiSummary}</p>
                          </div>

                          {/* Post Stats */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Eye className="h-4 w-4" />
                                {post.views}
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-4 w-4" />
                                {post.likes}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-4 w-4" />
                                {post.replies} replies
                              </div>
                            </div>

                            {/* Anonymous Reactions */}
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-sm">
                                <Lightbulb className="h-4 w-4 text-yellow-500" />
                                <span>{post.anonymousReactions.helpful}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Heart className="h-4 w-4 text-red-500" />
                                <span>{post.anonymousReactions.celebrate}</span>
                              </div>
                              <div className="flex items-center gap-1 text-sm">
                                <Zap className="h-4 w-4 text-orange-500" />
                                <span>{post.anonymousReactions.confused}</span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Reactions */}
                          <div className="flex items-center gap-2 pt-2 border-t">
                            <Button variant="ghost" size="sm" className="text-xs h-7">
                              👍 Helpful
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs h-7">
                              🎉 Celebrate  
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs h-7">
                              😕 Confused
                            </Button>
                            <Button variant="outline" size="sm" className="text-xs h-7 ml-auto">
                              Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="popular">
              <div className="text-center py-8 text-muted-foreground">
                Popular posts would be shown here...
              </div>
            </TabsContent>

            <TabsContent value="unanswered">
              <div className="text-center py-8 text-muted-foreground">
                Unanswered questions would be shown here...
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}