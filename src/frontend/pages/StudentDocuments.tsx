import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { FolderOpen } from "lucide-react";

const StudentDocuments = () => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">Documents</h2>
        <p className="text-muted-foreground mt-1">Access your documents and regulations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="h-5 w-5" />
            Your Documents
          </CardTitle>
          <CardDescription>Important documents and files</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Document library features are coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentDocuments;
