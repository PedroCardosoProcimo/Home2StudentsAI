import { useState } from "react";
import { Card, CardContent } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/frontend/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/frontend/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/frontend/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/frontend/components/ui/alert-dialog";
import { StatusBadge } from "@/frontend/components/admin/StatusBadge";
import { StudentCredentialsModal } from "@/frontend/components/admin/StudentCredentialsModal";
import { Search, Eye, Check, X, Loader2 } from "lucide-react";
import { Booking } from "@/shared/types";
import { useToast } from "@/backend/hooks/use-toast";
import { format, differenceInMonths } from "date-fns";
import { useAdminBookings, useUpdateBookingStatus, useApproveBookingWithStudent } from "@/backend/hooks/admin/useAdminBookings";
import { useAdminResidences } from "@/backend/hooks/admin/useAdminResidences";
import { useAdminRoomTypes } from "@/backend/hooks/admin/useAdminRoomTypes";
import { generateSecurePassword } from "@/backend/utils/passwordGenerator";

const AdminBookings = () => {
  const { toast } = useToast();
  const { data: bookings = [], isLoading: bookingsLoading } = useAdminBookings();
  const { data: residences = [], isLoading: residencesLoading } = useAdminResidences();
  const { data: roomTypes = [], isLoading: roomTypesLoading } = useAdminRoomTypes();
  const updateBookingStatus = useUpdateBookingStatus();
  const approveWithStudent = useApproveBookingWithStudent();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  // Student credentials modal state
  const [credentialsModalOpen, setCredentialsModalOpen] = useState(false);
  const [studentCredentials, setStudentCredentials] = useState<{
    email: string;
    password: string;
    name: string;
  } | null>(null);

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.guestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.guestEmail.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetailModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailModalOpen(true);
  };

  const openConfirmDialog = (booking: Booking, action: "approve" | "reject") => {
    setSelectedBooking(booking);
    setActionType(action);
    setIsConfirmDialogOpen(true);
  };

  const handleStatusChange = async () => {
    if (!selectedBooking || !actionType) return;

    try {
      if (actionType === "approve") {
        // Generate secure password for student account
        const password = generateSecurePassword(16);

        // Create student account and approve booking
        const result = await approveWithStudent.mutateAsync({
          booking: selectedBooking,
          password: password,
        });

        // Show credentials modal to admin
        setStudentCredentials({
          email: result.email,
          password: result.password,
          name: selectedBooking.guestName,
        });
        setCredentialsModalOpen(true);

        toast({
          title: "Success",
          description: "Booking approved and student account created",
        });
      } else {
        // Reject booking (no student creation)
        await updateBookingStatus.mutateAsync({
          id: selectedBooking.id,
          status: "rejected"
        });

        toast({
          title: "Success",
          description: "Booking rejected",
        });
      }

      setIsConfirmDialogOpen(false);
      setIsDetailModalOpen(false);
    } catch (err: any) {
      const errorMessage = err.message || "Failed to process booking. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  if (bookingsLoading || residencesLoading || roomTypesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Guest</TableHead>
                <TableHead>Residence</TableHead>
                <TableHead>Check-in / Check-out</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings.map((booking) => {
                const residence = residences.find((r) => r.id === booking.residenceId);
                return (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{booking.guestName}</p>
                        <p className="text-sm text-muted-foreground">{booking.guestEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{residence?.name || "Unknown"}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{format(booking.checkIn.toDate(), "MMM d, yyyy")}</p>
                        <p className="text-muted-foreground">{format(booking.checkOut.toDate(), "MMM d, yyyy")}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={booking.status} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(booking.createdAt.toDate(), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDetailModal(booking)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {booking.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openConfirmDialog(booking, "approve")}
                          >
                            <Check className="h-4 w-4 text-emerald-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openConfirmDialog(booking, "reject")}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Status</span>
                <StatusBadge status={selectedBooking.status} />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Guest Information</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Name</dt>
                    <dd>{selectedBooking.guestName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Email</dt>
                    <dd>{selectedBooking.guestEmail}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Phone</dt>
                    <dd>{selectedBooking.guestPhone}</dd>
                  </div>
                </dl>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Stay Details</h4>
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Residence</dt>
                    <dd>{residences.find((r) => r.id === selectedBooking.residenceId)?.name || "Unknown"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Room Type</dt>
                    <dd>{roomTypes.find((rt) => rt.id === selectedBooking.roomTypeId)?.name || "Not specified"}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Check-in</dt>
                    <dd>{format(selectedBooking.checkIn.toDate(), "MMMM d, yyyy")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Check-out</dt>
                    <dd>{format(selectedBooking.checkOut.toDate(), "MMMM d, yyyy")}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd>{differenceInMonths(selectedBooking.checkOut.toDate(), selectedBooking.checkIn.toDate())} months</dd>
                  </div>
                </dl>
              </div>

              {selectedBooking.notes && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm text-muted-foreground">{selectedBooking.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            {selectedBooking?.status === "pending" && (
              <>
                <Button
                  variant="outline"
                  onClick={() => openConfirmDialog(selectedBooking, "reject")}
                  className="text-destructive"
                  disabled={updateBookingStatus.isPending}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => openConfirmDialog(selectedBooking, "approve")}
                  disabled={updateBookingStatus.isPending}
                >
                  Approve
                </Button>
              </>
            )}
            {selectedBooking?.status !== "pending" && (
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>
                Close
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <AlertDialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {actionType === "approve" ? "Approve Booking" : "Reject Booking"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {actionType === "approve"
                ? `Approving this booking will create a student account for ${selectedBooking?.guestName}. Are you sure?`
                : `Are you sure you want to reject this booking from ${selectedBooking?.guestName}?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updateBookingStatus.isPending || approveWithStudent.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={updateBookingStatus.isPending || approveWithStudent.isPending}
              className={actionType === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {(updateBookingStatus.isPending || approveWithStudent.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {actionType === "approve" ? "Creating Account..." : "Rejecting..."}
                </>
              ) : (
                actionType === "approve" ? "Approve & Create Account" : "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Student Credentials Modal */}
      {studentCredentials && (
        <StudentCredentialsModal
          open={credentialsModalOpen}
          onClose={() => {
            setCredentialsModalOpen(false);
            setStudentCredentials(null);
          }}
          email={studentCredentials.email}
          password={studentCredentials.password}
          studentName={studentCredentials.name}
        />
      )}
    </div>
  );
};

export default AdminBookings;
