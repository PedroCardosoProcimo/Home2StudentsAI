import { useStudentAuth } from "@/frontend/contexts/StudentAuthContext";
import { useCurrentStudent } from "@/backend/hooks/useStudent";
import { useMyContract } from "@/backend/hooks/useMyContract";
import { useMyRegulationStatus } from "@/backend/hooks/useMyRegulationStatus";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { User, Home, FileText, ArrowRight, CheckCircle, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const StudentPortal = () => {
  const { user } = useStudentAuth();
  const { data: student } = useCurrentStudent(user?.uid);
  const { data: contract } = useMyContract();
  const { data: regulationStatus } = useMyRegulationStatus();
  const navigate = useNavigate();

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

        {/* Your Residence Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Your Residence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {contract ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Residence</p>
                  <p className="font-medium">{contract.residenceName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Room</p>
                  <p className="font-medium">
                    {contract.roomTypeName} - {contract.roomNumber}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate("/student/contract")}
                >
                  View Contract
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No active contract found
              </p>
            )}
          </CardContent>
        </Card>

        {/* Regulations Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Regulations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {regulationStatus ? (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {regulationStatus.hasAccepted ? (
                      <>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm font-medium text-green-600">
                          Accepted
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm font-medium text-amber-600">
                          Pending
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Version</p>
                  <p className="font-medium">v{regulationStatus.regulation.version}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate("/student/regulations")}
                >
                  View Regulations
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No regulation information available
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentPortal;
