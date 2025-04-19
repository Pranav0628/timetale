
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

const API_URL = "http://localhost/timetable/api";
const ENABLE_MOCKUP = true; // Keep mock mode enabled

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  
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
      
      // Try mock login first if enabled
      if (ENABLE_MOCKUP && email === "admin@timetale.com" && password === "admin123") {
        console.log("Mock login successful");
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
      }
      
      // If not mock credentials, try real database login
      const timeout = 10000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      try {
        const response = await fetch(`${API_URL}/auth/login.php`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
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
        clearTimeout(timeoutId);
        throw error;
      }
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          toast({
            title: "Connection timeout",
            description: "The server is not responding. Please try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Connection failed",
            description: "Could not connect to the server. Please try again later.",
            variant: "destructive",
          });
        }
      }
      return false;
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

