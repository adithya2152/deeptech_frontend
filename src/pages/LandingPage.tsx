import { useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { ExpertCard } from "@/components/experts/ExpertCard";
import { domainLabels } from "@/lib/constants";
import { useExperts } from "@/hooks/useExperts";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowRight,
  Shield,
  Clock,
  FileCheck,
  Users,
  Zap,
  Lock,
  TrendingUp,
  BrainCircuit,
  Lightbulb,
  CheckCircle2,
  CalendarDays,
  Target,
  Rocket,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const { data: experts, isLoading } = useExperts({ onlyVerified: true });

  const engagementModels = [
    {
      icon: Clock,
      title: "Hourly Rate",
      description:
        "Flexible billing for focused work sessions. Track hours and pay for actual time spent.",
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-200/20",
    },
    {
      icon: Target,
      title: "Fixed Price",
      description:
        "Perfect for well-defined deliverables. Set a scope, agree on a price, and get it done.",
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      border: "border-blue-200/20",
    },
    {
      icon: Rocket,
      title: "Sprint Based",
      description:
        "Agile execution for ongoing development. 2-week cycles with clear deliverables and demos.",
      color: "text-purple-500",
      bg: "bg-purple-500/20",
      border: "border-purple-200/20",
    },
    {
      icon: CalendarDays,
      title: "Daily Rate",
      description:
        "Flexible R&D and problem solving. Pay for expert time on a day-by-day basis.",
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-200/20",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Verified Deep-Tech Experts",
      description:
        "Every expert is vetted for domain expertise, system-level experience, and a proven deep-tech track record.",
    },
    {
      icon: FileCheck,
      title: "Built-in IP Protection",
      description:
        "Auto-generated NDAs, IP ownership declarations, and versioned agreement records protect your innovations.",
    },
    {
      icon: BrainCircuit,
      title: "Problem-First Matching",
      description:
        "Describe your challenge and get matched with experts who have solved similar frontier technology problems.",
    },
    {
      icon: TrendingUp,
      title: "Milestone Tracking",
      description:
        "Escrow-backed payments released only when specific technical milestones are met and verified.",
    },
  ];

  const domains = Object.entries(domainLabels).slice(0, 6);

  return (
    <Layout>
      <section className="relative overflow-hidden bg-background pt-16 pb-24 lg:pt-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

        <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center animate-in fade-in slide-in-from-top-4 duration-1000">
            <Badge
              variant="outline"
              className="mb-6 px-4 py-1.5 border-primary/20 bg-primary/5 text-primary rounded-full animate-pulse"
            >
              <Zap className="h-3.5 w-3.5 mr-2 fill-current" />
              {"World's First Vernacular Friendly Deep-Tech Market Place"}
            </Badge>

            {/* ASTEAI Branding - PRIMARY HEADING */}
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-normal mb-6">
              <span className="text-primary">ASTEAI</span> - World's First
              Vernacular DeepTech Marketplace!
            </h1>

            {/* Tagline Formula */}
            <div className="flex items-center justify-center gap-2 text-base sm:text-lg font-medium text-muted-foreground bg-muted/50 px-6 py-3 rounded-full border border-border/50 mb-8">
              <span className="font-bold text-primary">A*</span>chievements =
              <span className="font-bold text-amber-600">*S</span>kills +
              <span className="font-bold text-blue-600">*T</span>alent +
              <span className="font-bold text-purple-600">*E</span>fforts +
              <span className="font-bold text-emerald-600">*AI</span>
            </div>

            {/* Secondary Heading */}
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              {"Build the Future with"}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-600 p-3 mt-2 pb-2">
                {"Specialized Deep-Tech Talent"}
              </span>
            </h2>

            <p className="mt-6 text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              {
                "Connect with verified specialists in AI, Robotics, Biotech, and Quantum. Execute complex R&D with flexible engagement models designed for innovation."
              }
            </p>

            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="h-12 px-8 text-base shadow-lg shadow-primary/20"
                onClick={() =>
                  navigate(isAuthenticated ? "/experts" : "/register")
                }
              >
                {isAuthenticated ? "Find Experts" : "Start Building Now"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base"
                onClick={() => navigate("/how-it-works")}
              >
                {"How It Works"}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30 border-y">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
              {"Flexible Engagement"}
            </h2>
            <h3 className="font-display text-3xl font-bold">
              {"Work The Way You Want"}
            </h3>
            <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
              {
                "From quick architectural reviews to long-term R&D implementation, choose the model that fits your product roadmap."
              }
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {engagementModels.map((model, idx) => (
              <Card
                key={idx}
                className="relative overflow-hidden hover:shadow-lg transition-all duration-300 border-border/50 group"
              >
                <div
                  className={`absolute top-0 left-0 w-full h-1 ${model.bg.replace("/10", "")}`}
                />
                <CardHeader>
                  <div
                    className={`h-12 w-12 rounded-lg flex items-center justify-center mb-4 ${model.bg} ${model.color}`}
                  >
                    <model.icon className="h-6 w-6" />
                  </div>
                  <CardTitle className="text-xl">{model.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {model.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-sm font-bold uppercase tracking-widest text-primary mb-3">
              {"Frontier Expertise"}
            </h2>
            <h3 className="font-display text-3xl font-bold">
              {"Specialized Domains"}
            </h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {domains.map(([key, label]) => (
              <Card
                key={key}
                className="group border-border/50 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer bg-background"
                onClick={() => navigate(`/experts?domain=${key}`)}
              >
                <CardContent className="flex flex-col items-center justify-center p-5 space-y-4">
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors text-center">
                    {label}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:32px_32px]" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-20">
            <h2 className="font-display text-4xl font-bold mb-4">
              {"Built for Serious Engineering"}
            </h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              {
                "Generic platforms fail at deep-tech. We built a system specifically for R&D, hardware-software co-design, and scientific commercialization."
              }
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-4"
              >
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-2 border border-white/10 backdrop-blur-sm">
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="font-display text-xl font-bold">
                  {feature.title}
                </h3>
                <p className="text-slate-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/40">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-12 gap-6">
            <div className="text-left">
              <Badge variant="secondary" className="mb-4 bg-white shadow-sm">
                {"Available Now"}
              </Badge>
              <h2 className="font-display text-4xl font-bold">
                {"Featured Experts"}
              </h2>
              <p className="mt-2 text-muted-foreground text-lg">
                {"Top 1% vetted specialists ready for immediate engagement."}
              </p>
            </div>
            <Button
              variant="outline"
              className="rounded-full bg-white hover:bg-zinc-50"
              onClick={() => navigate("/experts")}
            >
              {"Explore Global Network"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-64 rounded-xl bg-muted animate-pulse border"
                />
              ))
            ) : experts && experts.length > 0 ? (
              experts
                .slice(0, 3)
                .map((expert) => <ExpertCard key={expert.id} expert={expert} />)
            ) : (
              <div className="col-span-full text-center py-16 bg-background rounded-2xl border-2 border-dashed">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                <p className="text-muted-foreground">
                  Experts are currently being vetted. Check back shortly.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="bg-gradient-to-br from-slate-900 to-slate-950 text-white overflow-hidden border-none shadow-2xl">
            <CardContent className="p-12 md:p-20 text-center relative">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-primary/20 blur-[100px]" />
                <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-indigo-500/20 blur-[100px]" />
              </div>

              <div className="relative z-10 max-w-3xl mx-auto space-y-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm mb-4 border border-white/20">
                  <Lock className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-4xl sm:text-5xl font-bold">
                  {"Start Building with Confidence"}
                </h2>
                <p className="text-xl text-white/70 leading-relaxed">
                  {
                    "Your intellectual property is protected from day one. Every project includes auto-generated NDAs, version-controlled IP assignments, and bank-grade data security."
                  }
                </p>
                <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    size="lg"
                    className="h-14 px-10 text-lg font-bold bg-white text-slate-950 hover:bg-slate-100"
                    onClick={() =>
                      navigate(isAuthenticated ? "/projects/new" : "/register")
                    }
                  >
                    {"Post a Project"}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 px-10 text-lg border-white/20 hover:bg-white/10 text-white bg-transparent"
                    onClick={() => navigate("/register?role=expert")}
                  >
                    {"Apply as Expert"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </Layout>
  );
}
