import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent } from "@/frontend/components/ui/card";
import { Button } from "@/frontend/components/ui/button";
import { Input } from "@/frontend/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/frontend/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/frontend/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/frontend/components/ui/alert-dialog";
import { Textarea } from "@/frontend/components/ui/textarea";
import { Label } from "@/frontend/components/ui/label";
import {
  Search,
  Eye,
  Edit,
  Ban,
  Loader2,
  Plus,
  AlertCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Contract } from "@/shared/types";
import { useToast } from "@/backend/hooks/use-toast";
import { format } from "date-fns";
import { useAdminContracts, useTerminateContract } from "@/backend/hooks/admin/useAdminContracts";
import { useAdminResidences } from "@/backend/hooks/admin/useAdminResidences";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import { Timestamp } from "firebase/firestore";

const AdminContracts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Filter state
  const [residenceFilter, setResidenceFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "terminated">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 50;

  // Terminate dialog state
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [terminationReason, setTerminationReason] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [residenceFilter, statusFilter, debouncedSearch]);

  // Build filters object (no pagination - we'll paginate client-side)
  const filters = useMemo(() => {
    return {
      residenceId: residenceFilter !== "all" ? residenceFilter : undefined,
      status: statusFilter !== "all" ? statusFilter : undefined,
      searchTerm: debouncedSearch || undefined,
    };
  }, [residenceFilter, statusFilter, debouncedSearch]);

  // Fetch all contracts
  const { data: allContracts = [], isLoading: contractsLoading, error: contractsError, isFetching } = useAdminContracts(filters);

  // Apply client-side pagination
  const totalCount = allContracts.length;
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);
  const needsPagination = totalCount > ITEMS_PER_PAGE;
  const contracts = useMemo(() => {
    if (!needsPagination) return allContracts;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return allContracts.slice(startIndex, endIndex);
  }, [allContracts, currentPage, needsPagination]);
  const { data: residences = [], isLoading: residencesLoading } = useAdminResidences();
  const terminateMutation = useTerminateContract();

  const openTerminateDialog = (contract: Contract) => {
    setSelectedContract(contract);
    setTerminationReason("");
    setIsTerminateDialogOpen(true);
  };

  const handleTerminate = async () => {
    if (!selectedContract) return;

    try {
      await terminateMutation.mutateAsync({
        id: selectedContract.id,
        reason: terminationReason || undefined,
      });

      toast({
        title: "Success",
        description: "Contract terminated successfully",
      });

      setIsTerminateDialogOpen(false);
      setSelectedContract(null);
      setTerminationReason("");
    } catch (err) {
      const errorMessage = err.message || "Failed to terminate contract. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const formatDateRange = (startDate: Timestamp, endDate: Timestamp) => {
    const start = startDate.toDate();
    const end = endDate.toDate();
    return `${format(start, "dd/MM/yy")} - ${format(end, "dd/MM/yy")}`;
  };

  // Loading state
  if (contractsLoading && !allContracts.length) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Error state
  if (contractsError) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Contracts</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load contracts. Please try again.
            <Button
              variant="outline"
              size="sm"
              className="ml-4"
              onClick={() => window.location.reload()}
            >
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <h1 className="text-3xl font-bold">Contracts</h1>
        <Button onClick={() => navigate("/admin/contracts/new")}>
          <Plus className="h-4 w-4 mr-2" />
          New Contract
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Residence Filter */}
        <Select value={residenceFilter} onValueChange={setResidenceFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Residences" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Residences</SelectItem>
            {residences.map((residence) => (
              <SelectItem key={residence.id} value={residence.id}>
                {residence.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Status Filter */}
        <Select
          value={statusFilter}
          onValueChange={(value: "all" | "active" | "terminated") => setStatusFilter(value)}
        >
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="terminated">Terminated</SelectItem>
          </SelectContent>
        </Select>

        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by student name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
          )}
        </div>
      </div>

      {/* Contracts Table */}
      <Card>
        <CardContent className="p-0">
          {contracts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <p className="text-lg font-medium text-muted-foreground mb-2">
                {debouncedSearch || statusFilter !== "all" || residenceFilter !== "all"
                  ? "No contracts match your filters."
                  : "No contracts yet."}
              </p>
              {!debouncedSearch && statusFilter === "all" && residenceFilter === "all" && (
                <p className="text-sm text-muted-foreground mb-4">
                  Create your first contract to get started.
                </p>
              )}
              {(debouncedSearch || statusFilter !== "all" || residenceFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setResidenceFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Residence</TableHead>
                    <TableHead>Room Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map((contract) => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        <div>
                          <Link
                            to={`/admin/contracts/${contract.id}`}
                            className="font-medium text-primary hover:underline"
                          >
                            {contract.studentName}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {contract.studentEmail}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{contract.residenceName}</TableCell>
                      <TableCell>{contract.roomTypeName}</TableCell>
                      <TableCell className="text-sm">
                        {formatDateRange(contract.startDate, contract.endDate)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {contract.status === "active" ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-600" />
                              <span className="text-green-600 font-medium">Active</span>
                            </>
                          ) : (
                            <>
                              <Ban className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-500 font-medium">Terminated</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => navigate(`/admin/contracts/${contract.id}`)}
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {contract.status === "active" && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => navigate(`/admin/contracts/${contract.id}/edit`)}
                                title="Edit contract"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => openTerminateDialog(contract)}
                                title="Terminate contract"
                              >
                                <Ban className="h-4 w-4 text-destructive" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {needsPagination && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{" "}
            {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} contracts
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage >= totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* Terminate Contract Dialog */}
      <AlertDialog open={isTerminateDialogOpen} onOpenChange={setIsTerminateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Terminate Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to terminate the contract for{" "}
              <strong>{selectedContract?.studentName}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-2 py-4">
            <Label htmlFor="termination-reason">
              Termination Reason (Optional)
            </Label>
            <Textarea
              id="termination-reason"
              placeholder="Enter reason for termination..."
              value={terminationReason}
              onChange={(e) => setTerminationReason(e.target.value)}
              rows={3}
            />
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={terminateMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTerminate}
              disabled={terminateMutation.isPending}
              className="bg-destructive hover:bg-destructive/90"
            >
              {terminateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Terminating...
                </>
              ) : (
                "Terminate Contract"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminContracts;
