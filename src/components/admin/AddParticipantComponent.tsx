import { useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../../redux/store";
import {
  addParticipant,
  fetchParticipantsByCategory,
  fetchCategoryById,
} from "../../redux/categorySlice";
import Loading from "../Loading";
import { useTranslation } from "react-i18next";

interface AddParticipantComponentProps {
  categoryId: string;
  onClose: () => void;
  onSuccess: (message: string) => void;
}

export const AddParticipantComponent: React.FC<
  AddParticipantComponentProps
> = ({ categoryId, onClose, onSuccess }) => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { category, participantsLoading, loading } = useSelector(
    (state: RootState) => state.category,
  );

  const [name, setName] = useState("");
  const [level, setLevel] = useState("");
  const [gender, setGender] = useState<"nam" | "nữ">("nam");
  const [localError, setLocalError] = useState<string | null>(null);

  const hasSlotTracking =
    category?.quantity != null &&
    (category.quantity.male_total > 0 || category.quantity.female_total > 0);

  const isMaleFull = hasSlotTracking && category!.quantity!.male_remain <= 0;
  const isFemaleFull =
    hasSlotTracking && category!.quantity!.female_remain <= 0;

  const handleAdd = async () => {
    if (!name.trim()) return;
    setLocalError(null);
    const result = await dispatch(
      addParticipant({
        categoryId,
        name: name.trim(),
        status: "tham gia",
        quantity: 1,
        level: level || undefined,
        gender,
      }),
    );
    if (addParticipant.fulfilled.match(result)) {
      await Promise.all([
        dispatch(fetchParticipantsByCategory(categoryId)),
        dispatch(fetchCategoryById(categoryId)),
      ]);
      onSuccess(t("admin.toast.participantAdded"));
      onClose();
    } else if (addParticipant.rejected.match(result)) {
      setLocalError(
        (result.payload as string) || t("admin.toast.participantAddFailed"),
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl">
        <h3 className="text-lg font-primaryBold mb-4">
          {t("admin.addParticipantModal.title")}
        </h3>
        <div className="mx-5">
          {hasSlotTracking && (
            <div className="flex justify-center gap-4 mb-4">
              <div
                className={`w-20 text-center px-4 py-1 h-12 rounded-lg border ${isMaleFull ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}
              >
                <p className="text-xs font-primaryMedium text-gray-800">
                  {t("formComponent.male")}
                </p>
                <p
                  className={`text-lg font-primaryBold ${isMaleFull ? "text-red-500" : "text-green-600"}`}
                >
                  {category?.quantity?.male_remain}/
                  {category?.quantity?.male_total}
                </p>
              </div>
              <div
                className={`w-20 text-center px-4 py-1 h-12 rounded-lg border ${isFemaleFull ? "border-red-300 bg-red-50" : "border-green-300 bg-green-50"}`}
              >
                <p className="text-xs font-primaryMedium text-gray-800">
                  {t("formComponent.female")}
                </p>
                <p
                  className={`text-lg font-primaryBold ${isFemaleFull ? "text-red-500" : "text-green-600"}`}
                >
                  {category?.quantity?.female_remain}/
                  {category?.quantity?.female_total}
                </p>
              </div>
            </div>
          )}

          <div className="mb-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder={t("admin.addParticipantModal.placeholder")}
              className="bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-gray-300 focus:border-gray-100 block w-full p-2.5 mb-3"
              disabled={loading || !!category?.isCalculated}
            />
            {category?.isCalculated && (
              <p className="text-red-500 font-primaryMedium text-sm mt-2 text-center">
                {t("formComponent.rejectInput")}
              </p>
            )}
          </div>

          <div className={`flex ${localError ? "mb-2" : "mb-4"} gap-2`}>
            <div className="w-1/2">
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-gray-300 focus:border-gray-100 block w-full p-2.5"
                placeholder={
                  t("formComponent.levelPlaceholder") ||
                  "Trình độ (TB, TB+, TB-,...)"
                }
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                disabled={loading}
              />
            </div>
            {hasSlotTracking && (
              <div className="w-1/2 flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => setGender("nam")}
                  disabled={isMaleFull || loading}
                  className={`w-20 flex-1 py-2 rounded-lg text-sm font-primaryMedium border-2 transition-colors disabled:opacity-40 ${
                    gender === "nam"
                      ? "border-blue-400 bg-blue-100 text-blue-700"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-blue-300"
                  }`}
                >
                  {t("formComponent.male")}{" "}
                  {isMaleFull ? t("formComponent.slotFull") : ""}
                </button>
                <button
                  type="button"
                  onClick={() => setGender("nữ")}
                  disabled={isFemaleFull || loading}
                  className={`w-20 flex-1 py-2 rounded-lg text-sm font-primaryMedium border-2 transition-colors disabled:opacity-40 ${
                    gender === "nữ"
                      ? "border-pink-400 bg-pink-100 text-pink-700"
                      : "border-gray-200 bg-gray-50 text-gray-600 hover:border-pink-300"
                  }`}
                >
                  {t("formComponent.female")}{" "}
                  {isFemaleFull ? t("formComponent.slotFull") : ""}
                </button>
              </div>
            )}
          </div>
        </div>

        {localError && (
          <p className="text-red-500 text-sm mb-3">{localError}</p>
        )}
        <div className="flex justify-center space-x-4 mt-6">
          <button
            onClick={handleAdd}
            disabled={participantsLoading || !name.trim()}
            className="text-black bg-green-400 hover:bg-green-500 focus:ring-2 focus:ring-green-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 w-20"
          >
            {participantsLoading ? (
              <Loading size="sm" />
            ) : (
              t("admin.addParticipantModal.confirm")
            )}
          </button>
          <button
            onClick={() => {
              onClose();
            }}
            className="text-black bg-gray-400 hover:bg-gray-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5 w-20"
          >
            {t("admin.addParticipantModal.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};
