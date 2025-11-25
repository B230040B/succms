import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { 
  Search, 
  Filter, 
  BookOpen, 
  Clock, 
  Users, 
  Star,
  Calendar,
  GraduationCap,
  CheckCircle,
  Plus,
  Eye
} from "lucide-react";

export function StudentCourses() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const enrolledCourses = [
    {
      id: 1,
      code: "CS301",
      name: "Database Systems",
      lecturer: "Dr. Sarah Chen",
      department: "Computer Science",
      credits: 3,
      semester: "Spring 2024",
      progress: 75,
      nextClass: "Today, 2:00 PM",
      room: "Lab 204",
      grade: "A-",
      status: "active"
    },
    {
      id: 2,
      code: "CS205",
      name: "Data Structures & Algorithms",
      lecturer: "Prof. Michael Roberts",
      department: "Computer Science",
      credits: 4,
      semester: "Spring 2024",
      progress: 60,
      nextClass: "Tomorrow, 10:00 AM",
      room: "Room 301",
      grade: "B+",
      status: "active"
    },
    {
      id: 3,
      code: "CS410",
      name: "Software Engineering",
      lecturer: "Dr. Elena Rodriguez",
      department: "Computer Science",
      credits: 4,
      semester: "Spring 2024",
      progress: 45,
      nextClass: "Wed, 9:00 AM",
      room: "Room 105",
      grade: "B",
      status: "active"
    }
  ];

  const availableCourses = [
    {
      id: 4,
      code: "CS350",
      name: "Machine Learning Fundamentals",
      lecturer: "Dr. Ahmad Hassan",
      department: "Computer Science",
      credits: 3,
      semester: "Spring 2024",
      enrolledStudents: 28,
      maxStudents: 35,
      rating: 4.8,
      difficulty: "Advanced",
      prerequisites: ["CS205", "MATH201"],
      description: "Introduction to machine learning algorithms, neural networks, and data analysis techniques.",
      schedule: "Mon/Wed/Fri 11:00 AM",
      room: "Lab 401"
    },
    {
      id: 5,
      code: "CS320",
      name: "Web Development",
      lecturer: "Prof. Lisa Wang",
      department: "Computer Science",
      credits: 3,
      semester: "Spring 2024",
      enrolledStudents: 45,
      maxStudents: 50,
      rating: 4.6,
      difficulty: "Intermediate",
      prerequisites: ["CS101"],
      description: "Full-stack web development using modern frameworks and technologies.",
      schedule: "Tue/Thu 2:00 PM",
      room: "Lab 302"
    },
    {
      id: 6,
      code: "MATH301",
      name: "Linear Algebra",
      lecturer: "Dr. Robert Chen",
      department: "Mathematics",
      credits: 4,
      semester: "Spring 2024",
      enrolledStudents: 32,
      maxStudents: 40,
      rating: 4.4,
      difficulty: "Intermediate",
      prerequisites: ["MATH201"],
      description: "Vector spaces, linear transformations, eigenvalues, and applications.",
      schedule: "Mon/Wed/Fri 9:00 AM",
      room: "Room 201"
    },
    {
      id: 7,
      code: "CS450",
      name: "Computer Graphics",
      lecturer: "Dr. Maria Lopez",
      department: "Computer Science",
      credits: 3,
      semester: "Spring 2024",
      enrolledStudents: 22,
      maxStudents: 30,
      rating: 4.7,
      difficulty: "Advanced",
      prerequisites: ["CS301", "MATH301"],
      description: "3D graphics programming, rendering techniques, and computer animation.",
      schedule: "Tue/Thu 10:00 AM",
      room: "Lab 501"
    }
  ];

  const categories = [
    { id: "all", name: "All Courses", count: availableCourses.length },
    { id: "cs", name: "Computer Science", count: availableCourses.filter(c => c.department === "Computer Science").length },
    { id: "math", name: "Mathematics", count: availableCourses.filter(c => c.department === "Mathematics").length },
    { id: "engineering", name: "Engineering", count: 0 },
    { id: "business", name: "Business", count: 0 }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600 bg-green-50';
    if (grade.startsWith('B')) return 'text-blue-600 bg-blue-50';
    if (grade.startsWith('C')) return 'text-yellow-600 bg-yellow-50';
    return 'text-gray-600 bg-gray-50';
  };

  const filteredCourses = availableCourses.filter(course => {
    const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.lecturer.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
                           (selectedCategory === "cs" && course.department === "Computer Science") ||
                           (selectedCategory === "math" && course.department === "Mathematics");
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1>My Courses</h1>
        <p className="text-muted-foreground">Manage your enrolled courses and discover new ones</p>
      </div>

      <Tabs defaultValue="enrolled">
        <TabsList>
          <TabsTrigger value="enrolled">Enrolled Courses ({enrolledCourses.length})</TabsTrigger>
          <TabsTrigger value="browse">Browse Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="enrolled" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2">{course.code}</Badge>
                      <CardTitle className="text-lg leading-tight">{course.name}</CardTitle>
                    </div>
                    <Badge className={getGradeColor(course.grade)}>
                      {course.grade}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">by {course.lecturer}</p>
                    <p className="text-sm text-muted-foreground">{course.credits} credits • {course.semester}</p>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} />
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{course.nextClass}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>{course.room}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button className="flex-1">
                      <BookOpen className="h-4 w-4 mr-2" />
                      Continue
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search courses, instructors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Categories Sidebar */}
            <Card className="lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                      selectedCategory === category.id ? 'bg-accent' : 'hover:bg-accent/50'
                    }`}
                  >
                    <span className="text-sm">{category.name}</span>
                    <span className="text-xs text-muted-foreground">{category.count}</span>
                  </button>
                ))}
              </CardContent>
            </Card>

            {/* Course Grid */}
            <div className="lg:col-span-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <Badge variant="outline" className="mb-2">{course.code}</Badge>
                          <CardTitle className="text-lg leading-tight">{course.name}</CardTitle>
                        </div>
                        <Badge className={getDifficultyColor(course.difficulty)}>
                          {course.difficulty}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {course.lecturer.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{course.lecturer}</p>
                          <p className="text-xs text-muted-foreground">{course.department}</p>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <p className="text-sm text-muted-foreground">{course.description}</p>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{course.enrolledStudents}/{course.maxStudents}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <GraduationCap className="h-4 w-4 text-muted-foreground" />
                          <span>{course.credits} credits</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span>{course.schedule}</span>
                        </div>
                      </div>

                      {course.prerequisites.length > 0 && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Prerequisites:</p>
                          <div className="flex flex-wrap gap-1">
                            {course.prerequisites.map((prereq, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {prereq}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Enrollment</span>
                          <span>{Math.round((course.enrolledStudents / course.maxStudents) * 100)}% full</span>
                        </div>
                        <Progress value={(course.enrolledStudents / course.maxStudents) * 100} />
                      </div>

                      <div className="flex items-center gap-2">
                        <Button className="flex-1">
                          <Plus className="h-4 w-4 mr-2" />
                          Enroll
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}