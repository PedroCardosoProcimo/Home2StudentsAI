import { useLocation } from "react-router-dom";
import { useAdminAuth } from "@/frontend/contexts/AdminAuthContext";
import { User } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/admin": "Dashboard",
  "/admin/residences": "Residences",
  "/admin/room-types": "Room Types",
  "/admin/bookings": "Bookings",
  "/admin/contracts": "Contracts",
  "/admin/settings": "Settings",
};

export const AdminHeader = () => {
  const { user } = useAdminAuth();
  const location = useLocation();

  // Handle dynamic routes
  const getTitle = () => {
    const pathname = location.pathname;

    // Check exact matches first
    if (pageTitles[pathname]) {
      return pageTitles[pathname];
    }

    // Handle dynamic contract routes
    if (pathname.startsWith("/admin/contracts/")) {
      if (pathname.endsWith("/edit")) {
        return "Edit Contract";
      } else if (pathname === "/admin/contracts/new") {
        return "Create Contract";
      } else {
        return "Contract Details";
      }
    }

    // Handle dynamic regulation routes
    if (pathname.match(/\/admin\/residences\/[^/]+\/regulations/)) {
      return "Regulations";
    }

    return "Admin";
  };

  const title = getTitle();

  return (
    <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-foreground ml-12 lg:ml-0">{title}</h1>

      <div className="flex items-center gap-2 text-muted-foreground">
        <User className="h-4 w-4" />
        <span className="text-sm">{user?.email}</span>
      </div>
    </header>
  );
};
