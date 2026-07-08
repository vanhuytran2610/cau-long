import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../../redux/store";
import {
  clearSubmitError,
  clearSuccessMessage,
  getSelectedCategory,
  submitUser,
} from "../../redux/userSlice";
import Loading from "../Loading";
import { BadmintonIcon, BadmintonShuttleIcon } from "hugeicons-react";
import { useTranslation } from "react-i18next";

export const FormComponent: React.FC<{
  onGoCom1Click: () => void;
  categoryId: string;
}> = ({ onGoCom1Click, categoryId }) => {
  const [username, setUsername] = useState("");
  const [level, setLevel] = useState("");
  const [gender, setGender] = useState<"nam" | "nữ">("nam");
  const dispatch = useAppDispatch();
  const { error, loading, message, isCategoryCalculated, categoryQuantity } =
    useSelector((state: RootState) => state.user);
  const [showModal, setShowModal] = useState(false);
  const { t } = useTranslation();
  const prevLoadingRef = useRef(loading);
  const language = useSelector((state: RootState) => state.language.language);

  const hasSlotTracking =
    categoryQuantity != null &&
    (categoryQuantity.male_total > 0 || categoryQuantity.female_total > 0);

  useEffect(() => {
    if (prevLoadingRef.current && !loading && message && !error) {
      setShowModal(true);
    }
    prevLoadingRef.current = loading;
  }, [loading, message, error]);

  const handleSubmit = (status: "tham gia" | "lần sau") => {
    dispatch(clearSubmitError());
    dispatch(
      submitUser({
        name: username,
        status,
        quantity: 1,
        categoryId,
        level: level.trim() || undefined,
        gender: gender,
      }),
    );
  };

  useEffect(() => {
    dispatch(getSelectedCategory());
  }, [dispatch, language]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    dispatch(clearSubmitError());
  };

  const closeModal = () => {
    setShowModal(false);
    dispatch(clearSuccessMessage());
    onGoCom1Click();
  };

  const handleNextTime = () => {
    onGoCom1Click();
    dispatch(clearSubmitError());
  };

  const isMaleFull = hasSlotTracking && categoryQuantity!.male_remain <= 0;
  const isFemaleFull = hasSlotTracking && categoryQuantity!.female_remain <= 0;

  return (
    <>
      <div className="min-w-xl mx-auto">
        <div className="mx-5">
          {/* Remaining slots */}
          {hasSlotTracking && !isCategoryCalculated && (
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
                  {categoryQuantity!.male_remain}/{categoryQuantity!.male_total}
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
                  {categoryQuantity!.female_remain}/
                  {categoryQuantity!.female_total}
                </p>
              </div>
            </div>
          )}

          <div className="mb-3 flex justify-center">
            <input
              type="text"
              id="username"
              className="bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-gray-300 focus:border-gray-100 block w-full p-2.5"
              placeholder={`${isCategoryCalculated ? "" : t("formComponent.inputNamePlaceholder")}`}
              value={username}
              onChange={handleInputChange}
              required
              disabled={loading || isCategoryCalculated}
            />
            {isCategoryCalculated && (
              <p className="text-red-500 font-primaryMedium text-sm mt-2 text-center">
                {t("formComponent.rejectInput")}
              </p>
            )}
          </div>

          {!isCategoryCalculated && (
            <div className={`flex ${error ? "mb-2" : "mb-4"} gap-2`}>
              {/* Level input */}
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

              {/* Gender selector - only shown if category has slot tracking */}
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
          )}

          {error && (
            <p className="text-red-500 font-primaryMedium text-md mt-2 mb-2">
              {error}
            </p>
          )}
        </div>

        <div className="pt-2">
          {!isCategoryCalculated ? (
            <>
              {!isMaleFull || !isFemaleFull ? (
                <div className="flex space-x-4 items-center justify-center">
                  <button
                    onClick={() => handleSubmit("tham gia")}
                    disabled={loading || (hasSlotTracking && !gender)}
                    className="text-black bg-green-500 hover:bg-green-600 focus:ring-2 focus:outline-none focus:ring-gray-300 font-primaryMedium rounded-lg text-sm w-28 px-5 py-2.5 text-center disabled:opacity-50"
                  >
                    {loading ? <Loading size="sm" /> : "OK"}
                  </button>
                  <button
                    onClick={handleNextTime}
                    className="text-black bg-red-300 hover:bg-red-400 focus:ring-2 focus:outline-none focus:ring-gray-300 font-primaryMedium rounded-lg text-sm w-28 px-5 py-2.5 text-center"
                  >
                    {t("formComponent.nextTime")}
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <button
                    onClick={handleNextTime}
                    className="text-black bg-green-500 hover:bg-green-600 focus:ring-2 focus:outline-none focus:ring-gray-300 font-primaryMedium rounded-lg text-sm w-28 sm:w-auto px-5 py-2.5 text-center"
                  >
                    {t("formComponent.homepage")}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex items-center justify-center">
              <button
                onClick={handleNextTime}
                className="text-black bg-green-500 hover:bg-green-600 focus:ring-2 focus:outline-none focus:ring-gray-300 font-primaryMedium rounded-lg text-sm w-28 sm:w-auto px-5 py-2.5 text-center"
              >
                {t("formComponent.homepage")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 w-full">
            <div className="text-center">
              <div className="mb-4 flex text-green-500 items-center justify-center">
                <BadmintonIcon size={44} />
                <BadmintonShuttleIcon className="-rotate-45 mt-5 -ml-2" />
              </div>
              <p className="text-md text-gray-600 font-primaryBold mb-6">
                {message}
              </p>
              <button
                onClick={closeModal}
                className="bg-red-400 hover:bg-red-500 text-black font-primaryMedium py-2 px-4 rounded-lg focus:ring-2 focus:outline-none focus:ring-green-300"
              >
                {t("formComponent.modalClose")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
