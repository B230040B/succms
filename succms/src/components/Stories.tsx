import { useState } from "react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { X, Plus, ChevronLeft, ChevronRight, Flag, ExternalLink, Award } from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";

type StoryContentType = "image" | "video" | "text" | "assignment" | "grade" | "course";

interface Story {
  id: number;
  userId: number;
  userName: string;
  userInitials: string;
  content: string;
  type: StoryContentType;
  timestamp: string;
  viewed: boolean;
  // Additional fields for different types
  title?: string;
  description?: string;
  grade?: string;
  assignmentTitle?: string;
  courseCode?: string;
}

interface StoryUser {
  id: number;
  name: string;
  initials: string;
  role: string;
  hasActiveStories: boolean;
  stories: Story[];
  viewed: boolean;
}

const mockStoryUsers: StoryUser[] = [
  {
    id: 0,
    name: "Your Story",
    initials: "YS",
    role: "student",
    hasActiveStories: false,
    stories: [],
    viewed: false
  },
  {
    id: 1,
    name: "Dr. Sarah Chen",
    initials: "SC",
    role: "lecturer",
    hasActiveStories: true,
    viewed: false,
    stories: [
      {
        id: 1,
        userId: 1,
        userName: "Dr. Sarah Chen",
        userInitials: "SC",
        content: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800",
        type: "image",
        timestamp: "2 hours ago",
        viewed: false,
        description: "Today's lecture on Database Normalization"
      },
      {
        id: 2,
        userId: 1,
        userName: "Dr. Sarah Chen",
        userInitials: "SC",
        content: "Assignment 3 submissions are now open! Remember to follow the SQL guidelines discussed in class.",
        type: "text",
        timestamp: "1 hour ago",
        viewed: false,
        title: "Assignment Update"
      }
    ]
  },
  {
    id: 2,
    name: "Prof. Michael",
    initials: "MR",
    role: "lecturer",
    hasActiveStories: true,
    viewed: false,
    stories: [
      {
        id: 3,
        userId: 2,
        userName: "Prof. Michael",
        userInitials: "MR",
        content: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=800",
        type: "image",
        timestamp: "3 hours ago",
        viewed: false,
        description: "Algorithm workshop starting soon!"
      }
    ]
  },
  {
    id: 3,
    name: "Emma Wilson",
    initials: "EW",
    role: "student",
    hasActiveStories: true,
    viewed: true,
    stories: [
      {
        id: 4,
        userId: 3,
        userName: "Emma Wilson",
        userInitials: "EW",
        content: "A",
        type: "grade",
        timestamp: "5 hours ago",
        viewed: true,
        title: "Database Systems - Midterm",
        courseCode: "CS301"
      }
    ]
  },
  {
    id: 4,
    name: "James Lee",
    initials: "JL",
    role: "student",
    hasActiveStories: true,
    viewed: false,
    stories: [
      {
        id: 5,
        userId: 4,
        userName: "James Lee",
        userInitials: "JL",
        content: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800",
        type: "image",
        timestamp: "6 hours ago",
        viewed: false,
        description: "Study group session 📚"
      },
      {
        id: 6,
        userId: 4,
        userName: "James Lee",
        userInitials: "JL",
        content: "Database Design Project",
        type: "assignment",
        timestamp: "5 hours ago",
        viewed: false,
        assignmentTitle: "Database Design Project",
        courseCode: "CS301",
        description: "Just submitted my project!"
      }
    ]
  },
  {
    id: 5,
    name: "Dr. Elena R.",
    initials: "ER",
    role: "lecturer",
    hasActiveStories: true,
    viewed: false,
    stories: [
      {
        id: 7,
        userId: 5,
        userName: "Dr. Elena R.",
        userInitials: "ER",
        content: "Software Engineering Principles",
        type: "course",
        timestamp: "8 hours ago",
        viewed: false,
        courseCode: "CS410",
        title: "New Course Module Released",
        description: "Check out the new Agile Development module in CS410"
      }
    ]
  }
];

interface StoriesProps {
  currentUserRole?: string;
}

export function Stories({ currentUserRole = "student" }: StoriesProps) {
  const [selectedUser, setSelectedUser] = useState<StoryUser | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>(mockStoryUsers);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const handleStoryClick = (user: StoryUser) => {
    if (user.id === 0) {
      alert("Add Story functionality - would open camera/file picker");
      return;
    }
    setSelectedUser(user);
    setCurrentStoryIndex(0);
  };

  const closeStoryViewer = () => {
    if (selectedUser && selectedUser.id !== 0) {
      setStoryUsers(prev => 
        prev.map(user => 
          user.id === selectedUser.id 
            ? { ...user, viewed: true, stories: user.stories.map(s => ({ ...s, viewed: true })) }
            : user
        )
      );
    }
    setSelectedUser(null);
    setCurrentStoryIndex(0);
  };

  const nextStory = () => {
    if (!selectedUser) return;
    
    if (currentStoryIndex < selectedUser.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } else {
      const currentUserIndex = storyUsers.findIndex(u => u.id === selectedUser.id);
      const nextUnviewedUser = storyUsers
        .slice(currentUserIndex + 1)
        .find(u => u.hasActiveStories && u.id !== 0);
      
      if (nextUnviewedUser) {
        setSelectedUser(nextUnviewedUser);
        setCurrentStoryIndex(0);
      } else {
        closeStoryViewer();
      }
    }
  };

  const previousStory = () => {
    if (!selectedUser) return;
    
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else {
      const currentUserIndex = storyUsers.findIndex(u => u.id === selectedUser.id);
      const previousUser = storyUsers
        .slice(0, currentUserIndex)
        .reverse()
        .find(u => u.hasActiveStories && u.id !== 0);
      
      if (previousUser) {
        setSelectedUser(previousUser);
        setCurrentStoryIndex(previousUser.stories.length - 1);
      }
    }
  };

  const handleReportStory = () => {
    alert(`Story ${currentStory?.id} has been reported for review. Our moderation team will investigate.`);
    setReportDialogOpen(false);
  };

  const currentStory = selectedUser?.stories[currentStoryIndex];

  const renderStoryContent = (story: Story) => {
    switch (story.type) {
      case "image":
        return (
          <div className="absolute inset-0">
            <ImageWithFallback
              src={story.content}
              alt={`Story by ${story.userName}`}
              className="w-full h-full object-contain"
            />
            {story.description && (
              <div className="absolute bottom-20 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                <p className="text-white text-center">{story.description}</p>
              </div>
            )}
          </div>
        );
      
      case "text":
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center p-8">
            <div className="text-center text-white space-y-4">
              {story.title && <h3 className="text-2xl">{story.title}</h3>}
              <p className="text-xl leading-relaxed">{story.content}</p>
            </div>
          </div>
        );
      
      case "grade":
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center p-8">
            <div className="text-center text-white space-y-6">
              <Award className="h-16 w-16 mx-auto" />
              <div>
                <h3 className="text-2xl mb-2">{story.title}</h3>
                <div className="text-8xl my-4">{story.content}</div>
                <Badge className="bg-white text-green-700 text-lg px-4 py-2">
                  {story.courseCode}
                </Badge>
              </div>
            </div>
          </div>
        );
      
      case "assignment":
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center p-8">
            <div className="text-center text-white space-y-6">
              <ExternalLink className="h-16 w-16 mx-auto" />
              <div>
                <Badge className="bg-white text-purple-700 mb-4">{story.courseCode}</Badge>
                <h3 className="text-2xl mb-2">{story.assignmentTitle}</h3>
                <p className="text-lg">{story.description}</p>
                <Button className="mt-6 bg-white text-purple-700 hover:bg-gray-100">
                  View Assignment
                </Button>
              </div>
            </div>
          </div>
        );
      
      case "course":
        return (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-cyan-600 flex items-center justify-center p-8">
            <div className="text-center text-white space-y-6">
              <div className="text-6xl mb-4">📚</div>
              <div>
                <Badge className="bg-white text-blue-700 mb-4 text-lg px-4 py-2">{story.courseCode}</Badge>
                <h3 className="text-2xl mb-2">{story.title}</h3>
                <p className="text-lg">{story.description}</p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      {/* Stories Carousel */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {storyUsers.map((user) => (
            <button
              key={user.id}
              onClick={() => handleStoryClick(user)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
            >
              <div className="relative">
                <div
                  className={`p-[3px] rounded-full ${
                    user.id === 0
                      ? "bg-gradient-to-br from-gray-300 to-gray-400"
                      : user.viewed
                      ? "bg-gradient-to-br from-gray-300 to-gray-400"
                      : "bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600"
                  }`}
                >
                  <div className="bg-white p-[2px] rounded-full">
                    <Avatar className="h-16 w-16 border-2 border-white">
                      <AvatarFallback className="bg-blue-100 text-blue-700">
                        {user.initials}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {user.id === 0 && (
                  <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 border-2 border-white">
                    <Plus className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>

              <span className="text-xs text-center max-w-[80px] truncate">
                {user.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {selectedUser && currentStory && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          <div className="relative w-full h-full max-w-lg mx-auto flex items-center justify-center">
            {/* Story Content */}
            {renderStoryContent(currentStory)}

            {/* Top Overlay */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/60 to-transparent z-10">
              <div className="flex gap-1 mb-4">
                {selectedUser.stories.map((_, index) => (
                  <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-white transition-all duration-300 ${
                        index < currentStoryIndex
                          ? "w-full"
                          : index === currentStoryIndex
                          ? "w-full animate-progress"
                          : "w-0"
                      }`}
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white">
                    <AvatarFallback className="bg-blue-600 text-white">
                      {currentStory.userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white text-sm">{currentStory.userName}</p>
                    <p className="text-white/80 text-xs">{currentStory.timestamp}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Report Button */}
                  <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-white hover:bg-white/20"
                      >
                        <Flag className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Report Story</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to report this story? Our moderation team will review it for policy violations.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleReportStory}>
                          Report
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeStoryViewer}
                    className="text-white hover:bg-white/20"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Navigation Areas */}
            <button
              onClick={previousStory}
              className="absolute left-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
              aria-label="Previous story"
            />
            <button
              onClick={nextStory}
              className="absolute right-0 top-0 bottom-0 w-1/3 z-20 cursor-pointer"
              aria-label="Next story"
            />

            {/* Always Visible Navigation Arrows */}
            <Button
              onClick={previousStory}
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white"
              disabled={currentStoryIndex === 0 && storyUsers.findIndex(u => u.id === selectedUser.id) === 0}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              onClick={nextStory}
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/40 hover:bg-black/60 text-white"
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        @keyframes progress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
        .animate-progress {
          animation: progress 5s linear forwards;
        }
      `}</style>
    </div>
  );
}
