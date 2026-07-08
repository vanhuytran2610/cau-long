import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  fetchCategories,
  fetchParticipantsByCategory,
  clearCategoryError,
  storeCategoryUpDe,
  updateParticipant,
  calculateCategory,
  exportCategory,
  uploadQrImage,
  fetchCategoryById,
} from "../../redux/categorySlice";
import { logout } from "../../redux/authSlice";
import { useAppDispatch, type RootState } from "../../redux/store";
import Loading from "../../components/Loading";
import {
  Delete02Icon,
  Edit02Icon,
  InformationDiamondIcon,
  QrCode01Icon,
  CheckmarkCircle03Icon,
  LogoutSquare01Icon,
  AddCircleIcon,
  AddTeamIcon,
} from "hugeicons-react";
import type { Category, Participant } from "../../interface/CategoryInterface";
import ChatBot from "../../components/admin/ChatBot";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../redux/languageSlice";
import { ModifyCategoryComponent } from "../../components/admin/ModifyCategoryComponent";
import { AddParticipantComponent } from "../../components/admin/AddParticipantComponent";
import { DeleteComponent } from "../../components/admin/DeleteComponent";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

export const AdminPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { username, logoutLoading, isAuthenticated } = useSelector(
    (state: RootState) => state.auth,
  );
  const language = useSelector((state: RootState) => state.language.language);
  const {
    categories,
    participants,
    loading,
    calculateLoading,
    exportLoading,
    uploadQrLoading,
  } = useSelector((state: RootState) => state.category);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState<string[]>([]);
  const [deleteParticipantInfo, setDeleteParticipantInfo] = useState<{
    participantId: string;
    categoryId: string;
  } | null>(null);
  const [addParticipantCategoryId, setAddParticipantCategoryId] = useState<
    string | null
  >(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [paymentInfoMap, setPaymentInfoMap] = useState<{
    [id: string]: string;
  }>({});
  const [qrPreviewMap, setQrPreviewMap] = useState<{ [id: string]: string }>(
    {},
  );
  const [qrNameMap, setQrNameMap] = useState<{ [id: string]: string }>({});
  const [qrFileMap, setQrFileMap] = useState<{ [id: string]: File }>({});
  const [calculateErrorMap, setCalculateErrorMap] = useState<{
    [id: string]: string | null;
  }>({});
  const [exportErrorMap, setExportErrorMap] = useState<{
    [id: string]: string | null;
  }>({});

  const checkAuthAndDispatch = (callback: () => void) => {
    if (!isAuthenticated) {
      addToast(t("admin.toast.loginRequired"), "error");
      setShowAuthModal(true);
      return;
    }
    callback();
  };

  const addToast = (message: string, type: Toast["type"] = "info") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => removeToast(id), 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCategories());
    }
  }, [dispatch, isAuthenticated, language]);

  const redirectToLogin = () => {
    window.location.href = "/login";
  };

  const handleToggleIsPaid = (
    participant: Participant,
    categoryId: string,
    isPaid: boolean,
  ): void => {
    checkAuthAndDispatch(async () => {
      dispatch(clearCategoryError());
      try {
        const result = await dispatch(
          updateParticipant({
            participantId: participant._id,
            categoryId,
            isPaid,
          }),
        );
        if (updateParticipant.fulfilled.match(result)) {
          dispatch(storeCategoryUpDe(categoryId));
          addToast(t("admin.toast.updateSuccess"), "success");
        }
      } catch {
        addToast(t("admin.toast.updateError"), "error");
      }
    });
  };

  const handleCalculate = async (category: Category): Promise<void> => {
    checkAuthAndDispatch(async () => {
      dispatch(clearCategoryError());
      setCalculateErrorMap((prev) => ({ ...prev, [category._id]: null }));
      try {
        const paymentInfo =
          paymentInfoMap[category._id] ?? category.paymentInfo;
        const result = await dispatch(
          calculateCategory({ id: category._id, paymentInfo }),
        );
        if (calculateCategory.fulfilled.match(result)) {
          await dispatch(fetchCategories());
          await dispatch(fetchParticipantsByCategory(category._id));
          addToast(t("admin.toast.calculateSuccess"), "success");
        } else if (calculateCategory.rejected.match(result)) {
          setCalculateErrorMap((prev) => ({
            ...prev,
            [category._id]: (result.payload as string) || "Failed",
          }));
        }
      } catch (err: any) {
        setCalculateErrorMap((prev) => ({
          ...prev,
          [category._id]: err?.message || "Failed to calculate",
        }));
      }
    });
  };

  const handleExport = async (category: Category): Promise<void> => {
    checkAuthAndDispatch(async () => {
      dispatch(clearCategoryError());
      setExportErrorMap((prev) => ({ ...prev, [category._id]: null }));
      try {
        let qrUrl =
          qrPreviewMap[category._id] !== undefined
            ? qrPreviewMap[category._id]
            : category.qr_img_url;

        const localFile = qrFileMap[category._id];
        if (localFile) {
          const uploadResult = await dispatch(uploadQrImage(localFile));
          if (uploadQrImage.fulfilled.match(uploadResult)) {
            qrUrl = uploadResult.payload.secure_url;
            setQrPreviewMap((prev) => ({ ...prev, [category._id]: qrUrl }));
            setQrFileMap((prev) => {
              const next = { ...prev };
              delete next[category._id];
              return next;
            });
          } else {
            setExportErrorMap((prev) => ({
              ...prev,
              [category._id]:
                (uploadResult.payload as string) || "Failed to upload QR image",
            }));
            return;
          }
        }

        const result = await dispatch(
          exportCategory({
            id: category._id,
            qr_img_url: qrUrl,
            qr_img_name: qrNameMap[category._id] ?? "",
          }),
        );
        if (exportCategory.fulfilled.match(result)) {
          addToast(t("admin.toast.exportSuccess"), "success");
        } else if (exportCategory.rejected.match(result)) {
          setExportErrorMap((prev) => ({
            ...prev,
            [category._id]: (result.payload as string) || "Failed",
          }));
        }
      } catch (err: any) {
        setExportErrorMap((prev) => ({
          ...prev,
          [category._id]: err?.message || "Failed to export",
        }));
      }
    });
  };

  const handleQrFileChange = (categoryId: string, file: File | null): void => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addToast(t("admin.toast.qrImgSizeError"), "error");
      return;
    }
    setQrFileMap((prev) => ({ ...prev, [categoryId]: file }));
    const reader = new FileReader();
    reader.onload = (e) => {
      setQrPreviewMap((prev) => ({
        ...prev,
        [categoryId]: e.target?.result as string,
      }));
      setQrNameMap((prev) => ({ ...prev, [categoryId]: file.name }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveQr = (categoryId: string): void => {
    setQrPreviewMap((prev) => ({ ...prev, [categoryId]: "" }));
    setQrNameMap((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
    setQrFileMap((prev) => {
      const next = { ...prev };
      delete next[categoryId];
      return next;
    });
  };

  const toggleParticipants = async (categoryId: string) => {
    if (!isAuthenticated) {
      addToast(t("admin.toast.loginToViewParticipants"), "error");
      setShowAuthModal(true);
      return;
    }

    if (!expandedCategories.includes(categoryId)) {
      setLoadingParticipants([...loadingParticipants, categoryId]);
      await dispatch(fetchParticipantsByCategory(categoryId));
      setLoadingParticipants(
        loadingParticipants.filter((id) => id !== categoryId),
      );
      setExpandedCategories([...expandedCategories, categoryId]);
    } else {
      setExpandedCategories(
        expandedCategories.filter((id) => id !== categoryId),
      );
    }
    await dispatch(fetchCategoryById(categoryId));
    dispatch(storeCategoryUpDe(categoryId));
  };

  const handleLogout = () => {
    if (!isAuthenticated) {
      addToast(t("admin.toast.alreadyLoggedOut"), "info");
      return;
    }
    dispatch(logout());
    addToast(t("admin.toast.logoutSuccess"), "info");
  };

  useEffect(() => {
    document.title = t("admin.title");
  }, [t]);

  const toastContainer = (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-black min-w-72 flex items-center justify-between transition-all duration-300 ease-in-out transform ${
            toast.type === "success"
              ? "bg-green-600"
              : toast.type === "error"
                ? "bg-red-400"
                : toast.type === "warning"
                  ? "bg-yellow-600"
                  : "bg-gray-400"
          } motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-4 motion-safe:duration-300`}
        >
          <span className="text-md font-primaryMedium text-black">
            {toast.message}
          </span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-3 text-black hover:text-gray-200 transition-colors duration-200 text-xl font-primaryMedium mb-1"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );

  if (isAuthenticated === false) {
    return (
      <>
        {toastContainer}
        {showAuthModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg min-w-md w-full mx-4 text-center">
              <div className="mb-6">
                <svg
                  className="mx-auto h-16 w-16 text-red-400 mb-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
                <h2 className="text-2xl font-primaryBold text-gray-900 mb-2">
                  {t("admin.auth.title")}
                </h2>
                <p className="text-gray-600 font-primaryRegular">
                  {t("admin.auth.description")}
                </p>
              </div>
              <button
                onClick={redirectToLogin}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-primaryMedium rounded-lg text-sm px-5 py-3 transition-colors"
              >
                {t("admin.auth.goToLogin")}
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  if (loading && categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto my-36">
        <Loading size="lg" className="py-20" />
      </div>
    );
  }

  return (
    <>
      {toastContainer}

      <div className="my-16 flex justify-center">
        <div className="max-w-4xl w-full px-2 sm:px-2 md:px-4 lg:px-6 xl:px-6 2xl:px-8">
          <div className="flex justify-between items-center mb-16 pb-4 border-b-2 border-gray-500">
            <h1 className="text-3xl font-primaryBold">
              Hello, {username || "Admin"}
            </h1>
            <div className="flex items-center space-x-2">
              <div className="flex items-center bg-gray-50 rounded-xl border-2 border-gray-200 p-0.5 text-sm font-primaryMedium">
                <button
                  onClick={() => dispatch(setLanguage("vi"))}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${language === "vi" ? "bg-yellow-400 hover:bg-yellow-500 shadow text-black" : "text-gray-500 hover:text-gray-700"}`}
                >
                  VI
                </button>
                <button
                  onClick={() => dispatch(setLanguage("en"))}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${language === "en" ? "bg-yellow-400 hover:bg-yellow-500 shadow text-black" : "text-gray-500 hover:text-gray-700"}`}
                >
                  EN
                </button>
              </div>
              <button
                onClick={handleLogout}
                className="text-black bg-red-400 hover:bg-red-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-3 py-2.5 sm:w-28 sm:px-5"
              >
                {logoutLoading ? (
                  <Loading size="sm" />
                ) : (
                  <>
                    <span className="hidden sm:inline">
                      {t("admin.logout")}
                    </span>
                    <LogoutSquare01Icon className="sm:hidden" size={18} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Category List */}
          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-xl font-primaryMedium">
              {t("admin.dateList.title")}
            </h2>
            {/* Create Category Button */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="text-black bg-green-400 hover:bg-green-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-3 py-2.5 sm:w-36 flex items-center justify-center gap-1"
            >
              <AddCircleIcon size={18} className="sm:hidden" />
              <span className="hidden sm:inline">
                {t("admin.createDate.button")}
              </span>
            </button>
          </div>

          <div className="space-y-4">
            {categories.map((category) => (
              <div
                key={category._id}
                className="border border-1 border-gray-300 rounded-lg px-2.5 py-4"
              >
                <div className="flex justify-between items-center">
                  <div className="flex space-x-2.5 w-2/3">
                    <button
                      onClick={() => toggleParticipants(category._id)}
                      disabled={loadingParticipants.includes(category._id)}
                      className="text-black flex items-center justify-center"
                      title={
                        expandedCategories.includes(category._id)
                          ? t("admin.dateList.showDetailInfo")
                          : t("admin.dateList.hideDetailInfo")
                      }
                    >
                      {loadingParticipants.includes(category._id) ? (
                        <Loading size="sm" />
                      ) : (
                        <svg
                          className="w-4 h-4 transition-transform duration-200"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          style={{
                            transform: expandedCategories.includes(category._id)
                              ? "rotate(90deg)"
                              : "rotate(0deg)",
                          }}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      )}
                    </button>
                    <div>
                      <h3 className="text-lg font-primaryBold">
                        {category.name}
                      </h3>
                      <p
                        className={`text-sm ${
                          category.is_selected
                            ? "font-primaryBold text-green-600"
                            : "font-primaryRegular text-gray-600"
                        }`}
                      >
                        {category.is_selected
                          ? t("admin.dateList.selected")
                          : t("admin.dateList.notSelected")}
                      </p>
                      {category.quantity &&
                        (category.quantity.male_total > 0 ||
                          category.quantity.female_total > 0) && (
                          <p className="text-xs font-primaryRegular text-gray-500 mt-0.5">
                            Nam: {category.quantity.male_current}/
                            {category.quantity.male_total} · Nữ:{" "}
                            {category.quantity.female_current}/
                            {category.quantity.female_total}
                          </p>
                        )}
                    </div>
                  </div>
                  <div className="flex space-x-2 mr-0.5">
                    <button
                      onClick={() => {
                        setAddParticipantCategoryId(category._id);
                        dispatch(fetchCategoryById(category._id));
                      }}
                      className="text-black w-10 h-10 bg-green-400 hover:bg-green-500 focus:ring-2 focus:ring-green-300 font-primaryMedium rounded-lg text-sm flex items-center justify-center"
                    >
                      <AddTeamIcon size={18} />
                    </button>
                    <button
                      onClick={() => setEditCategory(category)}
                      className="text-black w-10 h-10 bg-yellow-400 hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-300 font-primaryMedium rounded-lg text-sm flex items-center justify-center"
                    >
                      <Edit02Icon size={18} />
                    </button>
                    <button
                      onClick={() => setDeleteCategoryId(category._id)}
                      className="text-black bg-red-400 w-10 h-10 hover:bg-red-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm flex items-center justify-center"
                    >
                      <Delete02Icon size={18} />
                    </button>
                  </div>
                </div>

                {expandedCategories.includes(category._id) && (
                  <>
                    <hr className="mt-4 -mx-2.5 border-gray-300" />
                    <div className="mt-4 pb-2 mx-1 sm:flex sm:gap-6">
                      {/* Left: Calculate */}
                      <div className="sm:flex-1">
                        <p className="text-md font-primaryMedium text-black mb-2">
                          <InformationDiamondIcon
                            size={20}
                            className="inline mr-1 -mt-0.5"
                          />
                          {t("admin.categoryDetail.paymentInfo")}
                        </p>
                        <textarea
                          rows={3}
                          className="mb-0 mt-4 bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-gray-300 focus:border-gray-100 block w-full p-2.5 resize-none"
                          placeholder=""
                          value={
                            paymentInfoMap[category._id] ?? category.paymentInfo
                          }
                          onChange={(e) =>
                            setPaymentInfoMap((prev) => ({
                              ...prev,
                              [category._id]: e.target.value,
                            }))
                          }
                        />
                        <p className="text-sm font-primaryRegular mt-1 text-gray-500 italic">
                          {t("admin.categoryDetail.examplePrompt")}
                        </p>
                        <div className="hidden sm:block">
                          {calculateErrorMap[category._id] && (
                            <p className="text-red-500 text-xs mt-1">
                              {calculateErrorMap[category._id]}
                            </p>
                          )}
                          {exportErrorMap[category._id] && (
                            <p className="text-red-500 text-xs mt-1">
                              {exportErrorMap[category._id]}
                            </p>
                          )}
                          <div className="flex space-x-4 mt-2">
                            <button
                              onClick={() => handleCalculate(category)}
                              disabled={calculateLoading}
                              className="mt-3 text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2 disabled:opacity-50"
                            >
                              {calculateLoading ? (
                                <Loading size="sm" />
                              ) : (
                                t("admin.categoryDetail.calculate")
                              )}
                            </button>
                            <button
                              onClick={() => handleExport(category)}
                              disabled={exportLoading || uploadQrLoading}
                              className="mt-3 text-black bg-blue-400 hover:bg-blue-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2 disabled:opacity-50"
                            >
                              {uploadQrLoading || exportLoading ? (
                                <Loading size="sm" />
                              ) : (
                                t("admin.categoryDetail.showResult")
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Right: QR */}
                      <div>
                        <p className="text-md font-primaryMedium text-black mb-4 mt-4 sm:mt-0">
                          <QrCode01Icon
                            size={20}
                            className="inline mr-1 -mt-0.5"
                          />
                          {t("admin.categoryDetail.qrCode")}
                        </p>
                        <div>
                          {(() => {
                            const qrSrc =
                              qrPreviewMap[category._id] !== undefined
                                ? qrPreviewMap[category._id]
                                : category.qr_img_url;
                            return qrSrc ? (
                              <div className="relative w-48 h-52 mr-2">
                                <img
                                  src={qrSrc}
                                  alt="QR"
                                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemoveQr(category._id)}
                                  className="absolute -top-2.5 -right-2.5 w-5 h-5 bg-gray-600 text-white rounded-full flex items-center justify-center text-sm hover:bg-gray-800 leading-none pb-1"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <label className="cursor-pointer w-48 h-52 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-colors">
                                <span className="text-gray-400 text-2xl leading-none">
                                  +
                                </span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleQrFileChange(
                                      category._id,
                                      e.target.files?.[0] ?? null,
                                    )
                                  }
                                />
                              </label>
                            );
                          })()}
                        </div>
                      </div>

                      <div className="block sm:hidden">
                        {calculateErrorMap[category._id] && (
                          <p className="text-red-500 text-xs mt-1">
                            {calculateErrorMap[category._id]}
                          </p>
                        )}
                        {exportErrorMap[category._id] && (
                          <p className="text-red-500 text-xs mt-1">
                            {exportErrorMap[category._id]}
                          </p>
                        )}
                        <div className="flex space-x-4 mt-2">
                          <button
                            onClick={() => handleCalculate(category)}
                            disabled={calculateLoading}
                            className="mt-3 text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2 disabled:opacity-50"
                          >
                            {calculateLoading ? (
                              <Loading size="sm" />
                            ) : (
                              t("admin.categoryDetail.calculate")
                            )}
                          </button>
                          <button
                            onClick={() => handleExport(category)}
                            disabled={exportLoading || uploadQrLoading}
                            className="mt-3 text-black bg-blue-400 hover:bg-blue-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2 disabled:opacity-50"
                          >
                            {uploadQrLoading || exportLoading ? (
                              <Loading size="sm" />
                            ) : (
                              t("admin.categoryDetail.showResult")
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                    <hr className="mt-4 mx-1 border-gray-300" />
                    <div className="mt-5 mb-2">
                      <h4 className="text-md font-primaryMedium mb-3 text-black flex ml-1">
                        <CheckmarkCircle03Icon
                          size={20}
                          className="inline mr-1 mt-0.5"
                        />
                        {t("admin.categoryDetail.detail")}
                      </h4>
                      <p
                        className={`font-primaryRegular mx-3.5 text-justify whitespace-pre-line ${category.paymentResult === "" ? "text-gray-500 italic" : "text-gray-700"}`}
                      >
                        {category.paymentResult !== ""
                          ? category.paymentResult
                          : t("admin.categoryDetail.noDetail")}
                      </p>
                    </div>
                    <div className="mt-5 mb-1">
                      {participants[category._id]?.length ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200 text-gray-600">
                                <th className="py-2 px-2 text-center font-primaryMedium w-10">
                                  {t("admin.table.no")}
                                </th>
                                <th className="py-2 px-2 text-center font-primaryMedium">
                                  {t("admin.table.name")}
                                </th>
                                <th className="py-2 px-2 text-center font-primaryMedium">
                                  {t("admin.table.gender")}
                                </th>
                                <th className="py-2 px-2 text-center font-primaryMedium">
                                  {t("admin.table.amount")}
                                </th>
                                <th className="py-2 px-2 text-center font-primaryMedium">
                                  {t("admin.table.isPaid")}
                                </th>
                                <th className="py-2 px-2 text-center font-primaryMedium">
                                  {t("admin.table.deleteParticipant")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {participants[category._id].map(
                                (participant: Participant, index) => (
                                  <tr
                                    key={participant._id}
                                    className="border-b border-gray-100"
                                  >
                                    <td className="py-2 px-2 text-gray-500 font-primaryRegular text-center">
                                      {index + 1}
                                    </td>
                                    <td className="py-2 px-2 font-primaryMedium text-center">
                                      {participant.name}
                                    </td>
                                    <td className="py-2.5 capitalize px-2 font-primaryRegular text-center">
                                      {participant.gender}
                                    </td>
                                    <td className="py-2 px-2 font-primaryRegular text-center">
                                      {participant.money > 0
                                        ? (
                                            Math.round(
                                              participant.money / 1000,
                                            ) * 1000
                                          ).toLocaleString() + "đ"
                                        : "0k"}
                                    </td>
                                    <td className="py-2 px-2 text-center">
                                      <input
                                        type="checkbox"
                                        checked={participant.isPaid}
                                        onChange={(e) =>
                                          handleToggleIsPaid(
                                            participant,
                                            category._id,
                                            e.target.checked,
                                          )
                                        }
                                        className="w-4 h-4 accent-green-500 cursor-pointer"
                                      />
                                    </td>
                                    <td className="py-2 px-2 text-center">
                                      <button
                                        onClick={() =>
                                          setDeleteParticipantInfo({
                                            participantId: participant._id,
                                            categoryId: category._id,
                                          })
                                        }
                                        className="text-black bg-red-400 hover:bg-red-500 font-primaryMedium rounded-lg text-xs px-2 py-1.5"
                                      >
                                        <Delete02Icon size={18} />
                                      </button>
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center p-8 rounded-lg mr-0.5">
                          <div className="text-center">
                            <div className="text-gray-400 mb-2">
                              <svg
                                className="w-12 h-12 mx-auto"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                />
                              </svg>
                            </div>
                            <p className="text-sm text-gray-600 font-primaryRegular">
                              {t("admin.table.noParticipants")}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Create Category Modal */}
        {showCreateModal && (
          <ModifyCategoryComponent
            mode="create"
            onClose={() => setShowCreateModal(false)}
            onSuccess={(msg) => addToast(msg, "success")}
          />
        )}

        {/* Edit Category Modal */}
        {editCategory && (
          <ModifyCategoryComponent
            mode="update"
            category={editCategory}
            onClose={() => setEditCategory(null)}
            onSuccess={(msg) => addToast(msg, "success")}
          />
        )}

        {/* Delete Category Modal */}
        {deleteCategoryId && (
          <DeleteComponent
            type="category"
            categoryId={deleteCategoryId}
            onClose={() => setDeleteCategoryId(null)}
            onSuccess={(msg) => addToast(msg, "success")}
          />
        )}

        {/* Add Participant Modal */}
        {addParticipantCategoryId && (
          <AddParticipantComponent
            categoryId={addParticipantCategoryId}
            onClose={() => setAddParticipantCategoryId(null)}
            onSuccess={(msg) => addToast(msg, "success")}
          />
        )}

        {/* Delete Participant Modal */}
        {deleteParticipantInfo && (
          <DeleteComponent
            type="participant"
            participantId={deleteParticipantInfo.participantId}
            categoryId={deleteParticipantInfo.categoryId}
            onClose={() => setDeleteParticipantInfo(null)}
            onSuccess={(msg) => addToast(msg, "success")}
          />
        )}
      </div>
      <ChatBot onRefreshNeeded={() => dispatch(fetchCategories())} />
    </>
  );
};
