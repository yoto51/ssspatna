import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertInquirySchema } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";

interface AdmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Create a modified schema with client-side validations
const admissionInquirySchema = z.object({
  studentName: z.string().min(3, "Name must be at least 3 characters"),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.string().min(1, "Please select a gender"),
  applyingForClass: z.string().min(1, "Please select a class"),
  previousSchool: z.string().optional(),
  parentName: z.string().min(3, "Name must be at least 3 characters"),
  relationship: z.string().min(1, "Please select a relationship"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(10, "Address must be at least 10 characters"),
  referenceSource: z.string().optional(),
  reason: z.string().optional(),
  specialNeeds: z.string().optional(),
  terms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions",
  }),
});

type AdmissionFormValues = z.infer<typeof admissionInquirySchema>;

export function AdmissionModal({ isOpen, onClose }: AdmissionModalProps) {
  const { toast } = useToast();
  
  const form = useForm<AdmissionFormValues>({
    resolver: zodResolver(admissionInquirySchema),
    defaultValues: {
      studentName: "",
      dob: "",
      gender: "",
      applyingForClass: "",
      previousSchool: "",
      parentName: "",
      relationship: "",
      email: "",
      phone: "",
      address: "",
      referenceSource: "",
      reason: "",
      specialNeeds: "",
      terms: false,
    },
  });

  const admissionMutation = useMutation({
    mutationFn: async (data: Omit<AdmissionFormValues, "terms">) => {
      const res = await apiRequest("POST", "/api/inquiries", data);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted Successfully",
        description: "Thank you for your interest in Trinity International School. We will contact you shortly.",
      });
      form.reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Submission Error",
        description: error.message || "There was an error submitting your application. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: AdmissionFormValues) => {
    // Remove terms field as it's not needed in the API
    const { terms, ...submissionData } = values;
    admissionMutation.mutate(submissionData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Admission Inquiry Form</DialogTitle>
        </DialogHeader>
        
        <p className="text-gray-600 mb-6">
          Please fill out the form below to initiate the admission process. Our team will contact you shortly with further details.
        </p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Student Information Section */}
            <div>
              <h4 className="font-medium text-gray-800 mb-4 pb-2 border-b">Student Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="studentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name <span className="text-red-600">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter student's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dob"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth <span className="text-red-600">*</span></FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender <span className="text-red-600">*</span></FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="applyingForClass"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Applying for Class <span className="text-red-600">*</span></FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Class" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="nursery">Nursery</SelectItem>
                          <SelectItem value="kg">Kindergarten</SelectItem>
                          <SelectItem value="1">Class 1</SelectItem>
                          <SelectItem value="2">Class 2</SelectItem>
                          <SelectItem value="3">Class 3</SelectItem>
                          <SelectItem value="4">Class 4</SelectItem>
                          <SelectItem value="5">Class 5</SelectItem>
                          <SelectItem value="6">Class 6</SelectItem>
                          <SelectItem value="7">Class 7</SelectItem>
                          <SelectItem value="8">Class 8</SelectItem>
                          <SelectItem value="9">Class 9</SelectItem>
                          <SelectItem value="10">Class 10</SelectItem>
                          <SelectItem value="11">Class 11</SelectItem>
                          <SelectItem value="12">Class 12</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="previousSchool"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Previous School (if any)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter previous school name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Parent/Guardian Information Section */}
            <div>
              <h4 className="font-medium text-gray-800 mb-4 pb-2 border-b">Parent/Guardian Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="parentName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name <span className="text-red-600">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter parent/guardian's name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="relationship"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Relationship to Student <span className="text-red-600">*</span></FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Relationship" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="father">Father</SelectItem>
                          <SelectItem value="mother">Mother</SelectItem>
                          <SelectItem value="guardian">Guardian</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address <span className="text-red-600">*</span></FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter email address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number <span className="text-red-600">*</span></FormLabel>
                      <FormControl>
                        <Input placeholder="Enter phone number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address <span className="text-red-600">*</span></FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter complete address" rows={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Additional Questions Section */}
            <div>
              <h4 className="font-medium text-gray-800 mb-4 pb-2 border-b">Additional Information</h4>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="referenceSource"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How did you hear about us?</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Please select" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="website">School Website</SelectItem>
                          <SelectItem value="social-media">Social Media</SelectItem>
                          <SelectItem value="friend">Friend/Family</SelectItem>
                          <SelectItem value="newspaper">Newspaper</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Why do you want to join our school?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please share your reasons for choosing our school" 
                          rows={3} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="specialNeeds"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Does the student have any special needs or requirements?</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Please share any information that will help us better support the student" 
                          rows={2} 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Agreement Section */}
            <FormField
              control={form.control}
              name="terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange} 
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the <a href="#" className="text-primary hover:text-primary/90">Terms and Conditions</a> and <a href="#" className="text-primary hover:text-primary/90">Privacy Policy</a>.
                    </FormLabel>
                    <FormDescription>
                      By submitting this form, I consent to the school contacting me regarding the admission process.
                    </FormDescription>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary/90"
              disabled={admissionMutation.isPending}
            >
              {admissionMutation.isPending ? "Submitting..." : "Submit Application"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
