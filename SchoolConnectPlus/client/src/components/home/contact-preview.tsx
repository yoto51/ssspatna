import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Map, Phone, Mail, Clock, Facebook, Twitter, Instagram, Youtube } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const contactFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export function ContactPreview() {
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
  });

  const contactMutation = useMutation({
    mutationFn: async (data: ContactFormValues) => {
      const res = await apiRequest("POST", "/api/contact", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });
      reset();
    },
    onError: (error) => {
      toast({
        title: "Submission Error",
        description: error.message || "There was an error sending your message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ContactFormValues) => {
    contactMutation.mutate(data);
  };

  return (
    <section id="contact" className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <Card className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Contact Form */}
            <CardContent className="p-8 lg:col-span-3">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Get in Touch</h2>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="Enter your name"
                      {...register("name")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      {...register("email")}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Enter message subject"
                    {...register("subject")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  {errors.subject && (
                    <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Your Message
                  </Label>
                  <Textarea
                    id="message"
                    rows={4}
                    placeholder="Type your message here..."
                    {...register("message")}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
                  />
                  {errors.message && (
                    <p className="mt-1 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>
                <Button 
                  type="submit" 
                  className="w-full md:w-auto bg-primary hover:bg-primary/90 text-white"
                  disabled={isSubmitting || contactMutation.isPending}
                >
                  {contactMutation.isPending ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </CardContent>

            {/* Contact Info */}
            <div className="bg-primary text-white p-8 lg:col-span-2">
              <h3 className="text-xl font-semibold mb-6">Contact Information</h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center">
                    <Map size={20} />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">Address</h4>
                    <p className="text-primary-100 text-sm mt-1">
                      123 Education Lane, Knowledge City
                      <br />
                      State - 400001
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center">
                    <Phone size={20} />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">Phone</h4>
                    <p className="text-primary-100 text-sm mt-1">
                      +91 98765 43210
                      <br />
                      +91 12345 67890
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center">
                    <Mail size={20} />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">Email</h4>
                    <p className="text-primary-100 text-sm mt-1">
                      info@trinityschool.edu
                      <br />
                      admissions@trinityschool.edu
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center">
                    <Clock size={20} />
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium">Office Hours</h4>
                    <p className="text-primary-100 text-sm mt-1">
                      Monday - Friday: 8:00 AM - 4:00 PM
                      <br />
                      Saturday: 9:00 AM - 12:00 PM
                    </p>
                  </div>
                </div>

                <div className="pt-4">
                  <h4 className="font-medium mb-3">Connect with Us</h4>
                  <div className="flex space-x-3">
                    <a
                      href="#"
                      className="h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center hover:bg-primary-600 transition-colors"
                      aria-label="Facebook"
                    >
                      <Facebook size={20} />
                    </a>
                    <a
                      href="#"
                      className="h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center hover:bg-primary-600 transition-colors"
                      aria-label="Twitter"
                    >
                      <Twitter size={20} />
                    </a>
                    <a
                      href="#"
                      className="h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center hover:bg-primary-600 transition-colors"
                      aria-label="Instagram"
                    >
                      <Instagram size={20} />
                    </a>
                    <a
                      href="#"
                      className="h-10 w-10 rounded-full bg-primary-700 flex items-center justify-center hover:bg-primary-600 transition-colors"
                      aria-label="YouTube"
                    >
                      <Youtube size={20} />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
