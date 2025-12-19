import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { CalendarIcon, AlertCircle } from "lucide-react";
import { cn } from "@/frontend/lib/utils";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Calendar } from "@/frontend/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/frontend/components/ui/popover";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/frontend/components/ui/form";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import { useToast } from "@/backend/hooks/use-toast";
import { useResidences } from "@/backend/hooks/useResidences";
import { useRoomTypes } from "@/backend/hooks/useRoomTypes";
import { useCreateContract, useUpdateContract } from "@/backend/hooks/admin/useAdminContracts";
import { getStudentWithUser } from "@/backend/services/students";
import { getBookingById } from "@/backend/services/bookings";
import { getRoomTypeById } from "@/backend/services/residences";
import { StudentSearchCombobox } from "./StudentSearchCombobox";
import type { Contract, StudentWithUser } from "@/shared/types";

// Form schema
const contractSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  residenceId: z.string().min(1, "Residence is required"),
  roomTypeId: z.string().min(1, "Room type is required"),
  roomNumber: z.string().min(1, "Room number is required"),
  startDate: z.date({ required_error: "Start date is required" }),
  endDate: z.date({ required_error: "End date is required" }),
  monthlyValue: z.number().positive("Must be positive"),
  monthlyKwhLimit: z.number().positive("Must be positive"),
  contactEmail: z.string().email("Invalid email"),
  contactPhone: z
    .string()
    .regex(/^\+?[\d\s\-()]+$/, "Invalid phone number")
    .min(9, "Phone number too short"),
}).refine((data) => data.endDate > data.startDate, {
  message: "End date must be after start date",
  path: ["endDate"],
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface ContractFormProps {
  contractId?: string;
  initialData?: Contract;
  onSuccess?: (contractId?: string) => void;
  onCancel?: () => void;
}

export function ContractForm({
  contractId,
  initialData,
  onSuccess,
  onCancel,
}: ContractFormProps) {
  const { toast } = useToast();
  const isEditMode = !!contractId;

  // State variables first
  const [selectedStudent, setSelectedStudent] = React.useState<StudentWithUser | null>(null);
  const [isLoadingStudentData, setIsLoadingStudentData] = React.useState(false);
  const [pendingRoomTypeId, setPendingRoomTypeId] = React.useState<string | null>(null);
  const [hasAutoFilled, setHasAutoFilled] = React.useState(false);

  // Hooks that don't depend on form
  const { data: residences = [] } = useResidences(false);
  const createContract = useCreateContract();
  const updateContract = useUpdateContract();

  // Form initialization
  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: initialData
      ? {
          studentId: initialData.studentId,
          residenceId: initialData.residenceId,
          roomTypeId: initialData.roomTypeId,
          roomNumber: initialData.roomNumber,
          startDate: initialData.startDate.toDate(),
          endDate: initialData.endDate.toDate(),
          monthlyValue: initialData.monthlyValue,
          monthlyKwhLimit: initialData.monthlyKwhLimit,
          contactEmail: initialData.contactEmail,
          contactPhone: initialData.contactPhone,
        }
      : {
          studentId: "",
          residenceId: "",
          roomTypeId: "",
          roomNumber: "",
          startDate: undefined,
          endDate: undefined,
          monthlyValue: 0,
          monthlyKwhLimit: 0,
          contactEmail: "",
          contactPhone: "",
        },
  });

  // Form watchers and hooks that depend on form
  const selectedResidenceId = form.watch("residenceId");
  const { data: roomTypes = [] } = useRoomTypes(selectedResidenceId);

  // Set selectedStudent for edit mode
  React.useEffect(() => {
    if (isEditMode && initialData) {
      setSelectedStudent({
        id: initialData.studentId,
        name: initialData.studentName,
        email: initialData.studentEmail,
        phone: "",
        residenceId: initialData.residenceId,
        bookingId: "",
        createdAt: initialData.createdAt,
        updatedAt: initialData.updatedAt,
        needsPasswordChange: false,
      });
    }
  }, [isEditMode, initialData]);

  // Handle pending room type when roomTypes load
  React.useEffect(() => {
    if (pendingRoomTypeId && roomTypes.length > 0 && !isEditMode) {
      const roomTypeExists = roomTypes.find((rt) => rt.id === pendingRoomTypeId);
      if (roomTypeExists) {
        form.setValue("roomTypeId", pendingRoomTypeId);
        setPendingRoomTypeId(null);
      }
    }
  }, [pendingRoomTypeId, roomTypes, isEditMode, form]);

  // Handle student selection and auto-fill
  const handleStudentChange = React.useCallback(
    async (studentId: string, student: StudentWithUser | null) => {
      if (!student || isEditMode) return;

      setSelectedStudent(student);
      setIsLoadingStudentData(true);

      try {
        // Fetch student data
        const studentData = await getStudentWithUser(studentId);
        if (!studentData) {
          throw new Error("Student not found");
        }

        // Fetch booking data
        const booking = await getBookingById(studentData.bookingId);
        if (!booking) {
          throw new Error("Student booking not found");
        }

        if (!booking.roomTypeId) {
          throw new Error("Booking does not have a room type assigned");
        }

        // Fetch room type data
        const roomType = await getRoomTypeById(booking.roomTypeId);
        if (!roomType) {
          throw new Error("Room type not found");
        }

        // Auto-fill fields
        form.setValue("studentId", studentId);
        form.setValue("residenceId", studentData.residenceId);

        // Store room type ID for later (pending state pattern)
        setPendingRoomTypeId(booking.roomTypeId);

        form.setValue("startDate", booking.checkIn.toDate());
        form.setValue("endDate", booking.checkOut.toDate());
        form.setValue("monthlyValue", roomType.basePrice);
        form.setValue("contactEmail", studentData.email);
        form.setValue("contactPhone", studentData.phone);

        // Mark as auto-filled to lock residence and room type
        setHasAutoFilled(true);

        toast({
          title: "Auto-filled",
          description: "Form fields have been auto-filled from student and booking data.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to load student data",
          variant: "destructive",
        });
      } finally {
        setIsLoadingStudentData(false);
      }
    },
    [form, isEditMode, toast]
  );

  // Form submission
  const onSubmit = async (values: ContractFormValues) => {
    try {
      // Get current user ID (you might need to adjust this based on your auth setup)
      const currentUserId = "admin"; // TODO: Replace with actual current user ID

      if (isEditMode && contractId) {
        // Edit mode - exclude certain fields
        await updateContract.mutateAsync({
          id: contractId,
          roomNumber: values.roomNumber,
          endDate: values.endDate,
          monthlyValue: values.monthlyValue,
          monthlyKwhLimit: values.monthlyKwhLimit,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone,
          updatedBy: currentUserId,
        });

        toast({
          title: "Success",
          description: "Contract updated successfully",
        });
      } else {
        // Create mode - exclude residenceId and roomTypeId
        const newContract = await createContract.mutateAsync({
          studentId: values.studentId,
          roomNumber: values.roomNumber,
          startDate: values.startDate,
          endDate: values.endDate,
          monthlyValue: values.monthlyValue,
          monthlyKwhLimit: values.monthlyKwhLimit,
          contactEmail: values.contactEmail,
          contactPhone: values.contactPhone,
          createdBy: currentUserId,
        });

        toast({
          title: "Success",
          description: "Contract created successfully",
        });

        onSuccess?.(newContract.id);
        return;
      }

      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : `Failed to ${isEditMode ? "update" : "create"} contract`,
        variant: "destructive",
      });
    }
  };

  const isSubmitting = createContract.isPending || updateContract.isPending;

  return (
    <div className="space-y-6">
      {isEditMode && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You are editing an active contract. Changes will take effect immediately.
          </AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Student Field */}
          <FormField
            control={form.control}
            name="studentId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Student *</FormLabel>
                <FormControl>
                  {isEditMode ? (
                    <Input
                      value={
                        selectedStudent
                          ? `${selectedStudent.name} (${selectedStudent.email})`
                          : ""
                      }
                      disabled
                      readOnly
                    />
                  ) : (
                    <StudentSearchCombobox
                      value={field.value}
                      onValueChange={handleStudentChange}
                      disabled={isLoadingStudentData}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Residence + Room Type + Room Number Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Residence */}
            <FormField
              control={form.control}
              name="residenceId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Residence *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isEditMode || isLoadingStudentData || hasAutoFilled}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select residence" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {residences.map((residence) => (
                        <SelectItem key={residence.id} value={residence.id}>
                          {residence.name} - {residence.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Room Type */}
            <FormField
              control={form.control}
              name="roomTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Type *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={
                      !selectedResidenceId || isEditMode || isLoadingStudentData || hasAutoFilled
                    }
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {roomTypes.map((roomType) => (
                        <SelectItem key={roomType.id} value={roomType.id}>
                          {roomType.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Room Number */}
            <FormField
              control={form.control}
              name="roomNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Room Number *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="e.g., 101"
                      disabled={isLoadingStudentData}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Start Date *</FormLabel>
                  {isEditMode ? (
                    <Input
                      value={field.value ? format(field.value, "dd/MM/yyyy") : ""}
                      disabled
                      readOnly
                    />
                  ) : (
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoadingStudentData}
                          >
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Date */}
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>End Date *</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                          disabled={isLoadingStudentData}
                        >
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          const startDate = form.getValues("startDate");
                          if (!startDate) return date < new Date();
                          return date <= startDate;
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Financial Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Monthly Value */}
            <FormField
              control={form.control}
              name="monthlyValue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly Value (EUR) *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      disabled={isLoadingStudentData}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Monthly kWh Limit */}
            <FormField
              control={form.control}
              name="monthlyKwhLimit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monthly kWh Limit *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="1"
                      placeholder="0"
                      value={field.value || ""}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                      disabled={isLoadingStudentData}
                    />
                  </FormControl>
                  <FormDescription>
                    Electricity consumption limit per month
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Email */}
            <FormField
              control={form.control}
              name="contactEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      {...field}
                      placeholder="contact@email.com"
                      disabled={isLoadingStudentData}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Contact Phone */}
            <FormField
              control={form.control}
              name="contactPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Phone *</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      {...field}
                      placeholder="+351 XXX XXX XXX"
                      disabled={isLoadingStudentData}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Form Actions */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || isLoadingStudentData}
              className="flex-1"
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : isEditMode
                ? "Update Contract"
                : "Create Contract"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
