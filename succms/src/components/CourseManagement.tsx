import { useState, useEffect } from "react";
import { supabase } from "/workspaces/succms/succms/src/lib/supabase.ts";
import { useAuth } from "/workspaces/succms/succms/src/contexts/AuthContext.tsx";
import { CoursePage } from "./CoursePage"; // Ensure you created this file!
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Search, Plus, Loader2 } from "lucide-react";

export function CourseManagement() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState("my-teaching");
  const [courses, setCourses] = useState<any[]>([]);
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State for View Switching
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      fetchData();
    }
  }, [profile]);

  const fetchData = async () => {
    setIsLoading(true);
    // 1. Fetch All Courses
    const { data: allData } = await supabase.from('courses').select('*');
    setCourses(allData || []);

    // 2. Fetch "My" Claimed Courses
    const { data: myData } = await supabase
      .from('course_instructors')
      .select('course_id, courses(*)')
      .eq('user_id', profile?.id);
    
    // Extract the nested 'courses' object from the result
    setMyCourses(myData?.map((x: any) => x.courses) || []);
    setIsLoading(false);
  };

  const handleClaimCourse = async (courseId: string) => {
    const { error } = await supabase.from('course_instructors').insert({
      course_id: courseId,
      user_id: profile?.id
    });
    
    if (!error) {
      fetchData(); // Refresh lists to show the new course in "My Teaching"
      setActiveTab("my-teaching");
    } else {
        console.error("Error claiming course:", error);
    }
  };

  // --- VIEW LOGIC ---

  // 1. If a course is selected, show the Detail Page instead of the list
  if (selectedCourseId) {
    return <CoursePage courseId={selectedCourseId} onBack={() => setSelectedCourseId(null)} />;
  }

  // 2. Filter Logic for Search
  const filteredAll = courses.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.course_code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // 3. Loading State (Fixes the "unused variable" error)
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your courses...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Lecturer Dashboard</h1>
        <Button disabled variant="outline">Request New Course Creation</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="my-teaching">My Teaching ({myCourses.length})</TabsTrigger>
          <TabsTrigger value="all-courses">Course Catalog</TabsTrigger>
        </TabsList>

        <div className="my-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search courses..." 
              className="pl-8" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* MY TEACHING TAB */}
        <TabsContent value="my-teaching" className="space-y-4">
          {myCourses.length === 0 && (
            <div className="text-center py-10 border border-dashed rounded-lg bg-muted/30">
                <p className="text-muted-foreground">You haven't added any courses yet.</p>
                <Button variant="link" onClick={() => setActiveTab("all-courses")}>
                    Go to Course Catalog to add them
                </Button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map(course => (
              <Card 
                key={course.id} 
                className="hover:border-primary cursor-pointer transition-colors border-l-4 border-l-blue-500" 
                onClick={() => setSelectedCourseId(course.id)}
              >
                <CardHeader>
                  <div className="flex justify-between">
                    <Badge variant="outline">{course.course_code}</Badge>
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-none">Teaching</Badge>
                  </div>
                  <CardTitle className="mt-2 line-clamp-1">{course.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground mb-4">
                    {course.faculty}
                  </div>
                  <Button className="w-full">Manage Course</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ALL COURSES TAB */}
        <TabsContent value="all-courses" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {filteredAll.map(course => {
               const isAlreadyTeaching = myCourses.some(m => m.id === course.id);
               return (
                <Card key={course.id}>
                  <CardHeader>
                    <Badge variant="outline" className="w-fit">{course.course_code}</Badge>
                    <CardTitle className="mt-2 text-lg line-clamp-1">{course.name}</CardTitle>
                    <CardDescription className="line-clamp-1">{course.chinese_name}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isAlreadyTeaching ? (
                      <Button variant="secondary" className="w-full" disabled>Already Added</Button>
                    ) : (
                      <Button className="w-full" variant="outline" onClick={() => handleClaimCourse(course.id)}>
                        <Plus className="mr-2 h-4 w-4" /> Teach this Course
                      </Button>
                    )}
                  </CardContent>
                </Card>
               );
             })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}