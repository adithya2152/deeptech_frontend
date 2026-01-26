import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle2,
  ArrowRight,
  Users,
  FileText,
  DollarSign,
  Clock,
  Shield,
} from "lucide-react";
import { Layout } from "@/components/layout/Layout";

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState("buyer");

  const buyerSteps = [
    {
      number: 1,
      title: "Create Account & Profile",
      description:
        "Sign up as a buyer, verify your email, and complete your company profile",
      details: [
        "Register with email and password",
        "Verify email address",
        "Fill in company details (name, size, industry)",
        "Add company website and description",
        "Complete KYC/verification process",
      ],
      icon: <Users className="w-6 h-6" />,
    },
    {
      number: 2,
      title: "Post a Project",
      description:
        "Create a detailed project request with requirements and budget",
      details: [
        "Define project title and description",
        "Specify technical domain and TRL level",
        "Set budget range (min & max)",
        "Add risk categories and expected outcomes",
        "Set project deadline",
        "Save as draft or publish immediately",
      ],
      icon: <FileText className="w-6 h-6" />,
    },
    {
      number: 3,
      title: "Review Expert Proposals",
      description: "Receive and evaluate proposals from qualified experts",
      details: [
        "View incoming proposals from experts",
        "Review expert profiles and ratings",
        "Compare proposed timelines and rates",
        "Read expert's approach and experience",
        "View expert's scoring and badges",
        "Message experts for clarifications",
      ],
      icon: <Users className="w-6 h-6" />,
    },
    {
      number: 4,
      title: "Select & Contract",
      description:
        "Choose the best expert and create a legally binding contract",
      details: [
        "Select winning proposal",
        "Choose engagement model (daily, hourly, fixed, sprint)",
        "Review NDA terms (can customize)",
        "Sign service agreement",
        "Expert signs NDA",
        "Create and fund escrow account",
      ],
      icon: <Shield className="w-6 h-6" />,
    },
    {
      number: 5,
      title: "Fund Work",
      description: "Secure funds in escrow to initiate work",
      details: [
        "Fund escrow account with contract amount",
        "Funds held securely during project duration",
        "Released upon milestone completion",
        "Can adjust if payment model is hourly/daily",
        "Escrow ensures expert protection",
      ],
      icon: <DollarSign className="w-6 h-6" />,
    },
    {
      number: 6,
      title: "Monitor Progress",
      description: "Track work, communicate, and manage project timeline",
      details: [
        "View real-time work logs and time entries",
        "Review daily/sprint summaries",
        "Communicate via messaging system",
        "Receive status notifications",
        "Request revisions if needed",
        "Approve completed work",
      ],
      icon: <Clock className="w-6 h-6" />,
    },
    {
      number: 7,
      title: "Review & Release Payment",
      description: "Accept deliverables and release funds from escrow",
      details: [
        "Review final deliverables",
        "Verify contract completion",
        "Accept or request modifications",
        "Release payment from escrow",
        "Leave feedback and rating",
        "Submit any disputes if issues arise",
      ],
      icon: <CheckCircle2 className="w-6 h-6" />,
    },
  ];

  const expertSteps = [
    {
      number: 1,
      title: "Create Account & Profile",
      description: "Register as an expert and build your professional profile",
      details: [
        "Sign up with email and password",
        "Verify email address",
        "Complete expert profile with bio",
        "Add technical skills and expertise areas",
        "Upload portfolio or certifications",
        "Set hourly/daily rates",
      ],
      icon: <Users className="w-6 h-6" />,
    },
    {
      number: 2,
      title: "Browse Projects",
      description:
        "Explore available projects in the marketplace matching your skills",
      details: [
        "Access project marketplace/feed",
        "Filter by domain, budget, and deadline",
        "Search for specific project types",
        "View detailed project requirements",
        "See buyer's company profile",
        "Check project budget and timeline",
      ],
      icon: <FileText className="w-6 h-6" />,
    },
    {
      number: 3,
      title: "Submit Proposal",
      description: "Create a compelling proposal to win the project",
      details: [
        "Click 'Submit Proposal' on project",
        "Enter proposed rate and timeline",
        "Write detailed approach and methodology",
        "Highlight relevant experience",
        "Mention similar projects completed",
        "Propose engagement model preference",
      ],
      icon: <Users className="w-6 h-6" />,
    },
    {
      number: 4,
      title: "Negotiate & Contract",
      description: "Finalize terms and sign the contract",
      details: [
        "Wait for buyer's response to proposal",
        "Negotiate terms if buyer counters",
        "Review and sign NDA",
        "Review service agreement",
        "Sign contract",
        "Confirm start date and engagement model",
      ],
      icon: <Shield className="w-6 h-6" />,
    },
    {
      number: 5,
      title: "Start Work",
      description: "Begin project work and track your time/progress",
      details: [
        "Receive contract activation notification",
        "Start work on agreed timeline",
        "Log time entries (for hourly contracts)",
        "Create work logs and daily summaries",
        "Document progress and deliverables",
        "Communicate with buyer regularly",
      ],
      icon: <Clock className="w-6 h-6" />,
    },
    {
      number: 6,
      title: "Complete Deliverables",
      description: "Finish work and prepare for buyer review",
      details: [
        "Complete all project requirements",
        "Submit all agreed deliverables",
        "Ensure quality meets standards",
        "Document code/work properly",
        "Prepare for buyer review/acceptance",
        "Be available for revisions if needed",
      ],
      icon: <FileText className="w-6 h-6" />,
    },
    {
      number: 7,
      title: "Receive Payment & Feedback",
      description: "Get paid and build your reputation through ratings",
      details: [
        "Buyer accepts deliverables",
        "Payment released from escrow",
        "Funds deposited to your wallet",
        "Receive buyer's feedback and rating",
        "Rating impacts your score and visibility",
        "Build portfolio with completed projects",
      ],
      icon: <DollarSign className="w-6 h-6" />,
    },
  ];

  const keyFeatures = [
    {
      title: "Escrow Protection",
      description:
        "Funds held securely throughout contract duration, protecting both parties",
      icon: <Shield className="w-8 h-8 text-blue-600" />,
    },
    {
      title: "Multi-Model Engagement",
      description:
        "Support for daily, hourly, fixed-price, and sprint-based contracts",
      icon: <FileText className="w-8 h-8 text-green-600" />,
    },
    {
      title: "Work Tracking",
      description:
        "Real-time time logs, work summaries, and progress monitoring",
      icon: <Clock className="w-8 h-8 text-purple-600" />,
    },
    {
      title: "NDA & Contracts",
      description:
        "Legal framework with digital signatures and customizable NDAs",
      icon: <Shield className="w-8 h-8 text-red-600" />,
    },
    {
      title: "Rating System",
      description:
        "Earn badges and improve your score based on project performance",
      icon: <CheckCircle2 className="w-8 h-8 text-yellow-600" />,
    },
    {
      title: "Messaging System",
      description: "Built-in communication platform for seamless collaboration",
      icon: <Users className="w-8 h-8 text-indigo-600" />,
    },
  ];

  const StepCard = ({ step, index }) => (
    <div className="mb-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-600 text-white">
                {step.icon}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-1 rounded">
                  Step {step.number}
                </span>
              </div>
              <CardTitle className="text-xl">{step.title}</CardTitle>
              <CardDescription className="text-base mt-1">
                {step.description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 ml-16">
            {step.details.map((detail, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2 text-sm text-gray-700"
              >
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{detail}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
      {index < 6 && (
        <div className="flex justify-center my-2">
          <ArrowRight className="w-6 h-6 text-blue-400 rotate-90" />
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Header Section */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              Asteai Deeptech connects expert freelancers with buyers seeking
              specialized technical expertise. Whether you're hiring or offering
              your skills, here's how the platform works.
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Tabs */}
          <Tabs defaultValue="buyer" className="w-full mb-12">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="buyer" className="text-lg">
                For Buyers
              </TabsTrigger>
              <TabsTrigger value="expert" className="text-lg">
                For Experts
              </TabsTrigger>
            </TabsList>

            {/* Buyer Workflow */}
            <TabsContent value="buyer" className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-blue-900">
                  <strong>Buyer Workflow:</strong> Post your project, receive
                  proposals from qualified experts, select the best fit,
                  establish a contract with escrow protection, and collaborate
                  until completion.
                </p>
              </div>
              <div className="space-y-4">
                {buyerSteps.map((step, idx) => (
                  <StepCard key={step.number} step={step} index={idx} />
                ))}
              </div>
            </TabsContent>

            {/* Expert Workflow */}
            <TabsContent value="expert" className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-8">
                <p className="text-green-900">
                  <strong>Expert Workflow:</strong> Build your profile, browse
                  projects, submit proposals, negotiate contracts, deliver
                  quality work, and earn reputation through ratings and
                  feedback.
                </p>
              </div>
              <div className="space-y-4">
                {expertSteps.map((step, idx) => (
                  <StepCard key={step.number} step={step} index={idx} />
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Key Features Section */}
          <div className="mt-16 border-t pt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Key Features & Protections
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {keyFeatures.map((feature, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                      {feature.icon}
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Engagement Models Section */}
          <div className="mt-16 border-t pt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Engagement Models
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Hourly Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    Best for ongoing, flexible projects
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Pay based on actual hours worked</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Expert logs time daily</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Flexible scope and timeline</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Daily Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    Best for short-term intensive work
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Fixed daily rate and duration</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Predictable cost structure</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Expert commits specific days</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Fixed Price
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    Best for well-defined projects
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Single price for full project</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Clear scope and deliverables</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Payment on completion</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Sprint Based
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    Best for iterative development
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Fixed price per sprint</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Defined sprint duration</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>Multiple sprints possible</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Safety & Security Section */}
          <div className="mt-16 border-t pt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Safety & Security
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  For Buyers
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Escrow Protection:</strong> Payment held until
                      work is completed
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Expert Verification:</strong> View ratings and
                      completed projects
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Dispute Resolution:</strong> Formal process for
                      handling disagreements
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>NDA Protection:</strong> Legally binding
                      confidentiality agreements
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  For Experts
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Payment Security:</strong> Funds escrowed before
                      work begins
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Buyer Verification:</strong> Check company and
                      payment history
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Dispute Protection:</strong> Fair resolution
                      mechanism available
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      <strong>Reputation Building:</strong> Earn ratings to
                      increase visibility
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 border-t pt-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              <Card>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="text-lg">
                    What happens if I'm not satisfied with the work?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    You can request revisions during the contract period. If
                    issues persist, the platform provides a formal dispute
                    resolution process where both parties present evidence. If
                    unresolved, funds remain in escrow until resolved through
                    mediation or arbitration.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="text-lg">
                    How does escrow work?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    The buyer funds the escrow account when the contract becomes
                    active. The funds are held securely by the platform. Upon
                    project completion and acceptance, the funds are released to
                    the expert. If there's a dispute, funds remain protected
                    until resolution.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="text-lg">
                    Can I negotiate rates in a proposal?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Yes, after an expert submits a proposal, the buyer can
                    counter-offer different rates or terms. The expert can
                    accept, reject, or counter-counter-offer. Once both parties
                    agree, the contract is created and signed.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="text-lg">
                    What is the rating system?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    After project completion, both parties leave ratings and
                    feedback. Experts earn badges and improve their scoring tier
                    based on ratings, project completion, and performance.
                    Higher-rated experts appear higher in search results and are
                    more likely to win projects.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="text-lg">
                    How are invoices handled?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    For hourly/daily contracts, experts submit invoices for work
                    completed. The buyer reviews and approves them. Funds are
                    drawn from the escrow account. For fixed-price contracts,
                    the expert submits an invoice upon completion, which the
                    buyer approves before release of full payment.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="text-lg">
                    Is my intellectual property protected?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    Each contract includes an NDA that protects both parties'
                    intellectual property. The terms can be customized based on
                    your agreement. Once signed, it's a legally binding document
                    that protects confidentiality and IP rights.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
