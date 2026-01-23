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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
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
      title: 'Title',
      description: 'Desc',
      icon: <Shield className="w-8 h-8 text-blue-600" />,
    },
    {
      title: 'Title',
      description: 'Desc',
      icon: <FileText className="w-8 h-8 text-green-600" />,
    },
    {
      title: 'Title',
      description: 'Desc',
      icon: <Clock className="w-8 h-8 text-purple-600" />,
    },
    {
      title: 'Title',
      description: 'Desc',
      icon: <Shield className="w-8 h-8 text-red-600" />,
    },
    {
      title: 'Title',
      description: 'Desc',
      icon: <CheckCircle2 className="w-8 h-8 text-yellow-600" />,
    },
    {
      title: 'Title',
      description: 'Desc',
      icon: <Users className="w-8 h-8 text-indigo-600" />,
    },
  ];

  const StepCard = ({ step, index }: { step: any; index: number }) => (
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
                  {'Step'} {step.number}
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
            {step.details.map((detail: string, idx: number) => (
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
              {'Title'}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl">
              {'Subtitle'}
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Tabs */}
          <Tabs defaultValue="buyer" className="w-full mb-12">
            <TabsList className="grid w-full max-w-md grid-cols-2 mb-8">
              <TabsTrigger value="buyer" className="text-lg">
                {'Buyer'}
              </TabsTrigger>
              <TabsTrigger value="expert" className="text-lg">
                {'Expert'}
              </TabsTrigger>
            </TabsList>

            {/* Buyer Workflow */}
            <TabsContent value="buyer" className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
                <p className="text-blue-900">
                  <strong>{'Workflow'}</strong> {'Workflow Desc'}
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
                  <strong>{'Workflow'}</strong> {'Workflow Desc'}
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
              {'Title'}
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
              {'Title'}
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {'Title'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    {'Desc'}
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{'Point1'}</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{'Point2'}</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{'Point3'}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    {'Title'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    {'Desc'}
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{'Point1'}</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{'Point2'}</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{'Point3'}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {'Title'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    {'Desc'}
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{'Point1'}</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{'Point2'}</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{'Point3'}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {'Title'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-3">
                    {'Desc'}
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{'Point1'}</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{'Point2'}</span>
                    </li>
                    <li className="flex gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span>{'Point3'}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Safety & Security Section */}
          <div className="mt-16 border-t pt-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {'Title'}
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-blue-600" />
                  {'Buyer'}
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      {'Escrow'}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      {'Expert Verification'}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      {'Dispute'}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      {'Nda'}
                    </span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Shield className="w-6 h-6 text-green-600" />
                  {'Expert'}
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      {'Payment'}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      {'Buyer Verification'}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      {'Dispute'}
                    </span>
                  </li>
                  <li className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">
                      {'Reputation'}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mt-16 border-t pt-12 mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              {'Title'}
            </h2>
            <div className="space-y-4">
              <Card>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="text-lg">
                    {'Q'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {'A'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="text-lg">{'Q'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {'A'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="text-lg">
                    {'Q'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {'A'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="text-lg">
                    {'Q'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {'A'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="text-lg">
                    {'Q'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {'A'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="cursor-pointer hover:bg-gray-50">
                  <CardTitle className="text-lg">
                    {'Q'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700">
                    {'A'}
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
