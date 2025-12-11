import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Plus, Search, Pencil, Trash2, Loader2 } from "lucide-react";
import { useConfig } from "@/hooks/useConfig";
import { Residence } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAdminResidences, useCreateResidence, useUpdateResidence, useDeleteResidence } from "@/hooks/admin/useAdminResidences";

const AdminResidences = () => {
  const { toast } = useToast();
  const { data: residences = [], isLoading: residencesLoading } = useAdminResidences();
  const { data: config, isLoading: configLoading } = useConfig();
  const createResidence = useCreateResidence();
  const updateResidence = useUpdateResidence();
  const deleteResidence = useDeleteResidence();

  const isLoading = residencesLoading || configLoading;

  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedResidence, setSelectedResidence] = useState<Residence | null>(null);
  const [formData, setFormData] = useState<Partial<Residence>>({
    name: "",
    city: "",
    address: "",
    description: "",
    fullDescription: "",
    imageUrl: "",
    amenities: [],
    active: true,
    startingPrice: 0,
    minStay: 1,
  });

  const filteredResidences = residences.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.city.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const openAddModal = () => {
    setSelectedResidence(null);
    setFormData({
      name: "",
      city: "",
      address: "",
      description: "",
      fullDescription: "",
      imageUrl: "",
      amenities: [],
      active: true,
      startingPrice: 0,
      minStay: 1,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (residence: Residence) => {
    setSelectedResidence(residence);
    setFormData({ ...residence });
    setIsModalOpen(true);
  };

  const openDeleteDialog = (residence: Residence) => {
    setSelectedResidence(residence);
    setIsDeleteDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.city || !formData.address || !formData.description) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    try {
      if (selectedResidence) {
        // Edit
        await updateResidence.mutateAsync({
          id: selectedResidence.id,
          ...formData,
        });
        toast({ title: "Success", description: "Residence updated successfully" });
      } else {
        // Add
        await createResidence.mutateAsync(formData as Omit<Residence, 'id' | 'createdAt' | 'updatedAt'>);
        toast({ title: "Success", description: "Residence added successfully" });
      }
      setIsModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save residence. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async () => {
    if (selectedResidence) {
      try {
        await deleteResidence.mutateAsync(selectedResidence.id);
        toast({ title: "Success", description: "Residence deleted successfully" });
        setIsDeleteDialogOpen(false);
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete residence. Please try again.",
          variant: "destructive"
        });
      }
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities?.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...(prev.amenities || []), amenity],
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search residences..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={openAddModal}>
          <Plus className="h-4 w-4 mr-2" />
          Add Residence
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredResidences.map((residence) => (
                <TableRow key={residence.id}>
                  <TableCell>
                    <img
                      src={residence.imageUrl}
                      alt={residence.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{residence.name}</TableCell>
                  <TableCell>{residence.city}</TableCell>
                  <TableCell>€{residence.startingPrice}/mo</TableCell>
                  <TableCell>
                    <StatusBadge status={residence.active ? "active" : "inactive"} />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => openEditModal(residence)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openDeleteDialog(residence)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedResidence ? "Edit Residence" : "Add Residence"}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Select
                  value={formData.city || ""}
                  onValueChange={(value) => setFormData({ ...formData, city: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {config?.cities.map((city) => (
                      <SelectItem key={city} value={city}>{city}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                value={formData.imageUrl || ""}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startingPrice">Starting Price (€/month)</Label>
                <Input
                  id="startingPrice"
                  type="number"
                  value={formData.startingPrice || ""}
                  onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStay">Minimum Stay (months)</Label>
                <Input
                  id="minStay"
                  type="number"
                  value={formData.minStay || ""}
                  onChange={(e) => setFormData({ ...formData, minStay: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="startingPrice">Starting Price (€/month)</Label>
              <Input
                id="startingPrice"
                type="number"
                value={formData.startingPrice || ""}
                onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label>Amenities</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {config?.amenities.map((amenity) => (
                  <div key={amenity.name} className="flex items-center space-x-2">
                    <Checkbox
                      id={amenity.name}
                      checked={formData.amenities?.includes(amenity.name)}
                      onCheckedChange={() => toggleAmenity(amenity.name)}
                    />
                    <label htmlFor={amenity.name} className="text-sm">{amenity.name}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={formData.active}
                onCheckedChange={(checked) => setFormData({ ...formData, active: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={createResidence.isPending || updateResidence.isPending}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={createResidence.isPending || updateResidence.isPending}>
              {(createResidence.isPending || updateResidence.isPending) ? (
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
            <AlertDialogTitle>Delete Residence</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedResidence?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteResidence.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleteResidence.isPending} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteResidence.isPending ? (
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

export default AdminResidences;
