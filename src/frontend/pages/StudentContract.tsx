import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";
import { FileText } from "lucide-react";

const StudentContract = () => {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-3xl font-bold">My Contract</h2>
        <p className="text-muted-foreground mt-1">View and manage your housing contract</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Contract Details
          </CardTitle>
          <CardDescription>Your contract information will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Contract management features are coming soon...
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentContract;
