import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { CheckCircle } from "lucide-react";

export function AboutPreview() {
  const features = [
    {
      title: "CBSE Affiliated",
      description: "Recognized by the Central Board of Secondary Education",
    },
    {
      title: "Experienced Faculty",
      description: "Dedicated teachers with extensive experience in education",
    },
    {
      title: "Modern Infrastructure",
      description: "State-of-the-art facilities to enhance learning experiences",
    },
  ];

  return (
    <section id="about" className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="order-2 lg:order-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              About Trinity International School
            </h2>
            <p className="text-gray-600 mb-4">
              Founded in 2008, Trinity International School stands as a beacon of educational
              excellence, committed to nurturing young minds and fostering holistic development.
            </p>
            <p className="text-gray-600 mb-6">
              Our mission is to provide a comprehensive education that balances academic rigor with
              character development, preparing students to become responsible global citizens.
            </p>

            <div className="space-y-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-800">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button asChild className="mt-6 bg-primary hover:bg-primary/90 text-white">
              <Link href="/about">
                Learn More About Us <span className="ml-2">→</span>
              </Link>
            </Button>
          </div>

          <div className="order-1 lg:order-2 rounded-xl overflow-hidden shadow-lg">
            <img
              src="https://pixabay.com/get/g8ce32615f63249eb4cb241817937486a6761e8d44162069eb0eeba9d8cf127a3b6eb8e0f3790e3f65bbeca313ea7bb35a39f67a18340dba2370659cb0a04b88f_1280.jpg"
              alt="Trinity International School building"
              className="w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
