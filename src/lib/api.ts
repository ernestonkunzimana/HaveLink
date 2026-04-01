import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { toast } from 'react-hot-toast';

// Types
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'worker' | 'client';
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'worker' | 'client';
  permissions: string[];
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'cancelled';
  startDate: string;
  endDate?: string;
  budget: number;
  spent: number;
  progress: number;
  managerId: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  costPerUnit: number;
  supplier: string;
  location: string;
  status: 'available' | 'low_stock' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  projectId?: string;
  date: string;
  receipt?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ESGMetric {
  id: string;
  category: 'environmental' | 'social' | 'governance';
  metric: string;
  value: number;
  unit: string;
  target: number;
  projectId: string;
  reportDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProduceListing {
  id: string;
  cooperativeId: string;
  cropName: string;
  variety?: string;
  grade?: string;
  quantityKg: number;
  availableKg: number;
  pricePerKg: number;
  minPricePerKg?: number;
  currency: string;
  status: 'draft' | 'active' | 'bidding' | 'sold' | 'expired' | 'cancelled';
  listingType: 'instant' | 'auction' | 'contract';
  description?: string;
  location?: string;
  district?: string;
  harvestDate?: string;
  expiryDate?: string;
  isOrganic: boolean;
  cooperative?: { name: string };
  bids?: Bid[];
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  listingId: string;
  bidderId: string;
  bidderName?: string;
  bidPricePerKg: number;
  quantityKg: number;
  totalAmount: number;
  currency: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn' | 'countered' | 'expired';
  message?: string;
  listing?: ProduceListing;
  createdAt: string;
  updatedAt: string;
}

export interface WeighingRecord {
  id: string;
  deviceId: string;
  deviceName?: string;
  cooperativeId?: string;
  cropName: string;
  variety?: string;
  grossWeightKg: number;
  tareWeightKg: number;
  netWeightKg: number;
  moistureContent?: number;
  qualityGrade?: string;
  status: string;
  farmerName?: string;
  farmerId?: string;
  ticketNumber?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface MobileMoneyTx {
  id: string;
  provider: 'MTN' | 'Airtel' | 'Tigo' | 'Orange';
  transactionType: string;
  senderPhone: string;
  receiverPhone: string;
  amount: number;
  currency: string;
  status: string;
  internalReference: string;
  createdAt: string;
}

export interface PriceFloor {
  id: string;
  cropName: string;
  grade?: string;
  minPricePerKg: number;
  maxPricePerKg?: number;
  referencePricePerKg?: number;
  currency: string;
  district?: string;
  effectiveFrom: string;
  effectiveTo?: string;
  isActive: boolean;
  authority?: string;
}

export interface Cooperative {
  id: string;
  name: string;
  registrationNumber?: string;
  district?: string;
  memberCount: number;
  primaryCrops?: string[];
  isVerified: boolean;
  createdAt: string;
}
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: string;
  points: number;
  category: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
}

export interface LeaderboardEntry {
  userId: string;
  user: User;
  points: number;
  rank: number;
  badges: number;
  completedProjects: number;
}

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response: AxiosResponse) => {
        return response;
      },
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          
          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              this.setToken(response.data.accessToken);
              originalRequest.headers.Authorization = `Bearer ${response.data.accessToken}`;
              return this.client(originalRequest);
            }
          } catch (refreshError) {
            this.logout();
            window.location.href = '/auth/login';
          }
        }

        // Handle offline mode
        if (!navigator.onLine) {
          toast.error('You are offline. Some features may be limited.');
          return Promise.reject(new Error('Offline'));
        }

        // Show error toast
        const message = error.response?.data?.message || error.message || 'An error occurred';
        toast.error(message);

        return Promise.reject(error);
      }
    );
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
  }

  private setToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', token);
    }
  }

  private logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    const response = await this.client.post('/auth/login', credentials);
    return response.data;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<{ user: User; accessToken: string; refreshToken: string }>> {
    const response = await this.client.post('/auth/register', userData);
    return response.data;
  }

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> {
    const response = await this.client.post('/auth/refresh', { refreshToken });
    return response.data;
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    const response = await this.client.post('/auth/reset-password', { token, password });
    return response.data;
  }

  // User methods
  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.client.get('/users/me');
    return response.data;
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    const response = await this.client.patch('/users/me', userData);
    return response.data;
  }

  // Project methods
  async getProjects(page = 1, limit = 10): Promise<ApiResponse<Project[]>> {
    const response = await this.client.get(`/projects?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getProject(id: string): Promise<ApiResponse<Project>> {
    const response = await this.client.get(`/projects/${id}`);
    return response.data;
  }

  async createProject(projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    const response = await this.client.post('/projects', projectData);
    return response.data;
  }

  async updateProject(id: string, projectData: Partial<Project>): Promise<ApiResponse<Project>> {
    const response = await this.client.patch(`/projects/${id}`, projectData);
    return response.data;
  }

  async deleteProject(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/projects/${id}`);
    return response.data;
  }

  // Inventory methods
  async getInventory(page = 1, limit = 10): Promise<ApiResponse<InventoryItem[]>> {
    const response = await this.client.get(`/inventory?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getInventoryItem(id: string): Promise<ApiResponse<InventoryItem>> {
    const response = await this.client.get(`/inventory/${id}`);
    return response.data;
  }

  async createInventoryItem(itemData: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    const response = await this.client.post('/inventory', itemData);
    return response.data;
  }

  async updateInventoryItem(id: string, itemData: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    const response = await this.client.patch(`/inventory/${id}`, itemData);
    return response.data;
  }

  async deleteInventoryItem(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/inventory/${id}`);
    return response.data;
  }

  // Transaction methods
  async getTransactions(page = 1, limit = 10): Promise<ApiResponse<Transaction[]>> {
    const response = await this.client.get(`/transactions?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getTransaction(id: string): Promise<ApiResponse<Transaction>> {
    const response = await this.client.get(`/transactions/${id}`);
    return response.data;
  }

  async createTransaction(transactionData: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    const response = await this.client.post('/transactions', transactionData);
    return response.data;
  }

  async updateTransaction(id: string, transactionData: Partial<Transaction>): Promise<ApiResponse<Transaction>> {
    const response = await this.client.patch(`/transactions/${id}`, transactionData);
    return response.data;
  }

  async deleteTransaction(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/transactions/${id}`);
    return response.data;
  }

  // ESG Metrics methods
  async getESGMetrics(page = 1, limit = 10): Promise<ApiResponse<ESGMetric[]>> {
    const response = await this.client.get(`/esg-metrics?page=${page}&limit=${limit}`);
    return response.data;
  }

  async getESGMetric(id: string): Promise<ApiResponse<ESGMetric>> {
    const response = await this.client.get(`/esg-metrics/${id}`);
    return response.data;
  }

  async createESGMetric(metricData: Partial<ESGMetric>): Promise<ApiResponse<ESGMetric>> {
    const response = await this.client.post('/esg-metrics', metricData);
    return response.data;
  }

  async updateESGMetric(id: string, metricData: Partial<ESGMetric>): Promise<ApiResponse<ESGMetric>> {
    const response = await this.client.patch(`/esg-metrics/${id}`, metricData);
    return response.data;
  }

  async deleteESGMetric(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/esg-metrics/${id}`);
    return response.data;
  }

  // Gamification methods
  async getUserBadges(userId: string): Promise<ApiResponse<UserBadge[]>> {
    const response = await this.client.get(`/users/${userId}/badges`);
    return response.data;
  }

  async getLeaderboard(limit = 10): Promise<ApiResponse<LeaderboardEntry[]>> {
    const response = await this.client.get(`/leaderboard?limit=${limit}`);
    return response.data;
  }

  async getBadges(): Promise<ApiResponse<Badge[]>> {
    const response = await this.client.get('/badges');
    return response.data;
  }

  // Dashboard methods
  async getDashboardStats(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/dashboard/stats');
    return response.data;
  }

  async getRecentActivities(limit = 10): Promise<ApiResponse<any[]>> {
    const response = await this.client.get(`/activities/recent?limit=${limit}`);
    return response.data;
  }

  // ==================== HarvestLink Marketplace ====================

  // Marketplace listings
  async getMarketplaceListings(params?: { cropName?: string; district?: string; status?: string; page?: number; limit?: number }): Promise<ApiResponse<ProduceListing[]>> {
    const query = new URLSearchParams();
    if (params?.cropName) query.set('cropName', params.cropName);
    if (params?.district) query.set('district', params.district);
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    const response = await this.client.get(`/marketplace?${query.toString()}`);
    return response.data;
  }

  async getListing(id: string): Promise<ApiResponse<ProduceListing>> {
    const response = await this.client.get(`/marketplace/${id}`);
    return response.data;
  }

  async createListing(data: Partial<ProduceListing>): Promise<ApiResponse<ProduceListing>> {
    const response = await this.client.post('/marketplace', data);
    return response.data;
  }

  async updateListing(id: string, data: Partial<ProduceListing>): Promise<ApiResponse<ProduceListing>> {
    const response = await this.client.put(`/marketplace/${id}`, data);
    return response.data;
  }

  async deleteListing(id: string): Promise<ApiResponse> {
    const response = await this.client.delete(`/marketplace/${id}`);
    return response.data;
  }

  async getMarketStats(): Promise<ApiResponse<any>> {
    const response = await this.client.get('/marketplace/stats');
    return response.data;
  }

  async getCooperativeListings(cooperativeId: string, page = 1, limit = 20): Promise<ApiResponse<ProduceListing[]>> {
    const response = await this.client.get(`/marketplace/cooperative/${cooperativeId}?page=${page}&limit=${limit}`);
    return response.data;
  }

  // Bidding
  async getListingBids(listingId: string, page = 1): Promise<ApiResponse<Bid[]>> {
    const response = await this.client.get(`/bids/listing/${listingId}?page=${page}`);
    return response.data;
  }

  async getMyBids(page = 1): Promise<ApiResponse<Bid[]>> {
    const response = await this.client.get(`/bids/my?page=${page}`);
    return response.data;
  }

  async placeBid(data: { listingId: string; bidPricePerKg: number; quantityKg: number; message?: string }): Promise<ApiResponse<Bid>> {
    const response = await this.client.post('/bids', data);
    return response.data;
  }

  async acceptBid(bidId: string): Promise<ApiResponse> {
    const response = await this.client.post(`/bids/${bidId}/accept`);
    return response.data;
  }

  async rejectBid(bidId: string, reason?: string): Promise<ApiResponse> {
    const response = await this.client.post(`/bids/${bidId}/reject`, { reason });
    return response.data;
  }

  async withdrawBid(bidId: string): Promise<ApiResponse> {
    const response = await this.client.post(`/bids/${bidId}/withdraw`);
    return response.data;
  }

  // Weighing
  async getWeighingRecords(params?: { cooperativeId?: string; page?: number }): Promise<ApiResponse<WeighingRecord[]>> {
    const query = new URLSearchParams();
    if (params?.cooperativeId) query.set('cooperativeId', params.cooperativeId);
    if (params?.page) query.set('page', String(params.page));
    const response = await this.client.get(`/weighing?${query.toString()}`);
    return response.data;
  }

  async recordWeighing(data: Partial<WeighingRecord>): Promise<ApiResponse<WeighingRecord>> {
    const response = await this.client.post('/weighing', data);
    return response.data;
  }

  async getWeighingStats(cooperativeId?: string): Promise<ApiResponse<any>> {
    const query = cooperativeId ? `?cooperativeId=${cooperativeId}` : '';
    const response = await this.client.get(`/weighing/stats${query}`);
    return response.data;
  }

  async verifyWeighingRecord(id: string): Promise<ApiResponse> {
    const response = await this.client.post(`/weighing/${id}/verify`);
    return response.data;
  }

  // Mobile Money
  async getMobileMoneyTransactions(page = 1): Promise<ApiResponse<MobileMoneyTx[]>> {
    const response = await this.client.get(`/mobile-money?page=${page}`);
    return response.data;
  }

  async initiateMobileMoneyPayment(data: {
    provider: 'MTN' | 'Airtel' | 'Tigo' | 'Orange';
    transactionType: 'payment' | 'payout' | 'escrow' | 'refund' | 'escrow_release';
    senderPhone: string;
    receiverPhone: string;
    amount: number;
    bidId?: string;
    listingId?: string;
  }): Promise<ApiResponse<{ id: string; internalReference: string; status: string }>> {
    const response = await this.client.post('/mobile-money/initiate', data);
    return response.data;
  }

  async releaseMobileMoneyEscrow(txId: string): Promise<ApiResponse> {
    const response = await this.client.post(`/mobile-money/${txId}/release-escrow`);
    return response.data;
  }

  async getMobileMoneyStatus(reference: string): Promise<ApiResponse<MobileMoneyTx>> {
    const response = await this.client.get(`/mobile-money/status/${reference}`);
    return response.data;
  }

  // Compliance & Price Floors
  async getPriceFloors(params?: { cropName?: string; district?: string; activeOnly?: boolean }): Promise<ApiResponse<PriceFloor[]>> {
    const query = new URLSearchParams();
    if (params?.cropName) query.set('cropName', params.cropName);
    if (params?.district) query.set('district', params.district);
    if (params?.activeOnly) query.set('activeOnly', 'true');
    const response = await this.client.get(`/compliance/price-floors?${query.toString()}`);
    return response.data;
  }

  async setPriceFloor(data: Partial<PriceFloor>): Promise<ApiResponse<PriceFloor>> {
    const response = await this.client.post('/compliance/price-floors', data);
    return response.data;
  }

  async updatePriceFloor(id: string, data: Partial<PriceFloor>): Promise<ApiResponse<PriceFloor>> {
    const response = await this.client.put(`/compliance/price-floors/${id}`, data);
    return response.data;
  }

  async getComplianceReport(params?: { startDate?: string; endDate?: string; district?: string }): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (params?.startDate) query.set('startDate', params.startDate);
    if (params?.endDate) query.set('endDate', params.endDate);
    if (params?.district) query.set('district', params.district);
    const response = await this.client.get(`/compliance/report?${query.toString()}`);
    return response.data;
  }

  async getMarketTrends(cropName: string, days = 30): Promise<ApiResponse<any>> {
    const response = await this.client.get(`/compliance/trends/${encodeURIComponent(cropName)}?days=${days}`);
    return response.data;
  }
}

export const apiClient = new ApiClient();
export default apiClient;