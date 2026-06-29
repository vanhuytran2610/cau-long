export interface Category {
  _id: string;
  name: string;
  is_selected: boolean;
  isCalculated: boolean;
  paymentInfo: string;
  isShowMoney: boolean;
  qr_img_url: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  paymentResult: string;
}

export interface Participant {
  _id: string;
  name: string;
  status: "tham gia" | "lần sau";
  category: Category;
  quantity: number;
  money: number;
  isPaid: boolean;
  __v: number;
}

export interface CategoryState {
  categories: Category[];
  participants: { [categoryId: string]: Participant[] };
  loading: boolean;
  error: string | null;
  createdLoading: boolean;
  participantsLoading: boolean;
  categoryUpDe: string;
  calculateLoading: boolean;
  exportLoading: boolean;
  uploadQrLoading: boolean;
  deleteCategoryError: string | null;
}

export interface UploadQrResponse {
  secure_url: string;
  public_id: string;
}

export interface CreateCategoryPayload {
  name: string;
}

export interface UpdateCategoryPayload {
  id: string;
  name: string;
  is_selected: boolean;
}

export interface CreateCategoryResponse {
  statusCode: number;
  message: string;
  data: Category;
}

export interface UpdateCategoryResponse {
  statusCode: number;
  message: string;
  data: Category;
}

export interface ICalculateExpensePerson {
  tên: string;
  "số tiếng": number;
  "số tiền": number;
}

export interface ICalculateExpenses {
  tổng: number;
  "người đánh": ICalculateExpensePerson[];
  [key: string]: any;
}

export interface CalculateCategoryPayload {
  id: string;
  paymentInfo: string;
}

export interface CalculateCategoryResponse {
  statusCode: number;
  message: string;
  data: {
    category: Category;
    expenses: ICalculateExpenses;
  };
}

export interface ExportCategoryPayload {
  id: string;
  qr_img_url: string;
  qr_img_name: string;
}

export interface ExportCategoryResponse {
  statusCode: number;
  message: string;
  data: Category;
}

export interface ListCategoriesResponse {
  statusCode: number;
  message: string;
  data: Category[];
}

export interface IListParticipantsResponse {
  category: Category;
  participants: Participant[];
}

export interface ListParticipantsResponse {
  statusCode: number;
  message: string;
  data: IListParticipantsResponse;
}

export interface AddParticipantPayload {
  name: string;
  status: "tham gia" | "lần sau";
  quantity: number;
  categoryId: string;
}

export interface AddParticipantResponse {
  statusCode: number;
  message: string;
  data: {
    name: string;
    status: "tham gia" | "lần sau";
    category: Category;
    quantity: number;
    money: number;
    isPaid: boolean;
    _id: string;
    __v: number;
  }
}

export interface UpdateParticipantPayload {
  categoryId: string;
  participantId: string;
  isPaid: boolean;
}

export interface UpdateParticipantResponse {
  statusCode: number;
  message: string;
  data: Participant;
}

export interface IDeleteParticipantResponse {
  message: string;
  deletedParticipant: Participant;
}

export interface DeleteParticipantResponse {
  statusCode: number;
  message: string;
  data: IDeleteParticipantResponse;
}
