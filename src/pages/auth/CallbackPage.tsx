import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export default function CallbackPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleCallback = async () => {
      // Parse hash parameters (Supabase returns tokens in hash)
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const error = hashParams.get("error");
      const errorDescription = hashParams.get("error_description");

      // Handle errors
      if (error) {
        toast({
          title: "Error",
          description: errorDescription || "Authentication failed",
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Handle successful authentication
      if (accessToken) {
        try {
          // Send Supabase token to backend for verification and user creation
          const response = await fetch(
            `${API_BASE_URL}/auth/google/verify`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ access_token: accessToken }),
            },
          );

          const data = await response.json();

          if (data.success && data.data?.tokens?.accessToken) {
            // Store our backend JWT token
            localStorage.setItem("token", data.data.tokens.accessToken);

            toast({
              title: "Welcome!",
              description: "Successfully signed in with Google.",
            });

            // Force reload to update auth context
            window.location.href = "/dashboard";
          } else {
            throw new Error(data.message || "Failed to verify authentication");
          }
        } catch (error: any) {
          console.error("Callback error:", error);
          toast({
            title: "Error",
            description: error.message || "Failed to complete sign-in",
            variant: "destructive",
          });
          localStorage.removeItem("token");
          navigate("/login");
        }
      } else {
        toast({
          title: "Error",
          description: "No authentication token received",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    handleCallback();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Completing sign-in...</h2>
        <p className="text-sm text-muted-foreground">
          Please wait while we set up your account
        </p>
      </div>
    </div>
  );
}
