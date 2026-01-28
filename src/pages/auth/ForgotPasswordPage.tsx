import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await authApi.forgotPassword(email);
      toast({
        title: "Check Email",
        description: res.message || "Sent Link",
      });
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("no account found")) {
        toast({
          title: "Email Not Found",
          description: "Email Not Registered",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: err.message || "Unable To Send",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <span className="text-xl font-bold text-primary-foreground">
                A
              </span>
            </div>
            <span className="font-display text-2xl font-bold">
              {"Asteai Deeptech"}
            </span>
          </Link>
        </div>

        <Card className="animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">{"Forgot Password"}</CardTitle>
            <CardDescription>{"Enter your email to receive a reset link"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  {"Email"} <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {"Submit"}
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                {"Remembered"}{" "}
                <Link
                  to="/login"
                  className="text-primary hover:underline font-medium"
                >
                  {"Back To Login"}
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
