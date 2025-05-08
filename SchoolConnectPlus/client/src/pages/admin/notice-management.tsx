import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Notice, insertNoticeSchema } from "@shared/schema";
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
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
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
import { Loader2, Pencil, Trash2, FileText, AlertTriangle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { Helmet } from "react-helmet";

type NoticeFormValues = z.infer<typeof insertNoticeSchema>;

export default function NoticeManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  const { data: notices, isLoading } = useQuery<Notice[]>({
    queryKey: ["/api/notices"],
  });

  const form = useForm<NoticeFormValues>({
    resolver: zodResolver(insertNoticeSchema),
    defaultValues: {
      title: "",
      content: "",
      category: "",
      important: false,
    },
  });

  const resetForm = () => {
    form.reset({
      title: "",
      content: "",
      category: "",
      important: false,
    });
  };

  const openEditModal = (notice: Notice) => {
    setSelectedNotice(notice);
    form.reset({
      title: notice.title,
      content: notice.content,
      category: notice.category,
      important: notice.important,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteAlert = (notice: Notice) => {
    setSelectedNotice(notice);
    setIsDeleteAlertOpen(true);
  };

  const addMutation = useMutation({
    mutationFn: async (data: NoticeFormValues) => {
      const res = await apiRequest("POST", "/api/admin/notices", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Notice added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      setIsAddModalOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: "Failed to add notice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const editMutation = useMutation({
    mutationFn: async (data: NoticeFormValues) => {
      if (!selectedNotice) return null;
      const res = await apiRequest("PUT", `/api/admin/notices/${selectedNotice.id}`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Notice updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      setIsEditModalOpen(false);
      setSelectedNotice(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update notice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedNotice) return null;
      const res = await apiRequest("DELETE", `/api/admin/notices/${selectedNotice.id}`);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Notice deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/notices"] });
      setIsDeleteAlertOpen(false);
      setSelectedNotice(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete notice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onAddSubmit = (data: NoticeFormValues) => {
    addMutation.mutate(data);
  };

  const onEditSubmit = (data: NoticeFormValues) => {
    editMutation.mutate(data);
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-orange-100 text-orange-800";
      case "administrative":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Helmet>
        <title>Notice Management - Trinity School Admin</title>
        <meta 
          name="description" 
          content="Manage school notices and announcements in the Trinity International School admin panel." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">Notice Management</h1>
              <Button 
                onClick={() => {
                  resetForm();
                  setIsAddModalOpen(true);
                }}
                className="bg-primary hover:bg-primary/90"
              >
                <FileText className="mr-2 h-4 w-4" /> Add New Notice
              </Button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {notices && notices.length > 0 ? (
                  notices.map((notice) => (
                    <Card 
                      key={notice.id} 
                      className={`${notice.important ? 'border-l-4 border-red-500' : ''}`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{notice.title}</CardTitle>
                          <Badge className={getCategoryBadgeColor(notice.category)}>
                            {notice.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-500">
                          {format(new Date(notice.date), "MMMM d, yyyy")}
                        </p>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-gray-600 whitespace-pre-line">{notice.content}</p>
                        {notice.important && (
                          <div className="flex items-center mt-4 bg-red-50 p-2 rounded-md text-red-600 text-sm">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            <span>Important Notice</span>
                          </div>
                        )}
                      </CardContent>
                      <CardFooter className="pt-2 flex justify-end gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => openEditModal(notice)}
                          className="flex items-center"
                        >
                          <Pencil className="h-4 w-4 mr-1" /> Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => openDeleteAlert(notice)}
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
                      <FileText className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No notices</h3>
                      <p className="mt-1 text-sm text-gray-500">Get started by creating a new notice.</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>

      {/* Add Notice Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Notice</DialogTitle>
            <DialogDescription>
              Create a new notice to inform students and parents.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onAddSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
              <Input 
                id="title"
                placeholder="Enter notice title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category">Category <span className="text-red-500">*</span></Label>
              <Select 
                onValueChange={(value) => form.setValue("category", value)}
                defaultValue={form.getValues("category")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Administrative">Administrative</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="content">Content <span className="text-red-500">*</span></Label>
              <Textarea 
                id="content"
                placeholder="Enter notice content"
                rows={5}
                {...form.register("content")}
              />
              {form.formState.errors.content && (
                <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="important" 
                checked={form.getValues("important")}
                onCheckedChange={(checked) => 
                  form.setValue("important", checked as boolean)
                }
              />
              <Label htmlFor="important" className="cursor-pointer">
                Mark as important notice
              </Label>
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
                  "Add Notice"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Notice Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Notice</DialogTitle>
            <DialogDescription>
              Update the selected notice.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onEditSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title <span className="text-red-500">*</span></Label>
              <Input 
                id="edit-title"
                placeholder="Enter notice title"
                {...form.register("title")}
              />
              {form.formState.errors.title && (
                <p className="text-sm text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-category">Category <span className="text-red-500">*</span></Label>
              <Select 
                onValueChange={(value) => form.setValue("category", value)}
                defaultValue={form.getValues("category")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Academic">Academic</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Administrative">Administrative</SelectItem>
                  <SelectItem value="Sports">Sports</SelectItem>
                  <SelectItem value="Cultural">Cultural</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.category && (
                <p className="text-sm text-red-500">{form.formState.errors.category.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content <span className="text-red-500">*</span></Label>
              <Textarea 
                id="edit-content"
                placeholder="Enter notice content"
                rows={5}
                {...form.register("content")}
              />
              {form.formState.errors.content && (
                <p className="text-sm text-red-500">{form.formState.errors.content.message}</p>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="edit-important" 
                checked={form.getValues("important")}
                onCheckedChange={(checked) => 
                  form.setValue("important", checked as boolean)
                }
              />
              <Label htmlFor="edit-important" className="cursor-pointer">
                Mark as important notice
              </Label>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedNotice(null);
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
                  "Update Notice"
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
              This action cannot be undone. This will permanently delete the notice 
              "{selectedNotice?.title}" from the system.
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
