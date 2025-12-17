import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus } from 'lucide-react';
import { Button } from '@/frontend/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/frontend/components/ui/card';
import { Skeleton } from '@/frontend/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/frontend/components/ui/tabs';
import { RegulationList } from '@/frontend/components/regulations/RegulationList';
import { RegulationHistory } from '@/frontend/components/regulations/RegulationHistory';
import { RegulationAuditLog } from '@/frontend/components/regulations/RegulationAuditLog';
import { RegulationUploadDialog } from '@/frontend/components/regulations/RegulationUploadDialog';
import { useResidence } from '@/backend/hooks/useResidence';

export default function AdminRegulations() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const { data, isLoading } = useResidence(id || '');
  const residence = data?.residence;

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!residence) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Residence not found</h2>
          <p className="text-muted-foreground mb-4">
            The residence you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate('/admin/residences')}>
            Back to Residences
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header with back button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin/residences')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{residence.name}</h1>
          <p className="text-muted-foreground">Regulation Management</p>
        </div>
      </div>

      {/* Regulations section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Regulations</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage regulation documents for this residence
              </p>
            </div>
            <Button onClick={() => setIsUploadDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Regulation
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="list">Current View</TabsTrigger>
              <TabsTrigger value="history">Version History</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-6">
              <RegulationList residenceId={residence.id} />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <RegulationHistory residenceId={residence.id} />
            </TabsContent>

            <TabsContent value="audit" className="mt-6">
              <RegulationAuditLog residenceId={residence.id} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Upload dialog */}
      <RegulationUploadDialog
        residenceId={residence.id}
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
      />
    </div>
  );
}
