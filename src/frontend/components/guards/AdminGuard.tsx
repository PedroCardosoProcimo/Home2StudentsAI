import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAdminAuth } from "@/frontend/contexts/AdminAuthContext";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/backend/lib/firebase";
import { Loader2 } from "lucide-react";

interface AdminGuardProps {
  children: ReactNode;
}

export const AdminGuard = ({ children }: AdminGuardProps) => {
  const { user, isLoading: authLoading } = useAdminAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsChecking(false);
        return;
      }

      try {
        // Check if user exists in users collection with role='admin'
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setIsAdmin(userDoc.exists() && userDoc.data()?.role === 'admin');
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      } finally {
        setIsChecking(false);
      }
    };

    if (!authLoading) {
      checkAdminStatus();
    }
  }, [user, authLoading]);

  // Loading state
  if (authLoading || isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  // Not an admin - show unauthorized page
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-destructive mb-2">Unauthorized Access</h2>
          <p className="text-muted-foreground mb-4">
            You do not have permission to access this page. Please contact an administrator if you believe this is an error.
          </p>
          <p className="text-sm text-muted-foreground">
            Logged in as: {user.email}
          </p>
        </div>
      </div>
    );
  }

  // All checks passed - render admin content
  return <>{children}</>;
};
