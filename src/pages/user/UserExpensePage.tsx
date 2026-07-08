import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loading from "../../components/Loading";
import {
  InformationDiamondIcon,
  CheckmarkCircle03Icon,
  Home09Icon,
} from "hugeicons-react";
import { fetchUserCategories } from "../../redux/userSlice";
import { useAppDispatch, type RootState } from "../../redux/store";
import { Link } from "react-router";
import { useTranslation } from "react-i18next";
import { setLanguage } from "../../redux/languageSlice";

export const UserExpensePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    userCategories: categories,
    userCategoriesLoading: loading,
    userCategoriesError: error,
  } = useSelector((state: RootState) => state.user);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const { t } = useTranslation();
  const language = useSelector((state: RootState) => state.language.language);

  useEffect(() => {
    document.title = t("expense.title");
    dispatch(fetchUserCategories());
  }, [dispatch, language]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto my-36">
        <Loading size="lg" className="py-20" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto my-36 text-center">
        <p className="text-red-500 font-primaryRegular">{error}</p>
      </div>
    );
  }

  return (
    <div className="my-16 flex justify-center">
      <div className="max-w-4xl w-full px-2 sm:px-2 md:px-4 lg:px-6 xl:px-6 2xl:px-8">
        <div className="mb-16 pb-4 border-b-2 border-gray-500 flex items-center justify-between">
          <h1 className="text-3xl font-primaryBold">{t("expense.title")}</h1>
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
            <button className="min-w-12 sm:w-28 text-black bg-green-400 hover:bg-green-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-md px-3 py-2.5">
              <Link to="/" className="flex items-center justify-center">
                <nav className="hidden sm:inline">
                  {t("formComponent.homepage")}
                </nav>
                <Home09Icon className="sm:hidden" size={18} />
              </Link>
            </button>
          </div>
        </div>

        <h2 className="text-xl font-primaryMedium mb-4">
          {t("expense.listCategories")}
        </h2>
        <div className="space-y-4">
          {categories.map((category) => (
            <div
              key={category._id}
              className={`border-2 ${category.is_selected ? "border-green-300" : "border-gray-300"} rounded-lg px-2.5 py-4`}
            >
              <div className="flex items-center space-x-2.5">
                <button
                  onClick={() => toggleCategory(category._id)}
                  className="text-black flex items-center justify-center flex-shrink-0"
                >
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
                </button>
                <div>
                  <h3 className="text-lg font-primaryBold">{category.name}</h3>
                </div>
              </div>

              {expandedCategories.includes(category._id) && (
                <>
                  <hr className="mt-4 -mx-2.5 border-gray-300" />

                  {/* Payment Info & QR */}
                  {(category.paymentInfo || category.qr_img_url) && (
                    <div className="mt-4 pb-2 mx-1 sm:flex gap-6">
                      {category.paymentInfo && (
                        <div className="flex-1">
                          <p className="text-md font-primaryMedium text-black mb-2">
                            <InformationDiamondIcon
                              size={20}
                              className="inline mr-1 -mt-0.5"
                            />
                            {t("expense.categoryInfo")}
                          </p>
                          <p className="text-md font-primaryRegular text-gray-700 whitespace-pre-line mx-3">
                            {category.paymentInfo}
                          </p>
                        </div>
                      )}
                      {category.qr_img_url && (
                        <div className="mt-3 sm:mt-0.5">
                          <div className="flex items-center justify-center">
                            <img
                              src={category.qr_img_url}
                              alt="QR"
                              className="w-48 h-52 mr-2 object-cover rounded-lg border border-gray-200"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Participants */}
                  <hr className="mt-4 mx-1 border-gray-300" />
                  <div className="mt-5 mb-2">
                    <h4 className="text-md font-primaryMedium mb-3 text-black flex ml-1">
                      <CheckmarkCircle03Icon
                        size={20}
                        className="inline mr-1 mt-0.5"
                      />
                      {t("expense.detail")}
                    </h4>
                    <p
                      className={`font-primaryRegular mx-3 text-justify whitespace-pre-line ${category.paymentResult === "" ? "text-gray-500 italic" : "text-gray-700"}`}
                    >
                      {category.paymentResult !== ""
                        ? category.paymentResult
                        : t("expense.noDetail")}
                    </p>
                  </div>
                  <div className="mt-5 mb-1">
                    {category.participants?.length ? (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm border-collapse">
                            <thead>
                              <tr className="border-b border-gray-200 text-gray-600">
                                <th className="py-2 px-2 text-left font-primaryMedium w-10">
                                  {t("expense.no1Table")}
                                </th>
                                <th className="py-2 px-2 text-left font-primaryMedium">
                                  {t("expense.nameTable")}
                                </th>
                                {/* <th className="py-2 px-2 text-left font-primaryMedium">
                                  Số lượng
                                </th> */}
                                <th className="py-2 px-2 text-left font-primaryMedium">
                                  {t("expense.moneyTable")}
                                </th>
                                <th className="py-2 px-2 text-center font-primaryMedium">
                                  {t("expense.isPaidTable")}
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {category.participants.map(
                                (participant, index) => (
                                  <tr
                                    key={participant._id}
                                    className="border-b border-gray-100"
                                  >
                                    <td className="py-2 px-2 text-gray-500 font-primaryRegular">
                                      {index + 1}
                                    </td>
                                    <td className="py-2 px-2 font-primaryMedium">
                                      {participant.name}
                                    </td>
                                    {/* <td className="py-2.5 px-2 font-primaryRegular">
                                      {participant.quantity}
                                    </td> */}
                                    <td className="py-2 px-2 font-primaryRegular">
                                      {category.isShowMoney &&
                                      participant.money > 0
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
                                        disabled
                                        className="w-4 h-4 accent-green-500 cursor-default"
                                      />
                                    </td>
                                  </tr>
                                ),
                              )}
                            </tbody>
                          </table>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center p-8 rounded-lg">
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
                            {t("expense.noParticipant")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}

          {categories.length === 0 && (
            <p className="text-center text-gray-500 font-primaryRegular py-12">
              {t("expense.noCategory")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
