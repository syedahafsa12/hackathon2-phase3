// File: lib/hooks/useAuth.ts
// Spec: specs/001-competition-todo-app/file.md § FR-1 (Authentication with Better Auth)

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { betterAuth } from "@/lib/better-auth";
import toast from "react-hot-toast";
import type { User } from "@/lib/types";

interface SignupData {
  email: string;
  password: string;
  name?: string;
}

interface LoginData {
  email: string;
  password: string;
}

export function useAuth() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Get current user using Better Auth
  const { data: user, isLoading } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const session = await betterAuth.getSession();
      return session?.user || null;
    },
    retry: false,
    staleTime: Infinity,
  });

  // Signup mutation using Better Auth
  const signup = useMutation({
    mutationFn: async (data: SignupData) => {
      const session = await betterAuth.signUp(data.email, data.password, data.name);
      return session;
    },
    onSuccess: (session) => {
      queryClient.setQueryData(["currentUser"], session.user);
      toast.success("Account created successfully!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      console.error("Signup error:", error);
      const message = error.message || "Signup failed";
      toast.error(message);
    },
  });

  // Login mutation using Better Auth
  const login = useMutation({
    mutationFn: async (data: LoginData) => {
      const session = await betterAuth.signIn(data.email, data.password);
      return session;
    },
    onSuccess: (session) => {
      queryClient.setQueryData(["currentUser"], session.user);
      toast.success("Logged in successfully!");
      router.push("/dashboard");
    },
    onError: (error: any) => {
      console.error("Login error:", error);
      const message = error.message || "Login failed";
      toast.error(message);
    },
  });

  // Logout function using Better Auth
  const logout = async () => {
    await betterAuth.signOut();
    queryClient.setQueryData(["currentUser"], null);
    queryClient.clear();
    toast.success("Logged out successfully");
    router.push("/login");
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signup,
    login,
    logout,
  };
}
