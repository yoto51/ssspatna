import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Achievement, insertAchievementSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Card, 
  CardContent,  
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
import { Loader2, Pencil, Trash2, Award } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Helmet } from "react-helmet";

type AchievementFormValues = z.infer<typeof insertAchievementSchema>;

export default function AchievementManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Achievement | null>(null);

  const { data: achievements, isLoading } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  const form = useForm<AchievementFormValues>({
    resolver: zodResolver(insertAchievementSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      value: "",
    },
  });

  const resetForm = () => {
    form.reset({
      title: "",
      description: "",
      category: "",
      value: "",
    });
  };

  const openEditModal = (item: Achievement) => {
    setSelectedItem(item);
    form.reset({
      title: item.title,
      description: item.description || "",
      category: item.category || "",
      value: item.value || "",
    });
    setIsEditModalOpen(true);
  };

  const openDeleteAlert = (item: Achievement) => {
    setSelectedItem(item);
    setIsDeleteAlertOpen(true);
  };

  const addMutation = useMutation({
    mutationFn: async (data: AchievementFormValues) => {
      const res = await apiRequest("POST", "/api/admin/achievements", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Achievement added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to add achievement",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: AchievementFormValues) => {
      if (!selectedItem) return null;
      const res = await apiRequest("PUT", `/api/admin/achievements/${selectedItem.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Achievement updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      setIsEditModalOpen(false);
      setSelectedItem(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update achievement",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedItem) return null;
      const res = await apiRequest("DELETE", `/api/admin/achievements/${selectedItem.id}`);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Achievement deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/achievements"] });
      setIsDeleteAlertOpen(false);
      setSelectedItem(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete achievement",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAddSubmit = (data: AchievementFormValues) => {
    addMutation.mutate(data);
  };

  const onEditSubmit = (data: AchievementFormValues) => {
    editMutation.mutate(data);
  };

  const getCategoryColor = (category: string | null | undefined) => {
    switch (category?.toLowerCase()) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "sports":
        return "bg-green-100 text-green-800";
      case "cultural":
        return "bg-purple-100 text-purple-800";
      case "social":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Helmet>
        <title>Achievement Management - Trinity School Admin</title>
        <meta 
          name="description" 
          content="Manage school achievements and results in the Trinity International School admin panel." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Achievement Management</h1>
              <Button 
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <Award className="mr-2 h-4 w-4" /> Add New Achievement
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements && achievements.length > 0 ? (
                  achievements.map((item) => (
                    <Card key={item.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{item.title}</CardTitle>
                          {item.category && (
                            <span className={`text-xs px-2 py-1 rounded ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="text-3xl font-bold text-center py-4 text-primary">
                          {item.value}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600">{item.description}</p>
                        )}
                        {item.achievementDate && (
                          <p className="text-xs text-gray-500 mt-2">
                            Date: {new Date(item.achievementDate).toLocaleDateString()}
                          </p>
                        )}
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-end gap-2">
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
                      <Award className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No achievements</h3>
                      <p className="mt-1 text-sm text-gray-500">Click 'Add New Achievement' to add school achievements.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Add Achievement Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Achievement</DialogTitle>
            <DialogDescription>
              Add a new achievement to showcase on the school website.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input 
                id="title"
                placeholder="Enter achievement title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="value">Value/Number <span className="text-red-500">*</span></Label>
              <Input 
                id="value"
                placeholder="E.g., 98%, 25+, 100+"
                {...form.register("value")}
              />
              {form.formState.errors.value && (
                <p className="text-sm text-red-500">{form.formState.errors.value.message}</p>
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
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description"
                placeholder="Enter achievement description"
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
                  "Add Achievement"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Achievement Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Achievement</DialogTitle>
            <DialogDescription>
              Update the selected achievement.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title <span className="text-red-500">*</span></Label>
              <Input 
                id="edit-title"
                placeholder="Enter achievement title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-value">Value/Number <span className="text-red-500">*</span></Label>
              <Input 
                id="edit-value"
                placeholder="E.g., 98%, 25+, 100+"
                {...form.register("value")}
              />
              {form.formState.errors.value && (
                <p className="text-sm text-red-500">{form.formState.errors.value.message}</p>
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
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea 
                id="edit-description"
                placeholder="Enter achievement description"
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
                  "Update Achievement"
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
              This action cannot be undone. This will permanently delete the achievement 
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
