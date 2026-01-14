import { DayWorkSummary, Invoice } from "@/types";

const API_BASE_URL = import.meta.env.VITE_API_URL;

interface ApiError {
  error: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.endsWith('/')
      ? baseUrl.slice(0, -1)
      : baseUrl;
  }

  private getHeaders(token?: string): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ApiError = await response.json().catch(() => ({
        error: 'Network error',
        message: response.statusText,
      }));
      throw new Error(error.message || error.error);
    }
    return response.json() as Promise<T>;
  }

  get<T>(endpoint: string, token?: string): Promise<T> {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    }).then(res => this.handleResponse<T>(res));
  }

  post<T>(endpoint: string, data?: any, token?: string): Promise<T> {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.getHeaders(token),
      body: data ? JSON.stringify(data) : undefined,
    }).then(res => this.handleResponse<T>(res));
  }

  put<T>(endpoint: string, data?: any, token?: string): Promise<T> {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.getHeaders(token),
      body: data ? JSON.stringify(data) : undefined,
    }).then(res => this.handleResponse<T>(res));
  }

  patch<T>(endpoint: string, data?: any, token?: string): Promise<T> {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.getHeaders(token),
      body: data ? JSON.stringify(data) : undefined,
    }).then(res => this.handleResponse<T>(res));
  }

  delete<T>(endpoint: string, token?: string): Promise<T> {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.getHeaders(token),
    }).then(res => this.handleResponse<T>(res));
  }

  download(endpoint: string, token?: string): Promise<Blob> {
    return fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(token),
    }).then(res => res.blob());
  }

}

export const api = new ApiClient(API_BASE_URL);

/* =========================
   AUTH
========================= */

export const authApi = {
  refreshToken: (refreshToken: string) =>
    api.post<{ accessToken: string }>('/auth/refresh-token', { refreshToken }),

  login: (email: string, password: string) =>
    api.post<{
      success: boolean;
      message: string;
      data: { user: any; tokens: { accessToken: string; refreshToken: string } };
    }>('/auth/login', { email, password }),

  register: (data: any) =>
    api.post<{
      success: boolean;
      message: string;
      data: { user: any; tokens: { accessToken: string; refreshToken: string } };
    }>('/auth/register', data),

  logout: (token: string) =>
    api.post('/auth/logout', undefined, token),

  getMe: (token: string) =>
    api.get<{ success: boolean; data: { user: any } }>('/profile/me', token),

  updateProfile: (token: string, data: any) => {
    const cleanData = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );

    return api.patch<{ success: boolean; data: { user: any } }>(
      '/profile/me',
      cleanData,
      token
    );
  },

  sendEmailOtp: (email: string) =>
    api.post<{
      success: boolean;
      message: string;
    }>("/auth/email/send-otp", { email }),

  verifyEmailOtp: (data: { email: string; otp: string }) =>
    api.post<{
      success: boolean;
      message: string;
      data?: { signupTicket: string };
    }>("/auth/email/verify-otp", data),

  forgotPassword: (email: string) =>
    api.post<{ success: boolean; message: string; data?: { redirectTo?: string } }>(
      "/auth/password/forgot",
      { email }
    ),

  resetPassword: (data: { accessToken: string; refreshToken: string; password: string }) =>
    api.post<{ success: boolean; message: string }>("/auth/password/reset", data),

  uploadProfileMedia: async (
    token: string,
    file: File,
    type: 'avatar' | 'banner'
  ) => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(
      `${API_BASE_URL}/profile/media?type=${type}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Upload failed');
    }

    return res.json(); // { success, url }
  },

  switchRole: (token: string) =>
    api.post<{
      success: boolean;
      message: string;
      data: { role: string; tokens: { accessToken: string; refreshToken: string } }
    }>("/auth/switch-role", undefined, token),

  profile: {
    update(token: string, data: any) {
      return authApi.updateProfile(token, data);
    },
    uploadMedia(token: string, file: File, type: 'avatar' | 'banner') {
      return authApi.uploadProfileMedia(token, file, type);
    },
  },
};


/* =========================
   USERS (GENERIC)
========================= */

export const usersApi = {
  getReviews: (userId: string, token?: string, role?: 'buyer' | 'expert') => {
    const query = role ? `?role=${role}` : '';
    return api.get<{ success: boolean; data: any[] }>(`/profile/${userId}/reviews${query}`, token);
  },
};


/* =========================
   ADMIN
========================= */

export const adminApi = {
  getStats: (token: string) =>
    api.get<{ success: boolean; data: any }>('/admin/stats', token),

  getUsers: (token: string, search?: string, role?: string) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search);
    if (role && role !== 'all') params.append('role', role);
    return api.get<{ success: boolean; data: any[] }>(`/admin/users?${params.toString()}`, token);
  },

  getUserById: (id: string, token: string) =>
    api.get<{ success: boolean; data: any }>(`/admin/users/${id}`, token),

  getUserContracts: (id: string, token: string) =>
    api.get<{ success: boolean; data: any[] }>(`/admin/users/${id}/contracts`, token),

  banUser: (id: string, reason: string, token: string) =>
    api.put<{ success: boolean; message: string }>(`/admin/users/${id}/ban`, { reason }, token),

  unbanUser: (id: string, token: string) =>
    api.put<{ success: boolean; message: string }>(`/admin/users/${id}/unban`, {}, token),

  verifyExpert: (id: string, token: string) =>
    api.put<{ success: boolean; message: string }>(`/admin/users/${id}/verify`, {}, token),

  getProjects: (token: string) =>
    api.get<{ success: boolean; data: any[] }>('/admin/projects', token),

  approveProject: (id: string, token: string) =>
    api.put<{ success: boolean; message: string }>(`/admin/projects/${id}/approve`, {}, token),

  rejectProject: (id: string, token: string) =>
    api.put<{ success: boolean; message: string }>(`/admin/projects/${id}/reject`, {}, token),

  getContracts: (token: string) =>
    api.get<{ success: boolean; data: any[] }>('/admin/contracts', token),

  getDisputes: (token: string) =>
    api.get<{ success: boolean; data: any[] }>('/admin/disputes', token),

  resolveDispute: (id: string, decision: string, note: string | undefined, token: string) =>
    api.post<{ success: boolean; message: string }>(`/admin/disputes/${id}/resolve`, { decision, note }, token),

  getReports: (token: string) =>
    api.get<{ success: boolean; data: any[] }>('/admin/reports', token),

  actionReport: (id: string, action: string, token: string) =>
    api.post<{ success: boolean; message: string }>(`/admin/reports/${id}/action`, { action }, token),

  dismissReport: (id: string, token: string) =>
    api.put<{ success: boolean; message: string }>(`/admin/reports/${id}/dismiss`, {}, token),

  getPayouts: (token: string) =>
    api.get<{ success: boolean; data: any[] }>('/admin/payouts', token),

  processPayout: (id: string, token: string) =>
    api.post<{ success: boolean; message: string }>(`/admin/payouts/${id}/process`, {}, token),

  inviteAdmin: (email: string, token: string) =>
    api.post<{ success: boolean; message: string }>('/admin/invite', { email }, token),
};

/* =========================
   REPORTS (USER FACING)
========================= */

export const reportsApi = {
  create: (data: { reported_id: string; type: string; description: string; evidence?: any[] }, token: string) =>
    api.post<{ success: boolean; message: string }>('/reports', data, token),
};

/* =========================
   DISPUTES (USER FACING)
========================= */

export const disputesApi = {
  create: (data: { contract_id: string; reason: string; description: string; evidence?: any[] }, token: string) =>
    api.post<{ success: boolean; message: string }>('/disputes', data, token),
};


/* =========================
   CLIENTS (Formerly Buyers)
========================= */

export const clientsApi = {
  getById: (id: string, token?: string) =>
    api.get<{ data: any }>(`/buyers/${id}`, token),

  getPublicStats: (id: string, token?: string) =>
    api.get<{
      success: boolean;
      data: {
        total_spent: number;
        hire_rate: number;
        jobs_posted_count: number;
        avg_hourly_rate: number;
        hours_billed: number;
        member_since: string;
      }
    }>(`/buyers/${id}/stats`, token),

  getDashboardStats: (id: string, token: string) =>
    api.get<{
      success: boolean;
      data: {
        totalSpent: number;
        expertsHired: number;
        completedProjects: number;
      };
    }>(`/buyers/${id}/dashboard-stats`, token),
};

/* =========================
   EXPERTS
========================= */

export const expertsApi = {
  getAll: (
    token?: string,
    filters?: {
      domains?: string[];
      rateMin?: number;
      rateMax?: number;
      onlyVerified?: boolean;
      searchQuery?: string;
    }
  ) => {
    const params = new URLSearchParams();
    if (filters?.domains?.length) params.append("domain", filters.domains.join(","));
    if (filters?.rateMin) params.append("rateMin", filters.rateMin.toString());
    if (filters?.rateMax) params.append("rateMax", filters.rateMax.toString());
    if (filters?.onlyVerified) params.append("onlyVerified", "true");
    if (filters?.searchQuery) params.append("query", filters.searchQuery);

    const query = params.toString() ? `?${params.toString()}` : "";
    return api.get<{ data: any[] }>(`/experts${query}`, token);
  },

  getById: (id: string, token?: string) =>
    api.get<{ data: any }>(`/experts/${id}`, token),

  semanticSearch: (query: string, token?: string) =>
    api.post<{ results: any[]; query: string; totalResults: number }>(
      '/experts/semantic-search',
      { query },
      token
    ),

  updateById: (id: string, data: any, token: string) =>
    api.patch<{ success: boolean; data: any }>(
      `/experts/${id}`,
      data,
      token
    ),

  uploadDocument: async (token: string, formData: FormData) => {
    const response = await fetch(`${API_BASE_URL}/experts/documents`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || "Failed to upload document");
    }
    return response.json();
  },

  getResumeSignedUrl: (token: string) =>
    api.get<{ url: string }>('/experts/resume/signed-url', token),

  deleteDocument: async (token: string, documentId: string) => {
    const response = await fetch(
      `${API_BASE_URL}/experts/documents/${documentId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.message || 'Failed to delete document');
    }

    return response.json();
  },

  getDashboardStats: (id: string, token: string) =>
    api.get<{
      success: boolean;
      data: {
        totalEarnings: number;
        earningsChart: Array<{ name: string; value: number }>;
        trendPercentage: number;
        contractsEndingSoon: number;
      };
    }>(`/experts/${id}/dashboard-stats`, token),
};

/* =========================
   PROJECTS
========================= */

export const projectsApi = {
  getAll: (token: string, status?: string) => {
    const query = status ? `?status=${status}` : '';
    return api.get<{ success: boolean; data: any[] }>(
      `/projects${query}`,
      token
    );
  },

  getMarketplace: (
    token: string,
    filters?: { buyerId?: string }
  ) => {
    const params = new URLSearchParams();
    if (filters?.buyerId) params.append('buyer_id', filters.buyerId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return api.get<{ success: boolean; data: any[] }>(
      `/projects/marketplace${query}`,
      token
    );
  },

  getById: (id: string, token: string) =>
    api.get<{ success: boolean; data: any }>(
      `/projects/${id}`,
      token
    ),

  create: (data: any, token: string) =>
    api.post<{ success: boolean; data: any }>(
      '/projects',
      data,
      token
    ),

  update: (id: string, data: any, token: string) =>
    api.patch<{ success: boolean; data: any }>(
      `/projects/${id}`,
      data,
      token
    ),

  delete: (id: string, token: string) =>
    api.delete<{ success: boolean }>(
      `/projects/${id}`,
      token
    ),

  getProposals: (projectId: string, token: string) =>
    api.get<{ success: boolean; data: any[] }>(
      `/proposals/project/${projectId}`,
      token
    ),

  submitProposal: (projectId: string, data: any, token: string) =>
    api.post<{ success: boolean; data: any }>(
      '/proposals',
      data,
      token
    ),

  // NEW: Get proposals for the authenticated expert
  getExpertProposals: (token: string) =>
    api.get<{ success: boolean; data: any[] }>(
      '/proposals/expert/my-proposals',
      token
    ),
};

/* =========================
   INVITATIONS (NEW)
========================= */

export const invitationsApi = {
  send: (
    projectId: string,
    expertId: string,
    message: string,
    token: string,
    engagement_model?: string,
    payment_terms?: Record<string, any>
  ) =>
    api.post<{ success: boolean }>(
      '/invitations',
      {
        project_id: projectId,
        expert_profile_id: expertId,
        message,
        engagement_model,
        payment_terms
      },
      token
    ),

  getMyInvitations: (token: string) =>
    api.get<{ success: boolean; data: any[] }>('/invitations/me', token),

  updateStatus: (id: string, status: 'accepted' | 'declined', token: string) =>
    api.patch<{ success: boolean }>(`/invitations/${id}/status`, { status }, token),
};

/* =========================
   CONTRACTS
========================= */

export const contractsApi = {
  getAll: (token: string, status?: string) => {
    const query = status ? `?status=${status}` : '';
    return api.get<{ success: boolean; data: any[] }>(
      `/contracts${query}`,
      token
    );
  },

  getById: (id: string, token: string) =>
    api.get<{ success: boolean; data: any }>(
      `/contracts/${id}`,
      token
    ),

  getByProject: (projectId: string, token: string) =>
    api.get<{ success: boolean; data: any[] }>(
      `/contracts/project/${projectId}`,
      token
    ),

  create: (data: any, token: string) =>
    api.post<{ success: boolean; data: any }>(
      '/contracts',
      data,
      token
    ),

  acceptAndSignNda: (
    contractId: string,
    signature_name: string,
    token: string
  ) =>
    api.post<{ success: boolean; data: any }>(
      `/contracts/${contractId}/accept-and-sign-nda`,
      { signature_name },
      token
    ),

  updateNda: (
    contractId: string,
    nda_custom_content: string,
    token: string
  ) =>
    api.patch<{ success: boolean; data: any }>(
      `/contracts/${contractId}/nda`,
      { nda_custom_content, nda_status: 'sent' },
      token
    ),

  decline: (contractId: string, token: string, reason?: string) =>
    api.post<{
      projectId: any;
      success: boolean;
      message: string;
      data: { contractId: string; projectId: string };
    }>(
      `/contracts/${contractId}/decline`,
      { reason },
      token
    ),

  getInvoice: (invoiceId: string, token: string) =>
    api.get<{ success: boolean; data: Invoice }>('/invoices/' + invoiceId, token),

  payInvoice: (invoiceId: string, token: string) =>
    api.patch<{ success: boolean; data: any }>('/invoices/' + invoiceId + '/pay', undefined, token),

  getInvoices: (contractId: string, token: string) =>
    api.get<{ success: boolean; data: any[] }>(
      `/contracts/${contractId}/invoices`,
      token
    ),

  fundEscrow: (contractId: string, amount: number, token: string) =>
    api.post<{ success: boolean; data: any }>(
      `/contracts/${contractId}/fund`,
      { amount },
      token
    ),

  finishSprint: (contractId: string, token: string) =>
    api.post<{ success: boolean; data: any }>(
      `/contracts/${contractId}/finish-sprint`,
      undefined,
      token
    ),

  complete: (contractId: string, token: string) =>
    api.post<{ success: boolean; data: any }>(
      `/contracts/${contractId}/complete`,
      undefined,
      token
    ),

  submitFeedback: (contractId: string, rating: number, comment: string, token: string) =>
    api.post<{ success: boolean; data: any }>(
      `/contracts/${contractId}/feedback`,
      { rating, comment }, token),

  getFeedback: (contractId: string, token: string) =>
    api.get<{ success: boolean; data: any[] }>(
      `/contracts/${contractId}/feedback`, token),
};

/* =========================
   DAY WORK SUMMARIES + WORK LOGS
========================= */

export const dayWorkSummariesApi = {
  create: (
    contractId: string,
    work_date: string,
    total_hours: number,
    token: string
  ) =>
    api.post<{ success: boolean; data: DayWorkSummary }>(
      '/day-work-summaries',
      {
        contract_id: contractId,
        work_date,
        total_hours,
      },
      token
    ),

  getByContract: (contractId: string, token: string) =>
    api.get<{ success: boolean; data: DayWorkSummary[] }>(
      `/day-work-summaries/contract/${contractId}`,
      token
    ),

  approveOrReject: (
    summaryId: string,
    status: 'approved' | 'rejected',
    reviewer_comment: string | undefined,
    token: string
  ) =>
    api.patch<{ success: boolean; data: any }>(
      `/day-work-summaries/${summaryId}/status`,
      { status, reviewer_comment },
      token
    ),
};

export const workLogsApi = {
  create: async (contractId: string, data: any, token: string) => {
    const attachments: File[] | undefined = Array.isArray(data?.attachments)
      ? (data.attachments as File[])
      : undefined;

    if (attachments && attachments.length > 0) {
      const form = new FormData();
      form.append('contract_id', contractId);

      // Primitive fields
      if (data?.type) form.append('type', String(data.type));
      if (data?.description) form.append('description', String(data.description));
      if (data?.problems_faced) form.append('problems_faced', String(data.problems_faced));
      if (data?.log_date) form.append('log_date', String(data.log_date));

      // JSON fields
      if (data?.checklist) form.append('checklist', JSON.stringify(data.checklist));
      if (data?.evidence) form.append('evidence', JSON.stringify(data.evidence));

      for (const file of attachments.slice(0, 10)) {
        form.append('attachments', file);
      }

      const response = await fetch(`${API_BASE_URL}/work-logs`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(err.message || err.error || 'Failed to create work log');
      }

      return response.json();
    }

    // Default JSON path (no attachments)
    return api.post('/work-logs', { ...data, contract_id: contractId }, token);
  },

  update: async (workLogId: string, data: any, token: string) => {
    const attachments: File[] | undefined = Array.isArray(data?.attachments)
      ? (data.attachments as File[])
      : undefined;

    if (attachments && attachments.length > 0) {
      const form = new FormData();

      // Primitive fields
      if (data?.description) form.append('description', String(data.description));
      if (data?.problems_faced) form.append('problems_faced', String(data.problems_faced));
      if (data?.log_date) form.append('log_date', String(data.log_date));

      // JSON fields
      if (data?.checklist) form.append('checklist', JSON.stringify(data.checklist));
      if (data?.evidence) form.append('evidence', JSON.stringify(data.evidence));
      if (data?.evidence_summary) form.append('evidence_summary', String(data.evidence_summary));

      for (const file of attachments.slice(0, 10)) {
        form.append('attachments', file);
      }

      const response = await fetch(`${API_BASE_URL}/work-logs/${workLogId}/edit`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(err.message || err.error || 'Failed to update work log');
      }

      return response.json();
    }

    return api.patch(`/work-logs/${workLogId}/edit`, data, token);
  },

  getByContract: (contractId: string, token: string) =>
    api.get(`/work-logs/contract/${contractId}`, token),

  approve: (workLogId: string, token: string) =>
    api.patch(`/work-logs/${workLogId}`, { status: 'approved' }, token),

  reject: (workLogId: string, reason: string, token: string) =>
    api.patch(
      `/work-logs/${workLogId}`,
      { status: 'rejected', buyer_comment: reason },
      token
    ),
};

/* =========================
   MESSAGES
========================= */

export const messagesApi = {
  // Get all chats for current user
  getChats: (token: string) => api.get<any[]>("/chats", token),

  // Start or fetch direct chat with a user
  // Start or fetch direct chat with a user
  startDirectChat: (participantId: string, token: string, participantRole?: string) =>
    api.post<{ id: string; type: string; createdAt: string; members: any[] }>(
      "/chats/start",
      { participantId, participantRole },
      token
    ),

  // Get chat details with all members
  getChatDetails: (chatId: string, token: string) =>
    api.get<{ id: string; type: string; members: any[] }>(
      `/chats/${chatId}`,
      token
    ),

  // Get all messages in a chat
  getMessages: (chatId: string, token: string) =>
    api.get<any[]>(`/chats/${chatId}/messages`, token),

  // Send message to chat
  sendMessage: (chatId: string, content: string, token: string) =>
    api.post<{
      id: string;
      chatId: string;
      senderId: string;
      content: string;
      createdAt: string;
    }>(`/chats/${chatId}/messages`, { content }, token),

  // Add user to chat
  addChatMember: (chatId: string, userId: string, token: string) =>
    api.post<{ message: string; userId: string; chatId: string }>(
      `/chats/${chatId}/members`,
      { userId },
      token
    ),

  // Remove user from chat
  removeChatMember: (chatId: string, userId: string, token: string) =>
    api.delete<{ message: string; userId: string; chatId: string }>(
      `/chats/${chatId}/members`,
      token
    ),

  // Delete chat
  deleteChat: (chatId: string, token: string) =>
    api.delete<{ message: string; chatId: string }>(`/chats/${chatId}`, token),

  // Upload file attachment
  uploadAttachment: async (
    chatId: string,
    formData: FormData,
    token: string
  ) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_URL
      }/chats/${chatId}/attachments`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );
    if (!response.ok) {
      throw new Error("Failed to upload attachment");
    }
    return response.json();
  },

  // Download attachment
  downloadAttachment: (attachmentId, token) =>
    api.download(`/attachments/${attachmentId}`, token),

  // Delete attachment
  deleteAttachment: (attachmentId: string, token: string) =>
    api.delete<{ message: string; attachmentId: string }>(
      `/attachments/${attachmentId}`,
      token
    ),
};


/* =========================
   SCORING & RANKING
========================= */

export interface UserScoreResponse {
  success?: boolean;
  data: {
    user_id: string;
    expertise_score: number;
    performance_score: number;
    reliability_score: number;
    quality_score: number;
    engagement_score: number;
    overall_score: number;
    last_calculated_at?: string;
  };
}

export interface RankTierResponse {
  success?: boolean;
  data: {
    user_id: string;
    tier_name: string;
    tier_level: number;
    achieved_at?: string;
    previous_tier?: string | null;
    badge_icon?: string | null;
    tier_description?: string | null;
  };
}

export interface UserTagResponse {
  success?: boolean;
  data: Array<{
    id: string;
    user_id: string;
    tag_name: string;
    tag_category: string;
    tag_icon?: string | null;
    description?: string | null;
    score_contribution?: number;
    awarded_at?: string;
    expires_at?: string | null;
    display_priority?: number;
    is_verified_badge?: boolean;
  }>;
}

export interface LeaderboardEntry {
  user_id: string;
  first_name?: string | null;
  last_name?: string | null;
  avatar_url?: string | null;
  overall_score: number;
  tier_name?: string;
  tier_level?: number;
}

export const scoringApi = {
  getUserScore: (userId: string, token?: string) =>
    api.get<UserScoreResponse>(`/scoring/user/${userId}`, token),

  getUserRank: (userId: string, token?: string) =>
    api.get<RankTierResponse>(`/ranking/user/${userId}`, token),

  getUserTags: (userId: string, token?: string) =>
    api.get<UserTagResponse>(`/tags/user/${userId}`, token),

  getLeaderboard: (
    token?: string,
    params?: { limit?: number; role?: "expert" | "buyer" }
  ) => {
    const search = new URLSearchParams();
    if (params?.limit) search.append("limit", String(params.limit));
    if (params?.role) search.append("role", params.role);
    const q = search.toString() ? `?${search.toString()}` : "";
    return api.get<{ success?: boolean; data: LeaderboardEntry[] }>(
      `/scoring/leaderboard${q}`,
      token
    );
  },
};