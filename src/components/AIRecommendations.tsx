import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { 
  Brain, 
  Play, 
  ExternalLink, 
  BookOpen, 
  Video, 
  FileText,
  Star,
  Clock,
  TrendingUp,
  Lightbulb,
  Target,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Bookmark
} from "lucide-react";

interface AIRecommendationsProps {
  userRole: 'student' | 'lecturer';
  currentCourses?: string[];
  performanceData?: any;
}

export function AIRecommendations({ userRole, currentCourses = [], performanceData }: AIRecommendationsProps) {
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());

  const studentRecommendations = [
    {
      id: "1",
      type: "video",
      title: "Advanced SQL Joins Explained",
      platform: "Khan Academy",
      duration: "12 min",
      rating: 4.8,
      views: "2.3M",
      relevance: 95,
      reason: "Based on your struggles with complex queries in CS301",
      url: "https://khanacademy.org/sql-joins",
      difficulty: "intermediate",
      tags: ["SQL", "Database", "Joins"]
    },
    {
      id: "2", 
      type: "article",
      title: "Database Normalization Best Practices",
      platform: "GeeksforGeeks",
      duration: "8 min read",
      rating: 4.6,
      views: "890K",
      relevance: 88,
      reason: "Recommended for upcoming Database Design assignment",
      url: "https://geeksforgeeks.org/normalization",
      difficulty: "beginner",
      tags: ["Database", "Normalization", "Design"]
    },
    {
      id: "3",
      type: "video",
      title: "Dynamic Programming Patterns",
      platform: "YouTube - Abdul Bari",
      duration: "45 min",
      rating: 4.9,
      views: "1.8M", 
      relevance: 92,
      reason: "Your algorithm performance could improve with DP concepts",
      url: "https://youtube.com/watch?v=dp123",
      difficulty: "advanced",
      tags: ["Algorithms", "Dynamic Programming", "Problem Solving"]
    },
    {
      id: "4",
      type: "practice",
      title: "LeetCode SQL Practice Problems",
      platform: "LeetCode",
      duration: "30 problems",
      rating: 4.7,
      views: "500K",
      relevance: 85,
      reason: "Practice problems matching your current skill level",
      url: "https://leetcode.com/studyplan/sql",
      difficulty: "mixed",
      tags: ["SQL", "Practice", "Problem Solving"]
    },
    {
      id: "5",
      type: "course",
      title: "Software Design Patterns Masterclass",
      platform: "Coursera",
      duration: "6 weeks",
      rating: 4.8,
      views: "125K",
      relevance: 78,
      reason: "Perfect preparation for your Software Engineering course",
      url: "https://coursera.org/design-patterns",
      difficulty: "intermediate",
      tags: ["Software Engineering", "Design Patterns", "Architecture"]
    }
  ];

  const lecturerRecommendations = [
    {
      id: "l1",
      type: "tool",
      title: "SQLiteOnline - Interactive Database Tool",
      platform: "SQLiteOnline",
      duration: "Free tool",
      rating: 4.7,
      views: "1.2M",
      relevance: 95,
      reason: "Perfect for live database demonstrations in CS301",
      url: "https://sqliteonline.com",
      difficulty: "tool",
      tags: ["Database", "Teaching", "Interactive"]
    },
    {
      id: "l2",
      type: "article",
      title: "Effective Methods for Teaching Algorithms",
      platform: "ACM Digital Library",
      duration: "15 min read",
      rating: 4.6,
      views: "45K",
      relevance: 88,
      reason: "Research-backed strategies for your CS205 course",
      url: "https://dl.acm.org/teaching-algorithms",
      difficulty: "academic",
      tags: ["Teaching", "Algorithms", "Pedagogy"]
    },
    {
      id: "l3",
      type: "video",
      title: "Creating Engaging Programming Assignments",
      platform: "EdTech Hub",
      duration: "25 min",
      rating: 4.8,
      views: "78K",
      relevance: 82,
      reason: "Based on student engagement patterns in your courses",
      url: "https://edtechhub.org/programming-assignments",
      difficulty: "intermediate",
      tags: ["Assignment Design", "Engagement", "Programming"]
    }
  ];

  const recommendations = userRole === 'student' ? studentRecommendations : lecturerRecommendations;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'article': return FileText;
      case 'course': return BookOpen;
      case 'practice': return Target;
      case 'tool': return Zap;
      default: return ExternalLink;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-100 text-red-800';
      case 'article': return 'bg-blue-100 text-blue-800';
      case 'course': return 'bg-green-100 text-green-800';
      case 'practice': return 'bg-purple-100 text-purple-800';
      case 'tool': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      case 'mixed': return 'bg-blue-100 text-blue-800';
      case 'academic': return 'bg-purple-100 text-purple-800';
      case 'tool': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const toggleBookmark = (id: string) => {
    const newBookmarks = new Set(bookmarkedItems);
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id);
    } else {
      newBookmarks.add(id);
    }
    setBookmarkedItems(newBookmarks);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Recommendations
          <Badge className="bg-purple-100 text-purple-800 ml-auto">
            Personalized
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-sm text-muted-foreground">
          <Lightbulb className="h-4 w-4 inline mr-1" />
          {userRole === 'student' 
            ? "Curated learning resources based on your progress and performance"
            : "Teaching resources and tools tailored to your courses and student needs"
          }
        </div>

        {recommendations.slice(0, 3).map((item) => {
          const TypeIcon = getTypeIcon(item.type);
          const isBookmarked = bookmarkedItems.has(item.id);
          
          return (
            <div key={item.id} className="p-4 border rounded-lg space-y-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 bg-muted rounded-lg">
                    <TypeIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm leading-tight">{item.title}</h4>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => toggleBookmark(item.id)}
                        className="ml-2"
                      >
                        <Bookmark 
                          className={`h-4 w-4 ${isBookmarked ? 'fill-blue-500 text-blue-500' : 'text-muted-foreground'}`} 
                        />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={getTypeColor(item.type)} variant="secondary">
                        {item.type}
                      </Badge>
                      <Badge className={getDifficultyColor(item.difficulty)} variant="secondary">
                        {item.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{item.platform}</span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.duration}
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        {item.rating}
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {item.views}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Relevance Match</span>
                        <span className="text-green-600 font-medium">{item.relevance}%</span>
                      </div>
                      <Progress value={item.relevance} className="h-1" />
                    </div>

                    <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                      <Brain className="h-3 w-3 inline mr-1" />
                      {item.reason}
                    </p>

                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button className="flex-1" size="sm">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Open Resource
                </Button>
                <Button variant="outline" size="sm">
                  <ThumbsUp className="h-3 w-3" />
                </Button>
                <Button variant="outline" size="sm">
                  <ThumbsDown className="h-3 w-3" />
                </Button>
              </div>
            </div>
          );
        })}

        <Button variant="outline" className="w-full">
          <Brain className="h-4 w-4 mr-2" />
          View All AI Recommendations ({recommendations.length})
        </Button>
      </CardContent>
    </Card>
  );
}

export function StudyInsights() {
  const insights = [
    {
      type: "performance",
      title: "Peak Study Time Detected",
      description: "You perform best during 2-4 PM. Consider scheduling difficult topics then.",
      confidence: 92,
      actionable: true,
      icon: Clock
    },
    {
      type: "weakness",
      title: "SQL Joins Need Attention", 
      description: "Recent quiz results show 40% accuracy on complex joins. Practice recommended.",
      confidence: 88,
      actionable: true,
      icon: Target
    },
    {
      type: "strength",
      title: "Excellent Algorithm Intuition",
      description: "Your algorithm problem-solving speed is top 15% in class.",
      confidence: 95,
      actionable: false,
      icon: TrendingUp
    },
    {
      type: "prediction",
      title: "Midterm Performance Forecast",
      description: "Based on current progress, predicted grade: B+ (87%). Focus on databases.",
      confidence: 78,
      actionable: true,
      icon: Brain
    }
  ];

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'performance': return 'border-blue-200 bg-blue-50';
      case 'weakness': return 'border-red-200 bg-red-50';
      case 'strength': return 'border-green-200 bg-green-50';
      case 'prediction': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const getInsightIconColor = (type: string) => {
    switch (type) {
      case 'performance': return 'text-blue-600';
      case 'weakness': return 'text-red-600';
      case 'strength': return 'text-green-600';
      case 'prediction': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          AI Study Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div 
              key={index} 
              className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-white/50`}>
                  <Icon className={`h-4 w-4 ${getInsightIconColor(insight.type)}`} />
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">{insight.title}</h4>
                    <Badge variant="secondary" className="text-xs">
                      {insight.confidence}% confident
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-muted-foreground">
                    {insight.description}
                  </p>
                  
                  {insight.actionable && (
                    <Button size="sm" variant="outline" className="text-xs">
                      <Lightbulb className="h-3 w-3 mr-1" />
                      Get Action Plan
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}