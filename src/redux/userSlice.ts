import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { API_URL } from "../helpers/constants";
import type { RootState } from "./store";
import type { FetchUserCategoriesResponse, GetSelectedCategoryResponse, SubmitUserPayload, SubmitUserResponse, UserState } from "../helpers/UserInterface";

const initialState: UserState = {
  username: null,
  status: null,
  categoryName: null,
  categoryId: null,
  quantity: 1,
  error: null,
  loading: false,
  loadingCategory: false,
  message: null,
  userCategories: [],
  userCategoriesLoading: false,
  userCategoriesError: null,
  isCategoryCalculated: false,
};

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

export const fetchUserCategories = createAsyncThunk<
  FetchUserCategoriesResponse,
  void
>("user/fetchUserCategories", async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get(`${API_URL}/api/user/categories`);
    return response.data;
  } catch (error: any) {
    if (error.response?.status === 404) {
      return { statusCode: 404, message: "No categories found!", data: [] };
    }
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch categories"
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
          state.quantity = action.payload.data.quantity;
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
            state.isCategoryCalculated = action.payload.data.isCalculated;
            localStorage.setItem("categoryName", state.categoryName as string)
          } else {
            // Handle the case where data is null (No category selected)
            state.categoryId = null;
            state.categoryName = null;
            state.isCategoryCalculated = false;
          }
        }
      )
      .addCase(getSelectedCategory.rejected, (state) => {
        state.loadingCategory = false;
      })
      .addCase(fetchUserCategories.pending, (state) => {
        state.userCategoriesLoading = true;
        state.userCategoriesError = null;
      })
      .addCase(fetchUserCategories.fulfilled, (state, action: PayloadAction<FetchUserCategoriesResponse>) => {
        state.userCategoriesLoading = false;
        state.userCategories = action.payload.data;
      })
      .addCase(fetchUserCategories.rejected, (state, action) => {
        state.userCategoriesLoading = false;
        state.userCategoriesError = action.payload as string;
      });
  },
});

export const { clearError: clearSubmitError, clearSuccessMessage } =
  userSlice.actions;
export default userSlice.reducer;
