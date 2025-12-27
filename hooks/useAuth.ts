import { useState } from "react";
import { useRouter } from "next/navigation";
import api, { setupTokenRefresh, clearTokenRefresh } from "@/lib/api";
import { AxiosError } from "axios";
import { LoginResponse, LoginCredentials } from "@/types";
import { useAuth as useAuthContext } from "@/context/AuthContext";

export function useAuthActions() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { login: setUser, logout: clearUser } = useAuthContext();
  const router = useRouter();

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post<LoginResponse>("/auth/login", credentials);

      if (response.data.user) {
        setUser(response.data.user);
        setupTokenRefresh(900);
        router.push("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);

      if (err instanceof AxiosError) {
        const errorMessage =
          err.response?.data?.message || "Invalid email or password";
        setError(errorMessage);
      } else {
        setError("An unexpected error occurred");
      }
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      clearTokenRefresh();
      clearUser();
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return { login, logout, isLoading, error, setError };
}
