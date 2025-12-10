import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import { RoomType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAdminRoomTypes, useCreateRoomType, useUpdateRoomType, useDeleteRoomType } from "@/hooks/admin/useAdminRoomTypes";
import { useAdminResidences } from "@/hooks/admin/useAdminResidences";

const AdminRoomTypes = () => {
  const { toast } = useToast();
  const { data: roomTypes = [], isLoading: roomTypesLoading } = useAdminRoomTypes();
  const { data: residences = [], isLoading: residencesLoading } = useAdminResidences();
  const createRoomType = useCreateRoomType();
  const updateRoomType = useUpdateRoomType();
  const deleteRoomType = useDeleteRoomType();

  const [filterResidence, setFilterResidence] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [formData, setFormData] = useState<Partial<RoomType>>({
    residenceId: "",
    name: "",
    description: "",
    basePrice: 0,
    maxOccupancy: 1,
  });

  const filteredRoomTypes = filterResidence === "all"
    ? roomTypes
    : roomTypes.filter((r) => r.residenceId === filterResidence);

  const openAddModal = () => {
    setSelectedRoomType(null);
    setFormData({
      residenceId: "",
      name: "",
      description: "",
      basePrice: 0,
      maxOccupancy: 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setFormData({ ...roomType });
    setIsModalOpen(true);
  };

  const openDeleteDialog = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.residenceId || !formData.name || !formData.description || !formData.basePrice) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    try {
      if (selectedRoomType) {
        await updateRoomType.mutateAsync({
          id: selectedRoomType.id,
          ...formData,
        });
        toast({ title: "Success", description: "Room type updated successfully" });
      } else {
        await createRoomType.mutateAsync(formData as Omit<RoomType, 'id' | 'createdAt' | 'updatedAt'>);
        toast({ title: "Success", description: "Room type added successfully" });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save room type. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (selectedRoomType) {
      try {
        await deleteRoomType.mutateAsync(selectedRoomType.id);
        toast({ title: "Success", description: "Room type deleted successfully" });
        setIsDeleteDialogOpen(false);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete room type. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  if (roomTypesLoading || residencesLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <Select value={filterResidence} onValueChange={setFilterResidence}>
          <SelectTrigger className="w-full sm:w-64">
            <SelectValue placeholder="Filter by residence" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Residences</SelectItem>
            {residences.map((r) => (
              <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Room Type
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Residence</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Max Occupancy</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRoomTypes.map((roomType) => {
                const residence = residences.find((r) => r.id === roomType.residenceId);
                return (
                  <TableRow key={roomType.id}>
                    <TableCell className="font-medium">{roomType.name}</TableCell>
                    <TableCell>{residence?.name || "Unknown"}</TableCell>
                    <TableCell>€{roomType.basePrice}/mo</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {roomType.maxOccupancy}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => openEditModal(roomType)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(roomType)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedRoomType ? "Edit Room Type" : "Add Room Type"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="residenceId">Residence *</Label>
              <Select
                value={formData.residenceId || ""}
                onValueChange={(value) => setFormData({ ...formData, residenceId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select residence" />
                </SelectTrigger>
                <SelectContent>
                  {residences.map((r) => (
                    <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price (€/month) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={formData.basePrice || ""}
                  onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxOccupancy">Max Occupancy *</Label>
                <Select
                  value={String(formData.maxOccupancy || 1)}
                  onValueChange={(value) => setFormData({ ...formData, maxOccupancy: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={String(num)}>{num}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={createRoomType.isPending || updateRoomType.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={createRoomType.isPending || updateRoomType.isPending}>
              {(createRoomType.isPending || updateRoomType.isPending) ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Room Type</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedRoomType?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteRoomType.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteRoomType.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteRoomType.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminRoomTypes;
