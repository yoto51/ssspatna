import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { Redirect, Route, Link } from "wouter";

export function ProtectedRoute({
  path,
  component: Component,
  allowedRoles = []
}: {
  path: string;
  component: () => React.JSX.Element;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <Route path={path}>
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Route>
    );
  }

  if (!user) {
    return (
      <Route path={path}>
        <Redirect to="/auth" />
      </Route>
    );
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return (
      <Route path={path}>
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-center mb-6">
            You don't have permission to access this page. This area is restricted to {allowedRoles.join(' or ')} accounts.
          </p>
          {user.role === 'student' && (
            <Link href="/student" className="text-primary hover:underline">
              Go to Student Dashboard
            </Link>
          )}
          {user.role === 'admin' && (
            <Link href="/admin" className="text-primary hover:underline">
              Go to Admin Dashboard
            </Link>
          )}
        </div>
      </Route>
    );
  }

  return <Route path={path} component={Component} />;
}
