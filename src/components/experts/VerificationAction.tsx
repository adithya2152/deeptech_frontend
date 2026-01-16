import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

export function VerificationAction() {
  const navigate = useNavigate();

  return (
    <Card className="border-indigo-100 bg-indigo-50/50 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <ShieldCheck className="w-32 h-32 text-indigo-600" />
      </div>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-100 rounded-full">
            <Sparkles className="h-5 w-5 text-indigo-600" />
          </div>
          <CardTitle className="text-indigo-900 text-lg">AI Expert Verification</CardTitle>
        </div>
        <CardDescription className="text-indigo-700/80">
          Get a verified badge and boost your visibility by 3x. Go to your profile and use the <strong>AI Profile Assistant</strong> to analyze your resume instantly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          // ✅ UPDATED: Redirects to the Profile Editor where the AI button is
          onClick={() => navigate("/profile")} 
          className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition-all shadow-md hover:shadow-lg"
        >
          Go to Profile & Verify <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  );
}