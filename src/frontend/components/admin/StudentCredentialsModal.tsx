import { useState } from "react";
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
import { Copy, Check } from "lucide-react";
import { useToast } from "@/backend/hooks/use-toast";

interface StudentCredentialsModalProps {
  open: boolean;
  onClose: () => void;
  email: string;
  password: string;
  studentName: string;
}

export const StudentCredentialsModal = ({
  open,
  onClose,
  email,
  password,
  studentName,
}: StudentCredentialsModalProps) => {
  const { toast } = useToast();
  const [emailCopied, setEmailCopied] = useState(false);
  const [passwordCopied, setPasswordCopied] = useState(false);

  const copyToClipboard = async (text: string, type: 'email' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);

      if (type === 'email') {
        setEmailCopied(true);
        setTimeout(() => setEmailCopied(false), 2000);
      } else {
        setPasswordCopied(true);
        setTimeout(() => setPasswordCopied(false), 2000);
      }

      toast({
        title: "Copied!",
        description: `${type === 'email' ? 'Email' : 'Password'} copied to clipboard`,
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Student Account Created</DialogTitle>
          <DialogDescription>
            Share these credentials with {studentName}. This is the only time the password will be shown.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="student-email">Email</Label>
            <div className="flex gap-2">
              <Input
                id="student-email"
                value={email}
                readOnly
                className="flex-1"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(email, 'email')}
              >
                {emailCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="student-password">Password</Label>
            <div className="flex gap-2">
              <Input
                id="student-password"
                value={password}
                readOnly
                className="flex-1 font-mono"
              />
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={() => copyToClipboard(password, 'password')}
              >
                {passwordCopied ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Save these credentials securely. The password cannot be recovered later.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
