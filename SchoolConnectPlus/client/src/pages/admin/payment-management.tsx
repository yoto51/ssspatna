import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Fee, FeePayment, Student, User } from "@shared/schema";
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Loader2, Eye, Receipt, Download, Search, Plus } from "lucide-react";
import { format } from "date-fns";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface StudentWithFees extends Student {
  user: User;
  fees: Fee[];
}

const addFeeSchema = z.object({
  studentId: z.coerce.number().min(1, "Please select a student"),
  term: z.string().min(1, "Term is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  dueDate: z.string().min(1, "Due date is required"),
  status: z.string().min(1, "Status is required"),
});

type AddFeeValues = z.infer<typeof addFeeSchema>;

export default function PaymentManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isAddFeeModalOpen, setIsAddFeeModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentWithFees | null>(null);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<string>("all");

  const form = useForm<AddFeeValues>({
    resolver: zodResolver(addFeeSchema),
    defaultValues: {
      studentId: 0,
      term: "",
      amount: 0,
      dueDate: format(new Date(), "yyyy-MM-dd"),
      status: "pending",
    },
  });

  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["/api/admin/students"],
    queryFn: async () => {
      const response = await fetch("/api/admin/students", {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }
      
      const data = await response.json();
      
      // For each student, fetch their fees
      const studentsWithFees = await Promise.all(
        data.map(async (student: Student) => {
          const feesResponse = await fetch(`/api/admin/students/${student.id}/fees`, {
            credentials: "include",
          });
          
          if (!feesResponse.ok) {
            return { ...student, fees: [] };
          }
          
          const fees = await feesResponse.json();
          return { ...student, fees };
        })
      );
      
      return studentsWithFees;
    },
    onError: (error) => {
      toast({
        title: "Failed to fetch students",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addFeeMutation = useMutation({
    mutationFn: async (data: AddFeeValues) => {
      const res = await apiRequest("POST", "/api/admin/fees", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Fee added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      setIsAddFeeModalOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Failed to add fee",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateFeeMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const res = await apiRequest("PUT", `/api/admin/fees/${id}`, { status });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Fee status updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      setIsViewModalOpen(false);
      setSelectedFee(null);
    },
    onError: (error) => {
      toast({
        title: "Failed to update fee status",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const openViewModal = (student: StudentWithFees, fee: Fee) => {
    setSelectedStudent(student);
    setSelectedFee(fee);
    setIsViewModalOpen(true);
  };

  const resetForm = () => {
    form.reset({
      studentId: 0,
      term: "",
      amount: 0,
      dueDate: format(new Date(), "yyyy-MM-dd"),
      status: "pending",
    });
  };

  const openAddFeeModal = () => {
    resetForm();
    setIsAddFeeModalOpen(true);
  };

  const onAddFeeSubmit = (data: AddFeeValues) => {
    addFeeMutation.mutate(data);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "paid":
        return "bg-green-100 text-green-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter students based on search query and active tab
  const filteredStudents = students?.filter(student => {
    const searchMatch = 
      searchQuery === "" || 
      student.user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.class.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.rollNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!searchMatch) return false;
    
    if (activeTab === "all") return true;
    
    if (activeTab === "paid") {
      return student.fees.some(fee => fee.status === "paid");
    }
    
    if (activeTab === "pending") {
      return student.fees.some(fee => fee.status === "pending");
    }
    
    if (activeTab === "overdue") {
      return student.fees.some(fee => {
        const dueDate = new Date(fee.dueDate);
        const today = new Date();
        return fee.status === "pending" && dueDate < today;
      });
    }
    
    return true;
  }) || [];

  return (
    <>
      <Helmet>
        <title>Payment Management - Trinity School Admin</title>
        <meta 
          name="description" 
          content="Manage student fee payments in the Trinity International School admin panel." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h1 className="text-2xl font-bold">Fee & Payment Management</h1>
              
              <Button 
                onClick={openAddFeeModal}
                className="bg-primary hover:bg-primary/90"
              >
                <Plus className="mr-2 h-4 w-4" /> Add New Fee
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="w-full md:w-1/2 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by student name, class, or roll number..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Tabs 
                defaultValue="all" 
                value={activeTab} 
                onValueChange={setActiveTab} 
                className="w-full md:w-auto"
              >
                <TabsList className="grid grid-cols-4 w-full">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="paid">Paid</TabsTrigger>
                  <TabsTrigger value="overdue">Overdue</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {isLoadingStudents ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Student Fees</CardTitle>
                  <CardDescription>
                    {filteredStudents.length} {filteredStudents.length === 1 ? 'student' : 'students'} found
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredStudents.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Class</TableHead>
                            <TableHead>Roll No.</TableHead>
                            <TableHead>Parent Name</TableHead>
                            <TableHead>Fee Details</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStudents.map((student) => (
                            <TableRow key={student.id}>
                              <TableCell className="font-medium">{student.user.fullName}</TableCell>
                              <TableCell>{student.class} {student.section || ""}</TableCell>
                              <TableCell>{student.rollNumber || "N/A"}</TableCell>
                              <TableCell>{student.parentName || "N/A"}</TableCell>
                              <TableCell>
                                {student.fees && student.fees.length > 0 ? (
                                  <div className="space-y-1">
                                    {student.fees.map((fee) => (
                                      <div key={fee.id} className="text-sm">
                                        {fee.term}: ₹{fee.amount.toLocaleString()}
                                        <span className="text-xs text-gray-500 ml-2">
                                          Due: {format(new Date(fee.dueDate), "MM/dd/yyyy")}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">No fees assigned</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {student.fees && student.fees.length > 0 ? (
                                  <div className="space-y-1">
                                    {student.fees.map((fee) => (
                                      <Badge 
                                        key={fee.id} 
                                        className={getStatusBadgeColor(fee.status)}
                                      >
                                        {fee.status}
                                      </Badge>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-gray-500">N/A</span>
                                )}
                              </TableCell>
                              <TableCell>
                                {student.fees && student.fees.length > 0 ? (
                                  <div className="space-y-1">
                                    {student.fees.map((fee) => (
                                      <Button 
                                        key={fee.id}
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => openViewModal(student, fee)}
                                        className="flex items-center"
                                      >
                                        <Eye className="h-3 w-3 mr-1" /> View
                                      </Button>
                                    ))}
                                  </div>
                                ) : (
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    onClick={() => {
                                      form.setValue("studentId", student.id);
                                      setIsAddFeeModalOpen(true);
                                    }}
                                  >
                                    <Plus className="h-3 w-3 mr-1" /> Add Fee
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-10">
                      <h3 className="text-lg font-medium text-gray-900">No students found</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {searchQuery 
                          ? "No students match your search criteria." 
                          : activeTab !== "all" 
                            ? `No students with ${activeTab} fees found.` 
                            : "There are no students in the system yet."}
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

      {/* View Fee Modal */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-md md:max-w-lg">
          <DialogHeader>
            <DialogTitle>Fee Details</DialogTitle>
            <DialogDescription>
              View detailed information about the fee and payment.
            </DialogDescription>
          </DialogHeader>
          
          {selectedStudent && selectedFee && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Student Name</h3>
                  <p className="text-base">{selectedStudent.user.fullName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Class</h3>
                  <p className="text-base">{selectedStudent.class} {selectedStudent.section || ""}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Roll Number</h3>
                  <p className="text-base">{selectedStudent.rollNumber || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Parent Name</h3>
                  <p className="text-base">{selectedStudent.parentName || "N/A"}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Fee Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Term</h3>
                    <p className="text-base">{selectedFee.term}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Amount</h3>
                    <p className="text-base">₹{selectedFee.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Due Date</h3>
                    <p className="text-base">{format(new Date(selectedFee.dueDate), "MMMM d, yyyy")}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <Badge className={getStatusBadgeColor(selectedFee.status)}>
                      {selectedFee.status}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Created At</h3>
                    <p className="text-base">{format(new Date(selectedFee.createdAt), "MMMM d, yyyy")}</p>
                  </div>
                </div>
              </div>

              {selectedFee.status === "paid" && (
                <div className="border-t pt-4">
                  <h3 className="text-lg font-medium mb-3">Payment Information</h3>
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex items-center mb-2">
                      <Receipt className="h-5 w-5 text-green-600 mr-2" />
                      <span className="font-medium text-green-800">Payment Received</span>
                    </div>
                    <p className="text-sm text-green-700">
                      This fee has been marked as paid. You can download the receipt if available.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 bg-white"
                      onClick={() => {
                        toast({
                          title: "Receipt download",
                          description: "This feature would download the receipt in a production environment.",
                        });
                      }}
                    >
                      <Download className="h-4 w-4 mr-2" /> Download Receipt
                    </Button>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="text-lg font-medium mb-3">Update Status</h3>
                <div className="flex items-center gap-4">
                  <Select
                    defaultValue={selectedFee.status}
                    onValueChange={(value) => {
                      if (value !== selectedFee.status) {
                        updateFeeMutation.mutate({
                          id: selectedFee.id,
                          status: value,
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={() => setIsViewModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Fee Modal */}
      <Dialog open={isAddFeeModalOpen} onOpenChange={setIsAddFeeModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Fee</DialogTitle>
            <DialogDescription>
              Create a new fee entry for a student.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={form.handleSubmit(onAddFeeSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="studentId">Student <span className="text-red-500">*</span></Label>
              <Select 
                defaultValue={form.getValues("studentId").toString()}
                onValueChange={(value) => form.setValue("studentId", parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.map((student) => (
                    <SelectItem key={student.id} value={student.id.toString()}>
                      {student.user.fullName} - Class {student.class} {student.section || ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.studentId && (
                <p className="text-sm text-red-500">{form.formState.errors.studentId.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="term">Term <span className="text-red-500">*</span></Label>
              <Input 
                id="term"
                placeholder="E.g., Term 1 2023"
                {...form.register("term")}
              />
              {form.formState.errors.term && (
                <p className="text-sm text-red-500">{form.formState.errors.term.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹) <span className="text-red-500">*</span></Label>
              <Input 
                id="amount"
                type="number"
                placeholder="Enter amount in rupees"
                {...form.register("amount", { valueAsNumber: true })}
              />
              {form.formState.errors.amount && (
                <p className="text-sm text-red-500">{form.formState.errors.amount.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date <span className="text-red-500">*</span></Label>
              <Input 
                id="dueDate"
                type="date"
                {...form.register("dueDate")}
              />
              {form.formState.errors.dueDate && (
                <p className="text-sm text-red-500">{form.formState.errors.dueDate.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status <span className="text-red-500">*</span></Label>
              <Select 
                defaultValue={form.getValues("status")}
                onValueChange={(value) => form.setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
              )}
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setIsAddFeeModalOpen(false);
                }}
                disabled={addFeeMutation.isPending}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-primary hover:bg-primary/90"
                disabled={addFeeMutation.isPending}
              >
                {addFeeMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Fee"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
