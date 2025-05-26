import { useState, useEffect } from "react";
import { User } from "@shared/schema";
import { getStoredUser, setStoredUser } from "@/lib/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
    setIsLoading(false);
  }, []);

  const login = (userData: User) => {
    setStoredUser(userData);
    setUser(userData);
  };

  const logout = () => {
    setStoredUser(null);
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setStoredUser(updatedUser);
      setUser(updatedUser);
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };
}
