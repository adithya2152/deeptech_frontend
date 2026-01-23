import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const auth = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      const token = searchParams.get("token");
      const refreshToken = searchParams.get("refresh");
      const error = searchParams.get("error");

      // Handle errors from backend
      if (error) {
        let errorMessage = "Authentication failed";
        switch (error) {
          case "no_code":
            errorMessage = "No authorization code received";
            break;
          case "auth_failed":
            errorMessage = "Google authentication failed";
            break;
          case "callback_failed":
            errorMessage = "Failed to complete sign-in";
            break;
        }

        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        navigate("/login");
        return;
      }

      // Handle successful authentication
      if (token && refreshToken) {
        try {
          // Store the access token
          localStorage.setItem("token", token);

          // Get user profile
          const response = await authApi.getMe(token);

          if (response.success && response.data?.user) {
            toast({
              title: "Welcome!",
              description: "Successfully signed in with Google.",
            });

            // Force reload to update auth context
            window.location.href = "/dashboard";
          } else {
            throw new Error("Failed to fetch user profile");
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
          description: "Invalid callback parameters",
          variant: "destructive",
        });
        navigate("/login");
      }
    };

    handleCallback();
  }, [searchParams, navigate, toast]);

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
