import { Toaster } from "@/frontend/components/ui/toaster";
import { Toaster as Sonner } from "@/frontend/components/ui/sonner";
import { TooltipProvider } from "@/frontend/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/frontend/contexts/AdminAuthContext";
import { StudentAuthProvider } from "@/frontend/contexts/StudentAuthContext";

// Public pages
import Index from "./pages/Index";
import Residences from "./pages/Residences";
import ResidenceDetail from "./pages/ResidenceDetail";
import RoomDetail from "./pages/RoomDetail";
import Book from "./pages/Book";
import About from "./pages/About";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

// Admin pages
import { AdminLayout } from "./components/admin/AdminLayout";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminResidences from "./pages/admin/AdminResidences";
import AdminRegulations from "./pages/admin/AdminRegulations";
import AdminRoomTypes from "./pages/admin/AdminRoomTypes";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminSettings from "./pages/admin/AdminSettings";

// Student pages
import StudentLogin from "./pages/StudentLogin";
import StudentPortal from "./pages/StudentPortal";
import { StudentPortalGuard } from "./components/guards/StudentPortalGuard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AdminAuthProvider>
          <StudentAuthProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/residences" element={<Residences />} />
              <Route path="/residences/:id/rooms/:roomId" element={<RoomDetail />} />
              <Route path="/residences/:id" element={<ResidenceDetail />} />
              <Route path="/book" element={<Book />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />

              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="residences" element={<AdminResidences />} />
                <Route path="residences/:id/regulations" element={<AdminRegulations />} />
                <Route path="room-types" element={<AdminRoomTypes />} />
                <Route path="bookings" element={<AdminBookings />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>

              {/* Student routes */}
              <Route path="/student/login" element={<StudentLogin />} />
              <Route
                path="/student/portal"
                element={
                  <StudentPortalGuard>
                    <StudentPortal />
                  </StudentPortalGuard>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </StudentAuthProvider>
        </AdminAuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
