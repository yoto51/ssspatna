import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";

import HomePage from "@/pages/home-page";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";

import StudentDashboard from "@/pages/student/dashboard";
import StudentAcademic from "@/pages/student/academic";
import StudentFees from "@/pages/student/fees";
import StudentNotices from "@/pages/student/notices";

import AdminDashboard from "@/pages/admin/dashboard";
import AdminGalleryManagement from "@/pages/admin/gallery-management";
import AdminAchievementManagement from "@/pages/admin/achievement-management";
import AdminNoticeManagement from "@/pages/admin/notice-management";
import AdminInquiryManagement from "@/pages/admin/inquiry-management";
import AdminPaymentManagement from "@/pages/admin/payment-management";

import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/" component={HomePage} />
      <Route path="/auth" component={AuthPage} />
      
      {/* Student Routes */}
      <Route path="/student">
        <ProtectedRoute path="/student" allowedRoles={["student"]} component={StudentDashboard} />
      </Route>
      <Route path="/student/academic">
        <ProtectedRoute path="/student/academic" allowedRoles={["student"]} component={StudentAcademic} />
      </Route>
      <Route path="/student/fees">
        <ProtectedRoute path="/student/fees" allowedRoles={["student"]} component={StudentFees} />
      </Route>
      <Route path="/student/notices">
        <ProtectedRoute path="/student/notices" allowedRoles={["student"]} component={StudentNotices} />
      </Route>
      
      {/* Admin Routes */}
      <Route path="/admin">
        <ProtectedRoute path="/admin" allowedRoles={["admin"]} component={AdminDashboard} />
      </Route>
      <Route path="/admin/gallery">
        <ProtectedRoute path="/admin/gallery" allowedRoles={["admin"]} component={AdminGalleryManagement} />
      </Route>
      <Route path="/admin/achievements">
        <ProtectedRoute path="/admin/achievements" allowedRoles={["admin"]} component={AdminAchievementManagement} />
      </Route>
      <Route path="/admin/notices">
        <ProtectedRoute path="/admin/notices" allowedRoles={["admin"]} component={AdminNoticeManagement} />
      </Route>
      <Route path="/admin/inquiries">
        <ProtectedRoute path="/admin/inquiries" allowedRoles={["admin"]} component={AdminInquiryManagement} />
      </Route>
      <Route path="/admin/payments">
        <ProtectedRoute path="/admin/payments" allowedRoles={["admin"]} component={AdminPaymentManagement} />
      </Route>
      
      {/* Fallback Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </AuthProvider>
  );
}

export default App;
