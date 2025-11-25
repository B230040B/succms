import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Textarea } from "./ui/textarea";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Upload, 
  FileText, 
  Calendar, 
  Clock, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Users,
  Eye,
  MessageSquare
} from "lucide-react";

export function Assignments() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const assignments = [
    {
      id: 1,
      title: "JavaScript To-Do App",
      course: "Complete JavaScript Fundamentals",
      dueDate: "2025-08-25",
      status: "submitted",
      grade: 92,
      maxPoints: 100,
      submissionDate: "2025-08-23",
      peerReviews: 3,
      averagePeerGrade: 89,
      description: "Create a fully functional to-do application using vanilla JavaScript with local storage."
    },
    {
      id: 2,
      title: "Python Data Analysis Project",
      course: "Data Science with Python",
      dueDate: "2025-08-28",
      status: "in_review",
      grade: null,
      maxPoints: 150,
      submissionDate: "2025-08-26",
      peerReviews: 1,
      averagePeerGrade: null,
      description: "Analyze a dataset using pandas and create visualizations with matplotlib."
    },
    {
      id: 3,
      title: "React Component Library",
      course: "Advanced React Development",
      dueDate: "2025-09-02",
      status: "pending",
      grade: null,
      maxPoints: 200,
      submissionDate: null,
      peerReviews: 0,
      averagePeerGrade: null,
      description: "Build a reusable component library with documentation and testing."
    }
  ];

  const peerReviews = [
    {
      id: 1,
      assignmentTitle: "CSS Flexbox Layout Challenge",
      student: "Anonymous Student A",
      submissionDate: "2 days ago",
      status: "pending",
      dueDate: "2025-08-21",
      description: "Review a responsive layout implementation using CSS Flexbox."
    },
    {
      id: 2,
      assignmentTitle: "JavaScript Algorithm Problems",
      student: "Anonymous Student B", 
      submissionDate: "1 day ago",
      status: "pending",
      dueDate: "2025-08-22",
      description: "Evaluate solutions to common algorithmic challenges."
    },
    {
      id: 3,
      assignmentTitle: "HTML Semantic Structure",
      student: "Anonymous Student C",
      submissionDate: "4 hours ago",
      status: "completed",
      dueDate: "2025-08-20",
      description: "Assess proper use of semantic HTML elements in a webpage."
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted": return "bg-blue-100 text-blue-800";
      case "in_review": return "bg-yellow-100 text-yellow-800";
      case "graded": return "bg-green-100 text-green-800";
      case "pending": return "bg-gray-100 text-gray-800";
      case "overdue": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted": return <CheckCircle className="h-4 w-4" />;
      case "in_review": return <Clock className="h-4 w-4" />;
      case "graded": return <Star className="h-4 w-4" />;
      case "pending": return <AlertCircle className="h-4 w-4" />;
      case "overdue": return <AlertCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>Assignments</h1>
        <p className="text-muted-foreground">Submit your work and review peers</p>
      </div>

      <Tabs defaultValue="my-assignments">
        <TabsList>
          <TabsTrigger value="my-assignments">My Assignments</TabsTrigger>
          <TabsTrigger value="peer-reviews">Peer Reviews</TabsTrigger>
          <TabsTrigger value="upload">Submit Assignment</TabsTrigger>
        </TabsList>

        <TabsContent value="my-assignments" className="space-y-4">
          {assignments.map((assignment) => {
            const daysUntilDue = assignment.dueDate ? getDaysUntilDue(assignment.dueDate) : null;
            
            return (
              <Card key={assignment.id}>
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <h3>{assignment.title}</h3>
                          <p className="text-sm text-muted-foreground">{assignment.course}</p>
                          <p className="text-sm">{assignment.description}</p>
                        </div>
                        <Badge className={getStatusColor(assignment.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(assignment.status)}
                            {assignment.status.replace('_', ' ')}
                          </div>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Due Date</p>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{assignment.dueDate ? formatDate(assignment.dueDate) : 'N/A'}</span>
                          </div>
                          {daysUntilDue !== null && (
                            <p className={`text-xs ${daysUntilDue < 3 ? 'text-red-600' : 'text-muted-foreground'}`}>
                              {daysUntilDue > 0 ? `${daysUntilDue} days left` : 'Past due'}
                            </p>
                          )}
                        </div>
                        
                        <div>
                          <p className="text-muted-foreground">Grade</p>
                          <p className="flex items-center gap-1">
                            {assignment.grade !== null ? (
                              <>
                                <Star className="h-4 w-4 text-yellow-500" />
                                {assignment.grade}/{assignment.maxPoints}
                              </>
                            ) : (
                              <span>Pending</span>
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-muted-foreground">Peer Reviews</p>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{assignment.peerReviews}/3</span>
                          </div>
                          {assignment.averagePeerGrade && (
                            <p className="text-xs text-muted-foreground">
                              Avg: {assignment.averagePeerGrade}%
                            </p>
                          )}
                        </div>

                        <div>
                          <p className="text-muted-foreground">Submitted</p>
                          <p>{assignment.submissionDate ? formatDate(assignment.submissionDate) : 'Not submitted'}</p>
                        </div>
                      </div>

                      {assignment.status === "in_review" && (
                        <Alert>
                          <Clock className="h-4 w-4" />
                          <AlertDescription>
                            Your submission is being peer reviewed. You'll receive feedback soon.
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {assignment.status === "submitted" || assignment.status === "graded" ? (
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Submission
                        </Button>
                      ) : (
                        <Button size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Submit
                        </Button>
                      )}
                      
                      {assignment.peerReviews > 0 && (
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-2" />
                          View Reviews
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="peer-reviews" className="space-y-4">
          <div className="mb-4">
            <Alert>
              <Users className="h-4 w-4" />
              <AlertDescription>
                Complete peer reviews to unlock feedback on your own submissions. Reviews are anonymous to ensure honest feedback.
              </AlertDescription>
            </Alert>
          </div>

          {peerReviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3>{review.assignmentTitle}</h3>
                      <Badge variant={review.status === "completed" ? "default" : "secondary"}>
                        {review.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Submitted by {review.student}</p>
                    <p className="text-sm">{review.description}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Submitted: {review.submissionDate}</span>
                      <span>Review due: {formatDate(review.dueDate)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    {review.status === "completed" ? (
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        View Review
                      </Button>
                    ) : (
                      <Button size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Start Review
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="upload" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Submit Assignment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Assignment Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Assignment</label>
                <select className="w-full p-2 border rounded-md">
                  <option>React Component Library</option>
                  <option>Python Data Analysis Project</option>
                  <option>CSS Animation Showcase</option>
                </select>
              </div>

              {/* File Upload Area */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Upload Files</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    dragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                >
                  <div className="space-y-4">
                    <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
                      <Upload className="h-6 w-6 text-muted-foreground" />
                    </div>
                    
                    {selectedFile ? (
                      <div className="space-y-2">
                        <p className="font-medium">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p>Drag and drop your files here</p>
                        <p className="text-sm text-muted-foreground">or</p>
                        <Button variant="outline" onClick={() => document.getElementById('file-input')?.click()}>
                          Choose Files
                        </Button>
                        <input
                          id="file-input"
                          type="file"
                          className="hidden"
                          onChange={handleFileSelect}
                          multiple
                          accept=".pdf,.doc,.docx,.txt,.zip,.js,.py,.html,.css"
                        />
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Accepted formats: PDF, DOC, TXT, ZIP, JS, PY, HTML, CSS (Max 50MB)
                    </p>
                  </div>
                </div>
              </div>

              {/* Comments */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Comments (Optional)</label>
                <Textarea
                  placeholder="Add any notes about your submission..."
                  className="min-h-[100px]"
                />
              </div>

              {/* Submission Actions */}
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  <p>Submission will be available for peer review</p>
                  <p>You'll receive 3 anonymous reviews within 48 hours</p>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline">Save as Draft</Button>
                  <Button disabled={!selectedFile}>
                    <Upload className="h-4 w-4 mr-2" />
                    Submit Assignment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}