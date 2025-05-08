import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Calendar, Book, Receipt, Bell, AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Student, Notice, Fee } from "@shared/schema";
import { format } from "date-fns";
import { Helmet } from "react-helmet";

export default function StudentDashboard() {
  const { user } = useAuth();

  // Fetch student profile
  const { data: student, isLoading: isLoadingStudent } = useQuery<Student>({
    queryKey: ["/api/student/profile"],
  });

  // Fetch fees
  const { data: fees, isLoading: isLoadingFees } = useQuery<(Fee & { payments: any[] })[]>({
    queryKey: ["/api/student/fees"],
  });

  // Fetch notices
  const { data: notices, isLoading: isLoadingNotices } = useQuery<Notice[]>({
    queryKey: ["/api/notices/recent"],
  });
  
  // Count pending fees
  const pendingFeesCount = fees?.filter(fee => fee.status === "pending").length || 0;
  
  // Get upcoming fees
  const upcomingFees = fees?.filter(fee => fee.status === "pending")
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 2) || [];
  
  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };
  
  // Get important notices
  const importantNotices = notices?.filter(notice => notice.important) || [];

  const isLoading = isLoadingStudent || isLoadingFees || isLoadingNotices;

  return (
    <>
      <Helmet>
        <title>Student Dashboard - Trinity International School</title>
        <meta 
          name="description" 
          content="Student dashboard for Trinity International School providing access to academic information, fees, and notices." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Welcome Banner */}
                <div className="bg-gradient-to-r from-primary to-primary-800 rounded-xl text-white p-6 mb-6">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                      <h1 className="text-2xl font-bold">Welcome, {user?.fullName}!</h1>
                      <p className="mt-2">
                        Class {student?.class} {student?.section && `- Section ${student.section}`}
                        {student?.rollNumber && ` | Roll No: ${student.rollNumber}`}
                      </p>
                    </div>
                    <div className="text-center md:text-right">
                      <p className="text-primary-100">Today's Date</p>
                      <p className="text-xl font-semibold">{format(new Date(), "MMMM d, yyyy")}</p>
                    </div>
                  </div>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  {/* Academic Records */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Book className="h-5 w-5 text-blue-600" />
                        Academic Records
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">View your academic performance, grades, and results.</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline">
                        <Link href="/student/academic">View Academic Records</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Fee Status */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Receipt className="h-5 w-5 text-green-600" />
                        Fee Status
                        {pendingFeesCount > 0 && (
                          <Badge className="ml-2 bg-yellow-500">
                            {pendingFeesCount} pending
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Check your fee payment status and history.</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline">
                        <Link href="/student/fees">View Fee Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Notices */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-purple-600" />
                        Notices
                        {importantNotices.length > 0 && (
                          <Badge className="ml-2 bg-red-500">
                            {importantNotices.length} important
                          </Badge>
                        )}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">Stay updated with the latest announcements.</p>
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline">
                        <Link href="/student/notices">View Notices</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                {/* Important Information Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {/* Upcoming Fees */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Upcoming Fee Payments</CardTitle>
                      <CardDescription>Your pending fee payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {upcomingFees.length > 0 ? (
                        <div className="space-y-4">
                          {upcomingFees.map((fee) => (
                            <div key={fee.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
                              <div>
                                <h3 className="font-medium">{fee.term}</h3>
                                <p className="text-sm text-gray-500">Due: {formatDate(fee.dueDate)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-bold text-lg">₹{fee.amount.toLocaleString()}</p>
                                <Badge className="bg-yellow-100 text-yellow-800">
                                  {fee.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500">No pending fees at the moment.</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/student/fees">View All Fees</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  {/* Important Notices */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Important Notices</CardTitle>
                      <CardDescription>Stay updated with school announcements</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {importantNotices.length > 0 ? (
                        <div className="space-y-4">
                          {importantNotices.map((notice) => (
                            <div key={notice.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                              <div className="flex items-start gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                  <h3 className="font-medium">{notice.title}</h3>
                                  <p className="text-sm text-gray-700 line-clamp-2">{notice.content}</p>
                                  <div className="flex justify-between items-center mt-2">
                                    <Badge className="bg-red-100 text-red-800">
                                      {notice.category}
                                    </Badge>
                                    <span className="text-xs text-gray-500">
                                      {formatDate(notice.date)}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500">No important notices at the moment.</p>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button asChild variant="outline" className="w-full">
                        <Link href="/student/notices">View All Notices</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
                
                {/* Academic Calendar */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      Academic Calendar
                    </CardTitle>
                    <CardDescription>Important dates for the academic year</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <h3 className="font-medium text-blue-800">Mid-Term Exams</h3>
                        <p className="text-sm text-gray-700 mt-1">September 10-15, 2023</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <h3 className="font-medium text-green-800">Sports Day</h3>
                        <p className="text-sm text-gray-700 mt-1">November 5, 2023</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                        <h3 className="font-medium text-purple-800">Annual Day</h3>
                        <p className="text-sm text-gray-700 mt-1">December 15, 2023</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
