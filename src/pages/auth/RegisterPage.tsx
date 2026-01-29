import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2, Check, ShieldCheck } from "lucide-react";
import { authApi } from "@/lib/api";
import { PublicLanguageSelector } from "@/components/shared/PublicLanguageSelector";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Phone State (Input only, no verification)
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+91");

  // OTP States
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // RESTORED: Capture ticket here
  const [signupTicket, setSignupTicket] = useState("");

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<"buyer" | "expert">("buyer");
  const [agreed, setAgreed] = useState(false);

  // --- Handlers ---

  const handleSendEmailOtp = async () => {
    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await authApi.sendEmailOtp(email);
      setEmailOtpSent(true);
      toast({ title: "Email OTP Sent", description: `Code sent to ${email}` });
    } catch (err: any) {
      // Backend returns 409 with "User already exists. Please login." when email is registered
      const message = err.message || "Failed to send Email OTP";
      if (
        message.toLowerCase().includes("already exists") ||
        message.toLowerCase().includes("already registered")
      ) {
        toast({
          title: "Email Already Registered",
          description: "This email is already in use. Please log in instead.",
          variant: "destructive",
        });
      } else {
        toast({ title: "Error", description: message, variant: "destructive" });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length < 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter the verification code.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyEmailOtp({ email, otp: emailOtp });

      // RESTORED: Save the ticket
      if (res.success && res.data?.signupTicket) {
        setSignupTicket(res.data.signupTicket);
        setEmailVerified(true);
        toast({
          title: "Email Verified",
          description: "Your email has been successfully verified.",
        });
      } else {
        throw new Error("Verification failed - no ticket received");
      }
    } catch (err: any) {
      toast({
        title: "Verification Failed",
        description: err.message || "Invalid Email OTP",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      toast({
        title: "Agreement required",
        description: "Please accept terms of service.",
        variant: "destructive",
      });
      return;
    }
    if (!emailVerified || !signupTicket) {
      toast({
        title: "Email not verified",
        description: "Please verify your email first.",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both password fields match.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const fullPhone = `${countryCode}${phone}`.replace(/\s+/g, "");

      // RESTORED: Pass signupTicket to register
      await authApi.register({
        email,
        password,
        first_name,
        last_name,
        phone: fullPhone,
        role,
        signupTicket,
      });

      toast({
        title: "Welcome Title",
        description: "Account Created",
      });

      navigate("/login");
    } catch (err: any) {
      toast({
        title: "Registration Failed",
        description: err.message || "Could not create account.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (password.length === 0) return 0;
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const strength = passwordStrength();
  const strengthColors = [
    "bg-destructive",
    "bg-warning",
    "bg-warning",
    "bg-emerald-500",
  ];
  const strengthLabels = ["Weak", "Fair", "Good", "Strong"];

  const passwordsMatch =
    password.length > 0 &&
    confirmPassword.length > 0 &&
    password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12 relative animate-fade-in">
      <div className="absolute top-4 right-4 z-50">
        <PublicLanguageSelector />
      </div>

      <div className="w-full max-w-[500px] relative">
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

        <Card className="animate-scale-in border-muted/60 shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="font-display text-2xl">
              {"Create an Account"}
            </CardTitle>
            <CardDescription>
              {"Join the world's leading deep-tech platform."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={role}
              onValueChange={(v) => setRole(v as "buyer" | "expert")}
              className="mb-8"
            >
              <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
                <TabsTrigger value="buyer" className="rounded-md">
                  {"I want to hire"}
                </TabsTrigger>
                <TabsTrigger value="expert" className="rounded-md">
                  {"I want to work"}
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="mb-6">
              <Button
                variant="outline"
                type="button"
                className="w-full h-11 flex items-center justify-center gap-2"
                disabled={loading}
                onClick={async () => {
                  try {
                    // 1. Call backend to get Google OAuth URL
                    const res: any = await authApi.initiateGoogleOAuth();
                    if (res.success && res.data?.url) {
                      // 2. Redirect user to Google
                      window.location.href = res.data.url;
                    } else {
                      toast({ title: "Error", description: "Could not initiate Google Login", variant: "destructive" });
                    }
                  } catch (error) {
                    toast({ title: "Error", description: "Failed to connect to Google", variant: "destructive" });
                  }
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="16"
                  height="16"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                {"Continue with Google"}
              </Button>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    {"Or continue with email"}
                  </span>
                </div>
              </div>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">
                    {"First Name"} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="first_name"
                    placeholder="Aditya"
                    value={first_name}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">
                    {"Last Name"} <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="last_name"
                    placeholder="Kumar"
                    value={last_name}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Verification Section */}
              <div className="space-y-3 p-4 border rounded-xl bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    {"Email Address"}{" "}
                    <span className="text-destructive">*</span>
                    {emailVerified && (
                      <Check className="h-3.5 w-3.5 text-emerald-500" />
                    )}
                  </Label>
                  {emailVerified ? (
                    <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> {"Verified"}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      {"Verification Required"}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="aditya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={emailVerified}
                    required
                  />
                  {!emailVerified && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSendEmailOtp}
                      disabled={loading || !email}
                      className="shrink-0"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : emailOtpSent ? (
                        "Resend OTP"
                      ) : (
                        "Get OTP"
                      )}
                    </Button>
                  )}
                </div>

                {emailOtpSent && !emailVerified && (
                  <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                    <Input
                      placeholder={"Enter Code"}
                      value={emailOtp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "");
                        if (value.length <= 8) setEmailOtp(value);
                      }}
                      maxLength={8}
                      inputMode="numeric"
                      className="text-center tracking-widest font-mono"
                    />
                    <Button
                      type="button"
                      onClick={handleVerifyEmailOtp}
                      disabled={loading || emailOtp.length < 6}
                      size="sm"
                    >
                      {"Verify"}
                    </Button>
                  </div>
                )}
              </div>

              {/* Phone Input Section (No OTP) */}
              <div className="space-y-2">
                <Label htmlFor="phone">
                  {"Phone Number"} <span className="text-destructive">*</span>
                </Label>
                <div className="flex gap-2">
                  <select
                    className="flex h-10 w-[80px] rounded-md border border-input bg-background px-2 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                  >
                    <option value="+91">+91</option>
                    <option value="+1">+1</option>
                    <option value="+44">+44</option>
                  </select>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password">
                  {"Set Password"} <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {password ? (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? strengthColors[strength - 1] : "bg-muted"}`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-[11px] text-muted-foreground space-y-0.5">
                        <p
                          className={
                            password.length >= 8 ? "text-emerald-600" : ""
                          }
                        >
                          • {"At least 8 characters"}{" "}
                          {password.length >= 8 && "✓"}
                        </p>
                        <p
                          className={
                            /[A-Z]/.test(password) ? "text-emerald-600" : ""
                          }
                        >
                          • {"Contains uppercase letter"}{" "}
                          {/[A-Z]/.test(password) && "✓"}
                        </p>
                        <p
                          className={
                            /[0-9]/.test(password) ? "text-emerald-600" : ""
                          }
                        >
                          • {"Contains number"} {/[0-9]/.test(password) && "✓"}
                        </p>
                        <p
                          className={
                            /[^A-Za-z0-9]/.test(password)
                              ? "text-emerald-600"
                              : ""
                          }
                        >
                          • {"Contains special character"}{" "}
                          {/[^A-Za-z0-9]/.test(password) && "✓"}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-medium ${strength >= 3 ? "text-emerald-600" : strength >= 2 ? "text-amber-600" : "text-destructive"}`}
                      >
                        {strengthLabels[strength - 1] || "Weak"}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    {
                      "Use 8 or more characters with a mix of letters, numbers & symbols"
                    }
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirm_password">
                  {"Confirm Password"}{" "}
                  <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirm_password"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    aria-invalid={passwordsMismatch}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    aria-label={
                      showConfirmPassword
                        ? "Hide confirm password"
                        : "Show confirm password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {passwordsMismatch && (
                  <p className="text-xs text-destructive">
                    {"Passwords do not match"}
                  </p>
                )}
                {passwordsMatch && (
                  <p className="text-xs text-emerald-600">
                    {"Passwords match"}
                  </p>
                )}
              </div>

              {/* Footer Actions */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-2">
                  <button
                    type="button"
                    onClick={() => setAgreed(!agreed)}
                    className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0 ${agreed ? "bg-primary border-primary" : "border-input"
                      }`}
                  >
                    {agreed && (
                      <Check className="h-3 w-3 text-primary-foreground" />
                    )}
                  </button>
                  <p className="text-sm text-muted-foreground leading-tight">
                    {"I agree to the"}{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      {"Terms of Service"}
                    </Link>{" "}
                    {"and"}{" "}
                    <Link
                      to="/privacy"
                      className="text-primary hover:underline"
                    >
                      {"Privacy Policy"}
                    </Link>
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 text-base font-semibold"
                  disabled={
                    loading || !agreed || !emailVerified || passwordsMismatch
                  }
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {"Create Account"}
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              {"Already have an account?"}{" "}
              <Link
                to="/login"
                className="text-primary hover:underline font-medium"
              >
                {"Log in"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
