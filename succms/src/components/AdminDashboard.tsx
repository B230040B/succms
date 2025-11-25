import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
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
import {
  Shield,
  Flag,
  UserX,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  FileText,
  Megaphone,
  Upload,
  Eye,
  Ban
} from "lucide-react";

interface ReportedItem {
  id: number;
  type: "story" | "user";
  reportedBy: string;
  reportedUser: string;
  reason: string;
  content?: string;
  timestamp: string;
  status: "pending" | "resolved";
  severity: "low" | "medium" | "high";
}

const mockReports: ReportedItem[] = [
  {
    id: 1,
    type: "story",
    reportedBy: "Emma Wilson",
    reportedUser: "James Lee",
    reason: "Inappropriate content",
    content: "Story contains misleading academic information",
    timestamp: "2 hours ago",
    status: "pending",
    severity: "high"
  },
  {
    id: 2,
    type: "user",
    reportedBy: "Alex Thompson",
    reportedUser: "John Doe",
    reason: "Spam/Harassment",
    content: "User is sending spam messages in forums",
    timestamp: "5 hours ago",
    status: "pending",
    severity: "medium"
  },
  {
    id: 3,
    type: "story",
    reportedBy: "Sarah Kim",
    reportedUser: "Prof. Michael",
    reason: "Copyright violation",
    content: "Shared copyrighted material without permission",
    timestamp: "1 day ago",
    status: "resolved",
    severity: "high"
  },
  {
    id: 4,
    type: "user",
    reportedBy: "Multiple Users",
    reportedUser: "Jane Smith",
    reason: "Impersonation",
    content: "User is impersonating a faculty member",
    timestamp: "2 days ago",
    status: "resolved",
    severity: "high"
  }
];

const mockStats = {
  totalUsers: 1248,
  activeReports: 12,
  resolvedToday: 8,
  suspendedUsers: 3,
  totalStories: 3456,
  advertisements: 5
};

export function AdminDashboard() {
  const [reports, setReports] = useState<ReportedItem[]>(mockReports);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterSeverity, setFilterSeverity] = useState<string>("all");

  const filteredReports = reports.filter(report => {
    const statusMatch = filterStatus === "all" || report.status === filterStatus;
    const severityMatch = filterSeverity === "all" || report.severity === filterSeverity;
    return statusMatch && severityMatch;
  });

  const handleResolveReport = (id: number) => {
    setReports(prev => prev.map(report => 
      report.id === id ? { ...report, status: "resolved" as const } : report
    ));
  };

  const handleRemoveStory = (id: number) => {
    handleResolveReport(id);
    alert("Story removed successfully");
  };

  const handleSuspendUser = (username: string) => {
    alert(`User ${username} has been suspended`);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "low":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getTypeColor = (type: string) => {
    return type === "story" 
      ? "bg-purple-100 text-purple-800" 
      : "bg-orange-100 text-orange-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2">
            <Shield className="h-8 w-8 text-red-600" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage platform content and user safety</p>
        </div>
        <Badge className="bg-red-100 text-red-800">
          <Shield className="h-3 w-3 mr-1" />
          Administrator Access
        </Badge>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl">{mockStats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-2xl">{mockStats.activeReports}</p>
                <p className="text-xs text-muted-foreground">Active Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl">{mockStats.resolvedToday}</p>
                <p className="text-xs text-muted-foreground">Resolved Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Ban className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl">{mockStats.suspendedUsers}</p>
                <p className="text-xs text-muted-foreground">Suspended</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl">{mockStats.totalStories}</p>
                <p className="text-xs text-muted-foreground">Total Stories</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Megaphone className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl">{mockStats.advertisements}</p>
                <p className="text-xs text-muted-foreground">Active Ads</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="moderation">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="moderation">
            <Flag className="h-4 w-4 mr-2" />
            Moderation Queue
          </TabsTrigger>
          <TabsTrigger value="advertisements">
            <Megaphone className="h-4 w-4 mr-2" />
            Advertisements
          </TabsTrigger>
        </TabsList>

        {/* Moderation Queue */}
        <TabsContent value="moderation" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Reported Content & Users</CardTitle>
                <div className="flex gap-2">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {filteredReports.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
                  <p>No reports matching the selected filters</p>
                </div>
              ) : (
                filteredReports.map((report) => (
                  <div
                    key={report.id}
                    className={`p-4 border rounded-lg ${
                      report.status === "resolved" ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {report.reportedUser.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{report.reportedUser}</span>
                            <Badge className={getTypeColor(report.type)}>
                              {report.type}
                            </Badge>
                            <Badge className={getSeverityColor(report.severity)}>
                              {report.severity}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Reported by {report.reportedBy} • {report.timestamp}
                          </p>
                        </div>
                      </div>
                      <Badge variant={report.status === "resolved" ? "secondary" : "default"}>
                        {report.status === "pending" ? (
                          <><Clock className="h-3 w-3 mr-1" /> Pending</>
                        ) : (
                          <><CheckCircle2 className="h-3 w-3 mr-1" /> Resolved</>
                        )}
                      </Badge>
                    </div>

                    <div className="ml-13 space-y-2">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm">
                          <strong>Reason:</strong> {report.reason}
                        </p>
                        {report.content && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {report.content}
                          </p>
                        )}
                      </div>

                      {report.status === "pending" && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>

                          {report.type === "story" && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  className="flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Remove Story
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Remove Story</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently remove the reported story. This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRemoveStory(report.id)}>
                                    Remove
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="destructive"
                                size="sm"
                                className="flex items-center gap-2"
                              >
                                <UserX className="h-4 w-4" />
                                Suspend User
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Suspend User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will suspend {report.reportedUser}'s account. They will not be able to access the platform until the suspension is lifted.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleSuspendUser(report.reportedUser)}>
                                  Suspend
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveReport(report.id)}
                            className="flex items-center gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Mark Resolved
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advertisements Management */}
        <TabsContent value="advertisements" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Campus Advertisements</CardTitle>
                <Button className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload New Ad
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="mb-2">Upload Campus Advertisements</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload announcements, event posters, and important notices
                </p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>

              <div className="space-y-2">
                <h4>Advertisement Guidelines</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Images should be in JPG or PNG format</li>
                  <li>Recommended size: 400x600 pixels</li>
                  <li>File size should not exceed 2MB</li>
                  <li>Content must be campus-related and appropriate</li>
                  <li>Ads are reviewed before being published</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
