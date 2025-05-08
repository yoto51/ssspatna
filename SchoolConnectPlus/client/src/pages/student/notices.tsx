import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { Notice } from "@shared/schema";
import { Loader2, AlertTriangle, Bell, CalendarClock } from "lucide-react";
import { format } from "date-fns";
import { Helmet } from "react-helmet";

export default function StudentNotices() {
  const { user } = useAuth();

  // Fetch notices
  const { data: notices, isLoading } = useQuery<Notice[]>({
    queryKey: ["/api/notices"],
  });

  // Group notices by category
  const noticesByCategory: Record<string, Notice[]> = {};
  if (notices) {
    notices.forEach(notice => {
      if (!noticesByCategory[notice.category]) {
        noticesByCategory[notice.category] = [];
      }
      noticesByCategory[notice.category].push(notice);
    });
  }

  // Get important notices
  const importantNotices = notices?.filter(notice => notice.important) || [];

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  // Get category badge color
  const getCategoryBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "event":
        return "bg-orange-100 text-orange-800";
      case "administrative":
        return "bg-green-100 text-green-800";
      case "sports":
        return "bg-purple-100 text-purple-800";
      case "cultural":
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <>
      <Helmet>
        <title>Notices - Trinity International School</title>
        <meta 
          name="description" 
          content="Stay updated with the latest notices and announcements from Trinity International School." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">Notices & Announcements</h1>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {/* Important Notices */}
                {importantNotices.length > 0 && (
                  <Card className="mb-6 border-l-4 border-red-500">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Important Notices
                      </CardTitle>
                      <CardDescription>
                        Please read these important announcements carefully
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {importantNotices.map((notice) => (
                          <div key={notice.id} className="p-4 bg-red-50 rounded-lg border border-red-100">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-lg text-red-800">{notice.title}</h3>
                              <Badge className={getCategoryBadgeColor(notice.category)}>
                                {notice.category}
                              </Badge>
                            </div>
                            <p className="text-gray-700 whitespace-pre-line">{notice.content}</p>
                            <div className="flex items-center mt-3 text-sm text-gray-500">
                              <CalendarClock className="h-4 w-4 mr-1" />
                              {formatDate(notice.date)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Notices by Category */}
                {Object.keys(noticesByCategory).length > 0 ? (
                  <Tabs defaultValue={Object.keys(noticesByCategory)[0]} className="space-y-6">
                    <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full max-w-lg mx-auto">
                      {Object.keys(noticesByCategory).map((category) => (
                        <TabsTrigger key={category} value={category}>{category}</TabsTrigger>
                      ))}
                    </TabsList>
                    
                    {Object.entries(noticesByCategory).map(([category, categoryNotices]) => (
                      <TabsContent key={category} value={category} className="space-y-4">
                        <h2 className="text-xl font-semibold mb-4">{category} Notices</h2>
                        
                        {categoryNotices.map((notice) => (
                          <Card key={notice.id} id={`notice-${notice.id}`} className={notice.important ? 'border-l-4 border-red-500' : ''}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-start">
                                <CardTitle>{notice.title}</CardTitle>
                                {notice.important && (
                                  <Badge className="bg-red-100 text-red-800">Important</Badge>
                                )}
                              </div>
                              <CardDescription>
                                Posted on {formatDate(notice.date)}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="whitespace-pre-line">{notice.content}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </TabsContent>
                    ))}
                  </Tabs>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>No Notices Available</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        There are no notices available at the moment. Check back later for updates.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
