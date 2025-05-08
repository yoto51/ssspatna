import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { LoginModal } from "@/components/modals/login-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, LogOut, Menu, X } from "lucide-react";

export function Header() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/about", label: "About Us" },
    { href: "/admission", label: "Admission" },
    { href: "/gallery", label: "Gallery" },
    { href: "/notices", label: "Notices" },
    { href: "/contact", label: "Contact Us" },
  ];

  const isDashboardActive = location.startsWith("/student") || location.startsWith("/admin");

  return (
    <>
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between py-4">
            {/* Logo and School Name */}
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer">
                <div className="h-10 w-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">
                  SSS
                </div>
                <div>
                  <h1 className="text-lg md:text-xl font-bold text-primary">St. Stephen School Patna</h1>
                  <p className="text-xs text-gray-500 hidden md:block">Excellence in Education Since 1982</p>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`${
                    location === link.href ? "text-primary font-medium" : "text-gray-600"
                  } hover:text-primary transition-colors`}
                >
                  {link.label}
                </Link>
              ))}
              
              {user && user.role === "student" && (
                <Link 
                  href="/student"
                  className={`${
                    isDashboardActive && user.role === "student" ? "text-primary font-medium" : "text-gray-600"
                  } hover:text-primary transition-colors`}
                >
                  Dashboard
                </Link>
              )}
              
              {user && user.role === "admin" && (
                <Link 
                  href="/admin"
                  className={`${
                    isDashboardActive && user.role === "admin" ? "text-primary font-medium" : "text-gray-600"
                  } hover:text-primary transition-colors`}
                >
                  Admin Panel
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              className="md:hidden text-gray-500 hover:text-primary focus:outline-none"
              onClick={toggleMobileMenu}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>

            {/* Login/User Button */}
            <div className="hidden md:block">
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {user.fullName}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {user.role === "student" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/student" className="w-full">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/student/academic" className="w-full">Academic Records</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/student/fees" className="w-full">Fee Status</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/student/notices" className="w-full">Notices</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {user.role === "admin" && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link href="/admin" className="w-full">Dashboard</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/notices" className="w-full">Manage Notices</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/gallery" className="w-full">Manage Gallery</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/achievements" className="w-full">Manage Achievements</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/inquiries" className="w-full">Student Inquiries</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/admin/payments" className="w-full">Payment Status</Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-500 hover:text-red-700 cursor-pointer">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  className="flex items-center bg-primary text-white hover:bg-primary/90"
                  onClick={() => setLoginModalOpen(true)}
                >
                  <User className="mr-2 h-4 w-4" /> Login
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 shadow-lg">
            <div className="container mx-auto px-4 py-3 space-y-3">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`block py-2 ${
                    location === link.href ? "text-primary font-medium" : "text-gray-600"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {user && user.role === "student" && (
                <Link 
                  href="/student"
                  className={`block py-2 ${
                    isDashboardActive && user.role === "student" ? "text-primary font-medium" : "text-gray-600"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
              )}
              
              {user && user.role === "admin" && (
                <Link 
                  href="/admin"
                  className={`block py-2 ${
                    isDashboardActive && user.role === "admin" ? "text-primary font-medium" : "text-gray-600"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Admin Panel
                </Link>
              )}
              
              {user ? (
                <>
                  <div className="pt-2 border-t border-gray-100">
                    <div className="mb-2 text-sm font-medium text-gray-500">
                      Logged in as {user.fullName}
                    </div>
                    <Button 
                      variant="destructive" 
                      className="w-full"
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> Logout
                    </Button>
                  </div>
                </>
              ) : (
                <Button
                  className="w-full bg-primary text-white"
                  onClick={() => {
                    setLoginModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                >
                  <User className="mr-2 h-4 w-4" /> Login
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </>
  );
}
