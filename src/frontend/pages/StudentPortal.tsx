import { useStudentAuth } from "@/frontend/contexts/StudentAuthContext";
import { useCurrentStudent } from "@/backend/hooks/useStudent";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { User, Home, FileText } from "lucide-react";

const StudentPortal = () => {
  const { user } = useStudentAuth();
  const { data: student } = useCurrentStudent(user?.uid);

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Welcome, {student?.name}!</h2>
        <p className="text-muted-foreground mt-1">
          Your student portal dashboard
        </p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Your Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{student?.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{student?.email}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <p className="font-medium">{student?.phone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Placeholder cards for future features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Your Residence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Residence information will appear here
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Your documents and regulations
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentPortal;
