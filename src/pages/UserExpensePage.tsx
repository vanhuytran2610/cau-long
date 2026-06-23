import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Loading from "../components/Loading";
import {
  InformationDiamondIcon,
  QrCode01Icon,
  CheckmarkCircle03Icon,
} from "hugeicons-react";
import { fetchUserCategories } from "../redux/userSlice";
import { useAppDispatch, type RootState } from "../redux/store";
import { Link } from "react-router";

export const UserExpensePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    userCategories: categories,
    userCategoriesLoading: loading,
    userCategoriesError: error,
  } = useSelector((state: RootState) => state.user);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  useEffect(() => {
    document.title = "Chi phí";
    dispatch(fetchUserCategories());
  }, [dispatch]);

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
          <h1 className="text-3xl font-primaryBold">Chi phí</h1>
          <button className="text-black bg-green-400 hover:bg-green-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-md px-5 py-2.5">
            <Link to="/" className="flex items-center justify-center">
              Trang chủ
            </Link>
          </button>
        </div>

        <h2 className="text-xl font-primaryMedium mb-4">Danh sách buổi đánh</h2>
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
                    <div className="mt-4 pb-2 mx-1 flex gap-6">
                      {category.paymentInfo && (
                        <div className="flex-1">
                          <p className="text-md font-primaryMedium text-black mb-2">
                            <InformationDiamondIcon
                            size={20}
                            className="inline mr-1 -mt-0.5"
                          />
                            Thông tin buổi đánh
                          </p>
                          <p className="text-md font-primaryRegular text-gray-700 whitespace-pre-line mx-3">
                            {category.paymentInfo}
                          </p>
                        </div>
                      )}
                      {category.qr_img_url && (
                        <div>
                          <p className="text-md font-primaryMedium text-black mb-2">
                            <QrCode01Icon
                            size={20}
                            className="inline mr-1 -mt-0.5"
                          />
                            Mã QR
                          </p>
                          <img
                            src={category.qr_img_url}
                            alt="QR"
                            className="w-48 h-52 mr-2 object-cover rounded-lg border border-gray-200"
                          />
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
                        Chi tiết
                      </h4>
                      <p
                        className={`font-primaryRegular mx-3 text-justify whitespace-pre-line ${category.paymentResult === "" ? "text-gray-500 italic" : "text-gray-700"}`}
                      >
                        {category.paymentResult !== ""
                          ? category.paymentResult
                          : "Chưa có thông tin chi tiết"}
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
                                  STT
                                </th>
                                <th className="py-2 px-2 text-left font-primaryMedium">
                                  Tên
                                </th>
                                {/* <th className="py-2 px-2 text-left font-primaryMedium">
                                  Số lượng
                                </th> */}
                                <th className="py-2 px-2 text-left font-primaryMedium">
                                  Số tiền
                                </th>
                                <th className="py-2 px-2 text-center font-primaryMedium">
                                  Đã thanh toán
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
                            Không có người tham gia nào
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
              Không có ngày nào.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
