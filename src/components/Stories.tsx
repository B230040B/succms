import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { supabase } from "@/lib/supabase.ts";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { X, Plus, ChevronLeft, ChevronRight, Flag, Loader2, Heart, Pause, Play } from "lucide-react";
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

interface Story {
  id: string;
  userId: string;
  userName: string;
  userInitials: string;
  contentUrl: string;
  type: "image";
  timestamp: string;
  viewed: boolean;
  created_at: string;
}

interface StoryUser {
  id: string;
  name: string;
  initials: string;
  avatar_url?: string;
  role: string;
  hasActiveStories: boolean;
  stories: Story[];
  viewed: boolean;
}

export function Stories({ 
  currentUserAvatar, 
  currentUserName, 
  currentUserInitials 
}: { 
  currentUserAvatar?: string, 
  currentUserName: string, 
  currentUserInitials: string 
}) {
  const { user } = useAuth();
  const [selectedUser, setSelectedUser] = useState<StoryUser | null>(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [storyUsers, setStoryUsers] = useState<StoryUser[]>([]);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const STORY_DURATION = 5000; // 5 seconds per story
  const PROGRESS_INTERVAL = 50; // Update progress every 50ms

  const [viewedStoryIds, setViewedStoryIds] = useState<Set<string>>(() => {
    const saved = localStorage.getItem("viewed_story_ids");
    return new Set(saved ? JSON.parse(saved) : []);
  });

  useEffect(() => {
    fetchStories();
  }, []); 

  const fetchStories = async () => {
    const currentUserId = user?.id;
    
    // Always create "Your Story" tile first
    const yourStory: StoryUser = {
      id: currentUserId || "me",
      name: "Your Story",
      initials: currentUserInitials,
      avatar_url: currentUserAvatar,
      role: "student",
      hasActiveStories: false,
      stories: [],
      viewed: true 
    };

    try {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('stories')
        .select('id, user_id, image_url, created_at')
        .gt('created_at', yesterday)
        .order('created_at', { ascending: true });

      if (error) {
        console.error("Error fetching stories:", error);
        setStoryUsers([yourStory]);
        return;
      }

      // Get unique user IDs to fetch profiles
      const userIds = [...new Set(data?.map(s => s.user_id).filter(id => id !== currentUserId))];
      
      // Fetch user profiles for other users
      const userProfiles: Record<string, any> = {};
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('id, full_name, avatar_url, role')
          .in('id', userIds);
        
        profiles?.forEach(p => {
          userProfiles[p.id] = p;
        });
      }

      const groups: Record<string, StoryUser> = {};

      data?.forEach((s: any) => {
        const uId = s.user_id;
        const isMe = uId === currentUserId;
        
        if (isMe) {
          // Add to "Your Story"
          yourStory.stories.push({
            id: s.id,
            userId: uId,
            userName: "You",
            userInitials: currentUserInitials,
            contentUrl: s.image_url,
            type: "image",
            timestamp: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            created_at: s.created_at,
            viewed: viewedStoryIds.has(s.id)
          });
          yourStory.hasActiveStories = true;
        } else {
          // Group other users' stories
          const profile = userProfiles[uId];
          if (!groups[uId]) {
            groups[uId] = {
              id: uId,
              name: profile?.full_name || "Unknown",
              initials: (profile?.full_name || "U").charAt(0),
              avatar_url: profile?.avatar_url,
              role: profile?.role || "student",
              hasActiveStories: true,
              stories: [],
              viewed: true
            };
          }

          groups[uId].stories.push({
            id: s.id,
            userId: uId,
            userName: profile?.full_name || "Unknown",
            userInitials: (profile?.full_name || "U").charAt(0),
            contentUrl: s.image_url,
            type: "image",
            timestamp: new Date(s.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            created_at: s.created_at,
            viewed: viewedStoryIds.has(s.id)
          });
        }
      });

      // Update viewed status for all groups
      if (yourStory.stories.length > 0) {
        const hasUnread = yourStory.stories.some(s => !viewedStoryIds.has(s.id));
        yourStory.viewed = !hasUnread;
      }

      Object.values(groups).forEach(group => {
        if (group.stories.length > 0) {
           const hasUnread = group.stories.some(s => !viewedStoryIds.has(s.id));
           group.viewed = !hasUnread;
        }
      });

      const others = Object.values(groups);
      setStoryUsers([yourStory, ...others]);

    } catch (e) {
      console.error("Error loading stories", e);
      // Still show "Your Story" even on error
      setStoryUsers([yourStory]);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isUploading || !user) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage.from('stories').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('stories').getPublicUrl(fileName);
      
      const { error: insertError } = await supabase.from('stories').insert({ 
        user_id: user.id, 
        image_url: publicUrl 
      });
      
      if (insertError) throw insertError;

      fetchStories(); 
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err?.message || "Upload failed. Ensure 'stories' bucket exists and table has correct columns.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStoryClick = (storyUser: StoryUser) => {
    // Only open viewer if user has stories
    if (!storyUser.hasActiveStories || storyUser.stories.length === 0) {
      return; // Do nothing, let Plus button handle uploads
    }
    
    setSelectedUser(storyUser);
    const firstUnviewedIdx = storyUser.stories.findIndex(s => !viewedStoryIds.has(s.id));
    const idx = firstUnviewedIdx >= 0 ? firstUnviewedIdx : 0;
    setCurrentStoryIndex(idx);
    setProgress(0);
    setImageLoading(true);
    setIsPaused(false);
    
    markAsViewed(storyUser.stories[idx].id);
  };

  const markAsViewed = useCallback((storyId: string) => {
    if (viewedStoryIds.has(storyId)) return;
    const newSet = new Set(viewedStoryIds).add(storyId);
    setViewedStoryIds(newSet);
    localStorage.setItem("viewed_story_ids", JSON.stringify([...newSet]));

    // Update UI rings immediately
    setStoryUsers(prev => prev.map(u => {
      const updatedStories = u.stories.map(s => s.id === storyId ? { ...s, viewed: true } : s);
      const hasUnread = updatedStories.some(s => !s.viewed);
      return { ...u, stories: updatedStories, viewed: !hasUnread };
    }));
  }, [viewedStoryIds]);

  const closeStoryViewer = useCallback(() => {
    setSelectedUser(null);
    setCurrentStoryIndex(0);
    setProgress(0);
    setIsPaused(false);
    setImageLoading(true);
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const nextStory = useCallback(() => {
    if (!selectedUser) return;
    
    // Reset progress for next story
    setProgress(0);
    setImageLoading(true);
    
    if (currentStoryIndex < selectedUser.stories.length - 1) {
      const nextIdx = currentStoryIndex + 1;
      setCurrentStoryIndex(nextIdx);
      markAsViewed(selectedUser.stories[nextIdx].id);
    } else {
      const currentUserIndex = storyUsers.findIndex(u => u.id === selectedUser.id);
      const nextUnviewedUser = storyUsers
        .slice(currentUserIndex + 1)
        .find(u => u.hasActiveStories && u.stories.length > 0);
      
      if (nextUnviewedUser) {
        setSelectedUser(nextUnviewedUser);
        setCurrentStoryIndex(0);
        markAsViewed(nextUnviewedUser.stories[0].id);
      } else {
        closeStoryViewer();
      }
    }
  }, [selectedUser, currentStoryIndex, storyUsers, markAsViewed, closeStoryViewer]);

  const previousStory = useCallback(() => {
    if (!selectedUser) return;
    
    // Reset progress for previous story
    setProgress(0);
    setImageLoading(true);
    
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } else {
      const currentUserIndex = storyUsers.findIndex(u => u.id === selectedUser.id);
      const previousUser = storyUsers
        .slice(0, currentUserIndex)
        .reverse()
        .find(u => u.hasActiveStories && u.stories.length > 0);
      
      if (previousUser) {
        setSelectedUser(previousUser);
        setCurrentStoryIndex(previousUser.stories.length - 1);
      }
    }
  }, [selectedUser, currentStoryIndex, storyUsers]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!selectedUser) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          closeStoryViewer();
          break;
        case 'ArrowLeft':
          previousStory();
          break;
        case 'ArrowRight':
          nextStory();
          break;
        case ' ':
          e.preventDefault();
          setIsPaused(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedUser, closeStoryViewer, previousStory, nextStory]);

  // Progress timer
  useEffect(() => {
    if (!selectedUser || isPaused || imageLoading || reportDialogOpen) {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      return;
    }

    progressIntervalRef.current = setInterval(() => {
      setProgress(prev => {
        const newProgress = prev + (PROGRESS_INTERVAL / STORY_DURATION) * 100;
        if (newProgress >= 100) {
          return 100;
        }
        return newProgress;
      });
    }, PROGRESS_INTERVAL);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [selectedUser, isPaused, imageLoading, currentStoryIndex, reportDialogOpen]);

  // Auto advance when progress reaches 100%
  useEffect(() => {
    if (progress >= 100) {
      nextStory();
    }
  }, [progress, nextStory]);

  const currentStory = selectedUser?.stories[currentStoryIndex];

  return (
    <div className="w-full">
      {/* Stories Carousel */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide px-1">
          {storyUsers.map((user, index) => {
            const isMe = index === 0;
            const ringColor = (isMe && !user.hasActiveStories) 
                ? "bg-gray-200 dark:bg-zinc-800" 
                : user.viewed 
                    ? "bg-gray-300 dark:bg-zinc-700" 
                    : "bg-gradient-to-tr from-blue-500 via-purple-500 to-orange-500";

            return (
              <div
                key={user.id}
                onClick={() => handleStoryClick(user)}
                className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer"
              >
                <div className="relative">
                  <div className={`p-[3px] rounded-full transition-all ${ringColor}`}>
                    <div className="bg-white dark:bg-black p-[2px] rounded-full">
                      <Avatar className="h-16 w-16 border-2 border-white dark:border-black">
                        <AvatarImage src={user.avatar_url} className="object-cover" />
                        <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">
                          {user.initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>

                  {isMe && (
                    <div 
                        className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 border-2 border-white dark:border-black hover:scale-110 transition-transform"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    >
                      {isUploading ? <Loader2 className="h-3 w-3 text-white animate-spin" /> : <Plus className="h-3 w-3 text-white" />}
                    </div>
                  )}
                </div>

                <span className="text-xs text-center max-w-[80px] truncate font-medium text-gray-700 dark:text-gray-300">
                  {user.name.split(' ')[0]}
                </span>
              </div>
            );
          })}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleUpload} />
        </div>
      </div>

      {/* Story Viewer Modal - Using portal-like fixed positioning */}
      {selectedUser && currentStory && (
        <div 
          className="fixed inset-0 bg-black"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2147483647 }}
        >
          {/* Full screen container */}
          <div className="relative w-full h-full flex flex-col">
            
            {/* Header with progress bars - fixed at top */}
            <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent" style={{ zIndex: 2147483647 }}>
              {/* Progress bars */}
              <div className="flex gap-1 mb-4 w-full max-w-[1100px] mx-auto px-2">
                {selectedUser.stories.map((_, index) => (
                  <div key={index} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white"
                      style={{ 
                        width: index < currentStoryIndex 
                          ? '100%' 
                          : index === currentStoryIndex 
                            ? `${progress}%` 
                            : '0%',
                        transition: index === currentStoryIndex ? 'width 50ms linear' : 'none'
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* User info and controls */}
              <div className="flex items-center justify-between w-full max-w-[1100px] mx-auto px-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white/50">
                    <AvatarImage src={selectedUser.avatar_url} />
                    <AvatarFallback className="bg-blue-600 text-white font-semibold">{selectedUser.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-white text-sm font-semibold drop-shadow-md">{selectedUser.name}</p>
                    <p className="text-white/70 text-xs">{currentStory.timestamp}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {/* Pause/Play button */}
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full h-11 w-11 p-0" 
                    onClick={() => setIsPaused(prev => !prev)}
                  >
                    {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="text-white hover:bg-white/20 rounded-full h-10 w-10" 
                    onClick={() => alert("Liked!")}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>

                  <AlertDialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-white hover:bg-white/20 rounded-full h-11 w-11 p-0">
                        <Flag className="h-5 w-5" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="z-[10000]">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Report Story</AlertDialogTitle>
                        <AlertDialogDescription>Flag this content for moderation?</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => { alert("Reported."); setReportDialogOpen(false); }}>Report</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>

                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={closeStoryViewer} 
                    className="text-white hover:bg-white/20 rounded-full h-11 w-11 p-0"
                  >
                    <X className="h-6 w-6" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Image container - centered and constrained */}
            <div className="flex-1 flex items-center justify-center overflow-hidden px-4">
              {/* Loading indicator */}
              {imageLoading && (
                <div className="absolute inset-0 flex items-center justify-center z-20">
                  <Loader2 className="h-12 w-12 text-white animate-spin" />
                </div>
              )}

              <div className="w-[480px] h-[320px] max-w-[75vw] max-h-[60vh] flex items-center justify-center bg-black">
                <img 
                  key={currentStory.id} 
                  src={currentStory.contentUrl} 
                  alt="Story" 
                  className={`w-full h-full object-contain transition-opacity duration-200 ${imageLoading ? 'opacity-0' : 'opacity-100'}`}
                  onLoad={() => setImageLoading(false)}
                  onError={() => {
                    setImageLoading(false);
                    console.error("Failed to load story image");
                  }}
                />
              </div>
            </div>

            {/* Click zones for navigation */}
            <div 
              className="absolute top-28 bottom-0 left-0 w-1/3 z-50 cursor-pointer" 
              onClick={previousStory} 
            />
            <div 
              className="absolute top-28 bottom-0 right-0 w-1/3 z-50 cursor-pointer" 
              onClick={nextStory} 
            />

            {/* Navigation buttons for desktop */}
            <Button 
              onClick={previousStory} 
              variant="ghost" 
              size="icon" 
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 bg-black/40 hover:bg-black/60 text-white flex rounded-full h-12 w-12"
            >
              <ChevronLeft className="h-7 w-7" />
            </Button>
            <Button 
              onClick={nextStory} 
              variant="ghost" 
              size="icon" 
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 bg-black/40 hover:bg-black/60 text-white flex rounded-full h-12 w-12"
            >
              <ChevronRight className="h-7 w-7" />
            </Button>

            {/* Paused indicator */}
            {isPaused && !imageLoading && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="bg-black/60 rounded-full p-5">
                  <Pause className="h-14 w-14 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        .text-shadow { text-shadow: 0 1px 2px rgba(0,0,0,0.5); }
      `}</style>
    </div>
  );
}