import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "./store";
import { API_URL } from "../helpers/constants";
import type { AuthState, LoginCredentials, LoginResponse, LogoutResponse } from "../helpers/AuthInterface";



// Helper functions for localStorage
const saveAuthToStorage = (
  username: string,
  token: string,
  isAuthenticated: boolean
) => {
  try {
    localStorage.setItem(
      "auth",
      JSON.stringify({ username, token, isAuthenticated })
    );
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

const loadAuthFromStorage = (): { username: string; token: string } | null => {
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
  isAuthenticated: !!storedAuth,
  username: storedAuth?.username || null,
  token: storedAuth?.token || null,
  error: null,
  loading: false,
  logoutLoading: false,
  checkAuthLoading: false,
};

export const login = createAsyncThunk<LoginResponse, LoginCredentials>(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${API_URL}/api/admin/login`,
        credentials
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Login failed");
    }
  }
);

export const logout = createAsyncThunk<
  LogoutResponse,
  void,
  { state: RootState }
>("auth/logout", async (_, { getState, rejectWithValue }) => {
  const { auth } = getState() as { auth: AuthState };
  try {
    const response = await axios.post(
      `${API_URL}/api/admin/logout`,
      {},
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.message || "Logout failed");
  }
});

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { auth: AuthState };
    const token = state.auth.token;

    try {
      const response = await axios.get("/api/admin/check-auth", {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        (error as any).response?.data?.message || "Auth check failed"
      );
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
    // Optional: Manual logout without API call
    clearAuth(state) {
      state.isAuthenticated = false;
      state.username = null;
      state.token = null;
      state.error = null;
      //   state.loading = false;
      state.logoutLoading = false;
      removeAuthFromStorage();
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        login.fulfilled,
        (state, action: PayloadAction<LoginResponse>) => {
          state.loading = false;
          state.isAuthenticated = true;
          state.username = action.payload.data.username;
          state.token = action.payload.data.token;

          // Save to localStorage on successful login
          saveAuthToStorage(
            action.payload.data.username,
            action.payload.data.token,
            true
          );
        }
      )
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        // Clear any existing auth data on login failure
        removeAuthFromStorage();
      })
      .addCase(logout.pending, (state) => {
        state.logoutLoading = true;
        state.error = null;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.username = null;
        state.token = null;
        state.error = null;
        state.logoutLoading = false;

        // Remove from localStorage on successful logout
        removeAuthFromStorage();
      })
      .addCase(logout.rejected, (state, action) => {
        state.error = action.payload as string;
        state.logoutLoading = false;

        // Even if logout API fails, clear local storage for security
        removeAuthFromStorage();
        state.isAuthenticated = false;
        state.username = null;
        state.token = null;
      })
      .addCase(checkAuth.pending, (state) => {
        state.checkAuthLoading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.checkAuthLoading = false;
        if (action.payload.statusCode === 200) {
          state.isAuthenticated = true;
          state.username = action.payload.data.user.username; // Adjust based on API response
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.checkAuthLoading = false;
        state.isAuthenticated = false;
        state.username = null;
      });
  },
});

export const { clearError, clearAuth } = authSlice.actions;
export default authSlice.reducer;
