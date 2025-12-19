import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/frontend/components/ui/card";
import { Alert, AlertDescription } from "@/frontend/components/ui/alert";
import { ContractForm } from "@/frontend/components/contracts/ContractForm";
import { ContractPdfUpload } from "@/frontend/components/contracts/ContractPdfUpload";

export default function ContractCreate() {
  const navigate = useNavigate();
  const [createdContractId, setCreatedContractId] = useState<string | null>(null);

  const handleSuccess = (contractId?: string) => {
    if (contractId) {
      // Contract created successfully, show PDF upload
      setCreatedContractId(contractId);
    } else {
      // Edit mode or error, redirect
      navigate("/admin/contracts");
    }
  };

  const handleCancel = () => {
    navigate("/admin/contracts");
  };

  const handleFinish = () => {
    navigate("/admin/contracts");
  };

  // Step 1: Contract Form
  if (!createdContractId) {
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
            <CardTitle>Create New Contract</CardTitle>
            <CardDescription>
              Fill in the contract details. You'll be able to upload the signed PDF in the next step.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ContractForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Step 2: PDF Upload
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={handleFinish}
        className="mb-4"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Contracts
      </Button>

      {/* Success Alert */}
      <Alert>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          Contract created successfully! Now you can upload the signed contract PDF (optional).
        </AlertDescription>
      </Alert>

      {/* PDF Upload */}
      <ContractPdfUpload
        contractId={createdContractId}
        onUploadComplete={() => {
          // Optional: could show a success message or auto-redirect
        }}
      />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={handleFinish} className="flex-1">
          Finish & Go to Contracts
        </Button>
      </div>
    </div>
  );
}
