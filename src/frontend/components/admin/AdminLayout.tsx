import { Outlet } from "react-router-dom";
import { AdminGuard } from "@/frontend/components/guards/AdminGuard";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";

export const AdminLayout = () => {
  return (
    <AdminGuard>
      <div className="min-h-screen flex bg-muted">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1 p-6">
            <div className="max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </AdminGuard>
  );
};
