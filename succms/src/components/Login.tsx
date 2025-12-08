import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
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

export function Login() {
  const { signIn, signUp } = useAuth();
  const [selectedRole, setSelectedRole] = useState<'student' | 'lecturer' | 'admin' | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    // fullName removed; we'll store username in the profile's full_name field for now
    studentId: "",
    staffId: "",
    adminId: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

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

    if (authMode === 'signup') {
      if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
        setError("Please fill in all required fields");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters");
        return;
      }

      setIsLoading(true);
      try {
        // Pass the chosen username as the profile full_name metadata so the existing trigger stores it.
        const res = await signUp(formData.email, formData.password, formData.username, selectedRole);
        // supabase returns { data, error }
        const sError = (res as any).error;
        const data = (res as any).data;
        if (sError) {
          setError(sError.message || "Sign up failed");
        } else {
          // If a session/user is not returned, email confirmation may be required
          if (!data?.user && !data?.session) {
            setInfo(`Account created. A confirmation email was sent to ${formData.email}. Please confirm your email before signing in.`);
          } else {
            setInfo("Account created. You are signed in.");
          }
        }
      } catch (err: any) {
        setError(err.message || "An error occurred during sign up");
      } finally {
        setIsLoading(false);
      }
    } else {
      if (!formData.username || !formData.password) {
        setError("Please fill in all required fields");
        return;
      }

      setIsLoading(true);
      try {
        const res = await signIn(formData.username, formData.password, selectedRole);
        const sError = (res as any).error;
        const data = (res as any).data;
        if (sError) {
          const msg = sError.message || "Sign in failed";
          setError(msg);
        } else if (!data?.session && !data?.user) {
          // No session means likely needs confirmation
          setError("Unable to sign in. If you recently signed up, please confirm your email address.");
        }
      } catch (err: any) {
        setError(err.message || "An error occurred during sign in");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDemoLogin = async (role: 'student' | 'lecturer' | 'admin') => {
    const roleData = roles.find(r => r.id === role)!;
    setSelectedRole(role);
    setAuthMode('signin');
    setFormData({
      username: roleData.demoCredentials.email.split('@')[0],
      email: roleData.demoCredentials.email,
      password: roleData.demoCredentials.password,
      confirmPassword: "",
      studentId: role === 'student' ? roleData.demoCredentials.id : '',
      staffId: role === 'lecturer' ? roleData.demoCredentials.id : '',
      adminId: role === 'admin' ? roleData.demoCredentials.id : ''
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
    if (info) setInfo("");
  };

  const toggleAuthMode = () => {
    setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
    setError("");
    setInfo("");
    setFormData({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      studentId: "",
      staffId: "",
      adminId: ""
    });
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
            opacity: 0.9,
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
                        <Button className="w-full" onClick={() => { setSelectedRole(role.id); setAuthMode('signin'); }}>
                          Sign In as {role.title}
                          <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                        <Button className="w-full" variant="secondary" onClick={() => { setSelectedRole(role.id); setAuthMode('signup'); }}>
                          Create {role.title} Account
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
            opacity: 0.9,
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
              onClick={() => { setSelectedRole(null); setAuthMode('signin'); }}
              className="self-start"
            >
              ← Back
            </Button>
            
            <div className="space-y-4">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">{authMode === 'signin' ? 'Sign In' : 'Create Account'} as {currentRole.title}</CardTitle>
                <p className="text-muted-foreground">{authMode === 'signin' ? 'Enter your credentials to continue' : 'Fill in the form to create your account'}</p>
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
            {info && (
              <Alert className="border-green-200 bg-green-50">
                <AlertDescription className="text-green-700">
                  {info}
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username (unique)"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                {authMode === 'signin' ? (
                  <>
                    <Label htmlFor="username">Username</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="username"
                        type="text"
                        placeholder="your.username"
                        className="pl-10"
                        value={formData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <Label htmlFor="email">Email (for verification)</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@university.edu"
                        className="pl-10"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </>
                )}
              </div>

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

              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="pl-10 pr-10"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    {authMode === 'signin' ? 'Signing In...' : 'Creating Account...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </Button>
            </form>

            <div className="text-center space-y-2">
              {authMode === 'signin' && (
                <button className="text-sm text-muted-foreground hover:text-primary hover:underline">
                  Forgot your password?
                </button>
              )}
              <div className="pt-2 border-t">
                <button 
                  onClick={toggleAuthMode}
                  className="text-sm text-muted-foreground hover:text-primary hover:underline"
                >
                  {authMode === 'signin' ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                </button>
              </div>
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