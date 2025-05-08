import { Card, CardContent } from "@/components/ui/card";
import { Star, StarHalf } from "lucide-react";

export function Testimonials() {
  const testimonials = [
    {
      name: "Anita Patel",
      role: "Parent of Grade 8 Student",
      initials: "AP",
      text: "The teachers at Trinity are exceptional. They're not just focused on academics but also on developing the overall personality of children.",
      rating: 5,
    },
    {
      name: "Rahul Singh",
      role: "Alumni, Batch of 2019",
      initials: "RS",
      text: "My years at Trinity shaped me into who I am today. The school's emphasis on both academics and extracurriculars prepared me well for college.",
      rating: 4.5,
    },
    {
      name: "Sarika Kumar",
      role: "Current Grade 10 Student",
      initials: "SK",
      text: "I love the supportive environment at Trinity. The teachers encourage us to explore our interests and provide guidance whenever needed.",
      rating: 5,
    },
  ];

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`star-${i}`} className="fill-orange-500 text-orange-500" />);
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half-star" className="fill-orange-500 text-orange-500" />);
    }

    return stars;
  };

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">What Our Community Says</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Hear from our students, parents, and alumni about their experiences at Trinity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="bg-gray-50 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary-200 flex items-center justify-center text-primary font-bold">
                    {testimonial.initials}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-gray-800">{testimonial.name}</h3>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <div className="text-gray-600">
                  <span className="text-2xl text-primary-300 mb-2">"</span>
                  <p className="mb-2">{testimonial.text}</p>
                  <div className="flex text-orange-500">
                    {renderStars(testimonial.rating)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
