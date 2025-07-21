import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import type { RootState } from "./store";
import { API_URL } from "../constants";
import { removeAuthFromStorage } from "./authSlice";

export interface Category {
  _id: string;
  name: string;
  is_selected: boolean;
  isCalculated: boolean;
  __v: number;
}

export interface Participant {
  _id: string;
  name: string;
  status: "tham gia" | "lần sau";
  category: Category;
  paymentBefore: number;
  paymentDone: boolean;
  paidAmount: number;
  shareAmount: number;
  otherAmount: number;
  reasonOtherAmount: string;
  __v: number;
}

interface CategoryState {
  categories: Category[];
  participants: { [categoryId: string]: Participant[] };
  loading: boolean;
  error: string | null;
  createdLoading: boolean;
  participantsLoading: boolean;
  categoryUpDe: string;
}

interface CreateCategoryPayload {
  name: string;
}

export interface UpdateCategoryPaymentPayload {
  id: string;
  amount: number;
}

interface UpdateCategoryPayload {
  id: string;
  name: string;
  is_selected: boolean;
  payments: UpdateCategoryPaymentPayload[];
}

interface CreateCategoryResponse {
  statusCode: number;
  message: string;
  data: Category;
}

interface IResultPayment {
  id: string;
  name: string;
  paymentBefore: number;
  shareAmount: number;
  paidAmount: number;
}

interface IExpense {
  totalPaid: number;
  sharePerPerson: number;
  results: IResultPayment[];
}

interface IUpdateCategoryResponse {
  category: Category;
  expenses: IExpense;
}

interface UpdateCategoryResponse {
  statusCode: number;
  message: string;
  data: IUpdateCategoryResponse;
}

export interface ListCategoriesResponse {
  statusCode: number;
  message: string;
  data: Category[];
}

interface IListParticipantsResponse {
  category: Category;
  participants: Participant[];
}

interface ListParticipantsResponse {
  statusCode: number;
  message: string;
  data: IListParticipantsResponse;
}

interface UpdateParticipantPayload {
  categoryId: string;
  participantId: string;
  paymentDone: boolean;
  otherAmount: number;
  reason: string;
}

interface IUpdateParticipantResponse {
  _id: string;
  name: string;
  status: string;
  category: Category;
  __v: number;
  paymentBefore: number;
  shareAmount: number;
  paidAmount: number;
  paymentDone: boolean;
  otherAmount: number;
  reasonOtherAmount: string;
}

interface UpdateParticipantResponse {
  statusCode: number;
  message: string;
  data: IUpdateParticipantResponse;
}

interface IDeleteParticipantResponse {
  message: string;
  deletedParticipant: Participant;
  expenses: IExpense
}

interface DeleteParticipantResponse {
  statusCode: number;
  message: string;
  data: IDeleteParticipantResponse;
}

const initialState: CategoryState = {
  categories: [],
  participants: {},
  loading: false,
  error: null,
  createdLoading: false,
  participantsLoading: false,
  categoryUpDe: "",
};

export const createCategory = createAsyncThunk<
  CreateCategoryResponse,
  CreateCategoryPayload,
  { state: RootState }
>("category/createCategory", async (payload, { getState, rejectWithValue }) => {
  const { auth } = getState() as { auth: { token: string | null } };
  try {
    const response = await axios.post(`${API_URL}/api/categories`, payload, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to create category"
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
    const response = await axios.put(
      `${API_URL}/api/categories/${payload.id}`,
      {
        name: payload.name,
        is_selected: payload.is_selected,
        payments: payload.payments,
      },
      {
        headers: { Authorization: `Bearer ${auth.token}` },
      }
    );
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to update category"
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
    const response = await axios.delete(`${API_URL}/api/categories/${id}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to delete category"
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
    const response = await axios.get(`${API_URL}/api/categories`, {
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    return response.data;
  } catch (error: any) {
    return rejectWithValue(
      error.response?.data?.message || "Failed to fetch categories"
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
      const response = await axios.get(
        `${API_URL}/api/participants/${categoryId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch participants"
      );
    }
  }
);

export const updateParticipant = createAsyncThunk<
  UpdateParticipantResponse,
  UpdateParticipantPayload,
  { state: RootState }
>(
  "category/updateParticipant",
  async (payload, { getState, rejectWithValue }) => {
    const { auth } = getState() as { auth: { token: string | null } };
    try {
      const response = await axios.put(
        `${API_URL}/api/participants/${payload.categoryId}/${payload.participantId}`,
        {
          paymentDone: payload.paymentDone,
          otherAmount: payload.otherAmount,
          reason: payload.reason
        },
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update participant"
      );
    }
  }
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
      const response = await axios.delete(
        `${API_URL}/api/participants/${categoryId}/${participantId}`,
        {
          headers: { Authorization: `Bearer ${auth.token}` },
        }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete participant"
      );
    }
  }
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
        }
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
            (cat) => cat._id === action.payload.data.category._id
          );
          if (index !== -1) {
            state.categories[index] = action.payload.data.category;
          }
        }
      )
      .addCase(updateCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        deleteCategory.fulfilled,
        (state, action: PayloadAction<UpdateCategoryResponse>) => {
          state.loading = false;
          state.categories = state.categories.filter(
            (cat) => cat._id !== action.payload.data.category._id
          );
          delete state.participants[action.payload.data.category._id];
        }
      )
      .addCase(deleteCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
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
        }
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
            state.participants[categoryId] = state.participants[
              categoryId
            ].filter((p) => p._id !== action.payload.data._id);
          }
        }
      )
      .addCase(updateParticipant.rejected, (state, action) => {
        state.participantsLoading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteParticipant.pending, (state) => {
        state.participantsLoading = true;
        state.error = null;
      })
      .addCase(
        deleteParticipant.fulfilled,
        (state, action: PayloadAction<DeleteParticipantResponse>) => {
          state.participantsLoading = false;
          const categoryId = action.payload.data.deletedParticipant.category._id;
          if (state.participants[categoryId]) {
            state.participants[categoryId] = state.participants[
              categoryId
            ].filter((p) => p._id !== action.payload.data.deletedParticipant._id);
          }
        }
      )
      .addCase(deleteParticipant.rejected, (state, action) => {
        state.participantsLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError: clearCategoryError, storeCategoryUpDe } =
  categorySlice.actions;
export default categorySlice.reducer;
