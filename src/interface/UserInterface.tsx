import type { Category, CategoryQuantity } from "./CategoryInterface";

export interface UserState {
  username: string | null;
  status: "tham gia" | "lần sau" | null;
  categoryName: string | null;
  categoryId: string | null;
  quantity: number;
  error: string | null;
  loading: boolean;
  loadingCategory: boolean;
  message: string | null;
  userCategories: UserCategory[];
  userCategoriesLoading: boolean;
  userCategoriesError: string | null;
  isCategoryCalculated: boolean;
  categoryQuantity: CategoryQuantity | null;
  categoryContent: string | null;
}

export interface FetchUserCategoriesResponse {
  statusCode: number;
  message: string;
  data: UserCategory[];
}

export interface SubmitUserPayload {
  name: string;
  status: "tham gia" | "lần sau";
  quantity: number;
  categoryId: string;
  level?: string;
  gender?: "nam" | "nữ";
}

export interface SubmitUserResponse {
  statusCode: number;
  message: string;
  data: {
    name: string;
    status: "tham gia" | "lần sau";
    category: string;
    quantity: number;
    money: number;
    isPaid: boolean;
    _id: string;
    __v: number;
  };
}

export interface GetSelectedCategoryResponse {
  statusCode: number;
  message: string;
  data: Category;
}

export interface UserParticipant {
  _id: string;
  name: string;
  quantity: number;
  money: number;
  isPaid: boolean;
}

export interface UserCategory {
  _id: string;
  name: string;
  content: string;
  is_selected: boolean;
  isCalculated: boolean;
  isShowMoney: boolean;
  paymentInfo: string;
  qr_img_url: string;
  participants: UserParticipant[];
  paymentResult: string;
  quantity: CategoryQuantity | null;
}