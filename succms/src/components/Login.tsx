import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ArrowRight,
  Users,
  GraduationCap,
  UserCog,
  UserCheck,
  BarChart3,
  MessageSquare,
  Shield
} from "lucide-react";

interface LoginProps {
  onLogin: (role: 'student' | 'lecturer' | 'admin', userData: any) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<'student' | 'lecturer' | 'admin' | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    studentId: "",
    staffId: "",
    adminId: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const roles = [
    {
      id: 'student' as const,
      title: 'Student',
      description: 'Access courses, assignments, and track your academic progress',
      icon: GraduationCap,
      features: ['View enrolled courses', 'Submit assignments', 'Track grades', 'Join discussions'],
      demoCredentials: { email: 'student@university.edu', password: 'demo123', id: 'STU2024001' }
    },
    {
      id: 'lecturer' as const,
      title: 'Lecturer',
      description: 'Manage courses, create assignments, and monitor student progress',
      icon: UserCog,
      features: ['Create & manage courses', 'Grade assignments', 'Monitor progress', 'Moderate discussions'],
      demoCredentials: { email: 'lecturer@university.edu', password: 'demo123', id: 'LEC2024001' }
    },
    {
      id: 'admin' as const,
      title: 'Administrator',
      description: 'Manage platform content, moderate users, and upload campus advertisements',
      icon: Shield,
      features: ['Review reported content', 'Suspend users', 'Upload advertisements', 'Platform moderation'],
      demoCredentials: { email: 'admin@university.edu', password: 'demo123', id: 'ADM2024001' }
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) {
      setError("Please select your role");
      return;
    }
    setError("");
    if (!formData.email || !formData.password) {
      setError("Please fill in all required fields");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const userData = selectedRole === 'student' 
        ? { 
            name: 'Alex Johnson', 
            id: formData.studentId || 'STU2024001', 
            year: '3rd Year',
            program: 'Computer Science',
            email: formData.email
          }
        : selectedRole === 'lecturer'
        ? { 
            name: 'Dr. Sarah Chen', 
            id: formData.staffId || 'LEC2024001', 
            department: 'Computer Science',
            title: 'Associate Professor',
            email: formData.email
          }
        : { 
            name: 'Mr. John Doe', 
            id: formData.adminId || 'ADM2024001', 
            department: 'IT Services',
            title: 'System Administrator',
            email: formData.email
          };
      onLogin(selectedRole, userData);
    }, 1500);
  };

  const handleDemoLogin = (role: 'student' | 'lecturer' | 'admin') => {
    const roleData = roles.find(r => r.id === role)!;
    setSelectedRole(role);
    setFormData({
      email: roleData.demoCredentials.email,
      password: roleData.demoCredentials.password,
      studentId: role === 'student' ? roleData.demoCredentials.id : '',
      staffId: role === 'lecturer' ? roleData.demoCredentials.id : '',
      adminId: role === 'admin' ? roleData.demoCredentials.id : ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  if (!selectedRole) {
    return (
      <div className="min-h-screen relative flex items-center justify-center p-4">
        {/* Background Image */}
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: 'url(/loginBackground.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.7,
            pointerEvents: 'none',
          }}
        />
        {/* Overlay for gradient (optional, can remove if not needed) */}
        <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-50 via-white to-purple-50" style={{ opacity: 0.7, pointerEvents: 'none' }} />
        {/* Main Content */}
        <div className="w-full max-w-4xl relative z-20">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-40 sm:w-48 h-12 sm:h-14 rounded-md flex-shrink-0 flex items-center justify-center p-2 bg-white border border-gray-200 shadow-md">
                <img src="/suclogo.png" alt="Southern University College logo" className="h-full w-auto object-contain brightness-125 saturate-150 contrast-125 drop-shadow-lg" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">SUCCMS Learn 4.0</h1>
                <p className="text-muted-foreground">Southern University College E-Learning</p>
              </div>
            </div>
            <p className="text-xl text-muted-foreground">
              Select your role to continue
            </p>
          </div>

          {/* Role Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {roles.map((role) => {
              const Icon = role.icon;
              return (
                <Card 
                  key={role.id}
                  className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105 border-2 hover:border-primary/20"
                  onClick={() => setSelectedRole(role.id)}
                >
                  <CardContent className="p-8">
                    <div className="space-y-6">
                      <div className="text-center">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <Icon className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{role.title}</h3>
                        <p className="text-muted-foreground">{role.description}</p>
                      </div>

                      <div className="space-y-3">
                        {role.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <UserCheck className="h-4 w-4 text-green-600" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-3">
                        <Button className="w-full" onClick={() => setSelectedRole(role.id)}>
                          Continue as {role.title}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full text-xs" 
                          onClick={() => handleDemoLogin(role.id)}
                        >
                          Try Demo Account
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>© 2025 Southern University College. All rights reserved.</p>
            <p>For technical support, contact the Computer Centre Office (CCO).</p>
          </div>
        </div>
      </div>
    );
  }

  const currentRole = roles.find(role => role.id === selectedRole)!;
  const Icon = currentRole.icon;

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(/loginBackground.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />
      {/* Overlay for gradient (optional, can remove if not needed) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-blue-50 via-white to-purple-50" style={{ opacity: 0.7, pointerEvents: 'none' }} />
      {/* Main Content */}
      <div className="w-full max-w-md relative z-20">
        <Card className="shadow-xl border-0">
          <CardHeader className="space-y-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedRole(null)}
              className="self-start"
            >
              ← Back
            </Button>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">Sign in as {currentRole.title}</CardTitle>
                <p className="text-muted-foreground">Enter your credentials to continue</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-700">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder={selectedRole === 'student' ? 'student@university.edu' : 'lecturer@university.edu'}
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                </div>
              </div>

              {selectedRole === 'student' && (
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="STU2024001"
                    value={formData.studentId}
                    onChange={(e) => handleInputChange("studentId", e.target.value)}
                  />
                </div>
              )}

              {selectedRole === 'lecturer' && (
                <div className="space-y-2">
                  <Label htmlFor="staffId">Staff ID</Label>
                  <Input
                    id="staffId"
                    placeholder="LEC2024001"
                    value={formData.staffId}
                    onChange={(e) => handleInputChange("staffId", e.target.value)}
                  />
                </div>
              )}

              {selectedRole === 'admin' && (
                <div className="space-y-2">
                  <Label htmlFor="adminId">Admin ID</Label>
                  <Input
                    id="adminId"
                    placeholder="ADM2024001"
                    value={formData.adminId}
                    onChange={(e) => handleInputChange("adminId", e.target.value)}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-10 pr-10"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    Signing In...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center">
              <button className="text-sm text-muted-foreground hover:text-primary hover:underline">
                Forgot your password?
              </button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-muted-foreground">
          <p>© 2025 Southern University College. All rights reserved.</p>
          <p>For technical support, contact the Computer Centre Office (CCO).</p>
        </div>
      </div>
    </div>
  );
}