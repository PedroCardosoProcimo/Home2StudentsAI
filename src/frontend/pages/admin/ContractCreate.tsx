import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/frontend/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { ContractForm } from "@/frontend/components/contracts/ContractForm";

export default function ContractCreate() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    navigate("/admin/contracts");
  };

  const handleCancel = () => {
    navigate("/admin/contracts");
  };

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
        </CardHeader>
        <CardContent>
          <ContractForm onSuccess={handleSuccess} onCancel={handleCancel} />
        </CardContent>
      </Card>
    </div>
  );
}
