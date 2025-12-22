import { useState, useEffect } from "react";
import { supabase } from "/workspaces/succms/succms/src/lib/supabase.ts";
import { useAuth } from "/workspaces/succms/succms/src/contexts/AuthContext.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  MessageSquare, FileText, Calendar, Users, Send, Plus, 
  Trash2, Key, Loader2, Folder, 
  File, FileCode, FileImage, FileSpreadsheet, ChevronRight,
  ArrowLeft, Paperclip, CheckCircle, X, Download
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";

interface CoursePageProps {
  courseId: string;
  onBack: () => void;
}

// --- HELPER ICONS ---
const getFileIcon = (type: string) => {
  if (type === 'folder') return <Folder className="h-6 w-6 text-blue-500 fill-blue-100" />;
  if (type.includes('image')) return <FileImage className="h-6 w-6 text-purple-500" />;
  if (type.includes('pdf')) return <FileText className="h-6 w-6 text-red-500" />;
  if (type.includes('sheet') || type.includes('excel')) return <FileSpreadsheet className="h-6 w-6 text-green-500" />;
  if (type.includes('code') || type.includes('tsx') || type.includes('java')) return <FileCode className="h-6 w-6 text-yellow-500" />;
  return <File className="h-6 w-6 text-gray-500" />;
};

export function CoursePage({ courseId, onBack }: CoursePageProps) {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [posts, setPosts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]); 
  const [people, setPeople] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  
  // Lecturer View: All Submissions for selected assignment
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);

  // File Browser States
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [folderPath, setFolderPath] = useState<{id: string | null, name: string}[]>([{id: null, name: 'Root'}]);

  // Input States
  const [newPostContent, setNewPostContent] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Dialog States
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");

  const [showNewAssignmentDialog, setShowNewAssignmentDialog] = useState(false);
  const [newAssign, setNewAssign] = useState({ title: "", description: "", points: "", due_date: "" });
  const [newAssignFiles, setNewAssignFiles] = useState<{name: string, path: string}[]>([]);

  // View Assignment State
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [submissionFiles, setSubmissionFiles] = useState<{name: string, path: string}[]>([]);

  const isLecturer = profile?.role === 'lecturer';

  useEffect(() => {
    if (!courseId) return;
    fetchCourseDetails();
    fetchMaterials();
    fetchPeople(); // Updated to be bulletproof
    fetchAssignments();
    
    // Real-time Posts
    const channel = supabase
      .channel('public:course_posts')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'course_posts', filter: `course_id=eq.${courseId}` }, (payload) => {
        setPosts((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [courseId]);

  useEffect(() => {
    fetchMaterials();
  }, [currentFolderId]); 
  
  useEffect(() => {
    if (isLecturer && selectedAssignment) {
        fetchSubmissionsForAssignment(selectedAssignment.id);
    }
  }, [selectedAssignment, isLecturer]);

  // --- FETCH FUNCTIONS ---

  const fetchCourseDetails = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('courses').select('*').eq('id', courseId).single();
    setCourse(data);
    
    const { data: postData } = await supabase.from('course_posts').select('*').eq('course_id', courseId).order('created_at', { ascending: false });
    setPosts(postData || []);
    setIsLoading(false);
  };

  const fetchMaterials = async () => {
    let query = supabase.from('course_materials').select('*').eq('course_id', courseId).order('file_type', { ascending: false }).order('title', { ascending: true });
    if (currentFolderId) query = query.eq('parent_id', currentFolderId);
    else query = query.is('parent_id', null);
    const { data } = await query;
    setMaterials(data || []);
  };

  // --- NEW: ROBUST PEOPLE FETCH (Two-Step Method) ---
  const fetchPeople = async () => {
    try {
        // 1. Get IDs of everyone enrolled + instructors
        const { data: studentIds } = await supabase.from('enrollments').select('user_id').eq('course_id', courseId);
        const { data: instructorIds } = await supabase.from('course_instructors').select('user_id').eq('course_id', courseId);
        
        const allUserIds = [
            ...(studentIds?.map(x => x.user_id) || []),
            ...(instructorIds?.map(x => x.user_id) || [])
        ];
        
        if (allUserIds.length === 0) {
            setPeople([]);
            return;
        }

        // 2. Fetch Profiles for these IDs explicitly
        const { data: profiles } = await supabase
            .from('user_profiles')
            .select('*')
            .in('id', allUserIds);

        setPeople(profiles || []);

    } catch (error) {
        console.error("Error fetching people:", error);
    }
  };

  const fetchAssignments = async () => {
    const { data: assignData } = await supabase.from('course_assignments').select('*').eq('course_id', courseId).order('due_date', { ascending: true });
    setAssignments(assignData || []);

    if (!isLecturer && user) {
        const { data: subData } = await supabase.from('assignment_submissions').select('*').eq('student_id', user.id);
        setMySubmissions(subData || []);
    }
  };

  const fetchSubmissionsForAssignment = async (assignId: string) => {
    const { data } = await supabase.from('assignment_submissions').select('*').eq('assignment_id', assignId);
    setAllSubmissions(data || []);
  };

  // --- ACTIONS ---

  const handleCreateAssignment = async () => {
    if (!newAssign.title || !newAssign.due_date) return;
    const { error } = await supabase.from('course_assignments').insert({
        course_id: courseId,
        title: newAssign.title,
        description: newAssign.description,
        points: newAssign.points ? parseInt(newAssign.points) : null,
        due_date: new Date(newAssign.due_date).toISOString(),
        attachments: newAssignFiles
    });
    if (!error) {
        setShowNewAssignmentDialog(false);
        setNewAssign({ title: "", description: "", points: "", due_date: "" });
        setNewAssignFiles([]);
        fetchAssignments();
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if(!confirm("Delete assignment?")) return;
    await supabase.from('course_assignments').delete().eq('id', id);
    fetchAssignments();
  };

  const handleTurnIn = async () => {
    if (!selectedAssignment || !user) return;
    const existing = mySubmissions.find(s => s.assignment_id === selectedAssignment.id);
    const payload = { assignment_id: selectedAssignment.id, student_id: user.id, files: submissionFiles, submitted_at: new Date().toISOString() };

    if (existing) await supabase.from('assignment_submissions').update(payload).eq('id', existing.id);
    else await supabase.from('assignment_submissions').insert(payload);

    await fetchAssignments();
    setSelectedAssignment(null);
  };

  const handleUndoTurnIn = async () => {
    if (!selectedAssignment || !user) return;
    await supabase.from('assignment_submissions').delete().eq('assignment_id', selectedAssignment.id).eq('student_id', user.id);
    await fetchAssignments();
    setSelectedAssignment(null);
  };

  const uploadTempFile = async (e: React.ChangeEvent<HTMLInputElement>, setList: Function, currentList: any[]) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const filePath = `assignments/${Math.random().toString(36).substring(2)}_${file.name}`;
    setIsUploading(true);
    const { error } = await supabase.storage.from('course_content').upload(filePath, file);
    setIsUploading(false);
    if (!error) {
        const { data } = supabase.storage.from('course_content').getPublicUrl(filePath);
        setList([...currentList, { name: file.name, path: data.publicUrl }]);
    }
  };

  const handlePost = async () => {
    if (!newPostContent.trim()) return;
    await supabase.from('course_posts').insert({
      course_id: courseId,
      author_id: user?.id,
      author_name: profile?.full_name || "Unknown",
      content: newPostContent
    });
    setNewPostContent("");
    const { data } = await supabase.from('course_posts').select('*').eq('course_id', courseId).order('created_at', { ascending: false });
    if(data) setPosts(data);
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    await supabase.from('course_materials').insert({ course_id: courseId, parent_id: currentFolderId, title: newFolderName, file_type: 'folder', created_by: user?.id });
    setNewFolderName(""); setShowNewFolderDialog(false); fetchMaterials();
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const file = e.target.files[0];
    const filePath = `${courseId}/${Math.random().toString(36).substring(2)}.${file.name.split('.').pop()}`;
    await supabase.storage.from('course_content').upload(filePath, file);
    await supabase.from('course_materials').insert({ course_id: courseId, parent_id: currentFolderId, title: file.name, file_path: filePath, file_type: file.name.split('.').pop(), size: file.size, created_by: user?.id });
    setIsUploading(false); fetchMaterials();
  };

  const handleFileClick = (file: any) => {
    if (file.file_type === 'folder') { setCurrentFolderId(file.id); setFolderPath([...folderPath, { id: file.id, name: file.title }]); }
    else { const { data } = supabase.storage.from('course_content').getPublicUrl(file.file_path); window.open(data.publicUrl, '_blank'); }
  };

  if (isLoading || !course) return <div className="flex justify-center p-12"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between border-b pb-4">
        <div>
          <Button variant="ghost" className="pl-0 mb-2 hover:bg-transparent" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-primary">{course.name}</h1>
          <div className="flex gap-3 mt-2 text-muted-foreground">
             <span className="font-mono bg-muted px-2 py-0.5 rounded text-xs">{course.course_code}</span>
             <span className="text-xs">•</span>
             <span className="text-xs">{course.semester || "General"}</span>
          </div>
        </div>
        {isLecturer && (
          <Card className="bg-yellow-50 border-yellow-200 min-w-[200px]">
            <CardContent className="p-4 flex flex-col justify-center h-full">
              <div className="flex items-center gap-2 mb-1">
                <Key className="h-4 w-4 text-yellow-700" />
                <span className="text-[10px] text-yellow-800 font-bold uppercase tracking-wider">Enrollment Key</span>
              </div>
              <p className="font-mono text-xl font-bold text-yellow-900 tracking-wide select-all">{course.enrollment_key || "NOT SET"}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4 max-w-[500px] mb-4">
          <TabsTrigger value="posts" className="gap-2"><MessageSquare className="h-4 w-4"/> Posts</TabsTrigger>
          <TabsTrigger value="files" className="gap-2"><FileText className="h-4 w-4"/> Files</TabsTrigger>
          <TabsTrigger value="assignments" className="gap-2"><Calendar className="h-4 w-4"/> Tasks</TabsTrigger>
          <TabsTrigger value="people" className="gap-2"><Users className="h-4 w-4"/> People</TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4 flex-1">
          <div className="flex gap-4 p-4 border rounded-lg bg-muted/10 shadow-sm">
             <Avatar><AvatarFallback>{profile?.full_name[0]}</AvatarFallback></Avatar>
             <div className="flex-1 gap-2 flex flex-col">
                <Input placeholder="Share an announcement..." value={newPostContent} onChange={e => setNewPostContent(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePost()} />
                <div className="flex justify-end"><Button size="sm" onClick={handlePost} disabled={!newPostContent}>Post</Button></div>
             </div>
          </div>
          <div className="space-y-4">
            {posts.map(post => (
              <Card key={post.id} className="overflow-hidden">
                <div className="p-4 flex gap-3">
                  <Avatar className="h-9 w-9 mt-1"><AvatarFallback>{post.author_name[0]}</AvatarFallback></Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold">{post.author_name}</p>
                        <span className="text-xs text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm mt-1">{post.content}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-4 flex-1">
            <div className="flex justify-between items-center bg-muted/30 p-2 rounded-md border">
                <div className="flex items-center gap-1 text-sm overflow-hidden">
                    {folderPath.map((folder, idx) => (
                        <div key={idx} className="flex items-center">
                            {idx > 0 && <ChevronRight className="h-4 w-4 text-muted-foreground mx-1" />}
                            <button onClick={() => { const newPath = folderPath.slice(0, idx + 1); setFolderPath(newPath); setCurrentFolderId(folder.id); }} className={`hover:underline ${idx === folderPath.length - 1 ? 'font-bold' : 'text-muted-foreground'}`}>{folder.name}</button>
                        </div>
                    ))}
                </div>
                {isLecturer && (
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowNewFolderDialog(true)}><Folder className="h-4 w-4 mr-2" /> New Folder</Button>
                        <div className="relative">
                            <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileUpload} disabled={isUploading} />
                            <Button size="sm" disabled={isUploading}>{isUploading ? <Loader2 className="animate-spin h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />} Upload</Button>
                        </div>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {materials.map(file => (
                    <Card key={file.id} className="group relative hover:shadow-md cursor-pointer transition-all hover:bg-accent/5" onClick={() => handleFileClick(file)}>
                        <CardContent className="p-4 flex flex-col items-center text-center gap-3 h-full justify-center">
                            {getFileIcon(file.file_type)} <span className="text-sm font-medium leading-tight line-clamp-2 break-all">{file.title}</span>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>

        <TabsContent value="assignments" className="space-y-4">
            {isLecturer && (
                <Button onClick={() => setShowNewAssignmentDialog(true)} className="w-full sm:w-auto">
                    <Plus className="h-4 w-4 mr-2" /> Create Assignment
                </Button>
            )}

            <div className="grid gap-4">
                {assignments.length === 0 && <div className="text-center py-12 text-muted-foreground">No active assignments.</div>}
                
                {assignments.map(assign => {
                    const submission = mySubmissions.find(s => s.assignment_id === assign.id);
                    const isSubmitted = !!submission;
                    const isLate = isSubmitted && new Date(submission.submitted_at) > new Date(assign.due_date);
                    const isMissing = !isSubmitted && new Date() > new Date(assign.due_date);

                    return (
                        <Card 
                            key={assign.id} 
                            className="cursor-pointer hover:border-primary transition-colors"
                            onClick={() => {
                                setSelectedAssignment(assign);
                                setSubmissionFiles(submission?.files || []);
                            }}
                        >
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-semibold">{assign.title}</CardTitle>
                                {isLecturer ? (
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-500" onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleDeleteAssignment(assign.id); }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                ) : (
                                    <Badge variant={isSubmitted ? (isLate ? "destructive" : "default") : (isMissing ? "destructive" : "outline")}>
                                        {isSubmitted ? (isLate ? "Done Late" : "Turned In") : (isMissing ? "Missing" : "Assigned")}
                                    </Badge>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground flex justify-between">
                                    <span>Due: {new Date(assign.due_date).toLocaleDateString()}</span>
                                    <span>{assign.points ? `${assign.points} pts` : "Ungraded"}</span>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </TabsContent>

        {/* --- SIMPLIFIED PEOPLE TAB --- */}
        <TabsContent value="people">
            {people.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 rounded-lg">
                    <Users className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>No people found in this course.</p>
                </div>
            ) : (
                <div className="border rounded-md divide-y bg-card">
                     <div className="grid grid-cols-12 gap-4 p-4 font-medium bg-muted/30 text-sm">
                        <div className="col-span-12">Members</div>
                     </div>
                     {people.map((person, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-4 hover:bg-muted/10 transition-colors">
                             {/* Avatar Placeholder */}
                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {person.full_name ? person.full_name[0].toUpperCase() : '?'}
                                </AvatarFallback>
                            </Avatar>
                            
                            {/* Name and Role */}
                            <div className="flex flex-col">
                                <span className="font-semibold text-sm">
                                    {person.full_name || "Unknown User"}
                                </span>
                                <span className="text-xs text-muted-foreground capitalize">
                                    {person.role || "Member"}
                                </span>
                            </div>
                        </div>
                     ))}
                </div>
            )}
        </TabsContent>
      </Tabs>

      {/* --- CREATE ASSIGNMENT DIALOG --- */}
      <Dialog open={showNewAssignmentDialog} onOpenChange={(open: boolean) => setShowNewAssignmentDialog(open)}>
        <DialogContent className="max-w-2xl [&>button]:hidden">
            <DialogHeader className="flex flex-row justify-between items-center">
                <DialogTitle>Create Assignment</DialogTitle>
                <Button variant="ghost" size="icon" onClick={() => setShowNewAssignmentDialog(false)}><X className="h-4 w-4" /></Button>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input value={newAssign.title} onChange={e => setNewAssign({...newAssign, title: e.target.value})} placeholder="Assignment Title" />
                    </div>
                    <div className="space-y-2">
                        <Label>Due Date</Label>
                        <Input type="date" value={newAssign.due_date} onChange={e => setNewAssign({...newAssign, due_date: e.target.value})} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Instructions</Label>
                    <Textarea value={newAssign.description} onChange={e => setNewAssign({...newAssign, description: e.target.value})} placeholder="Describe the task..." />
                </div>
                <div className="space-y-2">
                    <Label>Points (Optional)</Label>
                    <Input type="number" value={newAssign.points} onChange={e => setNewAssign({...newAssign, points: e.target.value})} placeholder="100" />
                </div>
                <div className="space-y-2">
                    <Label>Attach Materials</Label>
                    <Input type="file" onChange={(e) => uploadTempFile(e, setNewAssignFiles, newAssignFiles)} disabled={isUploading} />
                    <div className="flex flex-wrap gap-2 mt-2">
                        {newAssignFiles.map((f, i) => (
                             <Badge key={i} variant="secondary" className="gap-1"><Paperclip className="h-3 w-3"/>{f.name}</Badge>
                        ))}
                    </div>
                </div>
            </div>
            <DialogFooter><Button onClick={handleCreateAssignment} disabled={!newAssign.title || !newAssign.due_date || isUploading}>Create</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- VIEW/SUBMIT ASSIGNMENT DIALOG --- */}
      <Dialog open={!!selectedAssignment} onOpenChange={(open: boolean) => !open && setSelectedAssignment(null)}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col [&>button]:hidden p-0 gap-0 overflow-hidden">
            {selectedAssignment && (
                <>
                <div className="border-b p-6 pb-4 flex justify-between items-start bg-background z-10">
                    <div className="pr-8">
                        <h2 className="text-2xl font-semibold tracking-tight">{selectedAssignment.title}</h2>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3"/> Due {new Date(selectedAssignment.due_date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{selectedAssignment.points || "No"} Points</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 -mr-2 -mt-2" onClick={() => setSelectedAssignment(null)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <div className="prose prose-sm max-w-none text-foreground">
                            <h4 className="font-semibold mb-2">Instructions</h4>
                            <p className="whitespace-pre-wrap leading-relaxed">{selectedAssignment.description || "No instructions provided."}</p>
                        </div>
                        {selectedAssignment.attachments && selectedAssignment.attachments.length > 0 && (
                            <div className="bg-muted/30 p-4 rounded-lg border">
                                <h4 className="font-semibold mb-3 text-sm flex items-center gap-2"><Paperclip className="h-4 w-4"/> Reference Materials</h4>
                                <div className="grid gap-2">
                                    {selectedAssignment.attachments.map((file: any, idx: number) => (
                                        <a key={idx} href={file.path} target="_blank" rel="noreferrer" className="flex items-center p-2.5 bg-background border rounded hover:border-primary/50 transition-colors group">
                                            <div className="bg-primary/10 p-2 rounded mr-3 text-primary"><FileText className="h-4 w-4"/></div>
                                            <span className="text-sm font-medium truncate flex-1">{file.name}</span>
                                            <Download className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="md:col-span-1">
                        {isLecturer ? (
                            <Card className="h-full border-l-4 border-l-primary shadow-sm">
                                <CardHeader className="bg-muted/10 pb-3">
                                    <CardTitle className="text-base flex justify-between items-center">
                                        Student Submissions
                                        <Badge variant="secondary">{people.filter(p => p.role === 'student').length}</Badge>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-0 max-h-[500px] overflow-y-auto divide-y">
                                    {people.filter(p => p.role === 'student').map(student => {
                                        const submission = allSubmissions.find(s => s.student_id === student.id);
                                        const isLate = submission && new Date(submission.submitted_at) > new Date(selectedAssignment.due_date);
                                        return (
                                            <div key={student.id} className="p-3 hover:bg-muted/50 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-sm font-medium">{student.full_name}</span>
                                                    {submission ? (
                                                        <Badge variant={isLate ? "destructive" : "default"} className="text-[10px] h-5">
                                                            {isLate ? "Late" : "Turned In"}
                                                        </Badge>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] h-5 text-muted-foreground">Missing</Badge>
                                                    )}
                                                </div>
                                                {submission && submission.files?.length > 0 && (
                                                    <div className="space-y-1 mt-2">
                                                        {submission.files.map((f: any, i: number) => (
                                                            <a key={i} href={f.path} target="_blank" rel="noreferrer" className="flex items-center text-xs text-blue-600 hover:underline">
                                                                <Paperclip className="h-3 w-3 mr-1" /> {f.name}
                                                            </a>
                                                        ))}
                                                        <div className="text-[10px] text-muted-foreground mt-1">
                                                            Submitted: {new Date(submission.submitted_at).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>
                        ) : (
                            <Card className="h-fit shadow-md border-t-4 border-t-primary">
                                <CardHeader className="pb-3 border-b bg-muted/10">
                                    <CardTitle className="text-base flex justify-between items-center">
                                        Your Work
                                        {mySubmissions.find(s=>s.assignment_id===selectedAssignment.id) && <CheckCircle className="h-5 w-5 text-green-600"/>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4 pt-4">
                                    {submissionFiles.length > 0 ? (
                                        <div className="space-y-2">
                                            {submissionFiles.map((f, i) => (
                                                <div key={i} className="flex items-center justify-between p-2.5 bg-background border rounded text-sm group">
                                                    <div className="flex items-center truncate text-blue-600">
                                                        <File className="h-4 w-4 mr-2 text-muted-foreground"/>
                                                        <span className="truncate max-w-[150px]">{f.name}</span>
                                                    </div>
                                                    {!mySubmissions.find(s=>s.assignment_id===selectedAssignment.id) && (
                                                        <button onClick={() => setSubmissionFiles(submissionFiles.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-red-500">
                                                            <X className="h-4 w-4"/>
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-sm text-center text-muted-foreground py-6 border-2 border-dashed rounded-lg bg-muted/20">
                                            No files attached yet.
                                        </div>
                                    )}
                                    <div className="pt-2">
                                        {mySubmissions.find(s => s.assignment_id === selectedAssignment.id) ? (
                                            <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleUndoTurnIn}>
                                                Undo Turn In
                                            </Button>
                                        ) : (
                                            <>
                                                <div className="relative mb-3">
                                                    <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => uploadTempFile(e, setSubmissionFiles, submissionFiles)} disabled={isUploading} />
                                                    <Button variant="secondary" className="w-full" disabled={isUploading}>
                                                        {isUploading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : <Plus className="h-4 w-4 mr-2"/>} 
                                                        Add or Create
                                                    </Button>
                                                </div>
                                                <Button className="w-full font-semibold" onClick={handleTurnIn} disabled={submissionFiles.length === 0}>
                                                    Turn In
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
                </>
            )}
        </DialogContent>
      </Dialog>
      
      {/* Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={(open: boolean) => setShowNewFolderDialog(open)}>
        <DialogContent><DialogHeader><DialogTitle>New Folder</DialogTitle></DialogHeader><Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} /><DialogFooter><Button onClick={handleCreateFolder}>Create</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}