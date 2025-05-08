import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export function HeroSection() {
  return (
    <section id="home" className="relative bg-primary text-white">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50 z-10"></div>
      
      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 py-16 md:py-24 flex flex-col items-center text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Welcome to St. Stephen School Patna</h2>
        <p className="text-lg md:text-xl max-w-2xl mb-8">
          Nurturing minds, building character, and inspiring excellence for a bright future.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild size="lg" className="bg-orange-500 hover:bg-orange-600 text-white border-none">
            <Link href="/admission">Apply for Admission</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="bg-white hover:bg-gray-100 text-primary border-white">
            <Link href="/about">Explore Our Programs</Link>
          </Button>
        </div>
      </div>
      
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-900 to-primary-700 -z-10"></div>
    </section>
  );
}
