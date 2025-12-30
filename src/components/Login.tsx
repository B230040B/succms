import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsList, TabsContent, TabsTrigger } from "./ui/tabs";
import { ArrowRight, Loader2, AlertCircle, BookOpen } from "lucide-react";

export function Login() {
  const { signIn, signUp } = useAuth();
  
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [info, setInfo] = useState<string>("");

  // Sign In State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Sign Up State
  const [signupUsername, setSignupUsername] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [signupFullName, setSignupFullName] = useState('');
  const [signupRole, setSignupRole] = useState<'student' | 'lecturer' | 'admin'>('student');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error: signInError } = await signIn(loginEmail, loginPassword);

    if (signInError) {
      setError(signInError.message);
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      setIsLoading(false);
      return;
    }
    if (signupPassword !== signupConfirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    const { error: signUpError } = await signUp(
      signupEmail, 
      signupPassword, 
      signupUsername, 
      signupFullName, 
      signupRole
    );

    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
    } else {
      setInfo("Account created! Please sign in.");
      setAuthMode('signin');
      setLoginEmail(signupEmail); // Auto-fill login email
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">SUCCMS Learn 4.0</CardTitle>
          <CardDescription>Enter your credentials to access the portal</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs 
            value={authMode} 
            onValueChange={(value: string) => setAuthMode(value as 'signin' | 'signup')} 
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Create Account</TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {info && (
              <Alert className="mb-4 bg-green-50 border-green-500 text-green-700">
                <AlertDescription>{info}</AlertDescription>
              </Alert>
            )}

            {/* SIGN IN FORM */}
            <TabsContent value="signin">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email"
                    placeholder="student@example.com" 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password" 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required 
                  />
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : (
                    <div className="flex items-center gap-2">Sign In <ArrowRight className="h-4 w-4" /></div>
                  )}
                </Button>
              </form>
            </TabsContent>

            {/* SIGN UP FORM */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} placeholder="you@example.com" required />
                </div>
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={signupFullName} onChange={(e) => setSignupFullName(e.target.value)} placeholder="e.g. Tan Chee Seng" required />
                </div>
                <div className="space-y-2">
                  <Label>Username</Label>
                  <Input value={signupUsername} onChange={(e) => setSignupUsername(e.target.value)} placeholder="e.g. JasonTan2711" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value={signupPassword} onChange={(e) => setSignupPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirm</Label>
                    <Input type="password" value={signupConfirmPassword} onChange={(e) => setSignupConfirmPassword(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>I am a...</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button type="button" variant={signupRole === 'student' ? 'default' : 'outline'} onClick={() => setSignupRole('student')}>Student</Button>
                    <Button type="button" variant={signupRole === 'lecturer' ? 'default' : 'outline'} onClick={() => setSignupRole('lecturer')}>Lecturer</Button>
                    <Button type="button" variant={signupRole === 'admin' ? 'default' : 'outline'} onClick={() => setSignupRole('admin')}>Admin</Button>
                  </div>
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}