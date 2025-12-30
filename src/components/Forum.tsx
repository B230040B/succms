import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.tsx";
import { supabase } from "@/lib/supabase.ts";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  Search, Plus, MessageCircle, Pin, 
  Loader2, Coffee, Layers, Heart, HelpCircle, Frown, Smile, ThumbsUp, Flame, ArrowLeft, 
  Image as ImageIcon, X, SmilePlus
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "./ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "./ui/select";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "./ui/popover";
import "./Forum.css";

/* ================= CONFIGURATION ================= */

const REACTION_TYPES = [
  { id: 'mad', icon: '😡', label: 'Mad' },
  { id: 'question', icon: '❓', label: 'Confused' },
  { id: 'sad', icon: '😢', label: 'Sad' },
  { id: 'laugh', icon: '😂', label: 'Haha' },
  { id: 'love', icon: '❤️', label: 'Love' },
  { id: 'hugs', icon: '🫂', label: 'Hugs' },
];

const getReactionIcon = (type: string) => {
    if (type === 'like') return '👍';
    return REACTION_TYPES.find(r => r.id === type)?.icon || '👍';
};

export function Forum() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Data
  const [courses, setCourses] = useState<any[]>([]);
  const [threads, setThreads] = useState<any[]>([]);
  const [userReactions, setUserReactions] = useState<Record<string, string>>({}); 
  const [replyReactions, setReplyReactions] = useState<Record<string, string>>({}); 
  const [loading, setLoading] = useState(true);
  
  // View State
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedThread, setSelectedThread] = useState<any | null>(null); 
  const [lightboxImage, setLightboxImage] = useState<string | null>(null); // For image popup
  
  // Create Thread State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newThread, setNewThread] = useState({ title: "", content: "", course_id: "general" });
  const [threadImages, setThreadImages] = useState<File[]>([]); // Array for up to 5 images
  const [threadImagePreviews, setThreadImagePreviews] = useState<string[]>([]);

  // Reply State
  const [replyText, setReplyText] = useState("");
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null);
  const [activeReplyBox, setActiveReplyBox] = useState<string | null>(null);
  const [replyTargetId, setReplyTargetId] = useState<string | null>(null);

  const threadFileInputRef = useRef<HTMLInputElement>(null);
  const replyFileInputRef = useRef<HTMLInputElement>(null);

  const MAX_NESTING_DEPTH = 3; 

  /* ================= EFFECTS ================= */

  useEffect(() => {
    if (user) {
      fetchCourses();
      fetchUserReactions();
    }
  }, [user]);

  useEffect(() => {
    fetchThreads();
  }, [selectedFilter, user]);

  /* ================= FETCHING ================= */

  const fetchCourses = async () => {
    const { data: enrollments } = await supabase
        .from('enrollments')
        .select('course_id, courses(id, name, course_code)')
        .eq('user_id', user?.id);
        
    if (enrollments) {
        const formatted = enrollments.map((e: any) => e.courses);
        setCourses(formatted);
    }
  };

  const fetchUserReactions = async () => {
    const { data: threadRx } = await supabase.from('forum_reactions').select('thread_id, type').eq('user_id', user?.id);
    const tMap: Record<string, string> = {};
    threadRx?.forEach((r: any) => tMap[r.thread_id] = r.type);
    setUserReactions(tMap);

    const { data: replyRx } = await supabase.from('forum_reply_reactions').select('reply_id, type').eq('user_id', user?.id);
    const rMap: Record<string, string> = {};
    replyRx?.forEach((r: any) => rMap[r.reply_id] = r.type);
    setReplyReactions(rMap);
  };

  const fetchThreads = async () => {
    setLoading(true);
    let query = supabase
        .from('forum_threads')
        .select(`
            *,
            author:user_profiles!author_id(id, full_name, avatar_url, role),
            replies:forum_replies(count),
            reactions:forum_reactions(type) 
        `);

    if (selectedFilter === "general") {
        query = query.is('course_id', null);
    } else if (selectedFilter !== "all") {
        query = query.eq('course_id', selectedFilter);
    } else if (courses.length > 0) {
        const myCourseIds = courses.map(c => c.id);
        const idString = `(${myCourseIds.join(',')})`;
        query = query.or(`course_id.in.${idString},course_id.is.null`);
    }

    const { data, error } = await query;
    if (!error) {
        const sorted = (data || []).sort((a, b) => {
            if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setThreads(sorted);
    }
    setLoading(false);
  };

  const fetchThreadDetails = async (threadId: string) => {
    try {
      const { data: thread, error: threadErr } = await supabase
          .from('forum_threads')
          .select(`*, author:user_profiles!author_id(id, full_name, avatar_url, role)`)
          .eq('id', threadId)
          .single();
      if (threadErr) console.error('Thread fetch error', threadErr);
      
      const { data: replies, error: repliesErr } = await supabase
          .from('forum_replies')
          .select(`
              *, 
              author:user_profiles!author_id(id, full_name, avatar_url, role),
              reactions:forum_reply_reactions(type)
          `)
          .eq('thread_id', threadId)
          .order('created_at', { ascending: true });
      if (repliesErr) console.error('Replies fetch error', repliesErr);
          
      if (thread) {
          const replyMap = new Map<string, any>();
          (replies || []).forEach((reply: any) => {
              replyMap.set(reply.id, { ...reply, children: [] });
          });

          const roots: any[] = [];
          replyMap.forEach((reply) => {
              if (reply.parent_id && replyMap.has(reply.parent_id)) {
                  replyMap.get(reply.parent_id).children.push(reply);
              } else {
                  roots.push(reply);
              }
          });

          const sortTree = (nodes: any[]) => {
              nodes.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
              nodes.forEach((node) => sortTree(node.children || []));
          };
          sortTree(roots);

          setSelectedThread({ ...thread, structuredReplies: roots, replyCount: (replies || []).length });
      } else {
          setSelectedThread({} as any);
      }
    } catch (e) {
      console.error('fetchThreadDetails failed', e);
      setSelectedThread({} as any);
    }
  };

  /* ================= IMAGE UPLOAD ================= */

  const uploadFileToSupabase = async (file: File) => {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;
        
        const { error } = await supabase.storage.from('forum-images').upload(filePath, file);
        if (error) {
            console.error("Upload error (make sure bucket exists):", error);
            return null;
        }
        const { data } = supabase.storage.from('forum-images').getPublicUrl(filePath);
        return data.publicUrl;
      } catch (e) {
          console.error("Upload failed", e);
          return null;
      }
  };

  /* ================= ACTIONS ================= */

  const handleCreateThread = async () => {
    if (!newThread.title || !newThread.content) return;
    
    // 1. Upload all images
    const uploadedUrls: string[] = [];
    for (const file of threadImages) {
        const url = await uploadFileToSupabase(file);
        if (url) uploadedUrls.push(url);
    }

    const hashtagRegex = /#(\w+)/;
    const contentMatch = newThread.content.match(hashtagRegex);
    const titleMatch = newThread.title.match(hashtagRegex);
    const extractedCategory = contentMatch ? contentMatch[1] : (titleMatch ? titleMatch[1] : "General");
    const finalCourseId = newThread.course_id === "general" ? null : newThread.course_id;

    const { error } = await supabase.from('forum_threads').insert({
        course_id: finalCourseId,
        author_id: user?.id,
        title: newThread.title,
        content: newThread.content,
        category: extractedCategory,
        images: uploadedUrls 
    });

    if (!error) {
        setIsCreateOpen(false);
        setNewThread({ title: "", content: "", course_id: "general" });
        setThreadImages([]);
        setThreadImagePreviews([]);
        fetchThreads();
    }
  };

  const handlePostReply = async (parentId: string | null = null) => {
        if (!selectedThread || (!replyText.trim() && !replyImage)) return;
        
        let imageUrl = null;
        if (replyImage) {
            imageUrl = await uploadFileToSupabase(replyImage);
        }

        const resolvedParent = parentId ?? replyTargetId ?? null;
    
        const { error } = await supabase.from('forum_replies').insert({
                thread_id: selectedThread.id,
                author_id: user?.id,
                content: replyText,
                parent_id: resolvedParent,
                image_url: imageUrl
        });

        if (!error) {
                setReplyText("");
                setReplyImage(null);
                setReplyImagePreview(null);
                setActiveReplyBox(null);
                setReplyTargetId(null);
                fetchThreadDetails(selectedThread.id); 
                fetchThreads(); 
        }
  };

  const handleReaction = async (targetId: string, type: string, isThread: boolean) => {
      const table = isThread ? 'forum_reactions' : 'forum_reply_reactions';
      const idField = isThread ? 'thread_id' : 'reply_id';
      const currentReactions = isThread ? userReactions : replyReactions;
      
      const currentType = currentReactions[targetId];

      if (currentType === type) {
          // Toggle Off
          await supabase.from(table).delete().eq(idField, targetId).eq('user_id', user?.id);
      } else {
          // Change / Add
          if (currentType) await supabase.from(table).delete().eq(idField, targetId).eq('user_id', user?.id);
          await supabase.from(table).insert({ [idField]: targetId, user_id: user?.id, type });
      }

      if (isThread) {
          fetchUserReactions();
          fetchThreads();
          if (selectedThread?.id === targetId) fetchThreadDetails(targetId);
      } else {
          fetchUserReactions();
          if (selectedThread) fetchThreadDetails(selectedThread.id);
      }
  };

  /* ================= HELPERS ================= */

  const navigateToProfile = (e: React.MouseEvent, userId: string) => {
    e.stopPropagation();
    navigate(`/profile/${userId}`);
  };

  const getCourseBadge = (courseId: string | null) => {
    if (!courseId) return <Badge variant="secondary" className="bg-purple-100 text-purple-700 hover:bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300"><Coffee className="h-3 w-3 mr-1"/> Campus Life</Badge>;
    const course = courses.find(c => c.id === courseId);
    return <Badge variant="outline" className="bg-white border-gray-300 text-gray-700 dark:bg-zinc-800 dark:border-zinc-700 dark:text-gray-300">{course?.name || "Unknown Course"}</Badge>;
  };

  const formatDate = (dateString: string) => {
    try {
        return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) { return ""; }
  };

  const countReplies = (nodes: any[] = []): number => nodes.reduce((acc, node) => acc + 1 + countReplies(node.children || []), 0);

  /* ================= SUB-COMPONENTS ================= */

  const ReactionBar = ({ targetId, reactions, myReaction, isThread }: { targetId: string, reactions: any[], myReaction: string, isThread: boolean }) => {
      // Calculate Top 3
      const counts: Record<string, number> = {};
      (reactions || []).forEach((r: any) => counts[r.type] = (counts[r.type] || 0) + 1);
      
      const topTypes = Object.entries(counts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([type]) => type);

      const isLiked = myReaction === 'like';

      return (
          <div className="flex items-center gap-3">
              {/* Like Button */}
              <Button 
                  variant="ghost" 
                  size="sm"
                  className={`gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 ${isLiked ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-gray-500 dark:text-gray-400'}`}
                  onClick={(e) => { e.stopPropagation(); handleReaction(targetId, 'like', isThread); }}
              >
                  <ThumbsUp className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
                  Like
              </Button>

              {/* Emoji Picker */}
              <Popover>
                  <PopoverTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="sm" className="px-2 text-gray-400 hover:text-yellow-500 dark:text-gray-500 dark:hover:text-yellow-400">
                          <SmilePlus className="h-5 w-5" />
                      </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2 flex gap-1 rounded-full shadow-xl bg-white dark:bg-zinc-800 border dark:border-zinc-700" side="top" align="start" onClick={(e) => e.stopPropagation()}>
                      {REACTION_TYPES.map((r) => (
                          <button 
                              key={r.id} 
                              className={`p-2 rounded-full transition-transform hover:scale-125 text-2xl ${myReaction === r.id ? 'bg-blue-100 dark:bg-blue-900/30' : 'hover:bg-gray-100 dark:hover:bg-zinc-700'}`} 
                              onClick={() => handleReaction(targetId, r.id, isThread)}
                              title={r.label}
                          >
                              {r.icon}
                          </button>
                      ))}
                  </PopoverContent>
              </Popover>

              {/* Top 3 Display */}
              {topTypes.length > 0 && (
                  <div className="flex items-center gap-1.5 ml-2 text-xs text-gray-500 dark:text-gray-400 cursor-default" title={`${reactions.length} reactions`}>
                      <div className="flex -space-x-1">
                          {topTypes.map((type, i) => (
                              <span key={i} className="relative z-10 text-sm drop-shadow-sm bg-white dark:bg-zinc-800 rounded-full">{getReactionIcon(type)}</span>
                          ))}
                      </div>
                      <span className="font-medium hover:underline">{reactions.length}</span>
                  </div>
              )}
          </div>
      );
  };

  const CommentNode = ({ comment, depth = 0 }: { comment: any, depth?: number }) => {
    const showReplyBox = activeReplyBox === comment.id;
    const indentLevel = Math.min(depth, MAX_NESTING_DEPTH - 1);
    const indentClass = indentLevel > 0 ? 'mt-4' : 'mt-6';

    return (
        <div className={`flex gap-3 w-full ${indentClass}`}>
            <Avatar className={`${depth > 0 ? 'h-8 w-8' : 'h-10 w-10'} cursor-pointer hover:opacity-80`} onClick={(e) => navigateToProfile(e, comment.author?.id)}>
                <AvatarImage src={comment.author?.avatar_url} />
                <AvatarFallback>{comment.author?.full_name?.[0]}</AvatarFallback>
            </Avatar>

            <div className="flex-1 group">
                <div className="flex items-baseline gap-2">
                    <span 
                        className="font-semibold text-sm text-gray-900 dark:text-gray-100 cursor-pointer hover:underline"
                        onClick={(e) => navigateToProfile(e, comment.author?.id)}
                    >
                        {comment.author?.full_name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.created_at)}</span>
                </div>

                <div style={{ whiteSpace: "pre-wrap" }} className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap leading-relaxed mt-1">
                    {comment.content}
                </div>

                {/* Reply Image Display */}
                {comment.image_url && (
                    <div className="mt-2">
                        <img 
                            src={comment.image_url} 
                            alt="Attachment" 
                            className="max-h-48 rounded-lg border dark:border-zinc-700 cursor-pointer hover:opacity-90 transition-opacity"
                            onClick={() => setLightboxImage(comment.image_url)}
                        />
                    </div>
                )}

                <div className="flex items-center gap-4 mt-2">
                    <ReactionBar targetId={comment.id} reactions={comment.reactions || []} myReaction={replyReactions[comment.id]} isThread={false} />
                    
                    <button 
                        onClick={() => initReply(comment, depth)}
                        className="text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white transition-colors"
                    >
                        Reply
                    </button>
                </div>

                {/* Reply Input */}
                {showReplyBox && (
                    <div className="mt-3 animate-in fade-in slide-in-from-top-1">
                        <div className="relative">
                            <Textarea 
                                autoFocus
                                placeholder={`Replying to ${comment.author?.full_name}...`}
                                className="min-h-[60px] text-sm p-3 pr-10 bg-white dark:bg-zinc-900 dark:text-white dark:placeholder-gray-400 border-b-2 focus:border-primary resize-none"
                                value={replyText}
                                onChange={e => setReplyText(e.target.value)}
                            />
                            {/* Image Upload Trigger */}
                            <button 
                                className="absolute bottom-3 right-3 p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 rounded-full transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                onClick={() => replyFileInputRef.current?.click()}
                                title="Attach an image"
                            >
                                <ImageIcon className="h-4 w-4" />
                            </button>
                            <input 
                                type="file" 
                                ref={replyFileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        setReplyImage(file);
                                        setReplyImagePreview(URL.createObjectURL(file));
                                    }
                                }}
                            />
                        </div>

                        {/* Image Preview */}
                        {replyImagePreview && (
                            <div className="mt-2 relative inline-block group">
                                <img src={replyImagePreview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border-2 border-gray-200 dark:border-zinc-700 shadow-sm" />
                                <button 
                                    onClick={() => { setReplyImage(null); setReplyImagePreview(null); }}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-2">
                            <Button variant="ghost" size="sm" onClick={() => { setActiveReplyBox(null); setReplyTargetId(null); setReplyImage(null); }} className="h-8 dark:text-white dark:hover:bg-zinc-800">Cancel</Button>
                            <Button size="sm" onClick={() => handlePostReply(replyTargetId ?? comment.id)} className="h-8">Reply</Button>
                        </div>
                    </div>
                )}

                {/* Recursive Children */}
                {comment.children && comment.children.length > 0 && comment.children.map((child: any) => (
                    <div key={child.id} style={{ marginLeft: `${indentLevel >= MAX_NESTING_DEPTH - 1 ? (MAX_NESTING_DEPTH - 1) * 3 : (indentLevel + 1) * 3}rem` }}>
                        <CommentNode comment={child} depth={depth + 1} />
                    </div>
                ))}
            </div>
        </div>
    );
  };

  /* ================= MAIN RENDER ================= */

  return (
    <div className="forum-root min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 p-4 lg:p-8">
      
      {/* LIGHTBOX POPUP */}
      {lightboxImage ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in" onClick={() => setLightboxImage(null)}>
              <button className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors" onClick={() => setLightboxImage(null)}>
                  <X className="h-10 w-10" />
              </button>
              {lightboxImage && (
                  <img 
                      src={lightboxImage} 
                      alt="Full size view" 
                      className="max-w-full max-h-full rounded-lg shadow-2xl object-contain" 
                      onClick={(e) => e.stopPropagation()}
                      onError={() => setLightboxImage(null)}
                  />
              )}
          </div>
      ) : null}

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* SIDEBAR */}
        <aside className="lg:col-span-1 space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Forums</h1>
                <p className="text-gray-500 dark:text-gray-300 mt-1">Engage with your community</p>
            </div>
            
            <Button className="w-full shadow-md font-bold py-6 text-lg" onClick={() => setIsCreateOpen(true)}>
                <Plus className="h-5 w-5 mr-2" /> Start Discussion
            </Button>

            <nav className="space-y-1">
                <button onClick={() => setSelectedFilter("all")} className={`forum-filter-button w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${selectedFilter === "all" ? "active bg-gray-100 dark:bg-zinc-800 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700" : "hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"}`}>
                    <Layers className="h-4 w-4" /> All Discussions
                </button>
                <button onClick={() => setSelectedFilter("general")} className={`forum-filter-button w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${selectedFilter === "general" ? "active bg-gray-100 dark:bg-zinc-800 dark:text-white shadow-sm ring-1 ring-gray-200 dark:ring-zinc-700" : "hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"}`}>
                    <Coffee className="h-4 w-4" /> General Lounge
                </button>
                <div className="px-3 py-2 mt-6 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">My Courses</div>
                {courses.map(c => (
                    <button key={c.id} onClick={() => setSelectedFilter(c.id)} className={`forum-course-button w-full text-left px-3 py-2 rounded-lg text-sm transition-colors truncate ${selectedFilter === c.id ? "active bg-blue-50 font-bold dark:bg-blue-900/30 dark:!text-blue-400" : "hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-zinc-800"}`}>
                        {c.name} <span className="ml-2 text-xs text-gray-400 dark:text-gray-500 font-normal">({c.course_code})</span>
                    </button>
                ))}
            </nav>
        </aside>

        {/* MAIN FEED AREA */}
        <main className="lg:col-span-3 space-y-6">
            <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500 pointer-events-none" />
                <Input 
                    placeholder="Search topics, hashtags..." 
                    className="pl-10 pr-4 h-12 bg-white dark:bg-zinc-900 dark:text-white dark:placeholder-gray-500 border-gray-200 dark:border-zinc-800 text-base shadow-sm focus-visible:ring-primary"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
            </div>

            {loading ? <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-gray-300 dark:text-gray-600"/></div> : !selectedThread ? (
                
                // === LIST VIEW ===
                <div className="space-y-6">
                    {threads.filter(t => {
                        const query = searchQuery.toLowerCase();
                        return t.title?.toLowerCase().includes(query) || t.content?.toLowerCase().includes(query) || t.category?.toLowerCase().includes(query);
                    }).map(thread => {
                        const replyCount = thread.replies && thread.replies[0] ? thread.replies[0].count : 0;

                        return (
                            <Card key={thread.id} className="group hover:shadow-lg transition-all duration-200 cursor-pointer border-2 border-gray-200 dark:border-zinc-800 dark:bg-zinc-900" onClick={() => fetchThreadDetails(thread.id)}>
                                <CardContent className="p-6 flex flex-col gap-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3" onClick={(e) => navigateToProfile(e, thread.author?.id)}>
                                            <Avatar className="h-10 w-10 border border-gray-200 hover:ring-2 hover:ring-primary transition-all">
                                                <AvatarImage src={thread.author?.avatar_url} />
                                                <AvatarFallback>{thread.author?.full_name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-gray-900 dark:text-white hover:underline">{thread.author?.full_name}</span>
                                                    {thread.author?.role === 'lecturer' && <Badge variant="secondary" className="h-5 text-[10px]">Lecturer</Badge>}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(thread.created_at)}</div>
                                            </div>
                                        </div>
                                        {thread.is_pinned && <Pin className="h-5 w-5 text-blue-500 fill-blue-100 rotate-45" />}
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">{thread.title}</h3>
                                        <div style={{ whiteSpace: "pre-wrap" }} className="text-gray-600 dark:text-gray-100 text-base line-clamp-3 leading-relaxed">
                                            {thread.content}
                                        </div>

                                        {/* Image Preview Grid - Fixed Container */}
                                        {(thread?.images ?? []).length > 0 && (
                                            <div className="mt-4 bg-gray-100 dark:bg-zinc-800/50 rounded-lg p-3 h-48 flex items-center justify-center overflow-hidden">
                                                <div className="flex flex-wrap gap-2 h-full items-center justify-center w-full">
                                                    {(thread?.images ?? []).slice(0, 4).map((img: string, i: number) => (
                                                        img && (
                                                            <img 
                                                                key={i} 
                                                                src={img} 
                                                                alt="Preview" 
                                                                className="h-full max-w-1/2 object-contain rounded border dark:border-zinc-700 cursor-pointer hover:opacity-90 transition-opacity" 
                                                                onClick={() => setLightboxImage(img)}
                                                                onError={() => console.error('Image failed to load:', img)}
                                                            />
                                                        )
                                                    ))}
                                                    {(thread?.images ?? []).length > 4 && (
                                                        <div className="flex items-center justify-center bg-gray-300 dark:bg-zinc-700 rounded h-40 w-20 text-gray-700 dark:text-gray-300 font-bold text-sm cursor-pointer hover:bg-gray-400 dark:hover:bg-zinc-600 transition-colors">
                                                            +{(thread?.images ?? []).length - 4}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {getCourseBadge(thread.course_id)}
                                        <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700">#{thread.category}</Badge>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between mt-2">
                                        <ReactionBar targetId={thread.id} reactions={thread.reactions || []} myReaction={userReactions[thread.id]} isThread={true} />
                                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                                            <span className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> {replyCount} replies</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            ) : selectedThread ? (
                
                // === THREAD DETAIL VIEW ===
                <div className="animate-in fade-in-50 slide-in-from-right-5 w-full">
                    <Button variant="ghost" className="mb-4 pl-0 hover:bg-transparent dark:text-white dark:hover:text-gray-300" onClick={() => setSelectedThread(null)}>
                        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Feed
                    </Button>
                    
                    <Card className="mb-6 border-2 border-gray-200 shadow-sm dark:bg-zinc-900 dark:border-zinc-800 bg-white">
                        <CardContent className="p-8 dark:text-white">
                            <div className="flex gap-2 mb-4">
                                {selectedThread?.course_id && getCourseBadge(selectedThread.course_id)}
                                <Badge className="text-sm px-3 py-1">#{selectedThread?.category ?? 'general'}</Badge>
                            </div>
                            
                            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight">
                                {selectedThread?.title ?? 'Discussion'}
                            </h1>

                            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100 dark:border-zinc-800 cursor-pointer" onClick={(e) => selectedThread?.author?.id && navigateToProfile(e, selectedThread.author.id)}>
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={selectedThread?.author?.avatar_url} />
                                    <AvatarFallback>{selectedThread?.author?.full_name?.[0] ?? 'U'}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-bold text-gray-900 dark:text-white hover:underline">{selectedThread?.author?.full_name ?? 'Anonymous'}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{selectedThread?.created_at ? formatDate(selectedThread.created_at) : 'Date unknown'}</p>
                                </div>
                            </div>

                            <div style={{ whiteSpace: "pre-wrap" }} className="text-lg text-gray-800 dark:text-gray-100 leading-relaxed font-serif">
                                {selectedThread?.content ?? 'No content'}
                            </div>

                            {/* Full Image Gallery (Reddit Style - Below Text) */}
                            {(selectedThread?.images ?? []).length > 0 && (
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {(selectedThread?.images ?? []).map((img: string | null | undefined, i: number) => (
                                        img ? (
                                            <img 
                                                key={i} 
                                                src={img} 
                                                alt={`Attachment ${i+1}`} 
                                                className="w-full h-auto rounded-xl border dark:border-zinc-700 shadow-sm cursor-pointer hover:opacity-95 transition-opacity"
                                                onClick={() => setLightboxImage(img)}
                                                onError={() => console.error('Image failed to load:', img)}
                                            />
                                        ) : null
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* COMMENTS */}
                    <div className="space-y-2 mb-20">
                        <h3 className="font-bold text-xl flex items-center gap-2 text-gray-800 dark:text-white mb-6">
                            <MessageCircle className="h-5 w-5"/>
                            {countReplies(selectedThread.structuredReplies) || selectedThread.replyCount || 0} Comments
                        </h3>
                        
                        {/* Root Reply Box */}
                        <div className="flex gap-4 mb-10">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src={(user as any)?.user_metadata?.avatar_url} />
                                <AvatarFallback>{(user as any)?.user_metadata?.full_name?.[0] ?? user?.email?.[0] ?? 'U'}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-2">
                                <div className="border-b-2 border-gray-200 dark:border-zinc-800 focus-within:border-black dark:focus-within:border-white transition-colors relative">
                                    <Textarea 
                                        placeholder="Add a comment..." 
                                        className="min-h-[20px] text-sm p-0 pr-10 border-0 focus-visible:ring-0 bg-transparent resize-none dark:text-white dark:placeholder-gray-400" 
                                        value={activeReplyBox === null ? replyText : ''} 
                                        onChange={e => {
                                            if (activeReplyBox === null) setReplyText(e.target.value)
                                        }}
                                        onFocus={() => {
                                            setActiveReplyBox(null);
                                            setReplyTargetId(null);
                                            setReplyText("");
                                        }}
                                    />
                                    {/* Image Upload Button */}
                                    <button 
                                        className="absolute bottom-0.5 right-0 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-full p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                        onClick={() => replyFileInputRef.current?.click()}
                                        title="Attach an image"
                                    >
                                        <ImageIcon className="h-5 w-5" />
                                    </button>
                                </div>

                                {/* Preview */}
                                {activeReplyBox === null && replyImagePreview && (
                                    <div className="relative inline-block mt-2 group">
                                        <img src={replyImagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200 dark:border-zinc-700 shadow-sm" />
                                        <button 
                                            onClick={() => { setReplyImage(null); setReplyImagePreview(null); }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                )}

                                {activeReplyBox === null && (replyText.length > 0 || replyImage) && (
                                    <div className="flex justify-end gap-2 animate-in fade-in">
                                        <Button variant="ghost" size="sm" onClick={() => { setReplyText(""); setReplyImage(null); setReplyImagePreview(null); }} className="rounded-full dark:text-white dark:hover:bg-zinc-800">Cancel</Button>
                                        <Button onClick={() => handlePostReply(null)} disabled={!replyText.trim() && !replyImage} size="sm" className="rounded-full">Comment</Button>
                                    </div>
                                )}
                                <input 
                                    type="file" 
                                    ref={replyFileInputRef} 
                                    className="hidden" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            setReplyImage(file);
                                            setReplyImagePreview(URL.createObjectURL(file));
                                        }
                                    }}
                                />
                            </div>
                        </div>

                        {/* Comment Stream */}
                        {selectedThread.structuredReplies?.map((reply: any) => (
                            <div key={reply.id} className="group">
                                <CommentNode comment={reply} depth={0} />
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                // === FALLBACK: Thread not loaded or error ===
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 mb-4">Loading discussion...</p>
                    <Loader2 className="h-8 w-8 animate-spin text-gray-300 dark:text-gray-600 mx-auto"/>
                </div>
            )}
        </main>
      </div>

      {/* CREATE THREAD DIALOG */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-2xl dark:bg-zinc-900 dark:border-zinc-800">
            <DialogHeader>
                <DialogTitle className="text-2xl dark:text-white">Start a New Discussion</DialogTitle>
            </DialogHeader>
            <div className="grid gap-6 py-4">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Where to post?</label>
                    <Select value={newThread.course_id} onValueChange={val => setNewThread({...newThread, course_id: val})}>
                        <SelectTrigger className="h-12 text-base dark:bg-zinc-800 dark:text-white dark:border-zinc-700"><SelectValue placeholder="Select Context" /></SelectTrigger>
                        <SelectContent className="dark:bg-zinc-800 dark:border-zinc-700">
                            <SelectItem value="general" className="font-bold text-purple-600">☕ General Lounge (Campus Life)</SelectItem>
                            {courses.map(c => <SelectItem key={c.id} value={c.id}>📚 {c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Topic Title</label>
                    <Input placeholder="E.g., How do I solve the Tutorial 3 bug? #Homework" className="h-12 text-lg dark:bg-zinc-800 dark:text-white dark:border-zinc-700" value={newThread.title} onChange={e => setNewThread({...newThread, title: e.target.value})} />
                </div>
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700 dark:text-gray-200">Content</label>
                    <Textarea placeholder="Write your thoughts here..." className="min-h-[200px] text-base p-4 leading-relaxed whitespace-pre-wrap dark:bg-zinc-800 dark:text-white dark:border-zinc-700" value={newThread.content} onChange={e => setNewThread({...newThread, content: e.target.value})} />
                    
                    {/* THREAD IMAGE PREVIEWS (Max 5) */}
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                Attachments ({threadImages.length}/5)
                            </label>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            {threadImagePreviews.map((src, i) => (
                                <div key={i} className="group relative inline-block">
                                    <img src={src} alt="Preview" className="h-24 w-24 object-cover rounded-lg border-2 border-gray-200 dark:border-zinc-700 shadow-sm" />
                                    <button 
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md hover:bg-red-600 transition-all opacity-0 group-hover:opacity-100"
                                        onClick={() => {
                                            const newFiles = [...threadImages]; newFiles.splice(i, 1);
                                            const newPreviews = [...threadImagePreviews]; newPreviews.splice(i, 1);
                                            setThreadImages(newFiles);
                                            setThreadImagePreviews(newPreviews);
                                        }}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                            {threadImages.length < 5 && (
                                <button 
                                    className="h-24 w-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-zinc-700 rounded-lg hover:border-primary dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-zinc-800/50 transition-all duration-200 group"
                                    onClick={() => threadFileInputRef.current?.click()}
                                >
                                    <ImageIcon className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                                    <span className="text-xs text-gray-400 group-hover:text-primary font-medium mt-1 transition-colors">Add Photo</span>
                                </button>
                            )}
                            <input 
                                type="file" 
                                ref={threadFileInputRef} 
                                className="hidden" 
                                accept="image/*" 
                                multiple
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length + threadImages.length > 5) {
                                        alert("Max 5 images allowed.");
                                        return;
                                    }
                                    setThreadImages([...threadImages, ...files]);
                                    setThreadImagePreviews([...threadImagePreviews, ...files.map(f => URL.createObjectURL(f))]);
                                }} 
                            />
                        </div>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleCreateThread} size="lg" className="w-full sm:w-auto font-bold" disabled={!newThread.title || !newThread.content}>Post Discussion</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}