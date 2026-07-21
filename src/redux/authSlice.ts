import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axiosInstance, { resolveTokenRefresh, rejectTokenRefresh } from "../helpers/axiosInstance";
import type { RootState } from "./store";
import { API_URL } from "../helpers/constants";
import type { AuthState, LoginCredentials, LoginResponse, LogoutResponse } from "../interface/AuthInterface";

// Helper functions for localStorage
const saveAuthToStorage = (
  username: string,
  accessToken: string,
  refreshToken: string,
  isAuthenticated: boolean
) => {
  try {
    localStorage.setItem("auth", JSON.stringify({ username, accessToken, refreshToken, isAuthenticated }));
  } catch (error) {
    console.error("Failed to save auth to localStorage:", error);
  }
};

export const removeAuthFromStorage = () => {
  try {
    localStorage.removeItem("auth");
  } catch (error) {
    console.error("Failed to remove auth from localStorage:", error);
  }
};

const loadAuthFromStorage = (): { username: string; accessToken: string; refreshToken: string } | null => {
  try {
    const stored = localStorage.getItem("auth");
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error("Failed to load auth from localStorage:", error);
    return null;
  }
};

// Initialize state with data from localStorage
const storedAuth = loadAuthFromStorage();
const initialState: AuthState = {
  isAuthenticated: !!(storedAuth?.accessToken),
  username: storedAuth?.username || null,
  accessToken: storedAuth?.accessToken || null,
  refreshToken: storedAuth?.refreshToken || null,
  sessionExpired: false,
  error: null,
  loading: false,
  logoutLoading: false,
  checkAuthLoading: false,
};

export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.post(`${API_URL}/api/admin/login`, credentials);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const logout = createAsyncThunk<LogoutResponse, void, { state: RootState }>(
  "auth/logout",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: AuthState };
    try {
      const response = await axiosInstance.post(
        `${API_URL}/api/admin/logout`,
        { refreshToken: auth.refreshToken },
        { headers: { Authorization: `Bearer ${auth.accessToken}` } }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Logout failed");
    }
  }
);

export const refreshAccessToken = createAsyncThunk<
  { accessToken: string; refreshToken: string },
  void,
  { state: RootState }
>(
  "auth/refreshAccessToken",
  async (_, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: AuthState };
    if (!auth.refreshToken) {
      rejectTokenRefresh();
      return rejectWithValue("No refresh token");
    }
    try {
      const response = await axiosInstance.post(`${API_URL}/api/admin/refresh`, {
        refreshToken: auth.refreshToken,
      });
      const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;

      const storedAuth = localStorage.getItem("auth");
      const currentAuth = storedAuth ? JSON.parse(storedAuth) : {};
      localStorage.setItem("auth", JSON.stringify({
        ...currentAuth,
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }));

      resolveTokenRefresh(newAccessToken);
      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch (error: any) {
      rejectTokenRefresh();
      return rejectWithValue(error.response?.data?.message || "Refresh failed");
    }
  }
);

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.accessToken;
    try {
      const response = await axiosInstance.get("/api/admin/check-auth", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue((error as any).response?.data?.message || "Auth check failed");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearAuth(state) {
      state.isAuthenticated = false;
      state.username = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.sessionExpired = false;
      state.error = null;
      state.logoutLoading = false;
      removeAuthFromStorage();
    },
    setSessionExpired(state, action: PayloadAction<boolean>) {
      state.sessionExpired = action.payload;
    },
    updateTokens(state, action: PayloadAction<{ accessToken: string; refreshToken: string }>) {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.username = action.payload.data.username;
        state.accessToken = action.payload.data.accessToken;
        state.refreshToken = action.payload.data.refreshToken;
        saveAuthToStorage(
          action.payload.data.username,
          action.payload.data.accessToken,
          action.payload.data.refreshToken,
          true
        );
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        removeAuthFromStorage();
      })
      .addCase(logout.pending, (state) => {
        state.logoutLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.username = null;
        state.accessToken = null;
        state.refreshToken = null;
        state.error = null;
        state.logoutLoading = false;
        removeAuthFromStorage();
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload as string;
        state.logoutLoading = false;
        state.isAuthenticated = false;
        state.username = null;
        state.accessToken = null;
        state.refreshToken = null;
        removeAuthFromStorage();
      })
      .addCase(refreshAccessToken.fulfilled, (state, action) => {
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.sessionExpired = false;
      })
      .addCase(refreshAccessToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.accessToken = null;
        state.refreshToken = null;
        state.sessionExpired = false;
        removeAuthFromStorage();
      })
      .addCase(checkAuth.pending, (state) => {
        state.checkAuthLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.checkAuthLoading = false;
        if (action.payload.statusCode === 200) {
          state.isAuthenticated = true;
          state.username = action.payload.data.user.username;
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.checkAuthLoading = false;
        state.isAuthenticated = false;
        state.username = null;
      });
  },
});

export const { clearError, clearAuth, setSessionExpired, updateTokens } = authSlice.actions;
export default authSlice.reducer;
