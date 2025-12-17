import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/frontend/components/ui/card";

const AdminSettings = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <Card className="opacity-60">
        <CardHeader>
          <CardTitle>More Settings</CardTitle>
          <CardDescription>Coming soon</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Additional settings will be available in future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
