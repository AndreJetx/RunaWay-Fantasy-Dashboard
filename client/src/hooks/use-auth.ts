import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

interface AuthUser {
  id: string;
  username: string;
  role: "dm" | "player";
}

async function fetchUser(): Promise<{ user: AuthUser }> {
  const res = await fetch("/api/auth/user");
  if (!res.ok) {
    throw new Error("Not authenticated");
  }
  return res.json();
}

async function logout(): Promise<{ success: boolean }> {
  const res = await fetch("/api/auth/logout", { method: "POST" });
  if (!res.ok) {
    throw new Error("Logout failed");
  }
  return res.json();
}

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: authData, isLoading, error } = useQuery({
    queryKey: ["auth"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth"], null);
      queryClient.clear();
      setLocation("/login");
    },
  });

  return {
    user: authData?.user,
    isLoading,
    isAuthenticated: !!authData?.user,
    isDm: authData?.user?.role === "dm",
    isPlayer: authData?.user?.role === "player",
    logout: () => logoutMutation.mutate(),
  };
}
