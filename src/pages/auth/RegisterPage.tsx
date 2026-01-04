import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Eye, EyeOff, Loader2, Check, ShieldCheck } from 'lucide-react';
import { authApi } from "@/lib/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { toast } = useToast();

  const [first_name, setFirstName] = useState('');
  const [last_name, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Phone State (Input only, no verification)
  const [phone, setPhone] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  
  // OTP States
  const [emailOtp, setEmailOtp] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  
  // RESTORED: Capture ticket here
  const [signupTicket, setSignupTicket] = useState('');

  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'buyer' | 'expert'>('buyer');
  const [agreed, setAgreed] = useState(false);

  // --- Handlers ---

  const handleSendEmailOtp = async () => {
    if (!email || !email.includes('@')) {
      toast({ title: "Invalid Email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await authApi.sendEmailOtp(email); 
      setEmailOtpSent(true);
      toast({ title: "Email OTP Sent", description: `Code sent to ${email}` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message || "Failed to send Email OTP", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (!emailOtp || emailOtp.length < 6) {
      toast({ title: "Invalid OTP", description: "Please enter the verification code.", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const res = await authApi.verifyEmailOtp({ email, otp: emailOtp });
      
      // RESTORED: Save the ticket
      if (res.success && res.data?.signupTicket) {
        setSignupTicket(res.data.signupTicket);
        setEmailVerified(true);
        toast({ title: "Email Verified", description: "Your email has been successfully verified." });
      } else {
        throw new Error("Verification failed - no ticket received");
      }
    } catch (err: any) {
      toast({ title: "Verification Failed", description: err.message || "Invalid Email OTP", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!agreed) {
      toast({ title: "Agreement required", description: "Please accept terms of service.", variant: "destructive" });
      return;
    }
    if (!emailVerified || !signupTicket) {
      toast({ title: "Email not verified", description: "Please verify your email first.", variant: "destructive" });
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
        signupTicket 
      });

      toast({
        title: "Welcome to DeepTech!",
        description: "Your account has been created successfully.",
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
  const strengthColors = ['bg-destructive', 'bg-warning', 'bg-warning', 'bg-emerald-500'];
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-[500px]">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <span className="text-xl font-bold text-primary-foreground">D</span>
            </div>
            <span className="font-display text-2xl font-bold">DeepTech</span>
          </Link>
        </div>

        <Card className="animate-scale-in border-muted/60 shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="font-display text-2xl">Create Account</CardTitle>
            <CardDescription>Verify your details to join the marketplace</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={role} onValueChange={(v) => setRole(v as 'buyer' | 'expert')} className="mb-8">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-muted/50">
                <TabsTrigger value="buyer" className="rounded-md">I'm Hiring</TabsTrigger>
                <TabsTrigger value="expert" className="rounded-md">I'm an Expert</TabsTrigger>
              </TabsList>
            </Tabs>

            <form onSubmit={handleRegister} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    placeholder="Aditya"
                    value={first_name}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
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
                        Email Address
                        {emailVerified && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                    </Label>
                    {emailVerified ? (
                        <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
                            <ShieldCheck className="h-3 w-3" /> Verified
                        </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">Required</span>
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
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (emailOtpSent ? 'Resend' : 'Get OTP')}
                      </Button>
                  )}
                </div>

                {emailOtpSent && !emailVerified && (
                    <div className="flex gap-2 animate-in fade-in slide-in-from-top-1">
                        <Input 
                            placeholder="Enter Code" 
                            value={emailOtp}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, '');
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
                            Verify
                        </Button>
                    </div>
                )}
              </div>

              {/* Phone Input Section (No OTP) */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
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
                <Label htmlFor="password">Set Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
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
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${i < strength ? strengthColors[strength - 1] : 'bg-muted'}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground text-right">
                      {strengthLabels[strength - 1] || 'Weak'}
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-2">
                    <button
                    type="button"
                    onClick={() => setAgreed(!agreed)}
                    className={`mt-0.5 h-4 w-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        agreed ? 'bg-primary border-primary' : 'border-input'
                    }`}
                    >
                    {agreed && <Check className="h-3 w-3 text-primary-foreground" />}
                    </button>
                    <p className="text-sm text-muted-foreground leading-tight">
                    I agree to the{' '}
                    <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                    {' '}and{' '}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                    </p>
                </div>

                <Button 
                    type="submit" 
                    className="w-full h-11 text-base font-semibold" 
                    disabled={loading || !agreed || !emailVerified}
                >
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Account
                </Button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Log in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}