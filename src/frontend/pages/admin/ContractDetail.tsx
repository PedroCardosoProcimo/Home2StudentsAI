import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  ArrowLeft,
  Loader2,
  Pencil,
  XCircle,
  User,
  Building,
  Calendar,
  Euro,
  Phone,
  Mail,
  FileText,
} from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/frontend/components/ui/card";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/frontend/components/ui/dialog";
import { Label } from "@/frontend/components/ui/label";
import { Textarea } from "@/frontend/components/ui/textarea";
import { useToast } from "@/backend/hooks/use-toast";
import { getContract } from "@/backend/services/contracts";
import { useTerminateContract } from "@/backend/hooks/admin/useAdminContracts";
import { ContractPdfUpload } from "@/frontend/components/contracts/ContractPdfUpload";

export default function ContractDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isTerminateDialogOpen, setIsTerminateDialogOpen] = useState(false);
  const [terminationReason, setTerminationReason] = useState("");

  const terminateContract = useTerminateContract();

  const { data: contract, isLoading, error } = useQuery({
    queryKey: ["contract", id],
    queryFn: () => getContract(id!),
    enabled: !!id,
  });

  const handleEdit = () => {
    navigate(`/admin/contracts/${id}/edit`);
  };

  const handleTerminate = async () => {
    if (!id) return;

    try {
      await terminateContract.mutateAsync({
        id,
        reason: terminationReason || undefined,
      });

      toast({
        title: "Success",
        description: "Contract terminated successfully",
      });

      setIsTerminateDialogOpen(false);
      navigate("/admin/contracts");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to terminate contract",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/contracts")}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contracts
        </Button>

        <Alert variant="destructive">
          <AlertDescription>
            {error instanceof Error ? error.message : "Contract not found"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const isActive = contract.status === "active";

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => navigate("/admin/contracts")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Contracts
        </Button>

        {isActive && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setIsTerminateDialogOpen(true)}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Terminate
            </Button>
          </div>
        )}
      </div>

      {/* Contract Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Student Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Student Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{contract.studentName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{contract.studentEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Student ID</p>
              <p className="font-mono text-sm">{contract.studentId}</p>
            </div>
          </CardContent>
        </Card>

        {/* Residence Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Residence Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Residence</p>
              <p className="font-medium">{contract.residenceName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Room Type</p>
              <p className="font-medium">{contract.roomTypeName}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Room Number</p>
              <p className="font-medium">{contract.roomNumber}</p>
            </div>
          </CardContent>
        </Card>

        {/* Contract Period */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Contract Period
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Start Date</p>
              <p className="font-medium">
                {format(contract.startDate.toDate(), "dd/MM/yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Date</p>
              <p className="font-medium">
                {format(contract.endDate.toDate(), "dd/MM/yyyy")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {contract.status.charAt(0).toUpperCase() + contract.status.slice(1)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Terms */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Euro className="h-5 w-5" />
              Financial Terms
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Monthly Value</p>
              <p className="font-medium text-lg">€{contract.monthlyValue}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Monthly kWh Limit</p>
              <p className="font-medium">{contract.monthlyKwhLimit} kWh</p>
            </div>
          </CardContent>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Mail className="h-3 w-3" />
                Email
              </p>
              <p className="font-medium">{contract.contactEmail}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Phone className="h-3 w-3" />
                Phone
              </p>
              <p className="font-medium">{contract.contactPhone}</p>
            </div>
          </CardContent>
        </Card>

        {/* Metadata */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Metadata
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-sm text-muted-foreground">Created At</p>
              <p className="font-medium">
                {format(contract.createdAt.toDate(), "dd/MM/yyyy HH:mm")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Updated At</p>
              <p className="font-medium">
                {format(contract.updatedAt.toDate(), "dd/MM/yyyy HH:mm")}
              </p>
            </div>
            {contract.status === "terminated" && contract.terminatedAt && (
              <>
                <div>
                  <p className="text-sm text-muted-foreground">Terminated At</p>
                  <p className="font-medium">
                    {format(contract.terminatedAt.toDate(), "dd/MM/yyyy HH:mm")}
                  </p>
                </div>
                {contract.terminationReason && (
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Termination Reason
                    </p>
                    <p className="font-medium">{contract.terminationReason}</p>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Contract PDF Upload */}
        <ContractPdfUpload contractId={contract.id} />
      </div>

      {/* Terminate Dialog */}
      <Dialog open={isTerminateDialogOpen} onOpenChange={setIsTerminateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Terminate Contract</DialogTitle>
            <DialogDescription>
              Are you sure you want to terminate this contract? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Textarea
                id="reason"
                placeholder="Enter termination reason..."
                value={terminationReason}
                onChange={(e) => setTerminationReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTerminateDialogOpen(false)}
              disabled={terminateContract.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleTerminate}
              disabled={terminateContract.isPending}
            >
              {terminateContract.isPending ? "Terminating..." : "Terminate Contract"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
