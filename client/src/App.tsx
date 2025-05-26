import { useEffect, useState } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/toast";
import { useAuth } from "@/hooks/use-auth";
import AuthPage from "@/pages/auth";
import Dashboard from "@/pages/dashboard";

function App() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && user ? (
          <Dashboard user={user} onLogout={logout} />
        ) : (
          <AuthPage onLogin={login} />
        )}
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
