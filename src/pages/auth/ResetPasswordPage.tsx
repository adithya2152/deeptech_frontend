import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { authApi } from "@/lib/api";
import { Loader2 } from "lucide-react";

function parseHashTokens(hash: string): {
  accessToken?: string;
  refreshToken?: string;
  type?: string;
  errorDescription?: string;
} {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(raw);
  return {
    accessToken: params.get('Access_token') || undefined,
    refreshToken: params.get('Refresh_token') || undefined,
    type: params.get('Type') || undefined,
    errorDescription: params.get('Error_description') || undefined,
  };
}

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const { accessToken, refreshToken, type, errorDescription } = parseHashTokens(window.location.hash);

    // Clear tokens from the URL ASAP
    if (window.location.hash) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }

    if (errorDescription) {
      toast({
        title: "Reset link error",
        description: decodeURIComponent(errorDescription),
        variant: "destructive",
      });
      return;
    }

    if (type && type !== "recovery") {
      // Still allow, but warn
      toast({
        title: "Notice",
        description: "This link is not a recovery link. You may need to request a new password reset.",
        variant: "destructive",
      });
    }

    setAccessToken(accessToken ?? null);
    setRefreshToken(refreshToken ?? null);
  }, [toast]);

  const canSubmit = useMemo(() => {
    if (!accessToken || !refreshToken) return false;
    if (!password || password.length < 6) return false;
    if (password !== confirmPassword) return false;
    return true;
  }, [accessToken, refreshToken, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessToken || !refreshToken) {
      toast({
        title: 'Invalid Link Title',
        description: 'Missing Tokens',
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: 'Passwords Mismatch',
        description: 'Reenter Password',
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await authApi.resetPassword({ accessToken, refreshToken, password });
      toast({
        title: 'Password Updated',
        description: res.message || 'Can Login',
      });
      navigate("/login");
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed To Reset',
        variant: "destructive",
      });
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
              <span className="text-xl font-bold text-primary-foreground">D</span>
            </div>
            <span className="font-display text-2xl font-bold">{'DeepTech'}</span>
          </Link>
        </div>

        <Card className="animate-scale-in">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">{'Title'}</CardTitle>
            <CardDescription>
              {'Subtitle'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!accessToken || !refreshToken ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {'Invalid Link'}
                </p>
                <Button asChild className="w-full">
                  <Link to="/forgot-password">{'Request New Link'}</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">{'New Password'}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{'Confirm Password'}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading || !canSubmit}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {'Submit'}
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <Link to="/login" className="text-primary hover:underline font-medium">
                {'Back To Login'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
