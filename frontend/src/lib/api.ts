// API Configuration and Client for AUI Wellbeing Hub Backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

// Types
interface Room {
  id: string;
  slug: string;
  title: string;
  topic: string;
  isMinorSafe: boolean;
  createdAt?: string;
  _count?: {
    messages: number;
  };
}

interface MessageFromAPI {
  id: string;
  body: string;
  createdAt: string;
  flagged: boolean;
  flags?: string[];
  author: {
    id: string;
    displayName: string;
  };
}

// Token management
export const getToken = (): string | null => {
  return localStorage.getItem('auth_token');
};

export const setToken = (token: string): void => {
  localStorage.setItem('auth_token', token);
};

export const removeToken = (): void => {
  localStorage.removeItem('auth_token');
};

// API Client
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      const errorMessage = error.error || error.message || `HTTP ${response.status}`;
      console.error('API Error:', {
        endpoint,
        status: response.status,
        error: errorMessage,
        details: error
      });
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth endpoints
  async register(data: {
    email: string;
    password: string;
    displayName: string;
    age: number;
    role: string;
  }) {
    return this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe() {
    return this.request<{ user: any }>('/auth/me');
  }

  async consent(data: { userId: string; accepted: boolean }) {
    return this.request<{ user: any }>('/auth/consent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Triage endpoints
  async createTriage(data: {
    topic: string;
    moodScore: number;
    urgency: string;
    message?: string;
  }) {
    return this.request<any>(
      '/triage',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async getMyTriages() {
    return this.request<{ triages: any[] }>('/triage/my');
  }

  // Booking endpoints
  async getCounselors() {
    return this.request<{ counselors: any[] }>('/bookings/counselors');
  }

  async createBooking(data: {
    counselorId: string;
    startAt: string;
    endAt: string;
    notes?: string;
  }) {
    return this.request<{ booking: any }>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyBookings() {
    return this.request<{ bookings: any[] }>('/bookings/my');
  }

  async updateBooking(id: string, data: { status?: string; notes?: string }) {
    return this.request<{ booking: any }>(`/bookings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Peer rooms endpoints
  async getRooms() {
    return this.request<{ rooms: any[] }>('/rooms');
  }

  async getRoom(slug: string) {
    return this.request<Room>(`/rooms/${slug}`);
  }

  async getRoomMessages(slug: string, params?: { cursor?: string; limit?: number; since?: string }) {
    const queryParams = new URLSearchParams();
    if (params?.cursor) queryParams.append('cursor', params.cursor);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.since) queryParams.append('since', params.since);
    
    const query = queryParams.toString();
    return this.request<{ messages: MessageFromAPI[]; nextCursor: string | null; hasMore: boolean }>(
      `/rooms/${slug}/messages${query ? `?${query}` : ''}`
    );
  }

  async sendMessage(roomId: string, content: string) {
    return this.request<{ message: any }>(`/rooms/${roomId}/message`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }

  async getFlaggedMessages() {
    return this.request<{ messages: any[] }>('/rooms/moderation/flagged');
  }

  // Crisis endpoints
  async createCrisisAlert(message: string) {
    return this.request<{ alert: any }>('/crisis/alert', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  async getCrisisAlerts() {
    return this.request<{ alerts: any[] }>('/crisis/alerts');
  }

  async updateCrisisAlert(id: string, status: string) {
    return this.request<{ alert: any }>(`/crisis/alerts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // Admin endpoints
  async getMetrics() {
    return this.request<{ metrics: any }>('/admin/metrics');
  }
}

export const api = new ApiClient(API_BASE_URL);
export { WS_URL };
