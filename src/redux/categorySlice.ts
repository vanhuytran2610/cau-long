import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
// import axios from "axios";
import axiosInstance from "../helpers/axiosInstance";
import type { RootState } from "./store";
import {
  API_URL,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
} from "../helpers/constants";
import { removeAuthFromStorage } from "./authSlice";
import type {
  AddParticipantPayload,
  AddParticipantResponse,
  CalculateCategoryPayload,
  CalculateCategoryResponse,
  CategoryState,
  CreateCategoryPayload,
  CreateCategoryResponse,
  DeleteParticipantResponse,
  ExportCategoryPayload,
  ExportCategoryResponse,
  ListCategoriesResponse,
  ListParticipantsResponse,
  UpdateCategoryPayload,
  UpdateCategoryResponse,
  UpdateParticipantPayload,
  UpdateParticipantResponse,
  UploadQrResponse,
} from "../interface/CategoryInterface";

const initialState: CategoryState = {
  categories: [],
  participants: {},
  loading: false,
  error: null,
  createdLoading: false,
  participantsLoading: false,
  categoryUpDe: "",
  calculateLoading: false,
  exportLoading: false,
  uploadQrLoading: false,
  deleteCategoryError: null,
};

export const createCategory = createAsyncThunk<
  CreateCategoryResponse,
  CreateCategoryPayload,
  { state: RootState }
>("category/createCategory", async (payload, { getState, rejectWithValue }) => {
  const { auth } = getState() as { auth: { token: string | null } };
  try {
    const response = await axiosInstance.post(
      `${API_URL}/api/categories`,
      payload,
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create category",
    );
  }
});

export const updateCategory = createAsyncThunk<
  UpdateCategoryResponse,
  UpdateCategoryPayload,
  { state: RootState }
>("category/updateCategory", async (payload, { getState, rejectWithValue }) => {
  const { auth } = getState() as { auth: { token: string | null } };
  try {
    const response = await axiosInstance.put(
      `${API_URL}/api/categories/${payload.id}`,
      {
        name: payload.name,
        is_selected: payload.is_selected,
      },
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update category",
    );
  }
});

export const deleteCategory = createAsyncThunk<
  UpdateCategoryResponse,
  string,
  { state: RootState }
>("category/deleteCategory", async (id, { getState, rejectWithValue }) => {
  const { auth } = getState() as { auth: { token: string | null } };
  try {
    const response = await axiosInstance.delete(
      `${API_URL}/api/categories/${id}`,
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      },
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete category",
    );
  }
});

export const fetchCategories = createAsyncThunk<
  ListCategoriesResponse,
  void,
  { state: RootState }
>("category/fetchCategories", async (_, { getState, rejectWithValue }) => {
  const { auth } = getState() as { auth: { token: string | null } };
  try {
    const response = await axiosInstance.get(`${API_URL}/api/categories`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch categories",
    );
  }
});

export const fetchParticipantsByCategory = createAsyncThunk<
  ListParticipantsResponse,
  string,
  { state: RootState }
>(
  "category/fetchParticipantsByCategory",
  async (categoryId, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: { token: string | null } };
    try {
      const response = await axiosInstance.get(
        `${API_URL}/api/participants/${categoryId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        },
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch participants",
      );
    }
  },
);

export const addParticipant = createAsyncThunk<
  AddParticipantResponse,
  AddParticipantPayload,
  { state: RootState }
>("category/addParticipant", async (payload, { getState, rejectWithValue }) => {
  const { auth } = getState() as { auth: { token: string | null } };
  try {
    const response = await axiosInstance.post(
      `${API_URL}/api/participants/${payload.categoryId}`,
      { name: payload.name, status: payload.status },
      { headers: { Authorization: `Bearer ${auth.token}` } },
    );
    return response.data;
  } catch (err: any) {
    return rejectWithValue(
      err.response?.data?.message || "Failed to add participant",
    );
  }
});

export const updateParticipant = createAsyncThunk<
  UpdateParticipantResponse,
  UpdateParticipantPayload,
  { state: RootState }
>(
  "category/updateParticipant",
  async (payload, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: { token: string | null } };
    try {
      const response = await axiosInstance.put(
        `${API_URL}/api/participants/${payload.categoryId}/${payload.participantId}`,
        { isPaid: payload.isPaid },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        },
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update participant",
      );
    }
  },
);

export const deleteParticipant = createAsyncThunk<
  DeleteParticipantResponse,
  { participantId: string; categoryId: string },
  { state: RootState }
>(
  "category/deleteParticipant",
  async ({ participantId, categoryId }, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: { token: string | null } };
    try {
      const response = await axiosInstance.delete(
        `${API_URL}/api/participants/${categoryId}/${participantId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        },
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete participant",
      );
    }
  },
);

export const calculateCategory = createAsyncThunk<
  CalculateCategoryResponse,
  CalculateCategoryPayload,
  { state: RootState }
>(
  "category/calculateCategory",
  async (payload, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: { token: string | null } };
    try {
      const response = await axiosInstance.post(
        `${API_URL}/api/categories/${payload.id}/calculate`,
        { paymentInfo: payload.paymentInfo },
        { headers: { Authorization: `Bearer ${auth.token}` } },
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to calculate expenses",
      );
    }
  },
);

export const exportCategory = createAsyncThunk<
  ExportCategoryResponse,
  ExportCategoryPayload,
  { state: RootState }
>("category/exportCategory", async (payload, { getState, rejectWithValue }) => {
  const { auth } = getState() as { auth: { token: string | null } };
  try {
    const response = await axiosInstance.put(
      `${API_URL}/api/categories/${payload.id}/export`,
      { qr_img_url: payload.qr_img_url, qr_img_name: payload.qr_img_name },
      { headers: { Authorization: `Bearer ${auth.token}` } },
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to export category",
    );
  }
});

export const uploadQrImage = createAsyncThunk<UploadQrResponse, File>(
  "category/uploadQrImage",
  async (file, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
      const response = await axiosInstance.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
      );
      return response.data as UploadQrResponse;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error?.message || "Failed to upload image",
      );
    }
  },
);

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    storeCategoryUpDe(state, action) {
      state.categoryUpDe = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCategory.pending, (state) => {
        state.createdLoading = true;
        state.error = null;
      })
      .addCase(
        createCategory.fulfilled,
        (state, action: PayloadAction<CreateCategoryResponse>) => {
          state.createdLoading = false;
          state.categories.push(action.payload.data);
        },
      )
      .addCase(createCategory.rejected, (state, action) => {
        state.createdLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        updateCategory.fulfilled,
        (state, action: PayloadAction<UpdateCategoryResponse>) => {
          state.loading = false;
          const index = state.categories.findIndex(
            (cat) => cat._id === action.payload.data._id,
          );
          if (index !== -1) {
            state.categories[index] = action.payload.data;
          }
        },
      )
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.deleteCategoryError = null;
      })
      .addCase(
        deleteCategory.fulfilled,
        (state, action: PayloadAction<UpdateCategoryResponse>) => {
          state.loading = false;
          state.categories = state.categories.filter(
            (cat) => cat._id !== action.payload.data._id,
          );
          delete state.participants[action.payload.data._id];
        },
      )
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.deleteCategoryError = action.payload as string;
      })
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchCategories.fulfilled,
        (state, action: PayloadAction<ListCategoriesResponse>) => {
          state.loading = false;
          state.categories = action.payload.data;
        },
      )
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        if (state.error === "Invalid token") {
          removeAuthFromStorage();
        }
      })
      .addCase(fetchParticipantsByCategory.pending, (state) => {
        state.participantsLoading = true;
        state.error = null;
      })
      .addCase(fetchParticipantsByCategory.fulfilled, (state, action) => {
        state.participantsLoading = false;
        const categoryId = action.meta.arg; // This should work with your thunk typing
        state.participants[categoryId] = action.payload.data.participants;
      })
      .addCase(fetchParticipantsByCategory.rejected, (state, action) => {
        state.participantsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addParticipant.pending, (state) => {
        state.participantsLoading = true;
        state.error = null;
      })
      .addCase(addParticipant.fulfilled, (state, action) => {
        state.participantsLoading = false;
        const categoryId = action.meta.arg.categoryId;
        if (state.participants[categoryId]) {
          state.participants[categoryId].push(action.payload.data as any);
        }
      })
      .addCase(addParticipant.rejected, (state, action) => {
        state.participantsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(updateParticipant.pending, (state) => {
        state.participantsLoading = true;
        state.error = null;
      })
      .addCase(
        updateParticipant.fulfilled,
        (state, action: PayloadAction<UpdateParticipantResponse>) => {
          state.participantsLoading = false;
          const categoryId = action.payload.data.category._id;
          if (state.participants[categoryId]) {
            const index = state.participants[categoryId].findIndex(
              (p) => p._id === action.payload.data._id,
            );
            if (index !== -1) {
              state.participants[categoryId][index] = action.payload.data;
            }
          }
        },
      )
      .addCase(updateParticipant.rejected, (state, action) => {
        state.participantsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteParticipant.pending, (state) => {
        state.participantsLoading = true;
        state.error = null;
      })
      .addCase(deleteParticipant.fulfilled, (state, action) => {
        state.participantsLoading = false;
        const { categoryId, participantId } = action.meta.arg;
        if (state.participants[categoryId]) {
          state.participants[categoryId] = state.participants[
            categoryId
          ].filter((p) => p._id !== participantId);
        }
      })
      .addCase(deleteParticipant.rejected, (state, action) => {
        state.participantsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(calculateCategory.pending, (state) => {
        state.calculateLoading = true;
        state.error = null;
      })
      .addCase(
        calculateCategory.fulfilled,
        (state, action: PayloadAction<CalculateCategoryResponse>) => {
          state.calculateLoading = false;
          const index = state.categories.findIndex(
            (cat) => cat._id === action.payload.data.category._id,
          );
          if (index !== -1) {
            state.categories[index] = action.payload.data.category;
          }
        },
      )
      .addCase(calculateCategory.rejected, (state, action) => {
        state.calculateLoading = false;
        state.error = action.payload as string;
      })
      .addCase(exportCategory.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(
        exportCategory.fulfilled,
        (state, action: PayloadAction<ExportCategoryResponse>) => {
          state.exportLoading = false;
          const index = state.categories.findIndex(
            (cat) => cat._id === action.payload.data._id,
          );
          if (index !== -1) {
            state.categories[index] = action.payload.data;
          }
        },
      )
      .addCase(exportCategory.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadQrImage.pending, (state) => {
        state.uploadQrLoading = true;
        state.error = null;
      })
      .addCase(uploadQrImage.fulfilled, (state) => {
        state.uploadQrLoading = false;
      })
      .addCase(uploadQrImage.rejected, (state, action) => {
        state.uploadQrLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError: clearCategoryError, storeCategoryUpDe } =
  categorySlice.actions;
export default categorySlice.reducer;
