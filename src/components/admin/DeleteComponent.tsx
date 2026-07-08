import { useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../../redux/store";
import {
  deleteCategory,
  deleteParticipant,
  fetchCategories,
  fetchParticipantsByCategory,
  storeCategoryUpDe,
  clearCategoryError,
} from "../../redux/categorySlice";
import Loading from "../Loading";
import { useTranslation } from "react-i18next";

type DeleteComponentProps =
  | {
      type: "category";
      categoryId: string;
      onClose: () => void;
      onSuccess: (message: string) => void;
    }
  | {
      type: "participant";
      participantId: string;
      categoryId: string;
      onClose: () => void;
      onSuccess: (message: string) => void;
    };

export const DeleteComponent: React.FC<DeleteComponentProps> = (props) => {
  const { type, onClose, onSuccess } = props;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { loading, participantsLoading } = useSelector(
    (state: RootState) => state.category,
  );

  const [localError, setLocalError] = useState<string | null>(null);

  const handleDelete = async () => {
    dispatch(clearCategoryError());
    setLocalError(null);

    if (type === "category") {
      const result = await dispatch(deleteCategory(props.categoryId));
      if (deleteCategory.fulfilled.match(result)) {
        dispatch(fetchCategories());
        onSuccess(t("admin.toast.dateDeleted"));
        onClose();
      } else if (deleteCategory.rejected.match(result)) {
        setLocalError(
          (result.payload as string) || t("admin.toast.deleteFailed"),
        );
      }
    } else {
      const result = await dispatch(
        deleteParticipant({
          participantId: props.participantId,
          categoryId: props.categoryId,
        }),
      );
      if (deleteParticipant.fulfilled.match(result)) {
        dispatch(storeCategoryUpDe(props.categoryId));
        await dispatch(fetchParticipantsByCategory(props.categoryId));
        onSuccess(t("admin.toast.participantDeleted"));
        onClose();
      } else if (deleteParticipant.rejected.match(result)) {
        setLocalError(
          (result.payload as string) ||
            t("admin.toast.participantDeleteFailed"),
        );
      }
    }
  };

  const isLoading = type === "category" ? loading : participantsLoading;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-xl font-primaryBold mb-5">
          {t("admin.deleteModal.title")}
        </h2>
        <p className="text-sm mb-4">
          {type === "category"
            ? t("admin.deleteModal.confirmDate")
            : t("admin.deleteModal.confirmParticipant")}
        </p>
        {localError && (
          <p className="text-red-400 text-sm mb-4 text-center">{localError}</p>
        )}
        <div className="flex space-x-4 items-center justify-center">
          <button
            onClick={handleDelete}
            disabled={isLoading}
            className="text-black bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 flex items-center justify-center w-20"
          >
            {isLoading ? (
              <Loading size="sm" />
            ) : (
              t("admin.deleteModal.delete")
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
