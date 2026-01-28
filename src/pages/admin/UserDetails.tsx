import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  useAdminUser,
  useAdminProfileContracts,
  useAdminUserProjects,
  useAdminActions,
} from "@/hooks/useAdmin";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Mail,
  Calendar,
  MapPin,
  DollarSign,
  ShieldCheck,
  Ban,
  AlertTriangle,
  Briefcase,
  FileSignature,
  Lightbulb,
  FileText,
  Package,
  ExternalLink,
  Brain, // <--- Ensure Brain is imported
} from "lucide-react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/admin/DataTable";
import { adminApi } from "@/lib/api";

const getFileNameFromUrl = (url: string) => {
  if (!url) return "Unknown Link";
  try {
    const decodedUrl = decodeURIComponent(url);
    const parts = decodedUrl.split("/");
    const lastPart = parts[parts.length - 1];
    if (lastPart.trim() === "") return parts[parts.length - 2] || url;
    return lastPart.split("?")[0];
  } catch (e) {
    return url;
  }
};

const normalizeExternalUrl = (raw: string) => {
  const v = String(raw || "").trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
};

export default function UserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const { data: user, isLoading } = useAdminUser(id || "");
  const { data: projects, isLoading: isLoadingProjects } = useAdminUserProjects(
    id || "",
  );
  const { banUser, unbanUser, verifyExpert, updateExpertStatus, isActing } =
    useAdminActions();

  const [showBanDialog, setShowBanDialog] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [showExpertDialog, setShowExpertDialog] = useState(false);
  const [expertStatus, setExpertStatus] = useState<string>("");
  const [tierLevel, setTierLevel] = useState<string>("");
  const [openingDocId, setOpeningDocId] = useState<string | null>(null);

  const [profileTab, setProfileTab] = useState<"expert" | "buyer">("expert");

  const roles: string[] = Array.isArray((user as any)?.roles)
    ? (((user as any).roles as any[]) || []).map((r) => String(r).toLowerCase())
    : (user as any)?.role
      ? [String((user as any).role).toLowerCase()]
      : [];
  const hasExpertProfile =
    roles.includes("expert") || !!(user as any)?.expert_profile_id;
  const hasBuyerProfile =
    roles.includes("buyer") || !!(user as any)?.buyer_profile_id;

  const buyerClientType = String(
    (user as any)?.client_type || "individual",
  ).toLowerCase();
  const isBuyerOrganisation = buyerClientType === "organisation";

  const buyerLocation = [
    (user as any)?.account_city,
    (user as any)?.account_state,
    (user as any)?.account_country,
  ]
    .map((s: any) => String(s || "").trim())
    .filter(Boolean)
    .join(", ");

  const buyerWebsite = String(
    (user as any)?.account_website_url || (user as any)?.company_website || "",
  ).trim();
  const buyerLinkedIn = String(
    (user as any)?.account_linkedin_url || "",
  ).trim();
  const buyerGithub = String((user as any)?.account_github_url || "").trim();

  const buyerLocationDisplay =
    buyerLocation || String((user as any)?.location || "").trim();

  const buyerProfileId = (user as any)?.buyer_profile_id as string | undefined;
  const expertProfileId = (user as any)?.expert_profile_id as
    | string
    | undefined;

  const { data: buyerContracts, isLoading: isLoadingBuyerContracts } =
    useAdminProfileContracts(buyerProfileId, "buyer");
  const { data: expertContracts, isLoading: isLoadingExpertContracts } =
    useAdminProfileContracts(expertProfileId, "expert");

  useEffect(() => {
    if (!user) return;
    const fallbackTab: "expert" | "buyer" = hasExpertProfile
      ? "expert"
      : "buyer";
    const isCurrentTabValid =
      (profileTab === "expert" && hasExpertProfile) ||
      (profileTab === "buyer" && hasBuyerProfile);
    if (!isCurrentTabValid) setProfileTab(fallbackTab);
  }, [user, hasExpertProfile, hasBuyerProfile, profileTab]);

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-96 items-center justify-center">
          Loading user profile...
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="p-8 text-center">
          <h2 className="text-xl font-bold">User not found</h2>
          <Button variant="link" onClick={() => navigate("/admin/users")}>
            Back to Users
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const expertDocuments: any[] = Array.isArray((user as any).expert_documents)
    ? (user as any).expert_documents
    : [];
  const resumeDocs = expertDocuments.filter(
    (d) => String(d?.document_type || "").toLowerCase() === "resume",
  );
  const nonResumeDocs = expertDocuments.filter(
    (d) => String(d?.document_type || "").toLowerCase() !== "resume",
  );

  // Keep in sync with backend allowed expert document types:
  // resume, work, credential, publication, other
  const workDocs = nonResumeDocs.filter(
    (d) => String(d?.document_type || "").toLowerCase() === "work",
  );
  const publicationDocs = nonResumeDocs.filter(
    (d) => String(d?.document_type || "").toLowerCase() === "publication",
  );
  const credentialDocs = nonResumeDocs.filter(
    (d) => String(d?.document_type || "").toLowerCase() === "credential",
  );
  // Everything else goes to “Other” (includes explicit 'other' and any unknown types)
  const otherDocs = nonResumeDocs.filter((d) => {
    const t = String(d?.document_type || "").toLowerCase();
    return !["work", "publication", "credential"].includes(t);
  });

  const getDocDisplayName = (doc: any) => {
    const title = String(doc?.title || "").trim();
    if (title) return title;
    const url = String(doc?.url || "").trim();
    if (url) return getFileNameFromUrl(url);
    return "Unknown Link";
  };

  const openDocument = async (doc: any) => {
    const docId = String(doc?.id || "");
    if (!docId || !token) return;

    try {
      setOpeningDocId(docId);
      const rawUrl = String(doc?.url || "");
      const isHttp = /^https?:\/\//i.test(rawUrl);

      const finalUrl = isHttp
        ? rawUrl
        : (await adminApi.getDocumentSignedUrl(docId, token)).data.url;

      window.open(finalUrl, "_blank", "noopener,noreferrer");
    } finally {
      setOpeningDocId(null);
    }
  };

  const effectiveExpertStatus = expertStatus || user.expert_status || "";
  const effectiveTierLevel = tierLevel || String((user as any).tier_level || 1);

  const tierNameForLevel = (level: number) => {
    const names: Record<number, string> = {
      1: "Newcomer",
      2: "Emerging Professional",
      3: "Competent Expert",
      4: "Established Expert",
      5: "Verified Specialist",
      6: "Senior Expert",
      7: "Master Practitioner",
      8: "Industry Leader",
      9: "Legendary",
      10: "Asteai Deeptech Pioneer",
    };
    return names[level] || `Level ${level}`;
  };

  const computedTierName = tierNameForLevel(Number(effectiveTierLevel));

  const buyerContractsCount = Array.isArray(buyerContracts)
    ? buyerContracts.length
    : 0;
  const expertContractsCount = Array.isArray(expertContracts)
    ? expertContracts.length
    : 0;

  const contractColumns = [
    {
      header: "Contract",
      accessorKey: "id",
      className: "font-mono text-xs",
      cell: (item: any) => `#${item.id.slice(0, 8)}`,
    },
    {
      header: "Project",
      accessorKey: "project_title",
      className: "font-medium max-w-[200px] truncate",
      cell: (item: any) => item.project_title,
    },
    {
      header: "Type",
      cell: (item: any) => (
        <Badge variant="outline" className="capitalize">
          {item.engagement_model}
        </Badge>
      ),
    },
    {
      header: "Amount",
      cell: (item: any) => (
        <span className="font-mono text-sm">
          ${Number(item.total_amount).toLocaleString()}
        </span>
      ),
    },
    {
      header: "Status",
      cell: (item: any) => (
        <Badge
          className={
            item.status === "active"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-700"
          }
        >
          {item.status}
        </Badge>
      ),
    },
    {
      header: "Date",
      cell: (item: any) =>
        item.created_at
          ? format(new Date(item.created_at), "MMM d, yyyy")
          : "-",
    },
  ];

  const projectColumns = [
    {
      header: "Project",
      accessorKey: "title",
      className: "font-medium max-w-[240px] truncate",
      cell: (item: any) => item.title,
    },
    {
      header: "Status",
      cell: (item: any) => (
        <Badge variant="outline" className="capitalize">
          {String(item.status || "draft").replace("_", " ")}
        </Badge>
      ),
    },
    {
      header: "Budget",
      cell: (item: any) => {
        const min = item.budget_min != null ? Number(item.budget_min) : null;
        const max = item.budget_max != null ? Number(item.budget_max) : null;
        if (min == null && max == null) return "-";
        if (min != null && max != null)
          return `$${min.toLocaleString()} – $${max.toLocaleString()}`;
        return `$${(min ?? max ?? 0).toLocaleString()}`;
      },
    },
    {
      header: "Date",
      cell: (item: any) =>
        item.created_at
          ? format(new Date(item.created_at), "MMM d, yyyy")
          : "-",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/admin/users")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold text-zinc-900">User Profile</h1>

          {hasExpertProfile && hasBuyerProfile && (
            <Tabs
              value={profileTab}
              onValueChange={(v) => setProfileTab(v as any)}
              className="ml-2"
            >
              <TabsList className="bg-white border border-zinc-200">
                <TabsTrigger value="expert">Expert</TabsTrigger>
                <TabsTrigger value="buyer">Buyer</TabsTrigger>
              </TabsList>
            </Tabs>
          )}

          <div className="ml-auto flex gap-2">
            {/* ✅ NEW: AI Analysis Button */}
            {hasExpertProfile && (
              <Button
                variant="outline"
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
                onClick={() =>
                  navigate(`/admin/experts/${user.id}/verification`)
                }
              >
                <Brain className="mr-2 h-4 w-4" /> View AI Analysis
              </Button>
            )}

            {hasExpertProfile && profileTab === "expert" && (
              <Button
                variant="outline"
                onClick={() => {
                  setExpertStatus(user.expert_status || "pending_review");
                  setTierLevel(String((user as any).tier_level || 1));
                  setShowExpertDialog(true);
                }}
                disabled={isActing}
              >
                Update Tier
              </Button>
            )}

            {hasExpertProfile &&
              profileTab === "expert" &&
              user.expert_status === "pending_review" &&
              !user.is_banned && (
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => verifyExpert(user.id)}
                  disabled={isActing}
                >
                  <ShieldCheck className="mr-2 h-4 w-4" /> Verify Expert
                </Button>
              )}
            {!user.is_banned && (
              <Button
                variant="destructive"
                onClick={() => setShowBanDialog(true)}
                disabled={isActing}
              >
                <Ban className="mr-2 h-4 w-4" /> Ban User
              </Button>
            )}
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6 items-start">
                <Avatar className="h-24 w-24 border-2 border-zinc-100">
                  <AvatarImage src={user.avatar_url} />
                  <AvatarFallback className="text-2xl bg-zinc-900 text-white">
                    {user.first_name?.[0]}
                    {user.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-2xl font-bold text-zinc-900">
                        {user.first_name} {user.last_name}
                      </h2>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex flex-wrap gap-1">
                          {(roles.length
                            ? roles
                            : [String(user.role || "buyer")]
                          ).map((r) => (
                            <Badge
                              key={r}
                              variant="outline"
                              className="capitalize"
                            >
                              {r}
                            </Badge>
                          ))}
                        </div>
                        {user.is_banned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-blue-200">
                            Active
                          </Badge>
                        )}
                        {hasExpertProfile && user.expert_status && (
                          <Badge
                            variant={
                              user.expert_status === "verified"
                                ? "default"
                                : "secondary"
                            }
                            className="capitalize bg-emerald-50 text-emerald-700 border-emerald-200"
                          >
                            {user.expert_status.replace("_", " ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-sm text-zinc-600 pt-2">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-zinc-400" />
                      {user.email}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-zinc-400" />
                      Joined {format(new Date(user.joined), "MMM d, yyyy")}
                    </div>
                    {user.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-zinc-400" />
                        {user.location}
                      </div>
                    )}
                  </div>

                  {hasExpertProfile && profileTab === "expert" && (
                    <div className="pt-4 mt-4 border-t border-zinc-100 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-zinc-500 uppercase font-bold">
                          Hourly Rate
                        </p>
                        <p className="font-semibold text-zinc-900">
                          ${(user as any).avg_hourly_rate || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase font-bold">
                          Daily Rate
                        </p>
                        <p className="font-semibold text-zinc-900">
                          ${user.avg_daily_rate || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase font-bold">
                          Sprint Rate
                        </p>
                        <p className="font-semibold text-zinc-900">
                          ${user.avg_sprint_rate || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500 uppercase font-bold">
                          Fixed Rate
                        </p>
                        <p className="font-semibold text-zinc-900">
                          ${user.avg_fixed_rate || 0}
                        </p>
                      </div>
                    </div>
                  )}

                  {hasExpertProfile &&
                    profileTab === "expert" &&
                    user.experience_summary && (
                      <div className="pt-4 mt-4 border-t border-zinc-100">
                        <h4 className="text-sm font-semibold mb-1 text-zinc-900">
                          Bio / Experience
                        </h4>
                        <p className="text-sm text-zinc-600 leading-relaxed">
                          {user.experience_summary}
                        </p>
                      </div>
                    )}

                  {hasExpertProfile && profileTab === "expert" && (
                    <div className="pt-4 mt-4 border-t border-zinc-100 space-y-3">
                      <Card className="border-zinc-200 shadow-sm">
                        <CardHeader className="py-3">
                          <CardTitle className="text-sm font-semibold flex items-center gap-2">
                            <FileText className="h-4 w-4 text-zinc-500" />{" "}
                            Resume
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {resumeDocs.length > 0 ? (
                            <div className="space-y-2">
                              {resumeDocs.map((doc, idx) => (
                                <div
                                  key={doc?.id || idx}
                                  className="flex items-center justify-between gap-3"
                                >
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-zinc-900 truncate">
                                      {getDocDisplayName(doc)}
                                    </p>
                                    <p className="text-xs text-zinc-500">
                                      {doc?.created_at
                                        ? format(
                                          new Date(doc.created_at),
                                          "MMM d, yyyy",
                                        )
                                        : ""}
                                    </p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => openDocument(doc)}
                                    disabled={
                                      !token ||
                                      openingDocId === String(doc?.id || "")
                                    }
                                    className="gap-2"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    {openingDocId === String(doc?.id || "")
                                      ? "Opening…"
                                      : "View"}
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-zinc-500">
                              No resume uploaded.
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {hasExpertProfile &&
                    profileTab === "expert" &&
                    user.skills &&
                    user.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {user.skills.map((skill: string, i: number) => (
                          <Badge
                            key={i}
                            variant="secondary"
                            className="bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                          >
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    )}

                  {hasBuyerProfile &&
                    profileTab === "buyer" &&
                    isBuyerOrganisation && (
                      <div className="pt-4 mt-4 border-t border-zinc-100">
                        <h4 className="text-sm font-semibold mb-1 text-zinc-900">
                          Company
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">
                              Name
                            </p>
                            <p className="font-medium text-zinc-900">
                              {(user as any).company_name || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">
                              Industry
                            </p>
                            <p className="font-medium text-zinc-900">
                              {(user as any).industry || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">
                              Client Type
                            </p>
                            <p className="font-medium text-zinc-900">
                              {(user as any).client_type || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">
                              Company Size
                            </p>
                            <p className="font-medium text-zinc-900">
                              {(user as any).company_size || "—"}
                            </p>
                          </div>
                        </div>
                        {(user as any).company_description && (
                          <p className="text-sm text-zinc-600 leading-relaxed mt-3">
                            {(user as any).company_description}
                          </p>
                        )}
                      </div>
                    )}

                  {hasBuyerProfile &&
                    profileTab === "buyer" &&
                    !isBuyerOrganisation && (
                      <div className="pt-4 mt-4 border-t border-zinc-100">
                        <h4 className="text-sm font-semibold mb-2 text-zinc-900">
                          Personal
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">
                              Client Type
                            </p>
                            <p className="font-medium text-zinc-900 capitalize">
                              {buyerClientType || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">
                              Location
                            </p>
                            <p className="font-medium text-zinc-900">
                              {buyerLocationDisplay || "—"}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">
                              Website
                            </p>
                            {buyerWebsite ? (
                              <a
                                className="inline-flex items-center gap-2 font-medium text-zinc-900 hover:underline"
                                href={normalizeExternalUrl(buyerWebsite)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open{" "}
                                <ExternalLink className="h-4 w-4 text-zinc-400" />
                              </a>
                            ) : (
                              <p className="font-medium text-zinc-900">—</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">
                              LinkedIn
                            </p>
                            {buyerLinkedIn ? (
                              <a
                                className="inline-flex items-center gap-2 font-medium text-zinc-900 hover:underline"
                                href={normalizeExternalUrl(buyerLinkedIn)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open{" "}
                                <ExternalLink className="h-4 w-4 text-zinc-400" />
                              </a>
                            ) : (
                              <p className="font-medium text-zinc-900">—</p>
                            )}
                          </div>
                          <div>
                            <p className="text-xs text-zinc-500 uppercase font-bold">
                              GitHub
                            </p>
                            {buyerGithub ? (
                              <a
                                className="inline-flex items-center gap-2 font-medium text-zinc-900 hover:underline"
                                href={normalizeExternalUrl(buyerGithub)}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                Open{" "}
                                <ExternalLink className="h-4 w-4 text-zinc-400" />
                              </a>
                            ) : (
                              <p className="font-medium text-zinc-900">—</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Side Card */}
          <div className="space-y-6">
            {hasExpertProfile && profileTab === "expert" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 uppercase">
                    Expert Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 rounded-md">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium">
                        Total Earnings
                      </span>
                    </div>
                    <span className="text-lg font-bold">
                      $
                      {Number(
                        (user as any).expert_total_earnings || 0,
                      ).toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-50 rounded-md">
                        <FileSignature className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium">Contracts</span>
                    </div>
                    <span className="font-bold">
                      {isLoadingExpertContracts ? "—" : expertContractsCount}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasBuyerProfile && profileTab === "buyer" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 uppercase">
                    Buyer Activity
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 rounded-md">
                        <DollarSign className="h-4 w-4 text-emerald-600" />
                      </div>
                      <span className="text-sm font-medium">Total Spent</span>
                    </div>
                    <span className="text-lg font-bold">
                      $
                      {Number(
                        (user as any).buyer_total_spent || 0,
                      ).toLocaleString()}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 rounded-md">
                        <Briefcase className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="text-sm font-medium">
                        Projects Posted
                      </span>
                    </div>
                    <span className="font-bold">
                      {Number((user as any).buyer_projects_posted || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-50 rounded-md">
                        <FileSignature className="h-4 w-4 text-purple-600" />
                      </div>
                      <span className="text-sm font-medium">Contracts</span>
                    </div>
                    <span className="font-bold">
                      {isLoadingBuyerContracts ? "—" : buyerContractsCount}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {user.is_banned && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-red-900 text-sm">
                        Account Suspended
                      </h4>
                      <p className="text-red-700 text-sm mt-1">
                        Reason: {user.ban_reason || "Violation of Terms"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasBuyerProfile && profileTab === "buyer" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 uppercase">
                    Buyer Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Client Type</span>
                    <span className="font-medium text-zinc-900 capitalize">
                      {buyerClientType || "—"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Location</span>
                    <span
                      className="font-medium text-zinc-900 truncate max-w-[200px]"
                      title={buyerLocationDisplay || "—"}
                    >
                      {buyerLocationDisplay || "—"}
                    </span>
                  </div>

                  <Separator />
                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase text-zinc-500">
                      Links
                    </div>
                    {buyerWebsite ? (
                      <a
                        className="flex items-center justify-between text-sm text-zinc-700 hover:text-zinc-900"
                        href={normalizeExternalUrl(buyerWebsite)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="truncate">Website</span>
                        <ExternalLink className="h-4 w-4 text-zinc-400" />
                      </a>
                    ) : (
                      <div className="flex items-center justify-between text-sm text-zinc-500">
                        <span>Website</span>
                        <span>—</span>
                      </div>
                    )}
                    {buyerLinkedIn ? (
                      <a
                        className="flex items-center justify-between text-sm text-zinc-700 hover:text-zinc-900"
                        href={normalizeExternalUrl(buyerLinkedIn)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="truncate">LinkedIn</span>
                        <ExternalLink className="h-4 w-4 text-zinc-400" />
                      </a>
                    ) : (
                      <div className="flex items-center justify-between text-sm text-zinc-500">
                        <span>LinkedIn</span>
                        <span>—</span>
                      </div>
                    )}
                    {buyerGithub ? (
                      <a
                        className="flex items-center justify-between text-sm text-zinc-700 hover:text-zinc-900"
                        href={normalizeExternalUrl(buyerGithub)}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="truncate">GitHub</span>
                        <ExternalLink className="h-4 w-4 text-zinc-400" />
                      </a>
                    ) : (
                      <div className="flex items-center justify-between text-sm text-zinc-500">
                        <span>GitHub</span>
                        <span>—</span>
                      </div>
                    )}
                  </div>

                  {isBuyerOrganisation && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600">Company</span>
                        <span className="font-medium text-zinc-900 truncate max-w-[160px]">
                          {(user as any).company_name || "—"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-zinc-600">Industry</span>
                        <span className="font-medium text-zinc-900 truncate max-w-[160px]">
                          {(user as any).industry || "—"}
                        </span>
                      </div>
                    </>
                  )}
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Total Spent</span>
                    <span className="font-bold">
                      $
                      {Number(
                        (user as any).buyer_total_spent || 0,
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">
                      Projects Posted
                    </span>
                    <span className="font-bold">
                      {Number((user as any).buyer_projects_posted || 0)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Hires Made</span>
                    <span className="font-bold">
                      {Number((user as any).buyer_hires_made || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {hasExpertProfile && profileTab === "expert" && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-500 uppercase">
                    User Scoring
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Overall</span>
                    <span className="font-bold text-zinc-900">
                      {Number(user.overall_score || 0).toFixed(1)}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Expertise</span>
                    <span className="font-medium">
                      {Number(user.expertise_score || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Performance</span>
                    <span className="font-medium">
                      {Number(user.performance_score || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Reliability</span>
                    <span className="font-medium">
                      {Number(user.reliability_score || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Quality</span>
                    <span className="font-medium">
                      {Number(user.quality_score || 0).toFixed(1)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">Engagement</span>
                    <span className="font-medium">
                      {Number(user.engagement_score || 0).toFixed(1)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* View-specific details */}
        {hasExpertProfile && profileTab === "expert" && (
          <Tabs defaultValue="contracts" className="w-full">
            <TabsList className="bg-white border border-zinc-200">
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="work">Work</TabsTrigger>
              <TabsTrigger value="publications">Publications</TabsTrigger>
              <TabsTrigger value="credentials">Credentials</TabsTrigger>
              <TabsTrigger value="other">Other</TabsTrigger>
            </TabsList>

            <TabsContent value="contracts" className="mt-4">
              <DataTable
                columns={contractColumns}
                data={expertContracts || []}
                isLoading={isLoadingExpertContracts}
              />
            </TabsContent>

            <TabsContent value="work" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-zinc-100">
                    {workDocs.map((doc: any, i: number) => (
                      <div key={doc?.id || i} className="p-4 hover:bg-zinc-50">
                        <button
                          type="button"
                          onClick={() => openDocument(doc)}
                          disabled={
                            !token || openingDocId === String(doc?.id || "")
                          }
                          className="w-full text-left font-medium text-zinc-900 hover:underline hover:text-blue-600 flex items-center gap-2"
                        >
                          <span className="truncate">
                            {getDocDisplayName(doc)}
                          </span>
                          <ExternalLink className="h-3 w-3 text-zinc-400" />
                        </button>
                      </div>
                    ))}
                    {workDocs.length === 0 && (
                      <div className="p-8 text-center text-zinc-500">
                        No work documents found.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="publications" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-zinc-100">
                    {publicationDocs.map((doc: any, i: number) => (
                      <div key={doc?.id || i} className="p-4 hover:bg-zinc-50">
                        <button
                          type="button"
                          onClick={() => openDocument(doc)}
                          disabled={
                            !token || openingDocId === String(doc?.id || "")
                          }
                          className="w-full text-left font-medium text-zinc-900 hover:underline hover:text-blue-600 flex items-center gap-2"
                        >
                          <span className="truncate">
                            {getDocDisplayName(doc)}
                          </span>
                          <ExternalLink className="h-3 w-3 text-zinc-400" />
                        </button>
                      </div>
                    ))}
                    {publicationDocs.length === 0 && (
                      <div className="p-8 text-center text-zinc-500">
                        No publications found.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="credentials" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-zinc-100">
                    {credentialDocs.map((doc: any, i: number) => (
                      <div key={doc?.id || i} className="p-4 hover:bg-zinc-50">
                        <button
                          type="button"
                          onClick={() => openDocument(doc)}
                          disabled={
                            !token || openingDocId === String(doc?.id || "")
                          }
                          className="w-full text-left font-medium text-zinc-900 hover:underline hover:text-blue-600 flex items-center gap-2"
                        >
                          <span className="truncate">
                            {getDocDisplayName(doc)}
                          </span>
                          <ExternalLink className="h-3 w-3 text-zinc-400" />
                        </button>
                      </div>
                    ))}
                    {credentialDocs.length === 0 && (
                      <div className="p-8 text-center text-zinc-500">
                        No credentials found.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="other" className="mt-4">
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-zinc-100">
                    {otherDocs.map((doc: any, i: number) => (
                      <div
                        key={doc?.id || i}
                        className="p-4 flex items-center justify-between hover:bg-zinc-50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-zinc-900 truncate">
                            {getDocDisplayName(doc)}
                          </p>
                          <p className="text-xs text-zinc-500">
                            {doc?.created_at
                              ? format(new Date(doc.created_at), "MMM d, yyyy")
                              : ""}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openDocument(doc)}
                          disabled={
                            !token || openingDocId === String(doc?.id || "")
                          }
                          className="gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />{" "}
                          {openingDocId === String(doc?.id || "")
                            ? "Opening…"
                            : "View"}
                        </Button>
                      </div>
                    ))}
                    {otherDocs.length === 0 && (
                      <div className="p-8 text-center text-zinc-500">
                        No other documents found.
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}

        {hasBuyerProfile && profileTab === "buyer" && (
          <Tabs defaultValue="projects" className="w-full">
            <TabsList className="bg-white border border-zinc-200">
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="company">Company</TabsTrigger>
            </TabsList>

            <TabsContent value="projects" className="mt-4">
              <DataTable
                columns={projectColumns}
                data={projects || []}
                isLoading={isLoadingProjects}
              />
            </TabsContent>

            <TabsContent value="contracts" className="mt-4">
              <DataTable
                columns={contractColumns}
                data={buyerContracts || []}
                isLoading={isLoadingBuyerContracts}
              />
            </TabsContent>

            <TabsContent value="company" className="mt-4">
              <Card>
                <CardContent className="p-6 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-bold">
                        Company
                      </p>
                      <p className="font-medium text-zinc-900">
                        {(user as any).company_name || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-bold">
                        Client Type
                      </p>
                      <p className="font-medium text-zinc-900">
                        {(user as any).client_type || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-bold">
                        Industry
                      </p>
                      <p className="font-medium text-zinc-900">
                        {(user as any).industry || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-bold">
                        Company Size
                      </p>
                      <p className="font-medium text-zinc-900">
                        {(user as any).company_size || "—"}
                      </p>
                    </div>
                  </div>
                  {(user as any).company_website && (
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-bold">
                        Website
                      </p>
                      <a
                        className="text-primary hover:underline"
                        href={(user as any).company_website}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {(user as any).company_website}
                      </a>
                    </div>
                  )}
                  {(user as any).company_description && (
                    <div>
                      <p className="text-xs text-zinc-500 uppercase font-bold">
                        Description
                      </p>
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        {(user as any).company_description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Ban Dialog */}
      <Dialog open={showBanDialog} onOpenChange={setShowBanDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Ban User
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to ban{" "}
              <strong>
                {user.first_name} {user.last_name}
              </strong>
              ?
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Ban</Label>
              <Textarea
                id="reason"
                placeholder="e.g. Repeated TOS violations..."
                value={banReason}
                onChange={(e: any) => setBanReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowBanDialog(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await banUser(user.id, banReason);
                setShowBanDialog(false);
              }}
              disabled={isActing}
            >
              {isActing ? "Banning..." : "Confirm Ban"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Expert Vetting Dialog */}
      <Dialog open={showExpertDialog} onOpenChange={setShowExpertDialog}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Update Expert Tier</DialogTitle>
            <DialogDescription>
              Set the expert's tier and status.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <Label>Expert Status</Label>
              <Select
                value={effectiveExpertStatus}
                onValueChange={(v) => setExpertStatus(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="incomplete">incomplete</SelectItem>
                  <SelectItem value="pending_review">pending_review</SelectItem>
                  <SelectItem value="rookie">rookie</SelectItem>
                  <SelectItem value="verified">verified</SelectItem>
                  <SelectItem value="rejected">rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tier Level</Label>
              <Select
                value={effectiveTierLevel}
                onValueChange={(v) => setTierLevel(v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select tier level" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => {
                    const lvl = String(i + 1);
                    const name = tierNameForLevel(i + 1);
                    return (
                      <SelectItem key={lvl} value={lvl}>
                        L{lvl} · {name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <div className="text-xs text-zinc-500">
                Tier name auto-sets to:{" "}
                <span className="font-medium text-zinc-700">
                  {computedTierName}
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setShowExpertDialog(false)}
              disabled={isActing}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await updateExpertStatus(user.id, {
                  expert_status: effectiveExpertStatus,
                  tier_name: computedTierName,
                  tier_level: Number(effectiveTierLevel),
                });
                setShowExpertDialog(false);
              }}
              disabled={
                isActing ||
                !effectiveExpertStatus ||
                !computedTierName ||
                !Number.isInteger(Number(effectiveTierLevel))
              }
            >
              {isActing ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
