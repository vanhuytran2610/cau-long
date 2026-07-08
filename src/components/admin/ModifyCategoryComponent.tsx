import { useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../../redux/store";
import {
  createCategory,
  updateCategory,
  fetchCategories,
  fetchParticipantsByCategory,
  clearCategoryError,
} from "../../redux/categorySlice";
import Loading from "../Loading";
import { useTranslation } from "react-i18next";
import type { Category } from "../../interface/CategoryInterface";

type ModifyCategoryProps =
  | {
      mode: "create";
      onClose: () => void;
      onSuccess: (message: string) => void;
    }
  | {
      mode: "update";
      category: Category;
      onClose: () => void;
      onSuccess: (message: string) => void;
    };

export const ModifyCategoryComponent: React.FC<ModifyCategoryProps> = (
  props,
) => {
  const { mode, onClose, onSuccess } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { loading, createdLoading, error, updateCategoryError } = useSelector(
    (state: RootState) => state.category,
  );

  const [name, setName] = useState(
    mode === "update" ? props.category.name : "",
  );
  const [content, setContent] = useState(
    mode === "update" ? props.category.content || "" : "",
  );
  const [isSelected, setIsSelected] = useState(
    mode === "update" ? props.category.is_selected : false,
  );
  const [localError, setLocalError] = useState<string | null>(null);

  const clearErrors = () => {
    if (error) dispatch(clearCategoryError());
    setLocalError(null);
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    clearErrors();

    if (mode === "create") {
      const result = await dispatch(
        createCategory({ name, content, is_selected: isSelected }),
      );
      if (createCategory.fulfilled.match(result)) {
        dispatch(fetchCategories());
        onSuccess(t("admin.toast.dateCreated"));
        onClose();
      } else if (createCategory.rejected.match(result)) {
        setLocalError(
          (result.payload as string) || t("admin.toast.createFailed"),
        );
      }
    } else {
      const result = await dispatch(
        updateCategory({
          id: props.category._id,
          name,
          is_selected: isSelected,
          content,
        }),
      );
      if (updateCategory.fulfilled.match(result)) {
        dispatch(fetchCategories());
        dispatch(fetchParticipantsByCategory(props.category._id));
        onSuccess(t("admin.toast.dateUpdated"));
        onClose();
      } else if (updateCategory.rejected.match(result)) {
        setLocalError(
          (result.payload as string) ||
            updateCategoryError ||
            t("admin.toast.updateFailed"),
        );
      }
    }
  };

  const isLoading = mode === "create" ? createdLoading : loading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-primaryBold mb-5">
          {mode === "create"
            ? t("admin.createDate.title")
            : t("admin.editModal.title")}
        </h2>
        <label className="font-primaryMedium">
          {t("admin.editModal.dateLabel")}
        </label>
        <input
          type="text"
          className="bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-gray-300 focus:border-gray-100 block w-full p-2.5 mb-3 mt-1"
          placeholder={t("admin.createDate.placeholder")}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            clearErrors();
          }}
        />
        <label className="font-primaryMedium block mb-1">
          {t("admin.editModal.contentLabel") || "Nội dung tuyển"}
        </label>
        <textarea
          rows={2}
          className="bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-gray-300 focus:border-gray-100 block w-full p-2.5 mb-3 resize-none"
          placeholder={
            t("admin.createDate.contentPlaceholder") ||
            "Nội dung tuyển (VD: Tuyển vãng lai, 8 nam (TB, TB+), 6 nữ (TB-, TB))"
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />

        <label
          className={`flex items-center ${localError ? "mb-4" : "mb-6"} font-primaryMedium`}
        >
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              setIsSelected(e.target.checked);
              clearErrors();
            }}
            className="mr-2 w-4 h-4 accent-green-500"
          />
          <span className="text-sm">{t("admin.editModal.selectDate")}</span>
        </label>

        {localError && (
          <p className="text-red-400 text-sm mb-4">{localError}</p>
        )}
        <div className="flex space-x-4 items-center justify-center mt-4">
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="text-black bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 flex items-center justify-center w-20"
          >
            {isLoading ? (
              <Loading size="sm" />
            ) : mode === "create" ? (
              t("admin.createDate.submitButton")
            ) : (
              t("admin.editModal.save")
            )}
          </button>
          <button
            onClick={onClose}
            className="text-black bg-gray-400 hover:bg-gray-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5 w-20"
          >
            {t("admin.editModal.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};
