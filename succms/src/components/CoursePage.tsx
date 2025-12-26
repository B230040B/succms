import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom"; // Added useSearchParams
import { supabase } from "/workspaces/succms/succms/src/lib/supabase.ts";
import { useAuth } from "/workspaces/succms/succms/src/contexts/AuthContext.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { 
  MessageSquare, FileText, Calendar, Users, Plus, 
  Trash2, Key, Loader2, Folder, 
  File, FileCode, FileImage, FileSpreadsheet, ChevronRight,
  ArrowLeft, Paperclip, CheckCircle, X, Download, Sparkles, User, ChevronLeft, GraduationCap
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
  const navigate = useNavigate(); 
  const [searchParams] = useSearchParams(); // Hook to read URL params
  
  const [activeTab, setActiveTab] = useState("posts");
  const [course, setCourse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Data States
  const [posts, setPosts] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]); 
  const [people, setPeople] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [mySubmissions, setMySubmissions] = useState<any[]>([]);
  
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);

  // Grading State
  const [gradingStudentId, setGradingStudentId] = useState<string | null>(null);
  const [currentGrade, setCurrentGrade] = useState("");
  const [currentFeedback, setCurrentFeedback] = useState("");
  const [isAiGrading, setIsAiGrading] = useState(false);

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
    fetchPeople(); 
    fetchAssignments();
    
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
  
  // --- AUTO-OPEN ASSIGNMENT FROM URL ---
  useEffect(() => {
    const assignmentIdFromUrl = searchParams.get('assignmentId');
    if (assignmentIdFromUrl && assignments.length > 0) {
        const targetAssign = assignments.find(a => a.id === assignmentIdFromUrl);
        if (targetAssign) {
            setSelectedAssignment(targetAssign);
            setActiveTab("assignments"); // Switch tab to context
            // Clean URL so refresh doesn't reopen it if they close it
            // navigate(`/courses/${courseId}`, { replace: true }); 
        }
    }
  }, [assignments, searchParams]); // Run when assignments load or URL changes

  useEffect(() => {
    if (selectedAssignment) {
        if (isLecturer) {
            fetchSubmissionsForAssignment(selectedAssignment.id);
            setGradingStudentId(null); 
        } else if (user) {
            const fetchMyLatestSubmission = async () => {
                const { data } = await supabase
                    .from('assignment_submissions')
                    .select('*')
                    .eq('assignment_id', selectedAssignment.id)
                    .eq('student_id', user.id)
                    .single();
                
                if (data) {
                    setMySubmissions(prev => {
                        const others = prev.filter(s => s.assignment_id !== selectedAssignment.id);
                        return [...others, data];
                    });
                    setSubmissionFiles(data.files || []); 
                }
            };
            fetchMyLatestSubmission();
        }
    }
  }, [selectedAssignment, isLecturer, user]);

  useEffect(() => {
    if (gradingStudentId && allSubmissions.length > 0) {
        const sub = allSubmissions.find(s => s.student_id === gradingStudentId);
        setCurrentGrade(sub?.grade || "");
        setCurrentFeedback(sub?.feedback || "");
    }
  }, [gradingStudentId, allSubmissions]);

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

  const fetchPeople = async () => {
    try {
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
    
    const submissionData = { 
        assignment_id: selectedAssignment.id, 
        student_id: user.id, 
        files: submissionFiles, 
        submitted_at: new Date().toISOString() 
    };

    const existing = mySubmissions.find(s => s.assignment_id === selectedAssignment.id);
    let error;

    if (existing) {
        const { error: updateError } = await supabase.from('assignment_submissions').update(submissionData).eq('id', existing.id);
        error = updateError;
    } else {
        const { error: insertError } = await supabase.from('assignment_submissions').insert(submissionData);
        error = insertError;
    }

    if (!error) {
        setMySubmissions(prev => {
            const others = prev.filter(s => s.assignment_id !== selectedAssignment.id);
            return [...others, { ...submissionData, id: existing?.id || 'temp-id', grade: null }];
        });
    } else {
        alert("Failed to turn in assignment. Please try again.");
    }
  };

  const handleUndoTurnIn = async () => {
    if (!selectedAssignment || !user) return;
    
    const { error } = await supabase.from('assignment_submissions').delete().eq('assignment_id', selectedAssignment.id).eq('student_id', user.id);
    
    if (!error) {
        setMySubmissions(prev => prev.filter(s => s.assignment_id !== selectedAssignment.id));
        setSubmissionFiles([]); 
    }
  };

  const handleSaveGrade = async () => {
    if (!gradingStudentId || !selectedAssignment) return;
    const existingSub = allSubmissions.find(s => s.student_id === gradingStudentId);
    
    if (existingSub) {
        await supabase.from('assignment_submissions').update({
            grade: currentGrade,
            feedback: currentFeedback
        }).eq('id', existingSub.id);
    } else {
        await supabase.from('assignment_submissions').insert({
            assignment_id: selectedAssignment.id,
            student_id: gradingStudentId,
            grade: currentGrade,
            feedback: currentFeedback,
            submitted_at: new Date().toISOString()
        });
    }
    
    alert("Grade Saved!");
    fetchSubmissionsForAssignment(selectedAssignment.id); 
  };

  const handleAiAutoGrade = async () => {
    setIsAiGrading(true);
    setTimeout(() => {
        setIsAiGrading(false);
        const randomScore = Math.floor(Math.random() * (100 - 70 + 1)) + 70;
        setCurrentGrade(randomScore.toString());
        setCurrentFeedback(
            "AI Generated Feedback:\n" +
            "- Good understanding of the core concepts.\n" +
            "- Structure is logical and easy to follow.\n" +
            "- Please include more citations in the future.\n" +
            "- Overall: Excellent work."
        );
    }, 2000);
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
             <Avatar className="h-10 w-10 shrink-0"><AvatarFallback>{profile?.full_name[0]}</AvatarFallback></Avatar>
             <div className="flex-1 gap-2 flex flex-col">
                <Input placeholder="Share an announcement..." value={newPostContent} onChange={e => setNewPostContent(e.target.value)} onKeyDown={e => e.key === 'Enter' && handlePost()} />
                <div className="flex justify-end"><Button size="sm" onClick={handlePost} disabled={!newPostContent}>Post</Button></div>
             </div>
          </div>
          <div className="space-y-4">
            {posts.map(post => (
              <Card key={post.id} className="overflow-hidden">
                <div className="p-4 flex gap-3">
                  <Avatar className="h-10 w-10 mt-1 shrink-0 border border-gray-200"><AvatarFallback>{post.author_name[0]}</AvatarFallback></Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-semibold truncate text-gray-900">{post.author_name}</p>
                        <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{new Date(post.created_at).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm mt-1 break-words text-gray-700">{post.content}</p>
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
                                    <div className="flex gap-2">
                                        {submission?.grade != null && <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">Graded</Badge>}
                                        <Badge variant={isSubmitted ? (isLate ? "destructive" : "default") : (isMissing ? "destructive" : "outline")}>
                                            {isSubmitted ? (isLate ? "Done Late" : "Turned In") : (isMissing ? "Missing" : "Assigned")}
                                        </Badge>
                                    </div>
                                )}
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-muted-foreground flex justify-between items-center mt-2">
                                    <span>Due: {new Date(assign.due_date).toLocaleDateString()}</span>
                                    {submission?.grade != null ? (
                                        <Badge variant="secondary" className="text-sm font-bold bg-green-100 text-green-800 hover:bg-green-200 px-2">
                                            {submission.grade} / {assign.points || 100}
                                        </Badge>
                                    ) : (
                                        <span>{assign.points ? `${assign.points} pts` : "Ungraded"}</span>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </TabsContent>

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
                        <div 
                            key={idx} 
                            className="flex items-center gap-4 p-4 hover:bg-muted/10 transition-colors cursor-pointer"
                            onClick={() => navigate(`/profile/${person.id}`)}
                        >
                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm shrink-0">
                                <AvatarImage src={person.avatar_url} />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                    {person.full_name ? person.full_name[0].toUpperCase() : '?'}
                                </AvatarFallback>
                            </Avatar>
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

      {/* --- DIALOGS --- */}
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

      <Dialog open={!!selectedAssignment} onOpenChange={(open: boolean) => !open && setSelectedAssignment(null)}>
        <DialogContent className="sm:max-w-[95vw] w-full h-[90vh] flex flex-col p-0 gap-0 overflow-hidden [&>button]:hidden bg-white">
            {selectedAssignment && (
                <>
                <div className="border-b p-4 flex justify-between items-center bg-gray-50 z-10 shrink-0 h-16">
                    <div className="flex items-center gap-4">
                        {isLecturer && gradingStudentId && (
                            <Button variant="ghost" size="sm" onClick={() => setGradingStudentId(null)}>
                                <ChevronLeft className="h-4 w-4 mr-1"/> Back to List
                            </Button>
                        )}
                        <div>
                            <h2 className="text-xl font-bold tracking-tight text-gray-900">{selectedAssignment.title}</h2>
                            <p className="text-xs text-gray-500">Due {new Date(selectedAssignment.due_date).toLocaleDateString()} • {selectedAssignment.points || "0"} Points</p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setSelectedAssignment(null)}>
                        <X className="h-5 w-5 text-gray-500" />
                    </Button>
                </div>

                <div className="flex-1 flex overflow-hidden">
                    
                    <div className={`flex-1 min-w-[320px] overflow-y-auto p-6 bg-white ${isLecturer && gradingStudentId ? 'hidden md:block md:w-2/3 border-r' : 'w-full'}`}>
                        
                        {isLecturer && !gradingStudentId && (
                            <div className="space-y-4">
                                <h3 className="font-semibold text-lg flex items-center gap-2 text-gray-800"><Users className="h-5 w-5"/> Student Submissions</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {people.filter(p => p.role === 'student').map(student => {
                                        const sub = allSubmissions.find(s => s.student_id === student.id);
                                        const isLate = sub && new Date(sub.submitted_at) > new Date(selectedAssignment.due_date);
                                        
                                        return (
                                            <Card 
                                                key={student.id} 
                                                className={`cursor-pointer hover:border-blue-500 hover:shadow-md transition-all ${sub ? 'bg-blue-50/50 border-blue-200' : 'bg-white border-gray-200'}`}
                                                onClick={() => setGradingStudentId(student.id)}
                                            >
                                                <CardContent className="p-4 flex items-center gap-3">
                                                    <Avatar className="h-10 w-10 border border-gray-200">
                                                        <AvatarImage src={student.avatar_url} />
                                                        <AvatarFallback>{student.full_name[0]}</AvatarFallback>
                                                    </Avatar>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="font-semibold text-sm truncate text-gray-900">{student.full_name}</p>
                                                        <div className="flex gap-2 mt-1">
                                                            {sub ? (
                                                                <Badge variant={isLate ? "destructive" : "default"} className="text-[10px] h-5 px-2">{isLate ? "Late" : "Submitted"}</Badge>
                                                            ) : (
                                                                <Badge variant="outline" className="text-[10px] h-5 px-2 text-gray-400">Missing</Badge>
                                                            )}
                                                            {sub?.grade && <Badge variant="secondary" className="text-[10px] h-5 bg-green-100 text-green-700 hover:bg-green-100">Graded: {sub.grade}</Badge>}
                                                        </div>
                                                    </div>
                                                    <ChevronRight className="h-4 w-4 text-gray-400"/>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {(!isLecturer || gradingStudentId) && (
                            <div className="space-y-8 max-w-4xl mx-auto">
                                {mySubmissions.find(s => s.assignment_id === selectedAssignment.id)?.grade != null && (
                                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="flex justify-between items-start mb-3">
                                            <h4 className="font-bold text-green-800 text-sm uppercase tracking-wider flex items-center gap-2">
                                                <GraduationCap className="h-4 w-4"/> Graded & Returned
                                            </h4>
                                            <Badge variant="secondary" className="bg-white text-green-700 border-green-200">
                                                {new Date(mySubmissions.find(s => s.assignment_id === selectedAssignment.id).submitted_at).toLocaleDateString()}
                                            </Badge>
                                        </div>
                                        <div className="text-4xl font-bold text-gray-900 mb-4">
                                            {mySubmissions.find(s => s.assignment_id === selectedAssignment.id).grade} 
                                            <span className="text-lg font-medium text-gray-400"> / {selectedAssignment.points}</span>
                                        </div>
                                        {mySubmissions.find(s => s.assignment_id === selectedAssignment.id).feedback && (
                                            <div className="bg-white p-4 rounded-lg border border-green-100 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed shadow-sm">
                                                <span className="font-bold text-gray-900 block mb-2">Lecturer Feedback:</span>
                                                {mySubmissions.find(s => s.assignment_id === selectedAssignment.id).feedback}
                                            </div>
                                        )}
                                    </div>
                                )}

                                <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
                                    <h4 className="font-bold text-gray-900 text-lg mb-4 flex items-center gap-2">
                                        <FileText className="h-5 w-5 text-gray-500"/> Instructions
                                    </h4>
                                    <p className="whitespace-pre-wrap leading-relaxed text-gray-700">{selectedAssignment.description || "No instructions provided."}</p>
                                    
                                    {selectedAssignment.attachments?.length > 0 && (
                                        <div className="mt-6 grid gap-2">
                                            {selectedAssignment.attachments.map((file: any, idx: number) => (
                                                <a key={idx} href={file.path} target="_blank" rel="noreferrer" className="flex items-center p-3 bg-white border rounded-lg hover:border-blue-300 transition-colors group shadow-sm">
                                                    <div className="bg-blue-50 p-2 rounded mr-3 text-blue-600"><FileText className="h-4 w-4"/></div>
                                                    <span className="text-sm font-medium truncate flex-1 text-gray-700">{file.name}</span>
                                                    <Download className="h-4 w-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {isLecturer && gradingStudentId && (
                                    <div className="pt-2">
                                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-gray-800"><User className="h-5 w-5"/> Student Submission</h3>
                                        {allSubmissions.find(s => s.student_id === gradingStudentId)?.files?.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {allSubmissions.find(s => s.student_id === gradingStudentId).files.map((f: any, i: number) => (
                                                    <a key={i} href={f.path} target="_blank" rel="noreferrer" className="flex items-center p-4 bg-white border-2 border-blue-100 rounded-xl hover:border-blue-500 hover:shadow-md transition-all group">
                                                        <div className="bg-blue-100 p-3 rounded-lg mr-3 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                            <FileText className="h-6 w-6"/>
                                                        </div>
                                                        <div className="flex-1 overflow-hidden">
                                                            <p className="font-medium text-blue-900 truncate">{f.name}</p>
                                                            <p className="text-xs text-blue-400">Click to view</p>
                                                        </div>
                                                        <Download className="h-5 w-5 text-gray-300 group-hover:text-blue-500"/>
                                                    </a>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center p-8 bg-gray-50 rounded-xl border border-dashed border-gray-300 text-gray-400 italic">
                                                Student has not attached any files yet.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="w-[400px] bg-gray-50 border-l p-6 overflow-y-auto shrink-0 flex flex-col shadow-[inset_10px_0_20px_-10px_rgba(0,0,0,0.05)]">
                        
                        {isLecturer ? (
                            gradingStudentId ? (
                                <div className="space-y-6">
                                    <div className="pb-4 border-b border-gray-200">
                                        <h3 className="font-bold text-lg mb-1 text-gray-900">Grading</h3>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            Student: <span className="font-medium text-gray-900">{people.find(p => p.id === gradingStudentId)?.full_name}</span>
                                        </p>
                                    </div>

                                    <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100 shadow-sm overflow-hidden">
                                        <CardContent className="p-5">
                                            <div className="flex items-center gap-2 mb-2 text-indigo-700 font-bold text-sm">
                                                <Sparkles className="h-4 w-4 text-indigo-500" /> AI Grader
                                            </div>
                                            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                                                Use AI to analyze the submission and generate a suggested grade and feedback.
                                            </p>
                                            <Button 
                                                onClick={handleAiAutoGrade} 
                                                disabled={isAiGrading}
                                                size="sm" 
                                                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-md transition-all active:scale-95"
                                            >
                                                {isAiGrading ? <Loader2 className="h-3 w-3 animate-spin mr-2"/> : <Sparkles className="h-3 w-3 mr-2"/>}
                                                {isAiGrading ? "Analyzing..." : "Auto-Grade Now"}
                                            </Button>
                                        </CardContent>
                                    </Card>

                                    <div className="space-y-5">
                                        <div className="space-y-2">
                                            <Label className="text-gray-700 font-semibold">Score</Label>
                                            <div className="flex items-center gap-2">
                                                <Input 
                                                    type="number" 
                                                    value={currentGrade} 
                                                    onChange={e => setCurrentGrade(e.target.value)} 
                                                    className="text-2xl font-bold h-14 w-24 text-center bg-white"
                                                    placeholder="-"
                                                />
                                                <span className="text-gray-400 text-lg font-medium">/ {selectedAssignment.points || 100}</span>
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-gray-700 font-semibold">Feedback</Label>
                                            <Textarea 
                                                value={currentFeedback} 
                                                onChange={e => setCurrentFeedback(e.target.value)} 
                                                className="min-h-[200px] bg-white text-base leading-relaxed p-4"
                                                placeholder="Enter detailed feedback for the student..."
                                            />
                                        </div>
                                        <Button onClick={handleSaveGrade} className="w-full h-12 text-lg shadow-lg hover:shadow-xl transition-all">
                                            Save Grade & Return
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 p-8">
                                    <div className="bg-white p-6 rounded-full mb-4 shadow-sm border border-gray-100"><Users className="h-10 w-10 opacity-20"/></div>
                                    <p className="font-medium">Select a student from the list on the left to begin grading.</p>
                                </div>
                            )
                        ) : (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">Your Work</h3>
                                    <p className="text-sm text-gray-500">Upload your files below</p>
                                </div>

                                <Card className="border-t-4 border-t-primary shadow-sm bg-white">
                                    <CardContent className="p-5 space-y-5">
                                        {submissionFiles.length > 0 ? (
                                            <div className="space-y-2">
                                                {submissionFiles.map((f, i) => (
                                                    <div key={i} className="flex items-center justify-between p-3 bg-gray-50 border rounded-lg text-sm group">
                                                        <div className="flex items-center truncate text-blue-700 font-medium">
                                                            <File className="h-4 w-4 mr-2 text-gray-400"/>
                                                            <span className="truncate max-w-[180px]">{f.name}</span>
                                                        </div>
                                                        {!mySubmissions.find(s=>s.assignment_id===selectedAssignment.id) && (
                                                            <button onClick={() => setSubmissionFiles(submissionFiles.filter((_, idx) => idx !== i))} className="text-gray-400 hover:text-red-500 p-1">
                                                                <X className="h-4 w-4"/>
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-center text-gray-400 py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                                                No files attached yet.
                                            </div>
                                        )}

                                        {mySubmissions.find(s => s.assignment_id === selectedAssignment.id) ? (
                                            <div className="space-y-4 pt-2">
                                                <div className="flex items-center justify-center gap-2 text-green-700 font-bold p-3 bg-green-50 border border-green-200 rounded-lg">
                                                    <CheckCircle className="h-5 w-5"/> Turned In
                                                </div>
                                                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200" onClick={handleUndoTurnIn}>
                                                    Unsubmit
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="space-y-3 pt-2">
                                                <div className="relative group">
                                                    <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => uploadTempFile(e, setSubmissionFiles, submissionFiles)} disabled={isUploading} />
                                                    <Button variant="secondary" className="w-full h-12 text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 border transition-all" disabled={isUploading}>
                                                        {isUploading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : <Plus className="h-4 w-4 mr-2"/>} 
                                                        Add File
                                                    </Button>
                                                </div>
                                                <Button className="w-full font-bold h-12 text-lg shadow-md hover:shadow-lg transition-all" onClick={handleTurnIn} disabled={submissionFiles.length === 0}>
                                                    Turn In
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>
                </div>
                </>
            )}
        </DialogContent>
      </Dialog>
      
      <Dialog open={showNewFolderDialog} onOpenChange={(open: boolean) => setShowNewFolderDialog(open)}>
        <DialogContent><DialogHeader><DialogTitle>New Folder</DialogTitle></DialogHeader><Input value={newFolderName} onChange={e => setNewFolderName(e.target.value)} /><DialogFooter><Button onClick={handleCreateFolder}>Create</Button></DialogFooter></DialogContent>
      </Dialog>
    </div>
  );
}