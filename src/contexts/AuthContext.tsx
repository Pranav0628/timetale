
import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// API base URL - update this to your PHP API endpoint
const API_URL = "http://localhost/timetable/api";

// Enable this for frontend testing without a backend
const ENABLE_MOCKUP = true; // Changed to true to enable mockup mode

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  // Check for saved auth on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("timetale-user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user", error);
        localStorage.removeItem("timetale-user");
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting to login with API URL:", API_URL);
      
      // Mockup mode for frontend testing without backend
      if (ENABLE_MOCKUP) {
        console.log("Using mockup login mode");
        
        // Demo credentials check
        if (email === "admin@timetale.com" && password === "admin123") {
          const userData = {
            id: "1",
            name: "Admin User",
            role: "admin",
          };
          
          setUser(userData);
          localStorage.setItem("timetale-user", JSON.stringify(userData));
          
          toast({
            title: "Login successful (Mock Mode)",
            description: `Welcome back, ${userData.name}!`,
          });
          
          return true;
        } else {
          toast({
            title: "Login failed",
            description: "Invalid email or password",
            variant: "destructive",
          });
          
          return false;
        }
      }
      
      // Regular mode - connects to actual backend
      // Check server availability first
      const timeout = 5000; // 5 seconds timeout
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(`${API_URL}/auth/login.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        signal: controller.signal
      }).finally(() => {
        clearTimeout(timeoutId);
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Login response:", data);
      
      if (data.success && data.user) {
        const userData = {
          id: data.user.id,
          name: data.user.name,
          role: data.user.role,
        };
        
        setUser(userData);
        localStorage.setItem("timetale-user", JSON.stringify(userData));
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${userData.name}!`,
        });
        
        return true;
      } else {
        toast({
          title: "Login failed",
          description: data.message || "Invalid email or password",
          variant: "destructive",
        });
        
        return false;
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.error("Request timeout - server might be down");
          toast({
            title: "Connection timeout",
            description: "The server is not responding. Please check your server configuration.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Connection failed",
            description: "Could not connect to the server. Please ensure it's running and accessible.",
            variant: "destructive",
          });
        }
      }
      throw error; // Rethrow to be caught by the login form component
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("timetale-user");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};
