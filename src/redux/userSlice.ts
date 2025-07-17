import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../constants";
import type { Category } from "./categorySlice";
import type { RootState } from "./store";

interface UserState {
  username: string | null;
  status: "tham gia" | "lần sau" | null;
  categoryName: string | null;
  categoryId: string | null;
  error: string | null;
  loading: boolean;
  loadingCategory: boolean;
  message: string | null;
}

interface SubmitUserPayload {
  name: string;
  status: "tham gia" | "lần sau";
  categoryId: string;
}

interface SubmitUserResponse {
  statusCode: number;
  message: string;
  data: {
    name: string;
    status: "tham gia" | "lần sau";
    category: string;
    _id: string;
    __v: number;
  };
}

const initialState: UserState = {
  username: null,
  status: null,
  categoryName: null,
  categoryId: null,
  error: null,
  loading: false,
  loadingCategory: false,
  message: null,
};

export interface GetSelectedCategoryResponse {
  statusCode: number;
  message: string;
  data: Category;
}

export const submitUser = createAsyncThunk<
  SubmitUserResponse,
  SubmitUserPayload
>("user/submitUser", async (payload, { rejectWithValue }) => {
  try {
    const response = await axios.post(`${API_URL}/api/participants`, payload);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Submission failed"
    );
  }
});

export const getSelectedCategory = createAsyncThunk<
  GetSelectedCategoryResponse,
  void,
  { state: RootState }
>("category/loadCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/api/user/category`);
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch categories"
    );
  }
});

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearSuccessMessage: (state) => {
      // Add this reducer
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        submitUser.fulfilled,
        (state, action: PayloadAction<SubmitUserResponse>) => {
          state.loading = false;
          state.username = action.payload.data.name;
          state.status = action.payload.data.status;
          state.categoryId = action.payload.data.category;
          state.message = action.payload.message;
        }
      )
      .addCase(submitUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(getSelectedCategory.pending, (state) => {
        state.loadingCategory = true;
      })
      .addCase(
        getSelectedCategory.fulfilled,
        (state, action: PayloadAction<GetSelectedCategoryResponse>) => {
          state.loadingCategory = false;

          // Check if data exists before accessing its properties
          if (action.payload.data) {
            state.categoryId = action.payload.data._id;
            state.categoryName = action.payload.data.name;
            localStorage.setItem("categoryName", state.categoryName as string)
          } else {
            // Handle the case where data is null (No category selected)
            state.categoryId = null;
            state.categoryName = null;
          }
        }
      )
      .addCase(getSelectedCategory.rejected, (state) => {
        state.loadingCategory = false;
      });
  },
});

export const { clearError: clearSubmitError, clearSuccessMessage } =
  userSlice.actions;
export default userSlice.reducer;
