import { axiosInstance } from "@/lib/axios.ts";
import { useAuthStore } from "@/stores/useAuthStore";
import { useChatStore } from "@/stores/useChatStore";
import { useAuth } from "@clerk/clerk-react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

const updateApiToken = (token: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { getToken } = useAuth();
  const [loading, setLoading] = useState(true);
  const { checkAdminStatus } = useAuthStore();
  const { initSocket, disconnectSocket } = useChatStore();

  useEffect(() => {
    // Install a response interceptor once to transparently refresh tokens
    // on 401 responses (e.g. when Clerk rotates the session token).
    const interceptorId = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest: any = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            const newToken = await getToken();
            updateApiToken(newToken);

            if (newToken) {
              originalRequest.headers = {
                ...(originalRequest.headers || {}),
                Authorization: `Bearer ${newToken}`,
              };
              return axiosInstance(originalRequest);
            }
          } catch (tokenError) {
            console.error("Error refreshing token after 401:", tokenError);
          }
        }

        return Promise.reject(error);
      }
    );

    const initialAuth = async () => {
      try {
        const token = await getToken();
        updateApiToken(token);
        if (token) {
          await checkAdminStatus();
          //init socket or other auth-dependent services here
          initSocket(getToken);
        }
      } catch (error: any) {
        updateApiToken(null);
        console.error("Error fetching token:", error);
      } finally {
        setLoading(false);
      }
    };
    initialAuth();
    //return cleanup function
    return () => {
      axiosInstance.interceptors.response.eject(interceptorId);
      disconnectSocket();
    };
  }, [getToken, checkAdminStatus, initSocket, disconnectSocket]);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader className="size-8 text-emerald-500 animate-spin" />
      </div>
    );
  }
  return <>{children}</>;
};

export default AuthProvider;
