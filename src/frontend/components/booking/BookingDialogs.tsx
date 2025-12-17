import { format } from "date-fns";
import { CheckCircle, AlertCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Button } from "@/frontend/components/ui/button";
import { BookingFormData } from "@/shared/types";

interface BookingSuccessDialogProps {
  open: boolean;
  onClose: () => void;
  bookingReference: string;
  bookingData: BookingFormData;
  residenceName?: string;
  roomTypeName?: string;
}

export const BookingSuccessDialog = ({
  open,
  onClose,
  bookingReference,
  bookingData,
  residenceName,
  roomTypeName,
}: BookingSuccessDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-center text-2xl">Booking Request Submitted!</DialogTitle>
          <DialogDescription className="text-center">
            Your booking has been successfully submitted. Please review the details below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Booking Reference */}
          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Booking Reference</p>
            <p className="text-2xl font-bold font-mono tracking-wider text-primary">
              {bookingReference}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Please save this reference number for your records
            </p>
          </div>

          {/* Booking Summary */}
          <div className="space-y-3 text-sm">
            <div className="border-b pb-2">
              <p className="text-muted-foreground">Residence</p>
              <p className="font-medium">{residenceName || "N/A"}</p>
            </div>

            <div className="border-b pb-2">
              <p className="text-muted-foreground">Room Type</p>
              <p className="font-medium">{roomTypeName || "N/A"}</p>
            </div>

            <div className="border-b pb-2">
              <p className="text-muted-foreground">Dates</p>
              <p className="font-medium">
                {bookingData.checkIn && format(bookingData.checkIn, "PPP")} -{" "}
                {bookingData.checkOut && format(bookingData.checkOut, "PPP")}
              </p>
            </div>

            <div className="border-b pb-2">
              <p className="text-muted-foreground">Guest Name</p>
              <p className="font-medium">{bookingData.guestName}</p>
            </div>

            <div className="border-b pb-2">
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{bookingData.guestEmail}</p>
            </div>

            <div className="border-b pb-2">
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{bookingData.guestPhone}</p>
            </div>

            {bookingData.notes && (
              <div>
                <p className="text-muted-foreground">Notes</p>
                <p className="font-medium">{bookingData.notes}</p>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-4 text-sm">
            <p className="font-medium text-blue-900 mb-1">What happens next?</p>
            <p className="text-blue-800">
              Our team will review your booking request and get back to you within 24 hours
              via email.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full" variant="coral">
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface BookingErrorDialogProps {
  open: boolean;
  onClose: () => void;
  onRetry: () => void;
  errorMessage?: string;
}

export const BookingErrorDialog = ({
  open,
  onClose,
  onRetry,
  errorMessage = "There was an error submitting your booking. This might be due to a network issue or a temporary problem with our servers.",
}: BookingErrorDialogProps) => {
  const handleRetry = () => {
    onClose();
    onRetry();
  };

  const handleCancel = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <DialogTitle className="text-center text-2xl">Booking Failed</DialogTitle>
          <DialogDescription className="text-center">
            {errorMessage}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-amber-50 rounded-lg p-4 text-sm">
            <p className="text-amber-900">
              <strong>Please try again.</strong> If the problem persists, please contact our
              support team for assistance.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button onClick={handleCancel} variant="outline" className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleRetry} variant="coral" className="flex-1">
            Try Again
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
