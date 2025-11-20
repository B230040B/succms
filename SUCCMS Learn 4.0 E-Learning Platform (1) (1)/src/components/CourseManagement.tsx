import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Alert, AlertDescription } from "./ui/alert";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  FileText, 
  Video, 
  Users, 
  Calendar,
  BookOpen,
  Settings,
  Eye,
  Download,
  Bell,
  MessageSquare
} from "lucide-react";

export function CourseManagement() {
  const [selectedCourse, setSelectedCourse] = useState(1);
  const [isCreating, setIsCreating] = useState(false);

  const courses = [
    {
      id: 1,
      code: "CS301",
      name: "Database Systems",
      description: "Introduction to database design, SQL, and database management systems.",
      semester: "Spring 2024",
      credits: 3,
      enrolledStudents: 45,
      maxStudents: 50,
      status: "active",
      materials: 12,
      assignments: 6,
      announcements: 3
    },
    {
      id: 2,
      code: "CS410",
      name: "Software Engineering",
      description: "Software development lifecycle, methodologies, and project management.",
      semester: "Spring 2024",
      credits: 4,
      enrolledStudents: 38,
      maxStudents: 40,
      status: "active",
      materials: 15,
      assignments: 8,
      announcements: 5
    },
    {
      id: 3,
      code: "CS550",
      name: "Advanced Databases",
      description: "Advanced topics in database systems including optimization and distributed databases.",
      semester: "Spring 2024",
      credits: 3,
      enrolledStudents: 25,
      maxStudents: 30,
      status: "active",
      materials: 10,
      assignments: 4,
      announcements: 2
    }
  ];

  const materials = [
    {
      id: 1,
      title: "Introduction to Database Design",
      type: "pdf",
      size: "2.4 MB",
      uploaded: "2024-02-15",
      downloads: 42,
      category: "lecture"
    },
    {
      id: 2,
      title: "SQL Fundamentals Video",
      type: "video",
      size: "145 MB",
      uploaded: "2024-02-18",
      downloads: 38,
      category: "lecture"
    },
    {
      id: 3,
      title: "Database Normalization Slides",
      type: "pptx",
      size: "5.1 MB",
      uploaded: "2024-02-22",
      downloads: 41,
      category: "slides"
    },
    {
      id: 4,
      title: "Practice Exercises - Week 3",
      type: "pdf",
      size: "1.8 MB",
      uploaded: "2024-02-25",
      downloads: 35,
      category: "exercises"
    }
  ];

  const announcements = [
    {
      id: 1,
      title: "Midterm Exam Schedule",
      content: "The midterm examination will be held on March 15th, 2024 in Lab 204. Please bring your student ID and arrive 15 minutes early.",
      priority: "high",
      published: "2024-03-01",
      views: 45
    },
    {
      id: 2,
      title: "Assignment 3 Guidelines Updated",
      content: "Additional requirements have been added to Assignment 3. Please review the updated document in the materials section.",
      priority: "medium",
      published: "2024-02-28",
      views: 38
    },
    {
      id: 3,
      title: "Office Hours This Week",
      content: "Office hours have been moved to Thursday 2-4 PM due to a faculty meeting on Tuesday.",
      priority: "low",
      published: "2024-02-26",
      views: 42
    }
  ];

  const selectedCourseData = courses.find(c => c.id === selectedCourse);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="h-4 w-4 text-red-500" />;
      case 'video': return <Video className="h-4 w-4 text-blue-500" />;
      case 'pptx': return <FileText className="h-4 w-4 text-orange-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800'; 
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isCreating) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1>Create New Course</h1>
            <p className="text-muted-foreground">Set up a new course for your students</p>
          </div>
          <Button variant="outline" onClick={() => setIsCreating(false)}>
            Cancel
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Course Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="courseCode">Course Code</Label>
                <Input id="courseCode" placeholder="CS301" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Credits</Label>
                <Input id="credits" type="number" placeholder="3" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="courseName">Course Name</Label>
              <Input id="courseName" placeholder="Database Systems" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Course Description</Label>
              <Textarea 
                id="description" 
                placeholder="Enter a detailed description of the course content and objectives..."
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Input id="semester" placeholder="Spring 2024" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStudents">Max Students</Label>
                <Input id="maxStudents" type="number" placeholder="50" />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button>Create Course</Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1>Course Management</h1>
          <p className="text-muted-foreground">Manage your courses, materials, and announcements</p>
        </div>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Course
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Course List Sidebar */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">My Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {courses.map((course) => (
              <div
                key={course.id}
                className={`p-3 rounded-lg cursor-pointer transition-colors ${
                  selectedCourse === course.id ? 'bg-accent' : 'hover:bg-accent/50'
                }`}
                onClick={() => setSelectedCourse(course.id)}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{course.code}</Badge>
                    <Badge className={course.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {course.status}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-medium">{course.name}</h4>
                  <div className="text-xs text-muted-foreground">
                    <p>{course.enrolledStudents}/{course.maxStudents} students</p>
                    <p>{course.semester}</p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {selectedCourseData && (
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="materials">Materials</TabsTrigger>
                <TabsTrigger value="announcements">Announcements</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Course Overview */}
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Badge variant="outline">{selectedCourseData.code}</Badge>
                          {selectedCourseData.name}
                        </CardTitle>
                        <p className="text-muted-foreground mt-1">{selectedCourseData.description}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{selectedCourseData.enrolledStudents}</div>
                        <div className="text-sm text-muted-foreground">Enrolled Students</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{selectedCourseData.materials}</div>
                        <div className="text-sm text-muted-foreground">Materials</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{selectedCourseData.assignments}</div>
                        <div className="text-sm text-muted-foreground">Assignments</div>
                      </div>
                      <div className="text-center p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-primary">{selectedCourseData.announcements}</div>
                        <div className="text-sm text-muted-foreground">Announcements</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enrollment Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Enrollment Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Students Enrolled</span>
                        <span>{selectedCourseData.enrolledStudents}/{selectedCourseData.maxStudents}</span>
                      </div>
                      <Progress value={(selectedCourseData.enrolledStudents / selectedCourseData.maxStudents) * 100} />
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button variant="outline" className="h-20 flex flex-col gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Material
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col gap-2">
                        <Bell className="h-5 w-5" />
                        Post Announcement
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col gap-2">
                        <FileText className="h-5 w-5" />
                        Create Assignment
                      </Button>
                      <Button variant="outline" className="h-20 flex flex-col gap-2">
                        <MessageSquare className="h-5 w-5" />
                        View Forum
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="materials" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Course Materials</CardTitle>
                      <Button>
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Material
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {materials.map((material) => (
                        <div key={material.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            {getFileIcon(material.type)}
                            <div>
                              <h4 className="font-medium">{material.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <span>{material.size}</span>
                                <span>Uploaded: {material.uploaded}</span>
                                <span>{material.downloads} downloads</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{material.category}</Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="announcements" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Course Announcements</CardTitle>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        New Announcement
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {announcements.map((announcement) => (
                        <div key={announcement.id} className="p-4 border rounded-lg space-y-3">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-medium">{announcement.title}</h4>
                                <Badge className={getPriorityColor(announcement.priority)}>
                                  {announcement.priority}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{announcement.content}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Published: {announcement.published}</span>
                            <span className="text-muted-foreground">{announcement.views} views</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Course Settings</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="courseCode">Course Code</Label>
                        <Input id="courseCode" defaultValue={selectedCourseData.code} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="credits">Credits</Label>
                        <Input id="credits" type="number" defaultValue={selectedCourseData.credits} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="courseName">Course Name</Label>
                      <Input id="courseName" defaultValue={selectedCourseData.name} />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Course Description</Label>
                      <Textarea 
                        id="description" 
                        defaultValue={selectedCourseData.description}
                        className="min-h-[100px]"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="semester">Semester</Label>
                        <Input id="semester" defaultValue={selectedCourseData.semester} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxStudents">Max Students</Label>
                        <Input id="maxStudents" type="number" defaultValue={selectedCourseData.maxStudents} />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 pt-4">
                      <Button>Save Changes</Button>
                      <Button variant="outline">Cancel</Button>
                      <Button variant="destructive" className="ml-auto">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Course
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </div>
  );
}