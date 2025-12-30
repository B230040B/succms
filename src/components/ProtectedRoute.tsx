import { useAuth } from '@/contexts/AuthContext.tsx';

// Define expected roles if you want strict checking (optional)
interface ProtectedRouteProps {
  allowedRoles?: ('student' | 'lecturer' | 'admin')[];
  children: React.ReactNode;
}

export default function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
  const { user, profile, isLoading } = useAuth();

  // 1. Show a loading spinner while Supabase checks the session
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 2. Not logged in? Return null (will be handled by App.tsx showing Login)
  if (!user) {
    return null;
  }

  // 3. Logged in, but wrong role? (e.g., Student trying to access Admin dashboard)
  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  // 4. Access granted! Render the children
  return <>{children}</>;
}