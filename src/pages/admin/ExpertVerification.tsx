import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowLeft, Brain, CheckCircle, Briefcase, Loader2, User, Mail, Wrench, Award } from "lucide-react";
import { adminAiApi } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from "recharts";

interface AiEvaluation {
  parsed_data: {
    name?: string;
    email?: string;
    all_skills?: string[];
    years_experience?: number;
    education?: any[];
  };
  scores: {
    overall_score: number;
    quality_score: number;
    expertise_score: number;
    engagement_score: number;
    performance_score: number;
    reliability_score: number;
  };
  admin_recommendation: {
    decision: string;
    justification: string;
    areas_for_growth: string[];
    best_fit_projects: string[];
    recommended_roles: string[];
  };
  llm_status: string;
  created_at: string;
  predicted_tier?: string;
}

export default function ExpertVerification() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [data, setData] = useState<AiEvaluation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id && token) {
      setLoading(true);
      adminAiApi.getExpertAiEvaluation(id, token)
        .then((res) => {
          if (res.success && res.data) {
            setData(res.data);
          } else {
            setError("No AI evaluation found for this user.");
          }
        })
        .catch((err) => {
          console.error(err);
          setError(err.message || "Failed to fetch evaluation.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, token]);

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

  // ✅ FIX 1: Safely handle missing scores object
  const getScoreData = (scores: any) => {
    if (!scores) return [];
    return [
      { name: 'Quality', value: scores.quality_score || 0 },
      { name: 'Expertise', value: scores.expertise_score || 0 },
      { name: 'Engagement', value: scores.engagement_score || 0 },
      { name: 'Performance', value: scores.performance_score || 0 },
      { name: 'Reliability', value: scores.reliability_score || 0 },
    ];
  };

  if (loading) return (
    <AdminLayout>
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    </AdminLayout>
  );

  if (error || !data) return (
    <AdminLayout>
      <div className="p-8 text-center text-zinc-500">
        <p>{error || "Evaluation data unavailable."}</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
      </div>
    </AdminLayout>
  );

  // ✅ FIX 2: Safely extract arrays with fallbacks to prevent .map() crashes
  const skills = data?.parsed_data?.all_skills || [];
  const recommendedRoles = data?.admin_recommendation?.recommended_roles || [];
  const areasForGrowth = data?.admin_recommendation?.areas_for_growth || [];
  const yearsExperience = data?.parsed_data?.years_experience ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-6xl mx-auto pb-10">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              Expert Verification Review
              <Badge variant={data?.admin_recommendation?.decision === "approve" ? "default" : "destructive"} className="ml-2 uppercase">
                {data?.admin_recommendation?.decision || "PENDING"}
              </Badge>
            </h1>
            <p className="text-zinc-500 text-sm">Expert ID: <span className="font-mono">{id}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left Column: Scores */}
          <Card className="md:col-span-1 border-zinc-200 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-lg">AI Score Breakdown</CardTitle>
              <CardDescription>Overall Score: <span className="font-bold text-zinc-900">{data?.scores?.overall_score || 0}/100</span></CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getScoreData(data?.scores)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {getScoreData(data?.scores).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Predicted Tier Section */}
              <div className="mt-4 pt-4 border-t border-zinc-100 w-full text-center">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">
                  Predicted Tier
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-700">
                  <Award className="h-5 w-5" />
                  <span className="font-bold text-lg">{data?.predicted_tier || "Unranked"}</span>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Right Column: Recommendation & Details */}
          <div className="md:col-span-2 space-y-6">
            <Card className="border-l-4 border-l-blue-500 shadow-sm bg-blue-50/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  Admin Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-white/60 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-zinc-900">{data?.parsed_data?.name || "Unknown Name"}</h3>
                      <div className="flex items-center gap-2 text-sm text-zinc-600">
                        <Mail className="h-3 w-3" />
                        <span>{data?.parsed_data?.email || "No email detected"}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 self-start sm:self-center">
                    {yearsExperience} Years Exp
                  </Badge>
                </div>

                <p className="text-zinc-800 font-medium leading-relaxed">
                  {data?.admin_recommendation?.justification || "No justification provided."}
                </p>
                
                {skills.length > 0 && (
                  <div>
                    <h4 className="text-xs font-bold uppercase text-zinc-500 mb-3 flex items-center gap-2">
                      <Wrench className="h-3 w-3" /> Detected Skills
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-blue-100/50">
                  <div>
                    <h4 className="text-xs font-bold uppercase text-zinc-500 mb-2">Recommended Roles</h4>
                    <div className="flex flex-wrap gap-2">
                      {recommendedRoles.length > 0 ? recommendedRoles.map((role: string) => (
                        <Badge key={role} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {role}
                        </Badge>
                      )) : <span className="text-sm text-zinc-400">None</span>}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase text-zinc-500 mb-2">Areas for Growth</h4>
                    {areasForGrowth.length > 0 ? (
                      <ul className="text-sm list-disc pl-4 text-zinc-600 space-y-1">
                        {areasForGrowth.map((area: string, i: number) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    ) : <span className="text-sm text-zinc-400">None identified.</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-zinc-500" /> Experience Level
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="text-3xl font-bold text-zinc-900">
                     {yearsExperience} 
                     <span className="text-sm font-normal text-zinc-500 ml-1">Years</span>
                   </div>
                   <p className="text-xs text-zinc-500 mt-1">
                     Based on resume timeline analysis.
                   </p>
                </CardContent>
              </Card>

              <Card className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-zinc-500" /> Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500">LLM Status</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 uppercase text-xs">
                          {data?.llm_status || "Unknown"}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-500">Analyzed On</span>
                        <span className="font-medium">
                          {data?.created_at ? new Date(data.created_at).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                   </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex gap-4 pt-4">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-sm">
                  Approve Expert
                </Button>
                <Button variant="destructive" className="w-full font-semibold shadow-sm">
                  Reject Expert
                </Button>
            </div>

          </div>
        </div>
      </div>
    </AdminLayout>
  );
}