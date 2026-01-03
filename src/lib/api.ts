import { DayWorkSummary, Invoice } from "@/types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL

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
}

export const api = new ApiClient(API_BASE_URL);

/* =========================
   AUTH
========================= */

export const authApi = {
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
    api.get<{ success: boolean; data: { user: any } }>('/auth/me', token),

  updateProfile: (token: string, data: any) =>
    api.patch<{ success: boolean; data: any }>(
      '/auth/me',
      data,
      token
    ),
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
    if (filters?.domains?.length)
      params.append("domain", filters.domains.join(","));
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
        // Content-Type is auto-set by browser for FormData
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error('Failed to upload document');
    }
    return response.json();
  },

  deleteDocument: (docId: string, token: string) =>
    api.delete<{ success: boolean }>(`/experts/documents/${docId}`, token)
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

  getMarketplace: (token: string) =>
    api.get<{ success: boolean; data: any[] }>(
      '/projects/marketplace',
      token
    ),

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
      { ...data, project_id: projectId },
      token
    ),
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
  create: (contractId: string, data: any, token: string) =>
    api.post('/work-logs', { ...data, contract_id: contractId }, token),

  update: (workLogId: string, data: any, token: string) =>
    api.patch(`/work-logs/${workLogId}/edit`, data, token),

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
  startDirectChat: (participantId: string, token: string) =>
    api.post<{ id: string; type: string; createdAt: string; members: any[] }>(
      "/chats/start",
      { participantId },
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
  downloadAttachment: (attachmentId: string, token: string) =>
    api.get<Blob>(`/attachments/${attachmentId}`, token),

  // Delete attachment
  deleteAttachment: (attachmentId: string, token: string) =>
    api.delete<{ message: string; attachmentId: string }>(
      `/attachments/${attachmentId}`,
      token
    ),
};