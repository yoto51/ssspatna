import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Helmet } from "react-helmet";
import { Loader2, Users, Mail, CalendarClock, School, BarChart } from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { data: inquiries, isLoading: isLoadingInquiries } = useQuery({
    queryKey: ["/api/admin/inquiries"],
  });

  const { data: contactMessages, isLoading: isLoadingMessages } = useQuery({
    queryKey: ["/api/admin/contact-messages"],
  });

  const { data: notices, isLoading: isLoadingNotices } = useQuery({
    queryKey: ["/api/notices"],
  });

  const { data: gallery, isLoading: isLoadingGallery } = useQuery({
    queryKey: ["/api/gallery"],
  });

  const isLoading = isLoadingInquiries || isLoadingMessages || isLoadingNotices || isLoadingGallery;

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - St. Stephen School Patna</title>
        <meta 
          name="description" 
          content="Admin dashboard for St. Stephen School Patna management system." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-10 bg-gray-50">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Admission Inquiries</p>
                        <h3 className="text-2xl font-bold">{inquiries?.length || 0}</h3>
                        <p className="text-xs text-gray-500">Total inquiries</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                        <Mail className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Contact Messages</p>
                        <h3 className="text-2xl font-bold">{contactMessages?.length || 0}</h3>
                        <p className="text-xs text-gray-500">
                          {contactMessages?.filter(msg => msg.status === "unread").length || 0} unread
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                        <CalendarClock className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Notices</p>
                        <h3 className="text-2xl font-bold">{notices?.length || 0}</h3>
                        <p className="text-xs text-gray-500">Published notices</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-6 flex items-center">
                      <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center mr-4">
                        <School className="h-6 w-6 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Gallery</p>
                        <h3 className="text-2xl font-bold">{gallery?.length || 0}</h3>
                        <p className="text-xs text-gray-500">Media items</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Recent Inquiries */}
                  <Card className="lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle>Recent Admission Inquiries</CardTitle>
                      <CardDescription>Latest inquiries from prospective students</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {inquiries && inquiries.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <th className="px-4 py-3">Name</th>
                                <th className="px-4 py-3">Class</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {inquiries.slice(0, 5).map((inquiry) => (
                                <tr key={inquiry.id}>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <div className="font-medium">{inquiry.studentName}</div>
                                    <div className="text-sm text-gray-500">{inquiry.email}</div>
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    {inquiry.applyingForClass}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                                    {new Date(inquiry.inquiryDate).toLocaleDateString()}
                                  </td>
                                  <td className="px-4 py-3 whitespace-nowrap">
                                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                                      inquiry.status === "pending" 
                                        ? "bg-yellow-100 text-yellow-800" 
                                        : inquiry.status === "approved"
                                        ? "bg-green-100 text-green-800"
                                        : "bg-red-100 text-red-800"
                                    }`}>
                                      {inquiry.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No admission inquiries available.
                        </div>
                      )}
                      
                      <div className="mt-4 text-right">
                        <Link href="/admin/inquiries" className="text-primary hover:text-primary/90 text-sm font-medium">
                          View All Inquiries
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Recent Messages */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle>Recent Messages</CardTitle>
                      <CardDescription>Latest contact messages</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {contactMessages && contactMessages.length > 0 ? (
                        <div className="space-y-4">
                          {contactMessages.slice(0, 3).map((message) => (
                            <div key={message.id} className="border-b pb-4 last:border-0 last:pb-0">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium">{message.name}</h4>
                                {message.status === "unread" && (
                                  <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">
                                    New
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500 mb-1">{message.subject}</p>
                              <p className="text-sm text-gray-600 line-clamp-2">{message.message}</p>
                              <div className="text-xs text-gray-500 mt-1">
                                {new Date(message.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          No contact messages available.
                        </div>
                      )}
                      
                      <div className="mt-4 text-right">
                        <Link href="/admin/contact-messages" className="text-primary hover:text-primary/90 text-sm font-medium">
                          View All Messages
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Quick Actions */}
                <h2 className="text-xl font-semibold mt-8 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href="/admin/notices" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-lg mb-2">Manage Notices</h3>
                    <p className="text-sm text-gray-500">Create or edit school notices</p>
                  </Link>
                  
                  <Link href="/admin/gallery" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-lg mb-2">Manage Gallery</h3>
                    <p className="text-sm text-gray-500">Upload and organize school photos</p>
                  </Link>
                  
                  <Link href="/admin/achievements" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-lg mb-2">Manage Achievements</h3>
                    <p className="text-sm text-gray-500">Update school achievements</p>
                  </Link>
                  
                  <Link href="/admin/payments" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                    <h3 className="font-medium text-lg mb-2">Payment Status</h3>
                    <p className="text-sm text-gray-500">Monitor fee payments</p>
                  </Link>
                </div>
              </>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
