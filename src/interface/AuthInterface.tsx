export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionExpired: boolean;
  error: string | null;
  loading: boolean;
  logoutLoading: boolean;
  checkAuthLoading: boolean;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  statusCode: number;
  message: string;
  data: {
    username: string;
    accessToken: string;
    refreshToken: string;
  };
}

export interface LogoutResponse {
  statusCode: number;
  message: string;
}
