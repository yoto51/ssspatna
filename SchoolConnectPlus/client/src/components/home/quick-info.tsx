import { GraduationCap, UserRound, Users } from "lucide-react";

export function QuickInfo() {
  const features = [
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: "Academic Excellence",
      description: "Our curriculum is designed to challenge students while providing the support they need to excel.",
      color: "text-primary",
    },
    {
      icon: <UserRound className="h-8 w-8" />,
      title: "Student Development",
      description: "We focus on holistic growth, nurturing both academic abilities and personal character.",
      color: "text-green-600",
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: "Vibrant Community",
      description: "Join our diverse and inclusive community that celebrates achievements and encourages growth.",
      color: "text-orange-500",
    },
  ];

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="bg-gray-50 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`mb-4 ${feature.color} text-3xl`}>{feature.icon}</div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
