import { useState, useEffect } from "react";
import { useAuth, loginSchema, registerSchema } from "@/hooks/use-auth";
import { Redirect } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Helmet } from "react-helmet";

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const { user, loginMutation, registerMutation } = useAuth();

  // Login form
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onLoginSubmit = (values: z.infer<typeof loginSchema>) => {
    loginMutation.mutate(values);
  };

  // Register form
  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      phone: "",
      address: "",
      role: "student", // Default role is student
    },
  });

  const onRegisterSubmit = (values: z.infer<typeof registerSchema>) => {
    registerMutation.mutate(values);
  };

  // Redirect to home if already logged in
  if (user) {
    if (user.role === "admin") {
      return <Redirect to="/admin" />;
    } else {
      return <Redirect to="/student" />;
    }
  }

  return (
    <>
      <Helmet>
        <title>Login or Register - St. Stephen School</title>
        <meta 
          name="description" 
          content="Login to access your student dashboard or register for a new account at St. Stephen School." 
        />
      </Helmet>
      
      <div className="flex flex-col min-h-screen">
        <Header />
        
        <main className="flex-grow py-12 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row gap-8 items-stretch max-w-6xl mx-auto">
              {/* Auth Forms */}
              <div className="w-full md:w-1/2">
                <Card className="h-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-2xl">Welcome to St. Stephen School</CardTitle>
                    <CardDescription>
                      Login to your account or register as a new student
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent>
                    <Tabs 
                      value={activeTab} 
                      onValueChange={(value) => setActiveTab(value as "login" | "register")}
                      className="w-full"
                    >
                      <TabsList className="grid w-full grid-cols-2 mb-6">
                        <TabsTrigger value="login">Login</TabsTrigger>
                        <TabsTrigger value="register">Register</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="login" className="mt-0">
                        <Form {...loginForm}>
                          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                            <FormField
                              control={loginForm.control}
                              name="username"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Username</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your username" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={loginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <Input type="password" placeholder="Enter your password" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <Button 
                              type="submit" 
                              className="w-full bg-primary hover:bg-primary/90 text-white"
                              disabled={loginMutation.isPending}
                            >
                              {loginMutation.isPending ? "Logging in..." : "Login"}
                            </Button>
                          </form>
                        </Form>
                        
                        <div className="mt-4 text-center text-sm text-gray-500">
                          <p>
                            Don't have an account?{" "}
                            <button 
                              onClick={() => setActiveTab("register")}
                              className="text-primary hover:underline"
                            >
                              Register here
                            </button>
                          </p>
                        </div>
                      </TabsContent>
                      
                      <TabsContent value="register" className="mt-0">
                        <Form {...registerForm}>
                          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                            <FormField
                              control={registerForm.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your full name" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={registerForm.control}
                                name="username"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                      <Input placeholder="Choose a username" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={registerForm.control}
                                name="email"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                      <Input type="email" placeholder="Enter your email" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <FormField
                                control={registerForm.control}
                                name="password"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="Create a password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              
                              <FormField
                                control={registerForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                      <Input type="password" placeholder="Confirm your password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                            
                            <FormField
                              control={registerForm.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your phone number" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <FormField
                              control={registerForm.control}
                              name="address"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Address</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Enter your address" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            {/* Hidden field for role - defaulted to "student" */}
                            <input type="hidden" {...registerForm.register("role")} value="student" />
                            
                            <Button 
                              type="submit" 
                              className="w-full bg-primary hover:bg-primary/90 text-white"
                              disabled={registerMutation.isPending}
                            >
                              {registerMutation.isPending ? "Registering..." : "Register"}
                            </Button>
                          </form>
                        </Form>
                        
                        <div className="mt-4 text-center text-sm text-gray-500">
                          <p>
                            Already have an account?{" "}
                            <button 
                              onClick={() => setActiveTab("login")}
                              className="text-primary hover:underline"
                            >
                              Login here
                            </button>
                          </p>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
              
              {/* Auth Hero Section */}
              <div className="w-full md:w-1/2 bg-primary rounded-xl p-8 text-white flex flex-col justify-center">
                <h1 className="text-3xl font-bold mb-4">Your Educational Journey Starts Here</h1>
                <p className="mb-6">
                  St. Stephen School provides a comprehensive education that balances academic rigor 
                  with character development, preparing students to become responsible global citizens.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Access Your Academic Records</h3>
                      <p className="text-sm text-primary-100">View your grades, assignments, and class schedule</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Track Fee Payments</h3>
                      <p className="text-sm text-primary-100">Check fee status, payment history, and due dates</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold">Stay Updated</h3>
                      <p className="text-sm text-primary-100">Receive personalized notices and important updates</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 bg-white/10 p-4 rounded-lg">
                  <p className="italic text-sm">
                    "Education is the passport to the future, for tomorrow belongs to those who prepare for it today."
                  </p>
                  <p className="text-sm mt-2 font-medium">- Malcolm X</p>
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </>
  );
}
