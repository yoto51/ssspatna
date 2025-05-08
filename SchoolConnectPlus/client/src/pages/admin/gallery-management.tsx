import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Gallery, insertGallerySchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2, Pencil, Trash2, ImagePlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet";

type GalleryFormValues = z.infer<typeof insertGallerySchema>;

export default function GalleryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Gallery | null>(null);

  const { data: galleryItems, isLoading } = useQuery<Gallery[]>({
    queryKey: ["/api/gallery"],
  });

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(insertGallerySchema),
    defaultValues: {
      title: "",
      description: "",
      imageUrl: "",
      category: "",
    },
  });

  const resetForm = () => {
    form.reset({
      title: "",
      description: "",
      imageUrl: "",
      category: "",
    });
  };

  const openEditModal = (item: Gallery) => {
    setSelectedItem(item);
    form.reset({
      title: item.title,
      description: item.description || "",
      imageUrl: item.imageUrl,
      category: item.category || "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteAlert = (item: Gallery) => {
    setSelectedItem(item);
    setIsDeleteAlertOpen(true);
  };

  const addMutation = useMutation({
    mutationFn: async (data: GalleryFormValues) => {
      const res = await apiRequest("POST", "/api/admin/gallery", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Gallery item added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to add gallery item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: GalleryFormValues) => {
      if (!selectedItem) return null;
      const res = await apiRequest("PUT", `/api/admin/gallery/${selectedItem.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Gallery item updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setIsEditModalOpen(false);
      setSelectedItem(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update gallery item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedItem) return null;
      const res = await apiRequest("DELETE", `/api/admin/gallery/${selectedItem.id}`);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Gallery item deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      setIsDeleteAlertOpen(false);
      setSelectedItem(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete gallery item",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAddSubmit = (data: GalleryFormValues) => {
    addMutation.mutate(data);
  };

  const onEditSubmit = (data: GalleryFormValues) => {
    editMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Gallery Management - Trinity School Admin</title>
        <meta 
          name="description" 
          content="Manage school gallery images and media in the Trinity International School admin panel." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Gallery Management</h1>
              <Button 
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <ImagePlus className="mr-2 h-4 w-4" /> Add New Image
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {galleryItems && galleryItems.length > 0 ? (
                  galleryItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden">
                      <div className="relative aspect-video overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.title} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardHeader className="p-4 pb-2">
                        <CardTitle className="text-lg">{item.title}</CardTitle>
                        {item.category && (
                          <CardDescription>
                            Category: {item.category}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <p className="text-sm text-gray-600">{item.description}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          Added on: {new Date(item.uploadDate).toLocaleDateString()}
                        </p>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => openEditModal(item)}
                          className="flex items-center"
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => openDeleteAlert(item)}
                          className="flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" /> Delete
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full flex justify-center items-center h-64 bg-white rounded-lg border border-dashed border-gray-300">
                    <div className="text-center">
                      <ImagePlus className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No gallery items</h3>
                      <p className="mt-1 text-sm text-gray-500">Click 'Add New Image' to add content to the gallery.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Add Gallery Item Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Gallery Item</DialogTitle>
            <DialogDescription>
              Upload a new image to the school gallery.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input 
                id="title"
                placeholder="Enter image title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL <span className="text-red-500">*</span></Label>
              <Input 
                id="imageUrl"
                placeholder="Enter image URL"
                {...form.register("imageUrl")}
              />
              {form.formState.errors.imageUrl && (
                <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select 
                onValueChange={(value) => form.setValue("category", value)}
                defaultValue={form.getValues("category")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Facilities">Facilities</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                placeholder="Enter image description"
                {...form.register("description")}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(false);
                }}
                disabled={addMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={addMutation.isPending}
              >
                {addMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Image"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Gallery Item Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Gallery Item</DialogTitle>
            <DialogDescription>
              Update the selected gallery item.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title <span className="text-red-500">*</span></Label>
              <Input 
                id="edit-title"
                placeholder="Enter image title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-imageUrl">Image URL <span className="text-red-500">*</span></Label>
              <Input 
                id="edit-imageUrl"
                placeholder="Enter image URL"
                {...form.register("imageUrl")}
              />
              {form.formState.errors.imageUrl && (
                <p className="text-sm text-red-500">{form.formState.errors.imageUrl.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category</Label>
              <Select 
                onValueChange={(value) => form.setValue("category", value)}
                defaultValue={form.getValues("category")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Facilities">Facilities</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                placeholder="Enter image description"
                {...form.register("description")}
              />
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedItem(null);
                }}
                disabled={editMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={editMutation.isPending}
              >
                {editMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Image"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the gallery item 
              "{selectedItem?.title}" from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteMutation.mutate();
              }}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
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
    </>
  );
}
