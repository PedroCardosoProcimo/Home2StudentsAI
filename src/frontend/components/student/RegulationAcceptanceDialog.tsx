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
import { Checkbox } from "@/frontend/components/ui/checkbox";
import { Label } from "@/frontend/components/ui/label";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import { Regulation, RegulationAcceptance } from "@/shared/types";

interface RegulationAcceptanceDialogProps {
  regulation: Regulation;
  onAccept: () => Promise<void>;
  isAccepting: boolean;
  previousAcceptance?: RegulationAcceptance | null;
  isReAcceptance?: boolean;
}

export const RegulationAcceptanceDialog = ({
  regulation,
  onAccept,
  isAccepting,
  previousAcceptance,
  isReAcceptance = false,
}: RegulationAcceptanceDialogProps) => {
  const [hasRead, setHasRead] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const handleAccept = async () => {
    if (!hasRead || !agreed) return;
    await onAccept();
  };

  // Format the previous acceptance date if it exists
  const previousAcceptanceDate = previousAcceptance?.acceptedAt
    ? new Date(previousAcceptance.acceptedAt.seconds * 1000).toLocaleDateString()
    : null;

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      {/* onOpenChange empty to prevent dismissal */}
      <DialogContent
        className="sm:max-w-3xl max-h-[90vh] flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {isReAcceptance ? "Updated Regulations" : "Residence Regulations"}
          </DialogTitle>
          <DialogDescription>
            {isReAcceptance
              ? "The residence regulations have been updated. Please review and accept the new version to continue."
              : "Please review and accept the residence regulations to continue."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 flex-1 overflow-y-auto">
          {/* Re-acceptance Alert Banner */}
          {isReAcceptance && previousAcceptance && (
            <Alert variant="default" className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                <strong>Regulations Updated:</strong> You previously accepted version{" "}
                {previousAcceptance.regulationVersion} on {previousAcceptanceDate}.
                The regulations have been updated to version {regulation.version}.
                Please review the new version and accept to continue using the portal.
              </AlertDescription>
            </Alert>
          )}

          {/* PDF Viewer */}
          <div className="border rounded-lg overflow-hidden bg-muted">
            <div className="h-[500px] w-full">
              <iframe
                src={regulation.fileUrl}
                className="w-full h-full"
                title="Residence Regulations"
              />
            </div>
          </div>

          {/* Acceptance Checkboxes */}
          <div className="space-y-3 bg-muted p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Checkbox
                id="has-read"
                checked={hasRead}
                onCheckedChange={(checked) => setHasRead(checked === true)}
                disabled={isAccepting}
              />
              <Label
                htmlFor="has-read"
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I have read and understood the residence regulations (Version {regulation.version})
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="agreed"
                checked={agreed}
                onCheckedChange={(checked) => setAgreed(checked === true)}
                disabled={isAccepting}
              />
              <Label
                htmlFor="agreed"
                className="text-sm font-medium leading-relaxed cursor-pointer"
              >
                I agree to comply with all rules and regulations outlined in this document
              </Label>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              <FileText className="inline h-4 w-4 mr-1" />
              You must accept these regulations to access your student portal.
            </p>
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4 mt-4">
          <Button
            onClick={handleAccept}
            disabled={!hasRead || !agreed || isAccepting}
            className="w-full sm:w-auto"
          >
            {isAccepting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recording Acceptance...
              </>
            ) : (
              "Accept and Continue"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
