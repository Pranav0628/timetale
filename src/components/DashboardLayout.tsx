
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavLink, Outlet } from "react-router-dom";
import { LogOut, Menu } from "lucide-react";

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-xl">TimeTale</span>
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-md hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <NavLink
              to="/dashboard"
              end
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/dashboard/teachers"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              Teachers
            </NavLink>
            <NavLink
              to="/dashboard/subjects"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              Subjects
            </NavLink>
            <NavLink
              to="/dashboard/sections"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              Sections
            </NavLink>
            <NavLink
              to="/dashboard/timetable"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`
              }
            >
              Timetable
            </NavLink>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </nav>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="border-t md:hidden">
            <div className="container mx-auto px-4 py-2">
              <nav className="flex flex-col space-y-3 py-2">
                <NavLink
                  to="/dashboard"
                  end
                  className={({ isActive }) =>
                    `px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-gray-100"
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/dashboard/teachers"
                  className={({ isActive }) =>
                    `px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-gray-100"
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Teachers
                </NavLink>
                <NavLink
                  to="/dashboard/subjects"
                  className={({ isActive }) =>
                    `px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-gray-100"
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Subjects
                </NavLink>
                <NavLink
                  to="/dashboard/sections"
                  className={({ isActive }) =>
                    `px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-gray-100"
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sections
                </NavLink>
                <NavLink
                  to="/dashboard/timetable"
                  className={({ isActive }) =>
                    `px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                      isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-gray-100"
                    }`
                  }
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Timetable
                </NavLink>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="justify-start px-2 py-1 h-auto text-sm font-medium text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Logout</span>
                </Button>
              </nav>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 py-6 px-4 container mx-auto">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} TimeTale - Automatic Timetable Generator
        </div>
      </footer>
    </div>
  );
};

export default DashboardLayout;
