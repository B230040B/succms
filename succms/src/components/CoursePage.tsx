import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Separator } from "./ui/separator";
import { 
  Play, 
  CheckCircle, 
  Clock, 
  Users, 
  MessageSquare, 
  Bot, 
  Send, 
  BookOpen, 
  Video, 
  FileText, 
  HelpCircle,
  Lock
} from "lucide-react";

export function CoursePage() {
  const [selectedModule, setSelectedModule] = useState(0);
  const [chatMessage, setChatMessage] = useState("");
  const [discussionMessage, setDiscussionMessage] = useState("");

  const course = {
    title: "Complete JavaScript Fundamentals",
    instructor: "Dr. Sarah Chen",
    progress: 67,
    totalModules: 12,
    completedModules: 8,
    totalStudents: 2847,
    rating: 4.8
  };

  const modules = [
    { id: 1, title: "Introduction to JavaScript", type: "video", duration: "15 min", completed: true, locked: false },
    { id: 2, title: "Variables and Data Types", type: "video", duration: "22 min", completed: true, locked: false },
    { id: 3, title: "Functions Deep Dive", type: "video", duration: "28 min", completed: true, locked: false },
    { id: 4, title: "Practice: Basic Functions", type: "quiz", duration: "10 min", completed: true, locked: false },
    { id: 5, title: "Objects and Arrays", type: "video", duration: "35 min", completed: true, locked: false },
    { id: 6, title: "DOM Manipulation", type: "video", duration: "42 min", completed: true, locked: false },
    { id: 7, title: "Event Handling", type: "video", duration: "18 min", completed: true, locked: false },
    { id: 8, title: "Assignment: To-Do App", type: "assignment", duration: "2 hours", completed: true, locked: false },
    { id: 9, title: "Async JavaScript", type: "video", duration: "31 min", completed: false, locked: false },
    { id: 10, title: "Promises and Fetch API", type: "video", duration: "26 min", completed: false, locked: false },
    { id: 11, title: "Final Project", type: "assignment", duration: "4 hours", completed: false, locked: false },
    { id: 12, title: "Course Completion Quiz", type: "quiz", duration: "30 min", completed: false, locked: true }
  ];

  const discussions = [
    {
      user: "Mike Johnson",
      time: "2 hours ago",
      message: "Can someone explain the difference between let and var? I'm still confused about scope.",
      replies: 3
    },
    {
      user: "Elena Rodriguez", 
      time: "5 hours ago",
      message: "Great explanation of closures in module 3! The examples really helped me understand.",
      replies: 1
    },
    {
      user: "David Kim",
      time: "1 day ago", 
      message: "Having trouble with the DOM manipulation exercises. Any tips?",
      replies: 7
    }
  ];

  const aiChatHistory = [
    { role: "assistant", message: "Hi! I'm your AI learning assistant. How can I help you with JavaScript today?" },
    { role: "user", message: "Can you explain hoisting?" },
    { role: "assistant", message: "Hoisting is a JavaScript behavior where variable and function declarations are moved to the top of their scope during compilation. However, only declarations are hoisted, not initializations. For example, with `var`, you can reference a variable before it's declared, but it will be `undefined`." }
  ];

  const getModuleIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-4 w-4" />;
      case "quiz": return <HelpCircle className="h-4 w-4" />;
      case "assignment": return <FileText className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const handleSendChat = () => {
    if (chatMessage.trim()) {
      setChatMessage("");
      // In a real app, this would send to AI API
    }
  };

  const handleSendDiscussion = () => {
    if (discussionMessage.trim()) {
      setDiscussionMessage("");
      // In a real app, this would post to discussions
    }
  };

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Badge>JavaScript</Badge>
            <Badge variant="outline">Beginner</Badge>
          </div>
          <h1>{course.title}</h1>
          <p className="text-muted-foreground">by {course.instructor}</p>
          
          <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {course.totalStudents.toLocaleString()} students
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              12 modules
            </div>
            <div className="flex items-center gap-1">
              ⭐ {course.rating} rating
            </div>
          </div>
        </div>

        <Card className="lg:w-80">
          <CardContent className="p-6">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Course Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} />
                <p className="text-xs text-muted-foreground mt-1">
                  {course.completedModules} of {course.totalModules} modules completed
                </p>
              </div>
              <Button className="w-full">Continue Learning</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Modules List */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Course Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {modules.map((module, index) => (
                <div
                  key={module.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedModule === index ? 'bg-accent' : 'hover:bg-accent/50'
                  }`}
                  onClick={() => !module.locked && setSelectedModule(index)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded ${module.locked ? 'bg-muted' : 'bg-primary/10'}`}>
                      {module.locked ? (
                        <Lock className="h-4 w-4 text-muted-foreground" />
                      ) : module.completed ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        getModuleIcon(module.type)
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className={module.locked ? 'text-muted-foreground' : ''}>{module.title}</h4>
                        <span className="text-sm text-muted-foreground">{module.duration}</span>
                      </div>
                      <p className="text-sm text-muted-foreground capitalize">{module.type}</p>
                    </div>
                    {!module.locked && !module.completed && (
                      <Button size="sm" variant="outline">
                        <Play className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* AI Assistant & Discussions */}
        <div className="space-y-6">
          <Tabs defaultValue="ai" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai" className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                AI Assistant
              </TabsTrigger>
              <TabsTrigger value="discussions" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Discussions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="ai">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Learning Assistant</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {aiChatHistory.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] p-3 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Ask me anything about the course..."
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      className="min-h-[40px] resize-none"
                    />
                    <Button size="sm" onClick={handleSendChat}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="discussions">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Course Discussions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4 max-h-64 overflow-y-auto">
                    {discussions.map((discussion, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {discussion.user.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 text-sm">
                              <span className="font-semibold">{discussion.user}</span>
                              <span className="text-muted-foreground">{discussion.time}</span>
                            </div>
                            <p className="text-sm mt-1">{discussion.message}</p>
                            <Button variant="ghost" size="sm" className="text-xs h-6 mt-1">
                              {discussion.replies} replies
                            </Button>
                          </div>
                        </div>
                        {index < discussions.length - 1 && <Separator />}
                      </div>
                    ))}
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Textarea
                      placeholder="Join the discussion..."
                      value={discussionMessage}
                      onChange={(e) => setDiscussionMessage(e.target.value)}
                      className="min-h-[40px] resize-none"
                    />
                    <Button size="sm" onClick={handleSendDiscussion}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}