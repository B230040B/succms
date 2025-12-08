import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  FileText,
  TrendingUp,
  Users,
  UserPlus,
  UserMinus,
  Shield,
  Clock,
  GraduationCap,
  Trophy
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface UserProfileProps {
  userId: string | number;
  userRole: "student" | "lecturer" | "admin";
  isOwnProfile?: boolean;
  currentUserRole?: "student" | "lecturer" | "admin";
}

const mockStudentData = {
  id: 12345,
  name: "Alex Thompson",
  email: "alex.thompson@university.edu",
  program: "Computer Science",
  year: "3rd Year",
  gpa: 3.7,
  enrolledCourses: [
    { code: "CS301", name: "Database Systems", grade: "A-", credits: 3 },
    { code: "CS205", name: "Data Structures", grade: "B+", credits: 4 },
    { code: "CS410", name: "Software Engineering", grade: "B", credits: 3 }
  ],
  attendance: 92,
  assignmentsCompleted: 28,
  totalAssignments: 32,
  certificates: [
    { title: "Python Programming", issuer: "University", date: "2023" },
    { title: "Web Development", issuer: "University", date: "2023" }
  ],
  achievements: [
    { title: "Dean's List", semester: "Fall 2023" },
    { title: "Best Project Award", course: "CS205" }
  ],
  followers: 245,
  following: 189,
  storiesCount: 12
};

const mockLecturerData = {
  id: 98765,
  name: "Dr. Sarah Chen",
  email: "sarah.chen@university.edu",
  department: "Computer Science",
  title: "Associate Professor",
  yearsExperience: 12,
  coursesCount: 24,
  studentsCount: 450,
  coursesTaught: [
    { code: "CS301", name: "Database Systems", year: "2024", students: 45 },
    { code: "CS302", name: "Advanced Databases", year: "2024", students: 30 },
    { code: "CS201", name: "Data Management", year: "2023", students: 50 }
  ],
  achievements: [
    { title: "Excellence in Teaching Award", year: "2023" },
    { title: "Research Grant Recipient", year: "2022" },
    { title: "Published 15 Papers", conference: "ACM" }
  ],
  researchInterests: ["Database Systems", "Machine Learning", "Data Mining"],
  followers: 892,
  following: 156,
  storiesCount: 34
};

export function UserProfile({ userId, userRole, isOwnProfile = false, currentUserRole = "student" }: UserProfileProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  
  const userData = userRole === "student" ? mockStudentData : mockLecturerData;
  const isAdmin = userRole === "admin";

  const handleFollowToggle = () => {
    setIsFollowing(!isFollowing);
  };

  const mockStories = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=200",
    "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=200",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=200",
    "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=200",
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200",
    "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200"
  ];

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="bg-blue-600 text-white text-2xl">
                {userData.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2>{userData.name}</h2>
                    {isAdmin && (
                      <Badge className="bg-red-100 text-red-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground">
                    {userRole === "student" 
                      ? `${mockStudentData.program} • ${mockStudentData.year}`
                      : `${mockLecturerData.title} • ${mockLecturerData.department}`
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">{userData.email}</p>
                </div>

                {!isOwnProfile && (
                  <Button
                    onClick={handleFollowToggle}
                    variant={isFollowing ? "outline" : "default"}
                    className="flex items-center gap-2"
                  >
                    {isFollowing ? (
                      <>
                        <UserMinus className="h-4 w-4" />
                        Unfollow
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Follow
                      </>
                    )}
                  </Button>
                )}
              </div>

              {/* Social Stats */}
              <div className="flex gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span><strong>{userData.followers}</strong> Followers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span><strong>{userData.following}</strong> Following</span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span><strong>{userData.storiesCount}</strong> Stories</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stories Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Shared Stories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {mockStories.map((story, index) => (
              <div
                key={index}
                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
              >
                <ImageWithFallback
                  src={story}
                  alt={`Story ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Profile Content Tabs */}
      <Tabs defaultValue={userRole === "student" ? "grades" : "courses"}>
        <TabsList className="grid w-full grid-cols-3">
          {userRole === "student" ? (
            <>
              <TabsTrigger value="grades">Grades</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="certificates">Certificates</TabsTrigger>
            </>
          ) : (
            <>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="experience">Experience</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </>
          )}
        </TabsList>

        {userRole === "student" ? (
          <>
            {/* Student Grades Tab */}
            <TabsContent value="grades" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Academic Performance</CardTitle>
                    <Badge className="bg-green-100 text-green-800">
                      GPA: {mockStudentData.gpa}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockStudentData.enrolledCourses.map((course, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{course.code}</Badge>
                            <span>{course.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{course.credits} Credits</p>
                        </div>
                        <Badge className={`${
                          course.grade.startsWith('A') ? 'bg-green-100 text-green-800' :
                          course.grade.startsWith('B') ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.grade}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Student Attendance Tab */}
            <TabsContent value="attendance" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Attendance Record</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Overall Attendance</span>
                      <span>{mockStudentData.attendance}%</span>
                    </div>
                    <Progress value={mockStudentData.attendance} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="p-4 bg-green-50 rounded-lg">
                      <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
                      <p className="text-2xl">{mockStudentData.assignmentsCompleted}</p>
                      <p className="text-sm text-muted-foreground">Assignments Completed</p>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <FileText className="h-8 w-8 text-blue-600 mb-2" />
                      <p className="text-2xl">{mockStudentData.totalAssignments}</p>
                      <p className="text-sm text-muted-foreground">Total Assignments</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Student Certificates Tab */}
            <TabsContent value="certificates" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Certificates & Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4>Certificates</h4>
                    {mockStudentData.certificates.map((cert, index) => (
                      <div key={index} className="p-4 border rounded-lg flex items-start gap-3">
                        <Award className="h-8 w-8 text-blue-600" />
                        <div>
                          <p className="font-medium">{cert.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {cert.issuer} • {cert.date}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 pt-4">
                    <h4>Achievements</h4>
                    {mockStudentData.achievements.map((achievement, index) => (
                      <div key={index} className="p-4 border rounded-lg flex items-start gap-3">
                        <Trophy className="h-8 w-8 text-yellow-600" />
                        <div>
                          <p className="font-medium">{achievement.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {achievement.semester || achievement.course}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        ) : (
          <>
            {/* Lecturer Courses Tab */}
            <TabsContent value="courses" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Teaching History</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {mockLecturerData.coursesTaught.map((course, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{course.code}</Badge>
                            <span>{course.name}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {course.year} • {course.students} Students
                          </p>
                        </div>
                        <BookOpen className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lecturer Experience Tab */}
            <TabsContent value="experience" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Professional Experience</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <Clock className="h-8 w-8 text-blue-600 mb-2" />
                      <p className="text-2xl">{mockLecturerData.yearsExperience}</p>
                      <p className="text-sm text-muted-foreground">Years Experience</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg">
                      <BookOpen className="h-8 w-8 text-purple-600 mb-2" />
                      <p className="text-2xl">{mockLecturerData.coursesCount}</p>
                      <p className="text-sm text-muted-foreground">Courses Taught</p>
                    </div>
                    <div className="p-4 bg-green-50 rounded-lg">
                      <GraduationCap className="h-8 w-8 text-green-600 mb-2" />
                      <p className="text-2xl">{mockLecturerData.studentsCount}</p>
                      <p className="text-sm text-muted-foreground">Students Taught</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <h4 className="mb-3">Research Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      {mockLecturerData.researchInterests.map((interest, index) => (
                        <Badge key={index} variant="secondary">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Lecturer Achievements Tab */}
            <TabsContent value="achievements" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Academic Achievements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {mockLecturerData.achievements.map((achievement, index) => (
                    <div key={index} className="p-4 border rounded-lg flex items-start gap-3">
                      <Award className="h-8 w-8 text-yellow-600" />
                      <div>
                        <p className="font-medium">{achievement.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {achievement.year || achievement.conference}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}