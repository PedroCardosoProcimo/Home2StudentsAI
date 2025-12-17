import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useStudentAuth } from "@/frontend/contexts/StudentAuthContext";
import { useCurrentStudent } from "@/backend/hooks/useStudent";
import {
  useRegulationAcceptanceCheck,
  useRecordRegulationAcceptance,
} from "@/backend/hooks/useStudentRegulation";
import { RegulationAcceptanceDialog } from "@/frontend/components/student/RegulationAcceptanceDialog";
import { Loader2 } from "lucide-react";
import { useToast } from "@/backend/hooks/use-toast";

interface StudentPortalGuardProps {
  children: ReactNode;
}

export const StudentPortalGuard = ({ children }: StudentPortalGuardProps) => {
  const { user, isStudent, isLoading: authLoading } = useStudentAuth();
  const { toast } = useToast();

  // Fetch student data
  const { data: student, isLoading: studentLoading } = useCurrentStudent(user?.uid);

  // Check regulation acceptance
  const {
    data: acceptanceCheck,
    isLoading: acceptanceLoading,
    error: acceptanceError,
  } = useRegulationAcceptanceCheck(user?.uid, student?.residenceId);

  // Mutation for recording acceptance
  const recordAcceptance = useRecordRegulationAcceptance();

  // Loading state
  if (authLoading || studentLoading || acceptanceLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!user) {
    return <Navigate to="/student/login" replace />;
  }

  // Not a student role - redirect to login
  if (!isStudent) {
    return <Navigate to="/student/login" replace />;
  }

  // Student data not found - error state
  if (!student) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-destructive mb-2">Account Error</h2>
          <p className="text-muted-foreground">
            Student account data not found. Please contact support.
          </p>
        </div>
      </div>
    );
  }

  // Error state - show if there's an acceptance check error
  if (acceptanceError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-destructive mb-2">Error Loading Regulations</h2>
          <p className="text-muted-foreground mb-4">
            {acceptanceError instanceof Error ? acceptanceError.message : 'Unknown error occurred'}
          </p>
          <p className="text-sm text-muted-foreground">
            Residence ID: {student?.residenceId || 'N/A'}
          </p>
        </div>
      </div>
    );
  }

  // No active regulation - error state (shouldn't happen)
  if (!acceptanceCheck?.regulation) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold mb-2">No Active Regulations</h2>
          <p className="text-muted-foreground mb-4">
            No active regulations found for your residence. Please contact support.
          </p>
          <div className="bg-muted p-4 rounded-lg text-sm text-left">
            <p><strong>Debug Info:</strong></p>
            <p>Student ID: {user?.uid}</p>
            <p>Residence ID: {student?.residenceId || 'Not set'}</p>
            <p>Student Email: {student?.email}</p>
          </div>
        </div>
      </div>
    );
  }

  // Regulation not accepted - show blocking dialog
  if (!acceptanceCheck.hasAccepted) {
    const handleAccept = async () => {
      try {
        await recordAcceptance.mutateAsync({
          studentId: user.uid,
          regulationId: acceptanceCheck.regulation.id,
          regulationVersion: acceptanceCheck.regulation.version,
          residenceId: student.residenceId,
        });

        toast({
          title: "Regulations Accepted",
          description: acceptanceCheck.isReAcceptance
            ? "Thank you for accepting the updated regulations!"
            : "Welcome to your student portal!",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to record acceptance. Please try again.",
          variant: "destructive",
        });
      }
    };

    return (
      <RegulationAcceptanceDialog
        regulation={acceptanceCheck.regulation}
        onAccept={handleAccept}
        isAccepting={recordAcceptance.isPending}
        previousAcceptance={acceptanceCheck.previousAcceptance}
        isReAcceptance={acceptanceCheck.isReAcceptance}
      />
    );
  }

  // All checks passed - render portal
  return <>{children}</>;
};
