import { useStudentAuth } from "@/frontend/contexts/StudentAuthContext";
import { useCurrentStudent } from "@/backend/hooks/useStudent";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { User } from "lucide-react";

const StudentProfile = () => {
  const { user } = useStudentAuth();
  const { data: student } = useCurrentStudent(user?.uid);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">My Profile</h2>
        <p className="text-muted-foreground mt-1">Manage your personal information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Information
          </CardTitle>
          <CardDescription>Your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Profile editing features are coming soon...
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentProfile;
