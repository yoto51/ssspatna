import { useQuery } from "@tanstack/react-query";
import { Notice } from "@shared/schema";
import { Link } from "wouter";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function NoticeBoard() {
  const { data: notices, isLoading, error } = useQuery<Notice[]>({
    queryKey: ["/api/notices/recent"],
  });

  if (error) {
    return (
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>Error loading notices. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  const getBadgeColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "academic":
        return "bg-primary-100 text-primary-800";
      case "event":
        return "bg-orange-100 text-orange-800";
      case "administrative":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getBorderColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "academic":
        return "border-l-4 border-primary-600";
      case "event":
        return "border-l-4 border-orange-500";
      case "administrative":
        return "border-l-4 border-green-600";
      default:
        return "border-l-4 border-gray-400";
    }
  };

  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Latest Notices</h2>
          <Link href="/notices" className="text-primary hover:text-primary-800 font-medium flex items-center">
            View All <span className="ml-1">→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            // Skeleton loaders for loading state
            Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="bg-white rounded-xl shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-24 mt-4" />
                  </CardContent>
                </Card>
              ))
          ) : notices && notices.length > 0 ? (
            notices.map((notice) => (
              <Card
                key={notice.id}
                className={`bg-white rounded-xl shadow-sm ${getBorderColor(notice.category)}`}
              >
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <Badge variant="outline" className={getBadgeColor(notice.category)}>
                      {notice.category}
                    </Badge>
                    <span className="text-gray-500 text-sm">
                      {format(new Date(notice.date), "MMM d, yyyy")}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{notice.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{notice.content}</p>
                  <Link 
                    href={`/notices#notice-${notice.id}`}
                    className="mt-4 inline-block text-primary hover:text-primary-800 text-sm font-medium"
                  >
                    Read More
                  </Link>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-3 text-center py-8">
              <p className="text-gray-500">No notices available at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
