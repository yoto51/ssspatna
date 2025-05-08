import { useQuery } from "@tanstack/react-query";
import { Gallery } from "@shared/schema";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export function GalleryPreview() {
  const { data: galleryItems, isLoading, error } = useQuery<Gallery[]>({
    queryKey: ["/api/gallery"],
  });

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-500">
            <p>Error loading gallery. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  // Only show the first 3 gallery items for preview
  const previewItems = galleryItems ? galleryItems.slice(0, 3) : [];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Life at Trinity</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Glimpses of our vibrant school environment, activities, and student achievements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading
            ? Array(3)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="rounded-xl overflow-hidden shadow-sm relative">
                    <Skeleton className="w-full h-64" />
                  </div>
                ))
            : previewItems.map((item) => (
                <div
                  key={item.id}
                  className="rounded-xl overflow-hidden shadow-sm group relative"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-70 group-hover:opacity-90 transition-opacity"></div>
                  <div className="absolute bottom-0 left-0 p-4 text-white">
                    <h3 className="font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-200">{item.description}</p>
                  </div>
                </div>
              ))}
        </div>

        <div className="text-center mt-8">
          <Button asChild variant="outline" className="bg-primary-50 text-primary hover:bg-primary-100">
            <Link href="/gallery">
              View Complete Gallery <span className="ml-2">→</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
