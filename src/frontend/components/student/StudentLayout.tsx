import { Outlet } from "react-router-dom";
import { StudentPortalGuard } from "@/frontend/components/guards/StudentPortalGuard";
import { StudentHeader } from "./StudentHeader";

export const StudentLayout = () => {
  return (
    <StudentPortalGuard>
      <div className="min-h-screen flex flex-col bg-muted">
        <StudentHeader />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </StudentPortalGuard>
  );
};
