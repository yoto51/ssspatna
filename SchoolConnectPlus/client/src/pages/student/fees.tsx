import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Progress } from "@/components/ui/progress";
import { Student, Fee, FeePayment } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Receipt, CreditCard, AlertTriangle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Helmet } from "react-helmet";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

interface FeeWithPayments extends Fee {
  payments: FeePayment[];
}

// Form schema for payment
const paymentSchema = z.object({
  paymentMethod: z.string().min(1, "Payment method is required"),
  transactionId: z.string().min(1, "Transaction ID is required"),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

export default function StudentFees() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<Fee | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<FeePayment | null>(null);

  // Fetch student profile
  const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
    queryKey: ["/api/student/profile"],
  });

  // Fetch fees with payments
  const { data: fees, isLoading: isLoadingFees } = useQuery<FeeWithPayments[]>({
    queryKey: ["/api/student/fees"],
  });

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      paymentMethod: "",
      transactionId: "",
    },
  });

  const isLoading = isLoadingStudent || isLoadingFees;

  // Calculate total fees and paid amount
  const totalFees = fees?.reduce((sum, fee) => sum + fee.amount, 0) || 0;
  const totalPaid = fees?.reduce((sum, fee) => {
    return fee.status === "paid" ? sum + fee.amount : sum;
  }, 0) || 0;
  const pendingAmount = totalFees - totalPaid;
  const paymentPercentage = totalFees > 0 ? (totalPaid / totalFees) * 100 : 0;

  // Filter fees by status
  const pendingFees = fees?.filter(fee => fee.status === "pending") || [];
  const paidFees = fees?.filter(fee => fee.status === "paid") || [];

  // Open payment modal
  const openPaymentModal = (fee: Fee) => {
    setSelectedFee(fee);
    form.reset({
      paymentMethod: "",
      transactionId: "",
    });
    setIsPaymentModalOpen(true);
  };

  // Open receipt modal
  const openReceiptModal = (fee: FeeWithPayments) => {
    if (fee.payments && fee.payments.length > 0) {
      setSelectedPayment(fee.payments[0]); // Assuming one payment per fee
      setIsReceiptModalOpen(true);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  // Process payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentFormValues) => {
      if (!selectedFee) throw new Error("No fee selected");
      const res = await apiRequest("POST", `/api/student/fees/${selectedFee.id}/pay`, data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Payment successful",
        description: "Your payment has been processed successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/student/fees"] });
      setIsPaymentModalOpen(false);
      setSelectedFee(null);
    },
    onError: (error) => {
      toast({
        title: "Payment failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmitPayment = (data: PaymentFormValues) => {
    paymentMutation.mutate(data);
  };

  return (
    <>
      <Helmet>
        <title>Fee Status - Trinity International School</title>
        <meta 
          name="description" 
          content="View and manage your fee payments at Trinity International School." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold mb-6">Fee Status</h1>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Fee Summary Card */}
                <Card className="mb-6">
                  <CardHeader className="pb-2">
                    <CardTitle>Fee Summary</CardTitle>
                    <CardDescription>Overall payment status for academic year</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="text-sm font-medium text-blue-800">Total Fees</h3>
                        <p className="text-2xl font-bold mt-1">₹{totalFees.toLocaleString()}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h3 className="text-sm font-medium text-green-800">Paid Amount</h3>
                        <p className="text-2xl font-bold mt-1">₹{totalPaid.toLocaleString()}</p>
                      </div>
                      <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                        <h3 className="text-sm font-medium text-yellow-800">Pending Amount</h3>
                        <p className="text-2xl font-bold mt-1">₹{pendingAmount.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Payment Progress</span>
                        <span>{paymentPercentage.toFixed(0)}%</span>
                      </div>
                      <Progress value={paymentPercentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
                
                {/* Pending Fees */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        Pending Fees
                      </CardTitle>
                      <CardDescription>
                        {pendingFees.length} {pendingFees.length === 1 ? 'payment' : 'payments'} pending
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {pendingFees.length > 0 ? (
                        <div className="space-y-4">
                          {pendingFees.map((fee) => {
                            const isDueDate = new Date(fee.dueDate) < new Date();
                            return (
                              <div 
                                key={fee.id} 
                                className={`p-4 rounded-lg border ${
                                  isDueDate ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
                                }`}
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h3 className="font-medium">{fee.term}</h3>
                                    <p className="text-sm text-gray-600">Due: {formatDate(fee.dueDate)}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-lg">₹{fee.amount.toLocaleString()}</p>
                                    <Badge className={
                                      isDueDate 
                                        ? "bg-red-100 text-red-800" 
                                        : "bg-yellow-100 text-yellow-800"
                                    }>
                                      {isDueDate ? "Overdue" : "Pending"}
                                    </Badge>
                                  </div>
                                </div>
                                <Button 
                                  variant="outline" 
                                  className="w-full mt-2 bg-white"
                                  onClick={() => openPaymentModal(fee)}
                                >
                                  <CreditCard className="h-4 w-4 mr-2" /> Pay Now
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
                          <h3 className="text-lg font-medium">All Fees Paid</h3>
                          <p className="text-gray-500 mt-1">You have no pending fee payments.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  
                  {/* Payment History */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-green-500" />
                        Payment History
                      </CardTitle>
                      <CardDescription>
                        {paidFees.length} {paidFees.length === 1 ? 'payment' : 'payments'} completed
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {paidFees.length > 0 ? (
                        <div className="space-y-4">
                          {paidFees.map((fee) => (
                            <div 
                              key={fee.id} 
                              className="p-4 rounded-lg border bg-green-50 border-green-200"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <h3 className="font-medium">{fee.term}</h3>
                                  <p className="text-sm text-gray-600">
                                    Paid on: {
                                      fee.payments && fee.payments.length > 0 
                                        ? formatDate(fee.payments[0].paymentDate) 
                                        : "N/A"
                                    }
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-lg">₹{fee.amount.toLocaleString()}</p>
                                  <Badge className="bg-green-100 text-green-800">Paid</Badge>
                                </div>
                              </div>
                              <Button 
                                variant="outline" 
                                className="w-full mt-2 bg-white"
                                onClick={() => openReceiptModal(fee)}
                              >
                                <Download className="h-4 w-4 mr-2" /> View Receipt
                              </Button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-6 text-center">
                          <Receipt className="h-12 w-12 text-gray-400 mb-2" />
                          <h3 className="text-lg font-medium">No Payment History</h3>
                          <p className="text-gray-500 mt-1">Your payment history will appear here once you make a payment.</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                {/* All Fee Transactions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Fee Transactions</CardTitle>
                    <CardDescription>Complete record of all fee transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {fees && fees.length > 0 ? (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Term</TableHead>
                              <TableHead>Due Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Status</TableHead>
                              <TableHead>Payment Date</TableHead>
                              <TableHead>Payment Method</TableHead>
                              <TableHead>Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {fees.map((fee) => (
                              <TableRow key={fee.id}>
                                <TableCell className="font-medium">{fee.term}</TableCell>
                                <TableCell>{formatDate(fee.dueDate)}</TableCell>
                                <TableCell>₹{fee.amount.toLocaleString()}</TableCell>
                                <TableCell>
                                  <Badge className={
                                    fee.status === "paid" 
                                      ? "bg-green-100 text-green-800" 
                                      : new Date(fee.dueDate) < new Date()
                                        ? "bg-red-100 text-red-800"
                                        : "bg-yellow-100 text-yellow-800"
                                  }>
                                    {fee.status === "paid" 
                                      ? "Paid" 
                                      : new Date(fee.dueDate) < new Date()
                                        ? "Overdue"
                                        : "Pending"
                                    }
                                  </Badge>
                                </TableCell>
                                <TableCell>
                                  {fee.payments && fee.payments.length > 0 
                                    ? formatDate(fee.payments[0].paymentDate) 
                                    : "-"
                                  }
                                </TableCell>
                                <TableCell>
                                  {fee.payments && fee.payments.length > 0 
                                    ? fee.payments[0].paymentMethod 
                                    : "-"
                                  }
                                </TableCell>
                                <TableCell>
                                  {fee.status === "paid" ? (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => openReceiptModal(fee)}
                                    >
                                      <Download className="h-3 w-3 mr-1" /> Receipt
                                    </Button>
                                  ) : (
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => openPaymentModal(fee)}
                                    >
                                      <CreditCard className="h-3 w-3 mr-1" /> Pay
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-gray-500">No fee transactions available.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
      
      {/* Payment Modal */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Make Payment</DialogTitle>
            <DialogDescription>
              Complete your fee payment using one of the available payment methods.
            </DialogDescription>
          </DialogHeader>
          
          {selectedFee && (
            <form onSubmit={form.handleSubmit(onSubmitPayment)} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Term</h3>
                    <p className="text-gray-600">{selectedFee.term}</p>
                  </div>
                  <div className="text-right">
                    <h3 className="font-medium">Amount</h3>
                    <p className="text-lg font-bold">₹{selectedFee.amount.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-gray-200">
                  <h3 className="font-medium">Due Date</h3>
                  <p className="text-gray-600">{formatDate(selectedFee.dueDate)}</p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method <span className="text-red-500">*</span></Label>
                <Select
                  onValueChange={(value) => form.setValue("paymentMethod", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Paytm">Paytm</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                    <SelectItem value="Net Banking">Net Banking</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.paymentMethod && (
                  <p className="text-sm text-red-500">{form.formState.errors.paymentMethod.message}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="transactionId">Transaction ID <span className="text-red-500">*</span></Label>
                <Input
                  id="transactionId"
                  placeholder="Enter transaction ID"
                  {...form.register("transactionId")}
                />
                {form.formState.errors.transactionId && (
                  <p className="text-sm text-red-500">{form.formState.errors.transactionId.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Enter the transaction ID received from your payment provider.
                </p>
              </div>
              
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsPaymentModalOpen(false);
                    setSelectedFee(null);
                  }}
                  disabled={paymentMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={paymentMutation.isPending}
                >
                  {paymentMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>Pay ₹{selectedFee.amount.toLocaleString()}</>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Receipt Modal */}
      <Dialog open={isReceiptModalOpen} onOpenChange={setIsReceiptModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              Receipt details for your fee payment.
            </DialogDescription>
          </DialogHeader>
          
          {selectedPayment && (
            <div className="space-y-4">
              <div className="bg-green-50 p-1 rounded-lg text-center mb-4">
                <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <h3 className="font-medium text-green-800">Payment Successful</h3>
              </div>
              
              <div className="border-t border-b py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Receipt No.</h3>
                    <p className="font-medium">{selectedPayment.id}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Payment Date</h3>
                    <p className="font-medium">{formatDate(selectedPayment.paymentDate)}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Amount Paid</h3>
                    <p className="font-medium">₹{selectedPayment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Payment Method</h3>
                    <p className="font-medium">{selectedPayment.paymentMethod}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Transaction ID</h3>
                    <p className="font-medium">{selectedPayment.transactionId || "N/A"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <Badge className="bg-green-100 text-green-800">
                      Paid
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  This is an electronically generated receipt and does not require a physical signature.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    toast({
                      title: "Receipt download",
                      description: "This feature would download the receipt in a production environment.",
                    });
                  }}
                >
                  <Download className="mr-2 h-4 w-4" /> Download Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
