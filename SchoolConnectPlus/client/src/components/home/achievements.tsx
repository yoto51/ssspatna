import { useQuery } from "@tanstack/react-query";
import { Achievement } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

export function Achievements() {
  const { data: achievements, isLoading, error } = useQuery<Achievement[]>({
    queryKey: ["/api/achievements"],
  });

  if (error) {
    return (
      <section className="py-12 bg-gradient-to-br from-primary-800 to-primary-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center text-red-200">
            <p>Error loading achievements. Please try again later.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-gradient-to-br from-primary-800 to-primary-900 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold mb-2">Our Achievements</h2>
          <p className="max-w-2xl mx-auto text-primary-100">
            Celebrating excellence in academics, sports, and extracurricular activities
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center"
                  >
                    <Skeleton className="h-12 w-20 bg-white/20 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 bg-white/20 mx-auto" />
                  </div>
                ))
            : achievements &&
              achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center hover:bg-white/20 transition-colors"
                >
                  <div className="text-4xl font-bold mb-2 text-orange-400">
                    {achievement.value}
                  </div>
                  <p className="text-primary-100">{achievement.description}</p>
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
