const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

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
      data: { user: any; tokens: { accessToken: string; refreshToken: string } };
    }>('/auth/login', { email, password }),

  register: (data: any) =>
    api.post<{
      success: boolean;
      data: { user: any; tokens: { accessToken: string; refreshToken: string } };
    }>('/auth/register', data),

  logout: (token: string) =>
    api.post('/auth/logout', undefined, token),

  getProfile: (token: string) =>
    api.get<{ success: boolean; data: any }>('/auth/me', token),
};

/* =========================
   EXPERTS
========================= */

export const expertsApi = {
  getAll: (token?: string, filters?: any) => {
    const params = new URLSearchParams();

    if (filters?.domains?.length)
      params.append('domain', filters.domains.join(','));
    if (filters?.rateMin)
      params.append('rateMin', filters.rateMin.toString());
    if (filters?.rateMax)
      params.append('rateMax', filters.rateMax.toString());
    if (filters?.onlyVerified)
      params.append('verified', 'true');
    if (filters?.searchQuery)
      params.append('queryText', filters.searchQuery);

    const query = params.toString() ? `?${params}` : '';
    return api.get<{ success: boolean; data: any[] }>(
      `/experts${query}`,
      token
    );
  },

  getById: (id: string, token?: string) =>
    api.get<{ success: boolean; data: any }>(
      `/experts/${id}`,
      token
    ),
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

  getInvoices: (contractId: string, token: string) =>
    api.get<{ success: boolean; data: any[] }>(
      `/contracts/${contractId}/invoices`,
      token
    ),
};

/* =========================
   WORK LOGS
========================= */

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

  finishSprint: (contractId: string, token: string) =>
    api.post(`/work-logs/${contractId}/finish-sprint`, {}, token),
};


/* =========================
   MESSAGES (FIXED)
========================= */

export const messagesApi = {
  startConversation: (
    participantId: string,
    token: string
  ) =>
    api.post<{
      conversation: any
    }>(
      '/conversations/start',
      { participantId },
      token
    ),

  getConversations: (token: string) =>
    api.get<{
      conversations: any[]
    }>(
      '/conversations',
      token
    ),

  getMessages: (conversationId: string, token: string) =>
    api.get<{
      messages: any[]
    }>(
      `/conversations/${conversationId}/messages`,
      token
    ),

  sendMessage: (conversationId: string, content: string, token: string) =>
    api.post<{
      message: any
    }>(
      `/conversations/${conversationId}/messages`,
      { content },
      token
    ),

  markAsRead: (conversationId: string, token: string) =>
    api.patch(
      `/conversations/${conversationId}/read`,
      {},
      token
    ),

  deleteConversation: (conversationId: string, token: string) =>
    api.delete(
      `/conversations/${conversationId}`,
      token
    ),
}
