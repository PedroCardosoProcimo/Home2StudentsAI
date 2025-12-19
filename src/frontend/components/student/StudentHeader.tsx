import { useStudentAuth } from "@/frontend/contexts/StudentAuthContext";
import { useCurrentStudent } from "@/backend/hooks/useStudent";
import { Button } from "@/frontend/components/ui/button";
import { LogOut, GraduationCap } from "lucide-react";
import { StudentNavigation } from "./StudentNavigation";

export const StudentHeader = () => {
  const { user, logout } = useStudentAuth();
  const { data: student } = useCurrentStudent(user?.uid);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="sticky top-0 z-50 bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          {/* Brand Section */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <GraduationCap className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-lg font-bold text-primary">HOME2STUDENTS</h1>
              <p className="text-xs text-muted-foreground">Student Portal</p>
            </div>
          </div>

          {/* Navigation Section (hidden on mobile) */}
          <div className="hidden md:flex flex-1 justify-center">
            <StudentNavigation />
          </div>

          {/* User Section */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium">{student?.name}</p>
              <p className="text-xs text-muted-foreground">{student?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden pb-3">
          <StudentNavigation />
        </div>
      </div>
    </header>
  );
};
