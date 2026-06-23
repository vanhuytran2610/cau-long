export interface AuthState {
  isAuthenticated: boolean;
  username: string | null;
  token: string | null;
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
    token: string;
  };
}

export interface LogoutResponse {
  statusCode: number;
  message: string;
}