import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/frontend/components/ui/dialog";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Label } from "@/frontend/components/ui/label";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import { Loader2, AlertCircle, KeyRound, CheckCircle2 } from "lucide-react";
import {
  validatePassword,
  validatePasswordsMatch,
  getPasswordStrength,
} from "@/backend/utils/passwordValidation";

interface PasswordChangeDialogProps {
  studentId: string;
  studentEmail: string;
  onPasswordChange: (currentPassword: string, newPassword: string) => Promise<void>;
  isChanging: boolean;
}

export const PasswordChangeDialog = ({
  studentId,
  studentEmail,
  onPasswordChange,
  isChanging,
}: PasswordChangeDialogProps) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  // Validate passwords on change
  useEffect(() => {
    if (!newPassword) {
      setValidationErrors([]);
      return;
    }

    const validation = validatePassword(newPassword);
    const errors = [...validation.errors];

    if (confirmPassword && !validatePasswordsMatch(newPassword, confirmPassword)) {
      errors.push("Passwords do not match");
    }

    setValidationErrors(errors);
  }, [newPassword, confirmPassword]);

  const canSubmit =
    currentPassword.length > 0 &&
    newPassword.length > 0 &&
    confirmPassword.length > 0 &&
    validationErrors.length === 0 &&
    !isChanging;

  const handleSubmit = async () => {
    setShowValidation(true);

    if (!canSubmit) {
      return;
    }

    try {
      await onPasswordChange(currentPassword, newPassword);
    } catch (error) {
      // Error handling is done in the parent component (StudentPortalGuard)
      console.error("Password change failed:", error);
    }
  };

  const passwordStrength = newPassword ? getPasswordStrength(newPassword) : null;

  const getStrengthColor = () => {
    switch (passwordStrength) {
      case 'strong':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'weak':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return '';
    }
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      {/* onOpenChange empty to prevent dismissal */}
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Password Change Required
          </DialogTitle>
          <DialogDescription>
            For security reasons, you must change your auto-generated password before accessing your portal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Warning Banner */}
          <Alert variant="default" className="border-blue-200 bg-blue-50">
            <AlertCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>First Time Login:</strong> Your account was created with a temporary password.
              Please choose a new secure password that you can remember.
            </AlertDescription>
          </Alert>

          {/* Current Password Field */}
          <div className="space-y-2">
            <Label htmlFor="current-password">Current Password</Label>
            <Input
              id="current-password"
              type="password"
              placeholder="Enter your current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              disabled={isChanging}
              autoComplete="current-password"
            />
            <p className="text-sm text-muted-foreground">
              This is the password provided by your residence administrator.
            </p>
          </div>

          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor="new-password">New Password</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Enter your new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              disabled={isChanging}
              autoComplete="new-password"
            />

            {/* Password Strength Indicator */}
            {newPassword && passwordStrength && (
              <div className={`text-xs px-2 py-1 rounded border ${getStrengthColor()}`}>
                Password strength: <strong className="capitalize">{passwordStrength}</strong>
              </div>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm New Password</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isChanging}
              autoComplete="new-password"
            />
          </div>

          {/* Password Requirements */}
          <div className="bg-muted p-3 rounded-lg space-y-2">
            <p className="text-sm font-medium">Password Requirements:</p>
            <ul className="text-sm space-y-1">
              <li className={newPassword.length >= 8 ? "text-green-600" : "text-muted-foreground"}>
                {newPassword.length >= 8 ? <CheckCircle2 className="inline h-3 w-3 mr-1" /> : "• "}
                At least 8 characters
              </li>
              <li className={/[A-Z]/.test(newPassword) ? "text-green-600" : "text-muted-foreground"}>
                {/[A-Z]/.test(newPassword) ? <CheckCircle2 className="inline h-3 w-3 mr-1" /> : "• "}
                One uppercase letter
              </li>
              <li className={/[a-z]/.test(newPassword) ? "text-green-600" : "text-muted-foreground"}>
                {/[a-z]/.test(newPassword) ? <CheckCircle2 className="inline h-3 w-3 mr-1" /> : "• "}
                One lowercase letter
              </li>
              <li className={/[0-9]/.test(newPassword) ? "text-green-600" : "text-muted-foreground"}>
                {/[0-9]/.test(newPassword) ? <CheckCircle2 className="inline h-3 w-3 mr-1" /> : "• "}
                One number
              </li>
            </ul>
          </div>

          {/* Validation Errors */}
          {showValidation && validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="w-full"
          >
            {isChanging ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              "Change Password and Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
