import { ApiClient } from '../../../shared/services/api-client';
import { TokenStorage } from '../../../infrastructure/storage/token-storage';
import { User, UserRole } from '../types/auth.types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
}

export class AuthService {
  constructor(
    private apiClient: ApiClient,
    private tokenStorage: TokenStorage
  ) {}

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await this.apiClient.post<LoginResponse>('/auth/login', credentials);
    
    // Store tokens
    this.tokenStorage.setTokens(response.token, response.refreshToken);
    
    // Store user data
    this.tokenStorage.setUser(response.user);
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.apiClient.post('/auth/logout');
    } catch (error) {
      // Continue with logout even if server request fails
      console.warn('Logout request failed:', error);
    } finally {
      // Clear local storage
      this.tokenStorage.clearTokens();
      this.tokenStorage.clearUser();
    }
  }

  async refreshToken(): Promise<string> {
    const refreshToken = this.tokenStorage.getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await this.apiClient.post<RefreshTokenResponse>('/auth/refresh', {
        refreshToken
      });

      // Update stored tokens
      this.tokenStorage.setTokens(response.token, response.refreshToken);
      
      return response.token;
    } catch (error) {
      // Clear tokens on refresh failure
      this.tokenStorage.clearTokens();
      this.tokenStorage.clearUser();
      throw error;
    }
  }

  async getCurrentUser(): Promise<User | null> {
    // First try to get user from storage
    const storedUser = this.tokenStorage.getUser();
    if (storedUser) {
      return storedUser;
    }

    // If no stored user but we have a token, fetch from server
    const token = this.tokenStorage.getAccessToken();
    if (token) {
      try {
        const user = await this.apiClient.get<User>('/auth/me');
        this.tokenStorage.setUser(user);
        return user;
      } catch (error) {
        // Clear invalid token
        this.tokenStorage.clearTokens();
        return null;
      }
    }

    return null;
  }

  async updateProfile(updates: Partial<User>): Promise<User> {
    const updatedUser = await this.apiClient.patch<User>('/auth/profile', updates);
    this.tokenStorage.setUser(updatedUser);
    return updatedUser;
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.apiClient.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
  }

  async forgotPassword(email: string): Promise<void> {
    await this.apiClient.post('/auth/forgot-password', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await this.apiClient.post('/auth/reset-password', {
      token,
      newPassword
    });
  }

  isAuthenticated(): boolean {
    return !!this.tokenStorage.getAccessToken();
  }

  getCurrentUserRole(): UserRole | null {
    const user = this.tokenStorage.getUser();
    return user?.role || null;
  }

  hasRole(role: UserRole): boolean {
    const userRole = this.getCurrentUserRole();
    return userRole === role;
  }

  hasAnyRole(roles: UserRole[]): boolean {
    const userRole = this.getCurrentUserRole();
    return userRole ? roles.includes(userRole) : false;
  }

  isSuperAdmin(): boolean {
    return this.hasRole(UserRole.SUPER_ADMIN);
  }

  isCompanyOwner(): boolean {
    return this.hasRole(UserRole.COMPANY_OWNER);
  }

  canAccessCompany(companyId: string): boolean {
    const user = this.tokenStorage.getUser();
    
    if (!user) return false;
    
    // Super admins can access any company
    if (user.role === UserRole.SUPER_ADMIN) {
      return true;
    }
    
    // Other users can only access their own company
    return user.companyId === companyId;
  }

  canAccessBranch(branchId: string): boolean {
    const user = this.tokenStorage.getUser();
    
    if (!user) return false;
    
    // Super admins and company owners can access any branch in their scope
    if (user.role === UserRole.SUPER_ADMIN || user.role === UserRole.COMPANY_OWNER) {
      return true;
    }
    
    // Branch managers can only access their specific branch
    if (user.role === UserRole.BRANCH_MANAGER) {
      return user.branchId === branchId;
    }
    
    // Other roles inherit from branch assignment
    return user.branchId === branchId;
  }

  getCurrentCompanyId(): string | null {
    const user = this.tokenStorage.getUser();
    return user?.companyId || null;
  }

  getCurrentBranchId(): string | null {
    const user = this.tokenStorage.getUser();
    return user?.branchId || null;
  }

  // Token management
  getAuthHeaders(): Record<string, string> {
    const token = this.tokenStorage.getAccessToken();
    
    if (!token) {
      throw new Error('No authentication token available');
    }

    return {
      'Authorization': `Bearer ${token}`
    };
  }

  isTokenExpired(): boolean {
    const token = this.tokenStorage.getAccessToken();
    
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      
      return currentTime >= expirationTime;
    } catch (error) {
      return true; // Consider token expired if parsing fails
    }
  }

  async ensureValidToken(): Promise<string> {
    let token = this.tokenStorage.getAccessToken();
    
    if (!token || this.isTokenExpired()) {
      token = await this.refreshToken();
    }
    
    return token;
  }

  // Session management
  extendSession(): void {
    // Update last activity timestamp
    this.tokenStorage.setLastActivity(Date.now());
  }

  isSessionActive(): boolean {
    const lastActivity = this.tokenStorage.getLastActivity();
    const sessionTimeout = 24 * 60 * 60 * 1000; // 24 hours
    
    if (!lastActivity) return false;
    
    return (Date.now() - lastActivity) < sessionTimeout;
  }

  // Multi-tenant helpers
  getTenantContext(): {
    companyId: string | null;
    branchId: string | null;
    role: UserRole | null;
  } {
    const user = this.tokenStorage.getUser();
    
    return {
      companyId: user?.companyId || null,
      branchId: user?.branchId || null,
      role: user?.role || null
    };
  }
}