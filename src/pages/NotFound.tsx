import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search, HelpCircle } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/30 px-4">
      <div className="text-center max-w-lg">
        {/* Large 404 */}
        <div className="relative mb-8">
          <h1 className="text-[150px] sm:text-[200px] font-black text-muted/20 leading-none select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-primary/10 rounded-full p-6">
              <Search className="h-16 w-16 text-primary/60" />
            </div>
          </div>
        </div>

        {/* Message */}
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
          {"Title"}
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {"Description"}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="default"
            size="lg"
            className="gap-2"
            onClick={() => navigate("/")}
          >
            <Home className="h-4 w-4" />
            {"Go Home"}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            {"Go Back"}
          </Button>
        </div>

        {/* Help link */}
        <div className="mt-8 pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground">
            {"Need Help"}{" "}
            <a
              href="mailto:support@asteai.com"
              className="text-primary hover:underline inline-flex items-center gap-1"
            >
              <HelpCircle className="h-3 w-3" />
              {"Contact Support"}
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
