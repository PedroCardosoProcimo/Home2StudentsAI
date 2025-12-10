import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { settings as initialSettings } from "@/data/mockData";
import { Settings } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import { format } from "date-fns";

const AdminSettings = () => {
  const { toast } = useToast();
  const { user } = useAdminAuth();
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [minStay, setMinStay] = useState<string>(String(settings.minimumStayMonths));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    setSettings({
      minimumStayMonths: Number(minStay) as 1 | 6 | 10,
      updatedAt: new Date(),
      updatedBy: user?.email || "unknown",
    });

    toast({ title: "Success", description: "Settings saved successfully" });
    setIsSaving(false);
  };

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

          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>

          <p className="text-sm text-muted-foreground">
            Last updated: {format(settings.updatedAt, "MMMM d, yyyy")} by {settings.updatedBy}
          </p>
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
