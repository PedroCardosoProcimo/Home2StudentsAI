import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { useAdminSettings, useUpdateSettings } from "@/hooks/admin/useAdminSettings";

const AdminSettings = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = useAdminSettings();
  const updateSettings = useUpdateSettings();
  const [minStay, setMinStay] = useState<string>("1");

  useEffect(() => {
    if (settings) {
      setMinStay(String(settings.minimumStayMonths));
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        minimumStayMonths: Number(minStay) as 1 | 6 | 10,
      });

      toast({ title: "Success", description: "Settings saved successfully" });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Minimum Stay Requirement</CardTitle>
          <CardDescription>
            Set the minimum booking duration for all residences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <RadioGroup value={minStay} onValueChange={setMinStay}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="1" id="1month" />
              <Label htmlFor="1month">1 month</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="6" id="6months" />
              <Label htmlFor="6months">6 months</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="10" id="10months" />
              <Label htmlFor="10months">10 months</Label>
            </div>
          </RadioGroup>

          <Button onClick={handleSave} disabled={updateSettings.isPending}>
            {updateSettings.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>

          {settings?.updatedAt && (
            <p className="text-sm text-muted-foreground">
              Last updated: {format(settings.updatedAt.toDate(), "MMMM d, yyyy")} by {settings.updatedBy}
            </p>
          )}
        </CardContent>
      </Card>

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
