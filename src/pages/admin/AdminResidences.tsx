import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Plus, Search, Pencil, Trash2, Loader2, AlertCircle, X } from "lucide-react";
import { useConfig } from "@/hooks/useConfig";
import { Residence, RoomType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { useAdminResidences, useCreateResidence, useUpdateResidence, useDeleteResidence } from "@/hooks/admin/useAdminResidences";
import { useAdminRoomTypes, useCreateRoomType, useUpdateRoomType, useDeleteRoomType } from "@/hooks/admin/useAdminRoomTypes";

// Temporary room type for form management
interface TempRoomType {
  tempId: string; // Temporary ID for local state management
  id?: string; // Real ID if it exists in DB
  name: string;
  description: string;
  basePrice: number;
  maxOccupancy: number;
}

const AdminResidences = () => {
  const { toast } = useToast();
  const { data: residences = [], isLoading: residencesLoading } = useAdminResidences();
  const { data: allRoomTypes = [] } = useAdminRoomTypes();
  const { data: config, isLoading: configLoading } = useConfig();
  const createResidence = useCreateResidence();
  const updateResidence = useUpdateResidence();
  const deleteResidence = useDeleteResidence();
  const createRoomType = useCreateRoomType();
  const updateRoomType = useUpdateRoomType();
  const deleteRoomType = useDeleteRoomType();

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

  // Room types management
  const [roomTypes, setRoomTypes] = useState<TempRoomType[]>([]);
  const [roomTypeFormData, setRoomTypeFormData] = useState<Partial<TempRoomType>>({
    name: "",
    description: "",
    basePrice: 0,
    maxOccupancy: 1,
  });
  const [editingRoomTypeId, setEditingRoomTypeId] = useState<string | null>(null);

  // Load room types when editing a residence
  useEffect(() => {
    if (selectedResidence && isModalOpen) {
      const residenceRoomTypes = allRoomTypes
        .filter((rt) => rt.residenceId === selectedResidence.id)
        .map((rt) => ({
          tempId: rt.id,
          id: rt.id,
          name: rt.name,
          description: rt.description,
          basePrice: rt.basePrice,
          maxOccupancy: rt.maxOccupancy,
        }));
      setRoomTypes(residenceRoomTypes);
    }
  }, [selectedResidence, isModalOpen, allRoomTypes]);

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
    setRoomTypes([]);
    setRoomTypeFormData({
      name: "",
      description: "",
      basePrice: 0,
      maxOccupancy: 1,
    });
    setEditingRoomTypeId(null);
    setIsModalOpen(true);
  };

  const openEditModal = (residence: Residence) => {
    setSelectedResidence(residence);
    setFormData({ ...residence });
    setRoomTypeFormData({
      name: "",
      description: "",
      basePrice: 0,
      maxOccupancy: 1,
    });
    setEditingRoomTypeId(null);
    setIsModalOpen(true);
  };

  const openDeleteDialog = (residence: Residence) => {
    setSelectedResidence(residence);
    setIsDeleteDialogOpen(true);
  };

  const handleAddRoomType = () => {
    if (!roomTypeFormData.name || !roomTypeFormData.description || !roomTypeFormData.basePrice) {
      toast({ title: "Error", description: "Please fill in all room type fields", variant: "destructive" });
      return;
    }

    if (editingRoomTypeId) {
      // Update existing
      setRoomTypes((prev) =>
        prev.map((rt) =>
          rt.tempId === editingRoomTypeId
            ? {
                ...rt,
                name: roomTypeFormData.name!,
                description: roomTypeFormData.description!,
                basePrice: roomTypeFormData.basePrice!,
                maxOccupancy: roomTypeFormData.maxOccupancy!,
              }
            : rt
        )
      );
      setEditingRoomTypeId(null);
    } else {
      // Add new
      const newRoomType: TempRoomType = {
        tempId: `temp-${Date.now()}`,
        name: roomTypeFormData.name!,
        description: roomTypeFormData.description!,
        basePrice: roomTypeFormData.basePrice!,
        maxOccupancy: roomTypeFormData.maxOccupancy!,
      };
      setRoomTypes((prev) => [...prev, newRoomType]);
    }

    // Reset form
    setRoomTypeFormData({
      name: "",
      description: "",
      basePrice: 0,
      maxOccupancy: 1,
    });
  };

  const handleEditRoomType = (roomType: TempRoomType) => {
    setRoomTypeFormData({
      name: roomType.name,
      description: roomType.description,
      basePrice: roomType.basePrice,
      maxOccupancy: roomType.maxOccupancy,
    });
    setEditingRoomTypeId(roomType.tempId);
  };

  const handleCancelEditRoomType = () => {
    setRoomTypeFormData({
      name: "",
      description: "",
      basePrice: 0,
      maxOccupancy: 1,
    });
    setEditingRoomTypeId(null);
  };

  const handleDeleteRoomType = (tempId: string) => {
    setRoomTypes((prev) => prev.filter((rt) => rt.tempId !== tempId));
    if (editingRoomTypeId === tempId) {
      handleCancelEditRoomType();
    }
  };

  const handleSave = async () => {
    // Validate residence fields
    if (!formData.name || !formData.city || !formData.address || !formData.description || !formData.minStay) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    // Validate room types
    if (roomTypes.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one room type",
        variant: "destructive"
      });
      return;
    }

    try {
      let residenceId: string;

      if (selectedResidence) {
        // Edit existing residence
        await updateResidence.mutateAsync({
          id: selectedResidence.id,
          ...formData,
        });
        residenceId = selectedResidence.id;

        // Handle room types for existing residence
        const existingRoomTypeIds = roomTypes.filter((rt) => rt.id).map((rt) => rt.id!);
        const allExistingIds = allRoomTypes
          .filter((rt) => rt.residenceId === residenceId)
          .map((rt) => rt.id);

        // Delete removed room types
        const deletedIds = allExistingIds.filter((id) => !existingRoomTypeIds.includes(id));
        for (const id of deletedIds) {
          await deleteRoomType.mutateAsync(id);
        }

        // Update or create room types
        for (const rt of roomTypes) {
          if (rt.id) {
            // Update existing
            await updateRoomType.mutateAsync({
              id: rt.id,
              name: rt.name,
              description: rt.description,
              basePrice: rt.basePrice,
              maxOccupancy: rt.maxOccupancy,
              residenceId,
            });
          } else {
            // Create new
            await createRoomType.mutateAsync({
              residenceId,
              name: rt.name,
              description: rt.description,
              basePrice: rt.basePrice,
              maxOccupancy: rt.maxOccupancy,
            });
          }
        }

        toast({ title: "Success", description: "Residence updated successfully" });
      } else {
        // Create new residence
        residenceId = await createResidence.mutateAsync(
          formData as Omit<Residence, "id" | "createdAt" | "updatedAt">
        );

        // Create all room types
        for (const rt of roomTypes) {
          await createRoomType.mutateAsync({
            residenceId,
            name: rt.name,
            description: rt.description,
            basePrice: rt.basePrice,
            maxOccupancy: rt.maxOccupancy,
          });
        }

        toast({ title: "Success", description: "Residence added successfully" });
      }

      setIsModalOpen(false);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to save residence. Please try again.",
        variant: "destructive",
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
          variant: "destructive",
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

  const isSaveDisabled =
    createResidence.isPending ||
    updateResidence.isPending ||
    createRoomType.isPending ||
    updateRoomType.isPending ||
    deleteRoomType.isPending ||
    roomTypes.length === 0;

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
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedResidence ? "Edit Residence" : "Add Residence"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Residence Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Residence Details</h3>

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
                        <SelectItem key={city} value={city}>
                          {city}
                        </SelectItem>
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
                  placeholder="Brief description for listing cards..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullDescription">Full Description</Label>
                <Textarea
                  id="fullDescription"
                  value={formData.fullDescription || ""}
                  onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                  rows={5}
                  placeholder="Detailed description shown on residence detail page..."
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
                  <Label htmlFor="startingPrice">Starting Price (€/month) *</Label>
                  <Input
                    id="startingPrice"
                    type="number"
                    value={formData.startingPrice || ""}
                    onChange={(e) => setFormData({ ...formData, startingPrice: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="minStay">Minimum Stay (months) *</Label>
                  <Input
                    id="minStay"
                    type="number"
                    min="1"
                    value={formData.minStay || ""}
                    onChange={(e) => setFormData({ ...formData, minStay: Number(e.target.value) })}
                  />
                </div>
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
                      <label htmlFor={amenity.name} className="text-sm">
                        {amenity.name}
                      </label>
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

            {/* Room Types Section */}
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Room Types *</h3>
                  <p className="text-sm text-muted-foreground">
                    At least one room type is required
                  </p>
                </div>
              </div>

              {/* Room Type Form */}
              <Card>
                <CardContent className="pt-6">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="roomTypeName">Room Type Name *</Label>
                        <Input
                          id="roomTypeName"
                          value={roomTypeFormData.name || ""}
                          onChange={(e) =>
                            setRoomTypeFormData({ ...roomTypeFormData, name: e.target.value })
                          }
                          placeholder="e.g., Studio Apartment"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="basePrice">Base Price (€/month) *</Label>
                        <Input
                          id="basePrice"
                          type="number"
                          value={roomTypeFormData.basePrice || ""}
                          onChange={(e) =>
                            setRoomTypeFormData({ ...roomTypeFormData, basePrice: Number(e.target.value) })
                          }
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="roomTypeDescription">Description *</Label>
                      <Textarea
                        id="roomTypeDescription"
                        value={roomTypeFormData.description || ""}
                        onChange={(e) =>
                          setRoomTypeFormData({ ...roomTypeFormData, description: e.target.value })
                        }
                        rows={2}
                        placeholder="Describe the room type..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxOccupancy">Max Occupancy *</Label>
                      <Select
                        value={String(roomTypeFormData.maxOccupancy || 1)}
                        onValueChange={(value) =>
                          setRoomTypeFormData({ ...roomTypeFormData, maxOccupancy: Number(value) })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4].map((num) => (
                            <SelectItem key={num} value={String(num)}>
                              {num} {num === 1 ? "person" : "people"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex gap-2">
                      <Button type="button" onClick={handleAddRoomType} className="flex-1">
                        {editingRoomTypeId ? "Update Room Type" : "Add Room Type"}
                      </Button>
                      {editingRoomTypeId && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCancelEditRoomType}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Room Types List */}
              {roomTypes.length > 0 ? (
                <Card>
                  <CardContent className="p-0">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Max Occupancy</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roomTypes.map((rt) => (
                          <TableRow key={rt.tempId}>
                            <TableCell className="font-medium">{rt.name}</TableCell>
                            <TableCell>€{rt.basePrice}/mo</TableCell>
                            <TableCell>{rt.maxOccupancy}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditRoomType(rt)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteRoomType(rt.tempId)}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    No room types added yet. Please add at least one room type to continue.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              disabled={isSaveDisabled}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaveDisabled}>
              {(createResidence.isPending ||
                updateResidence.isPending ||
                createRoomType.isPending ||
                updateRoomType.isPending ||
                deleteRoomType.isPending) ? (
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
              Are you sure you want to delete "{selectedResidence?.name}"? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteResidence.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteResidence.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
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
