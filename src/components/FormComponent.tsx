import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../redux/store";
import {
  clearSubmitError,
  clearSuccessMessage,
  submitUser,
} from "../redux/userSlice";
import Loading from "./Loading";
import { BadmintonIcon, BadmintonShuttleIcon } from "hugeicons-react";

export const FormComponent: React.FC<{
  onGoCom1Click: () => void;
  categoryId: string;
}> = ({ onGoCom1Click, categoryId }) => {
  const [username, setUsername] = useState("");
  const dispatch = useAppDispatch();
  const { error, loading, message } = useSelector(
    (state: RootState) => state.user
  );
  const [showModal, setShowModal] = useState(false);

  // Track previous loading state to detect when submission completes
  const prevLoadingRef = useRef(loading);

  useEffect(() => {
    // If loading changed from true to false and there's a success message, show modal
    if (prevLoadingRef.current && !loading && message && !error) {
      setShowModal(true);
    }
    prevLoadingRef.current = loading;
  }, [loading, message, error]);

  const handleSubmit = (status: "tham gia" | "lần sau") => {
    if (!username.trim()) {
      dispatch(clearSubmitError());
      dispatch(submitUser({ name: "", status, categoryId }));
      return;
    }
    dispatch(clearSubmitError());
    dispatch(submitUser({ name: username, status, categoryId }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    dispatch(clearSubmitError());
  };

  const closeModal = () => {
    setShowModal(false);
    dispatch(clearSuccessMessage()); // Clear the success message from store
    onGoCom1Click();
  };

  return (
    <>
      <div className="max-w-sm mx-auto">
        <div className="mb-5">
          <input
            type="text"
            id="username"
            className="bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-gray-300 focus:border-gray-100 block w-full p-2.5"
            placeholder="Min Le..."
            value={username}
            onChange={handleInputChange}
            required
          />
          {error && (
            <p className="text-red-500 font-primaryMedium text-md mt-2">
              {error}
            </p>
          )}
        </div>
        <div className="flex space-x-4 items-center justify-center">
          <button
            onClick={() => handleSubmit("tham gia")}
            className="text-black bg-green-500 hover:bg-green-600 focus:ring-2 focus:outline-none focus:ring-gray-300 font-primaryMedium rounded-lg text-sm w-24 sm:w-auto px-5 py-2.5 text-center"
          >
            {loading ? <Loading size="sm" /> : `OK`}
          </button>
          <button
            onClick={() => {
              onGoCom1Click();
            }}
            className="text-black bg-red-300 hover:bg-red-400 focus:ring-2 focus:outline-none focus:ring-gray-300 font-primaryMedium rounded-lg text-sm w-24 sm:w-auto px-5 py-2.5 text-center"
          >
            Lần sau
          </button>
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
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
