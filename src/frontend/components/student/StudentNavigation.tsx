import { Link, useLocation } from "react-router-dom";
import { Home, FileText, FolderOpen, User } from "lucide-react";
import { cn } from "@/frontend/lib/utils";

const navItems = [
  { label: "Dashboard", href: "/student/dashboard", icon: Home },
  { label: "My Contract", href: "/student/contract", icon: FileText },
  { label: "Documents", href: "/student/documents", icon: FolderOpen },
  { label: "Profile", href: "/student/profile", icon: User },
];

export const StudentNavigation = () => {
  const location = useLocation();

  return (
    <nav className="flex gap-1">
      {navItems.map((item) => {
        const isActive = location.pathname === item.href;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors rounded-md",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
