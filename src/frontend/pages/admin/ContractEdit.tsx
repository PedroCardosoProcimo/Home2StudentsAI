import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import { ContractForm } from "@/frontend/components/contracts/ContractForm";
import { ContractPdfUpload } from "@/frontend/components/contracts/ContractPdfUpload";
import { getContract } from "@/backend/services/contracts";

export default function ContractEdit() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { data: contract, isLoading, error } = useQuery({
    queryKey: ["contract", id],
    queryFn: () => getContract(id!),
    enabled: !!id,
  });

  const handleSuccess = () => {
    navigate("/admin/contracts");
  };

  const handleCancel = () => {
    navigate("/admin/contracts");
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => navigate("/admin/contracts")}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Contracts
      </Button>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Edit Contract</CardTitle>
        </CardHeader>
        <CardContent>
          <ContractForm
            contractId={id}
            initialData={contract}
            onSuccess={handleSuccess}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>

      {/* Contract PDF Upload */}
      <ContractPdfUpload contractId={contract.id} />
    </div>
  );
}
