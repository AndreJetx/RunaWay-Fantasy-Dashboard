import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { api } from "@/lib/api";

export function useAuth() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: authData, isLoading } = useQuery({
    queryKey: ["auth"],
    queryFn: () => api.getUser(),
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: () => api.logout(),
    onSuccess: () => {
      queryClient.setQueryData(["auth"], null);
      setLocation("/login");
    },
  });

  return {
    user: authData?.user,
    isLoading,
    isAuthenticated: !!authData?.user,
    logout: () => logoutMutation.mutate(),
  };
}
