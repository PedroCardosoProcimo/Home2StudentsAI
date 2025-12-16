import { useState, useEffect, useMemo } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { format, addMonths, differenceInMonths } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { cn } from "@/lib/utils";
import { useResidences } from "@/hooks/useResidences";
import { useCreateBooking } from "@/hooks/useCreateBooking";
import { useRoomTypes } from "@/hooks/useRoomTypes";
import { BookingFormData } from "@/types";
import { BookingSuccessDialog, BookingErrorDialog } from "@/components/booking/BookingDialogs";

const Book = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectedResidence = searchParams.get("residence");
  const preselectedRoomType = searchParams.get("roomType");
  
  // Determine if fields should be locked (when navigating from RoomDetail)
  const isLocked = !!(preselectedResidence && preselectedRoomType);

  const [bookingId, setBookingId] = useState<string>("");
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [formData, setFormData] = useState<BookingFormData>({
    residenceId: preselectedResidence || "",
    roomTypeId: preselectedRoomType || "",
    checkIn: undefined,
    checkOut: undefined,
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    notes: "",
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof BookingFormData, string>>>({});

  // Firebase hooks
  const { data: residences = [] } = useResidences(true);
  const { data: roomTypes = [] } = useRoomTypes(formData.residenceId);
  const createBooking = useCreateBooking();

  // Get selected residence and room type
  const selectedResidence = useMemo(
    () => residences.find((r) => r.id === formData.residenceId),
    [residences, formData.residenceId]
  );

  const selectedRoomType = useMemo(
    () => roomTypes.find((r) => r.id === formData.roomTypeId),
    [roomTypes, formData.roomTypeId]
  );

  const minStay = selectedResidence?.minStay || 1;

  useEffect(() => {
    // Reset room type when residence changes
    if (formData.residenceId && !isLocked) {
      setFormData((prev) => ({ ...prev, roomTypeId: "" }));
    }
  }, [formData.residenceId, isLocked]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof BookingFormData, string>> = {};

    // Residence validation
    if (!formData.residenceId) {
      newErrors.residenceId = "Please select a residence";
    }

    // Room type validation
    if (!formData.roomTypeId) {
      newErrors.roomTypeId = "Please select a room type";
    }

    // Date validation
    if (!formData.checkIn) {
      newErrors.checkIn = "Please select a check-in date";
    }
    if (!formData.checkOut) {
      newErrors.checkOut = "Please select a check-out date";
    }

    // Check minimum stay requirement
    if (formData.checkIn && formData.checkOut && selectedResidence) {
      const monthsDiff = differenceInMonths(formData.checkOut, formData.checkIn);
      if (monthsDiff < minStay) {
        newErrors.checkOut = `Minimum stay is ${minStay} month${minStay > 1 ? 's' : ''}`;
      }
    }

    // Name validation
    if (!formData.guestName.trim()) {
      newErrors.guestName = "Name is required";
    } else if (formData.guestName.trim().length < 2) {
      newErrors.guestName = "Name must be at least 2 characters";
    }

    // Email validation
    if (!formData.guestEmail.trim()) {
      newErrors.guestEmail = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.guestEmail)) {
      newErrors.guestEmail = "Please enter a valid email address";
    }

    // Phone validation - improved to check for proper format and length
    if (!formData.guestPhone.trim()) {
      newErrors.guestPhone = "Phone number is required";
    } else {
      // Remove spaces, dashes, and parentheses for validation
      const cleanPhone = formData.guestPhone.replace(/[\s\-()]/g, '');

      // Check if it contains only digits and optional + prefix
      if (!/^\+?\d+$/.test(cleanPhone)) {
        newErrors.guestPhone = "Phone number must contain only digits";
      } else if (cleanPhone.replace('+', '').length < 9) {
        newErrors.guestPhone = "Phone number must be at least 9 digits";
      } else if (cleanPhone.replace('+', '').length > 15) {
        newErrors.guestPhone = "Phone number must be at most 15 digits";
      }
    }

    // Terms validation
    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "You must accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const id = await createBooking.mutateAsync(formData);
        setBookingId(id);
        setShowSuccessDialog(true);
      } catch (error) {
        setShowErrorDialog(true);
      }
    }
  };

  const handleSuccessDialogClose = () => {
    setShowSuccessDialog(false);
    navigate('/');
  };

  const handleErrorDialogClose = () => {
    setShowErrorDialog(false);
  };

  const handleRetry = () => {
    // Form is still populated, user can just resubmit
    // No need to do anything special here
  };

  return (
    <Layout>
      <div className="pt-24 md:pt-28 min-h-screen bg-muted/30">
        <div className="container-narrow section-padding">
          {/* Breadcrumb */}
          <Breadcrumb className="mb-8">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/">Home</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Book</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground">
              Book Your Stay
            </h1>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Fill in your details and we'll get back to you within 24 hours to
              confirm your reservation.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="bg-card rounded-xl p-6 md:p-8 shadow-sm">
              {/* Select Your Stay */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-6">
                  Select Your Stay
                </h2>
                <div className="space-y-5">
                  {/* Residence */}
                  <div>
                    <Label htmlFor="residence">Residence *</Label>
                    <Select
                      value={formData.residenceId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, residenceId: value }))
                      }
                      disabled={isLocked}
                    >
                      <SelectTrigger className={cn(errors.residenceId && "border-destructive")}>
                        <SelectValue placeholder="Select a residence" />
                      </SelectTrigger>
                      <SelectContent>
                        {residences.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} - {r.city}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.residenceId && (
                      <p className="text-sm text-destructive mt-1">{errors.residenceId}</p>
                    )}
                  </div>

                  {/* Room Type */}
                  <div>
                    <Label htmlFor="roomType">Room Type *</Label>
                    <Select
                      value={formData.roomTypeId}
                      onValueChange={(value) =>
                        setFormData((prev) => ({ ...prev, roomTypeId: value }))
                      }
                      disabled={!formData.residenceId || isLocked}
                    >
                      <SelectTrigger className={cn(errors.roomTypeId && "border-destructive")}>
                        <SelectValue placeholder={formData.residenceId ? "Select a room type" : "Select a residence first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.name} - €{r.basePrice}/month
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.roomTypeId && (
                      <p className="text-sm text-destructive mt-1">{errors.roomTypeId}</p>
                    )}
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label>Check-in Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.checkIn && "text-muted-foreground",
                              errors.checkIn && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.checkIn ? format(formData.checkIn, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.checkIn}
                            onSelect={(date) =>
                              setFormData((prev) => ({
                                ...prev,
                                checkIn: date,
                                checkOut: date ? addMonths(date, minStay) : undefined,
                              }))
                            }
                            disabled={(date) => date < new Date()}
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.checkIn && (
                        <p className="text-sm text-destructive mt-1">{errors.checkIn}</p>
                      )}
                    </div>

                    <div>
                      <Label>Check-out Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.checkOut && "text-muted-foreground",
                              errors.checkOut && "border-destructive"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.checkOut ? format(formData.checkOut, "PPP") : "Pick a date"}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.checkOut}
                            onSelect={(date) =>
                              setFormData((prev) => ({ ...prev, checkOut: date }))
                            }
                            disabled={(date) =>
                              !formData.checkIn || date < addMonths(formData.checkIn, minStay)
                            }
                            initialFocus
                            className="pointer-events-auto"
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.checkOut && (
                        <p className="text-sm text-destructive mt-1">{errors.checkOut}</p>
                      )}
                    </div>
                  </div>

                  {selectedResidence && (
                    <p className="text-sm text-muted-foreground">
                      Minimum stay: {minStay} month{minStay > 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>

              {/* Your Information */}
              <div className="mb-8">
                <h2 className="text-lg font-heading font-semibold text-foreground mb-6">
                  Your Information
                </h2>
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.guestName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, guestName: e.target.value }))
                      }
                      className={cn(errors.guestName && "border-destructive")}
                      placeholder="Enter your full name"
                    />
                    {errors.guestName && (
                      <p className="text-sm text-destructive mt-1">{errors.guestName}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.guestEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, guestEmail: e.target.value }))
                      }
                      className={cn(errors.guestEmail && "border-destructive")}
                      placeholder="your@email.com"
                    />
                    {errors.guestEmail && (
                      <p className="text-sm text-destructive mt-1">{errors.guestEmail}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.guestPhone}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, guestPhone: e.target.value }))
                      }
                      className={cn(errors.guestPhone && "border-destructive")}
                      placeholder="+351 XXX XXX XXX"
                    />
                    {errors.guestPhone && (
                      <p className="text-sm text-destructive mt-1">{errors.guestPhone}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="notes">Message / Notes (optional)</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      placeholder="Any special requests or questions?"
                      rows={4}
                    />
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="mb-8">
                <div className="flex items-start gap-3">
                  <Checkbox
                    id="terms"
                    checked={formData.termsAccepted}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, termsAccepted: checked === true }))
                    }
                    className={cn(errors.termsAccepted && "border-destructive")}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link to="/terms" className="text-secondary hover:underline">
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-secondary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.termsAccepted && (
                  <p className="text-sm text-destructive mt-1">{errors.termsAccepted}</p>
                )}
              </div>

              {/* Submit */}
              <Button
                type="submit"
                variant="coral"
                size="lg"
                className="w-full"
                disabled={createBooking.isPending}
              >
                {createBooking.isPending ? "Submitting..." : "Submit Booking Request"}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Success Dialog */}
      <BookingSuccessDialog
        open={showSuccessDialog}
        onClose={handleSuccessDialogClose}
        bookingReference={bookingId.slice(0, 8).toUpperCase()}
        bookingData={formData}
        residenceName={selectedResidence?.name}
        roomTypeName={selectedRoomType?.name}
      />

      {/* Error Dialog */}
      <BookingErrorDialog
        open={showErrorDialog}
        onClose={handleErrorDialogClose}
        onRetry={handleRetry}
      />
    </Layout>
  );
};

export default Book;
