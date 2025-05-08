import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdmissionInquiry } from "@shared/schema";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, Trash2, Filter } from "lucide-react";
import { format } from "date-fns";
import { Helmet } from "react-helmet";

export default function InquiryManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<AdmissionInquiry | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [responseMessage, setResponseMessage] = useState("");

  const { data: inquiries, isLoading } = useQuery<AdmissionInquiry[]>({
    queryKey: ["/api/admin/inquiries"],
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/inquiries/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Inquiry status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      setIsStatusModalOpen(false);
      setSelectedInquiry(null);
      setResponseMessage("");
    },
    onError: (error) => {
      toast({
        title: "Failed to update inquiry status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!selectedInquiry) return null;
      const res = await apiRequest("DELETE", `/api/admin/inquiries/${selectedInquiry.id}`);
      return res;
    },
    onSuccess: () => {
      toast({
        title: "Inquiry deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/inquiries"] });
      setIsDeleteAlertOpen(false);
      setSelectedInquiry(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to delete inquiry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openViewModal = (inquiry: AdmissionInquiry) => {
    setSelectedInquiry(inquiry);
    setIsViewModalOpen(true);
  };

  const openStatusModal = (inquiry: AdmissionInquiry) => {
    setSelectedInquiry(inquiry);
    setIsStatusModalOpen(true);
  };

  const openDeleteAlert = (inquiry: AdmissionInquiry) => {
    setSelectedInquiry(inquiry);
    setIsDeleteAlertOpen(true);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "waitlisted":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredInquiries = inquiries?.filter(inquiry => {
    if (activeTab === "all") return true;
    return inquiry.status === activeTab;
  }) || [];

  return (
    <>
      <Helmet>
        <title>Admission Inquiries - Trinity School Admin</title>
        <meta 
          name="description" 
          content="Manage admission inquiries in the Trinity International School admin panel." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <h1 className="text-2xl font-bold">Admission Inquiries</h1>
              
              <Tabs 
                defaultValue="all" 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full md:w-auto"
              >
                <TabsList className="grid grid-cols-4 w-full md:w-auto">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Student Admission Inquiries</CardTitle>
                  <CardDescription>
                    {filteredInquiries.length} {filteredInquiries.length === 1 ? 'inquiry' : 'inquiries'} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredInquiries.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Parent Name</TableHead>
                            <TableHead>Contact</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredInquiries.map((inquiry) => (
                            <TableRow key={inquiry.id}>
                              <TableCell className="font-medium">{inquiry.studentName}</TableCell>
                              <TableCell>{inquiry.applyingForClass}</TableCell>
                              <TableCell>{inquiry.parentName}</TableCell>
                              <TableCell>
                                {inquiry.email}
                                <br />
                                {inquiry.phone}
                              </TableCell>
                              <TableCell>{format(new Date(inquiry.inquiryDate), "MM/dd/yyyy")}</TableCell>
                              <TableCell>
                                <Badge className={getStatusBadgeColor(inquiry.status)}>
                                  {inquiry.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => openViewModal(inquiry)}
                                    className="flex items-center"
                                  >
                                    <Eye className="h-4 w-4 mr-1" /> View
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="default" 
                                    onClick={() => openStatusModal(inquiry)}
                                    className="flex items-center bg-primary/90 hover:bg-primary"
                                  >
                                    <Filter className="h-4 w-4 mr-1" /> Status
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="destructive" 
                                    onClick={() => openDeleteAlert(inquiry)}
                                    className="flex items-center"
                                  >
                                    <Trash2 className="h-4 w-4 mr-1" /> Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium text-gray-900">No inquiries found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {activeTab === "all" 
                          ? "There are no admission inquiries yet." 
                          : `There are no ${activeTab} inquiries.`}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </main>
        
        <Footer />
      </div>

      {/* View Inquiry Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md md:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Inquiry Details</DialogTitle>
            <DialogDescription>
              View detailed information about the admission inquiry.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-3 border-b pb-2">Student Information</h3>
                  <dl className="space-y-2">
                    <div className="grid grid-cols-2">
                      <dt className="font-medium text-gray-500">Name:</dt>
                      <dd>{selectedInquiry.studentName}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium text-gray-500">Date of Birth:</dt>
                      <dd>{selectedInquiry.dob}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium text-gray-500">Gender:</dt>
                      <dd className="capitalize">{selectedInquiry.gender}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium text-gray-500">Applying for Class:</dt>
                      <dd>{selectedInquiry.applyingForClass}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium text-gray-500">Previous School:</dt>
                      <dd>{selectedInquiry.previousSchool || "N/A"}</dd>
                    </div>
                  </dl>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-3 border-b pb-2">Parent Information</h3>
                  <dl className="space-y-2">
                    <div className="grid grid-cols-2">
                      <dt className="font-medium text-gray-500">Name:</dt>
                      <dd>{selectedInquiry.parentName}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium text-gray-500">Relationship:</dt>
                      <dd className="capitalize">{selectedInquiry.relationship}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium text-gray-500">Email:</dt>
                      <dd>{selectedInquiry.email}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium text-gray-500">Phone:</dt>
                      <dd>{selectedInquiry.phone}</dd>
                    </div>
                    <div className="grid grid-cols-2">
                      <dt className="font-medium text-gray-500">Address:</dt>
                      <dd>{selectedInquiry.address}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-3 border-b pb-2">Additional Information</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="font-medium text-gray-500 mb-1">Reference Source:</dt>
                    <dd>{selectedInquiry.referenceSource || "Not specified"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500 mb-1">Reason for Joining:</dt>
                    <dd className="whitespace-pre-line">{selectedInquiry.reason || "Not specified"}</dd>
                  </div>
                  <div>
                    <dt className="font-medium text-gray-500 mb-1">Special Needs:</dt>
                    <dd className="whitespace-pre-line">{selectedInquiry.specialNeeds || "None specified"}</dd>
                  </div>
                </dl>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Status:</span>
                    <Badge className={getStatusBadgeColor(selectedInquiry.status)}>
                      {selectedInquiry.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Submitted on: {format(new Date(selectedInquiry.inquiryDate), "MMMM d, yyyy")}
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setIsViewModalOpen(false);
                    openStatusModal(selectedInquiry);
                  }}
                  className="bg-primary hover:bg-primary/90"
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Modal */}
      <Dialog open={isStatusModalOpen} onOpenChange={setIsStatusModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Inquiry Status</DialogTitle>
            <DialogDescription>
              Change the status of this admission inquiry.
            </DialogDescription>
          </DialogHeader>
          
          {selectedInquiry && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Student Name</h3>
                <p className="text-base">{selectedInquiry.studentName}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-1">Current Status</h3>
                <Badge className={getStatusBadgeColor(selectedInquiry.status)}>
                  {selectedInquiry.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">New Status</Label>
                <Select 
                  defaultValue={selectedInquiry.status}
                  onValueChange={(value) => {
                    // If we have selected a new status than the current one
                    if (value !== selectedInquiry.status) {
                      updateStatusMutation.mutate({ id: selectedInquiry.id, status: value });
                    } else {
                      setIsStatusModalOpen(false);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="waitlisted">Waitlisted</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="response">Response Message (Optional)</Label>
                <Textarea
                  id="response"
                  placeholder="Enter a response message to the applicant..."
                  rows={4}
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  This message will be sent to the applicant via email if configured.
                </p>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsStatusModalOpen(false);
                setResponseMessage("");
              }}
              disabled={updateStatusMutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              onClick={() => {
                if (selectedInquiry) {
                  updateStatusMutation.mutate({ 
                    id: selectedInquiry.id, 
                    status: selectedInquiry.status  // Use the already-selected value from the Select component
                  });
                }
              }}
              className="bg-primary hover:bg-primary/90"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the admission inquiry from 
              {selectedInquiry?.studentName} and remove it from the system.
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
