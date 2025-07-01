import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  fetchParticipantsByCategory,
  clearCategoryError,
  deleteParticipant,
  storeCategoryUpDe,
  type Participant,
  type Category,
  type UpdateCategoryPaymentPayload,
  updateParticipant,
} from "../redux/categorySlice";
import { logout } from "../redux/authSlice"; // Assuming checkAuth action is added
import { useAppDispatch, type RootState } from "../redux/store";
import Loading from "../components/Loading";
import { Delete02Icon, Edit02Icon, UserGroupIcon } from "hugeicons-react";

interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

interface SelectedParticipant {
  selected: boolean;
  amount: number;
}

interface SelectedParticipants {
  [participantId: string]: SelectedParticipant;
}

interface EditParticipantData {
  paymentDone: boolean;
  otherAmount: number;
  reason: string;
}

// interface EditParticipantModalProps {
//   participant: Participant | null;
//   categoryId: string;
//   onClose: () => void;
//   onUpdate: (
//     categoryId: string,
//     participantId: string,
//     data: EditParticipantData
//   ) => Promise<void>;
// }

export const AdminPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { username, logoutLoading, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const {
    categories,
    participants,
    loading,
    error,
    createdLoading,
    participantsLoading,
    categoryUpDe,
  } = useSelector((state: RootState) => state.category);

  // Existing state
  const [newCategoryName, setNewCategoryName] = useState("");
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteCategoryId, setDeleteCategoryId] = useState<string | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [loadingParticipants, setLoadingParticipants] = useState<string[]>([]);
  const [deleteParticipantInfo, setDeleteParticipantInfo] = useState<{
    participantId: string;
    categoryId: string;
  } | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteParticipantError, setDeleteParticipantError] = useState<
    string | null
  >(null);
  // New state for toast and auth modal
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [selectedParticipants, setSelectedParticipants] =
    useState<SelectedParticipants>({});
  // State for edit participant modal
  const [editParticipant, setEditParticipant] = useState<Participant | null>(
    null
  );
  const [participantFormData, setParticipantFormData] =
    useState<EditParticipantData>({
      paymentDone: false,
      otherAmount: 0,
      reason: "",
    });
  const [participantUpdateError, setParticipantUpdateError] = useState<
    string | null
  >(null);
  const [currentCategoryId, setCurrentCategoryId] = useState<string>('');

  // Helper function to check authentication before dispatch
  const checkAuthAndDispatch = (callback: () => void) => {
    if (!isAuthenticated) {
      addToast("Please log in to perform this action", "error");
      setShowAuthModal(true);
      return;
    }
    callback();
  };

  // Toast functions
  const addToast = (message: string, type: Toast["type"] = "info") => {
    const id = Date.now().toString();
    const newToast: Toast = { id, message, type };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Check authentication continuously
  //   useEffect(() => {
  //     let intervalId: NodeJS.Timeout;

  //     const checkAuthContinuously = () => {
  //       if (isAuthenticated && !checkAuthLoading) {
  //         dispatch(checkAuth())
  //           .unwrap()
  //           .then((response: any) => {
  //             if (response.statusCode !== 200) {
  //               // Authentication failed (e.g., token blacklisted)
  //               dispatch(logout());
  //               addToast("Session expired, please log in again", "error");
  //               setShowAuthModal(true);
  //             }
  //           })
  //           .catch((error: any) => {
  //             console.error("Error checking auth:", error);
  //             addToast("Error checking session, please log in again", "error");
  //             setShowAuthModal(true);
  //           });
  //       }
  //     };

  //     if (isAuthenticated) {
  //       checkAuthContinuously(); // Initial check
  //       intervalId = setInterval(checkAuthContinuously, 30000); // Poll every 30 seconds
  //     }

  //     // Cleanup on unmount or auth change
  //     return () => {
  //       if (intervalId) clearInterval(intervalId);
  //     };
  //   }, [isAuthenticated, checkAuthLoading, dispatch]);

  // Check authentication on component mount

  useEffect(() => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchCategories());
      if (categoryUpDe) {
        dispatch(fetchParticipantsByCategory(categoryUpDe));
      }
    }
  }, [dispatch, isAuthenticated]);

  // Redirect to login page
  const redirectToLogin = () => {
    window.location.href = "/login"; // Adjust path as needed
  };

  const handleCreateCategory = async () => {
    if (!isAuthenticated) {
      addToast("Please log in to create a category", "error");
      setShowAuthModal(true);
      return;
    }

    if (newCategoryName.trim()) {
      dispatch(clearCategoryError());
      try {
        const result = await dispatch(
          createCategory({ name: newCategoryName })
        );
        if (createCategory.fulfilled.match(result)) {
          setEditCategory(null);
          setNewCategoryName("");
          dispatch(fetchCategories());
          addToast("Date created successfully!", "success");
        } else if (createCategory.rejected.match(result)) {
          const errorMsg =
            (result.payload as string) || "Failed to create category";
          setCreateError(errorMsg);
        }
      } catch (err) {
        const errorMsg = "Failed to create category";
        setCreateError(errorMsg);
        addToast(errorMsg, "error");
      }
    }
  };

  const handleUpdateCategory = async (category: Category) => {
    if (!isAuthenticated) {
      addToast("Please log in to update a category", "error");
      setShowAuthModal(true);
      return;
    }

    dispatch(clearCategoryError());
    setUpdateError(null);

    try {
      // Get selected participants data
      const selectedParticipantsData: UpdateCategoryPaymentPayload[] =
        Object.entries(selectedParticipants)
          .filter(([_, data]: [string, SelectedParticipant]) => data.selected)
          .map(([participantId, data]: [string, SelectedParticipant]) => ({
            id: participantId,
            amount: data.amount,
          }));

      // console.log("Selected participants:", selectedParticipantsData);
      if (selectedParticipantsData.length === 0) {
        setUpdateError("Please select at least one participant");
        return;
      }

      const result = await dispatch(
        updateCategory({
          id: category._id,
          name: category.name,
          is_selected: category.is_selected,
          payments: selectedParticipantsData,
        })
      );

      if (updateCategory.fulfilled.match(result)) {
        setEditCategory(null);
        dispatch(fetchCategories());
        await dispatch(fetchParticipantsByCategory(category._id));
        addToast("Date updated successfully!", "success");
      } else if (updateCategory.rejected.match(result)) {
        const errorMsg =
          (result.payload as string) || "Failed to update category";
        setUpdateError(errorMsg);
      }
    } catch (err) {
      const errorMsg = "Failed to update category";
      setUpdateError(errorMsg);
      addToast(errorMsg, "error");
    }
  };

  const handleDeleteCategory = (id: string) => {
    checkAuthAndDispatch(() => {
      dispatch(clearCategoryError());
      dispatch(deleteCategory(id));
      setDeleteCategoryId(null);
      dispatch(fetchCategories());
      addToast("Date deleted successfully!", "success");
    });
  };

  // Handler to open edit participant modal
  const handleEditParticipant = (
    participant: Participant,
    categoryId: string
  ): void => {
    setEditParticipant(participant);
    setCurrentCategoryId(categoryId);
    setParticipantFormData({
      paymentDone: participant.paymentDone || false,
      otherAmount: participant.otherAmount || 0,
      reason: participant.reasonOtherAmount || "",
    });
    setParticipantUpdateError(null);
  };

  // Handler for form field changes
  const handleParticipantFormChange = (
    field: keyof EditParticipantData,
    value: boolean | number | string
  ): void => {
    setParticipantFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleUpdateParticipant = async (): Promise<void> => {
    checkAuthAndDispatch(async () => {
      dispatch(clearCategoryError());
      if (!editParticipant) return;

      setParticipantUpdateError(null);
      try {
        // Delete the participant
        console.log(participantFormData.reason);
        const result = await dispatch(
          updateParticipant({
            participantId: editParticipant._id,
            categoryId: currentCategoryId,
            paymentDone: participantFormData.paymentDone,
            otherAmount: participantFormData.otherAmount,
            reason: participantFormData.reason,
          })
        );

        if (updateParticipant.fulfilled.match(result)) {
          dispatch(storeCategoryUpDe(editParticipant.category._id));

          // Fetch updated participants list for this category
          await dispatch(
            fetchParticipantsByCategory(editParticipant.category._id)
          );

          // Close the modal and show success message
          setEditParticipant(null);
          addToast("Participant updated successfully!", "success");
        } else if (updateParticipant.rejected.match(result)) {
          const errorMsg =
            (result.payload as string) || "Failed to delete participant";
          setParticipantUpdateError(errorMsg);
        }

        // Store the category ID for future reference
      } catch (error: any) {
        // Handle any errors that occur during the deletion process
        // addToast("Failed to delete participant", "error");
        setParticipantUpdateError(error);
        console.error("Error deleting participant:", error);
      }
    });
  };

  const handleCloseParticipantModal = (): void => {
    setEditParticipant(null);
    setParticipantFormData({
      paymentDone: false,
      otherAmount: 0,
      reason: "",
    });
    setParticipantUpdateError(null);
  };

  const handleDeleteParticipant = async (
    participantId: string,
    categoryId: string
  ) => {
    checkAuthAndDispatch(async () => {
      dispatch(clearCategoryError());

      try {
        // Delete the participant
        const result = await dispatch(
          deleteParticipant({ participantId, categoryId })
        );

        if (deleteParticipant.fulfilled.match(result)) {
          dispatch(storeCategoryUpDe(categoryId));

          // Fetch updated participants list for this category
          await dispatch(fetchParticipantsByCategory(categoryId));

          // Close the modal and show success message
          setDeleteParticipantInfo(null);
          addToast("Participant deleted successfully!", "success");
        } else if (deleteParticipant.rejected.match(result)) {
          const errorMsg =
            (result.payload as string) || "Failed to delete participant";
          setDeleteParticipantError(errorMsg);
        }

        // Store the category ID for future reference
      } catch (error: any) {
        // Handle any errors that occur during the deletion process
        // addToast("Failed to delete participant", "error");
        setDeleteParticipantError(error);
        console.error("Error deleting participant:", error);
      }
    });
  };

  const toggleParticipants = async (categoryId: string) => {
    if (!isAuthenticated) {
      addToast("Please log in to view participants", "error");
      setShowAuthModal(true);
      return;
    }

    if (!expandedCategories.includes(categoryId)) {
      setLoadingParticipants([...loadingParticipants, categoryId]);
      await dispatch(fetchParticipantsByCategory(categoryId));
      setLoadingParticipants(
        loadingParticipants.filter((id) => id !== categoryId)
      );
      setExpandedCategories([...expandedCategories, categoryId]);
    } else {
      setExpandedCategories(
        expandedCategories.filter((id) => id !== categoryId)
      );
    }
    dispatch(storeCategoryUpDe(categoryId));
  };

  const handleLogout = () => {
    if (!isAuthenticated) {
      addToast("You are already logged out", "info");
      return;
    }

    dispatch(logout());
    addToast("Logged out successfully!", "info");
  };

  useEffect(() => {
    document.title = "Management";
  }, []);

  console.log(deleteParticipantError);

  // Show auth modal if not authenticated
  if (isAuthenticated === false) {
    return (
      <>
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
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
              } motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-4 motion-safe:duration-300 group-[.toast-container]:motion-safe:animate-out group-[.toast-container]:motion-safe:fade-out group-[.toast-container]:motion-safe:slide-out-to-top-4`}
            >
              <span className="text-md font-primaryMedium text-black">
                {toast.message}
              </span>
              <button
                onClick={() => removeToast(toast.id)}
                className="ml-3 text-black hover:text-gray-200 transition-colors duration-200"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Authentication Modal */}
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
                  Authentication Required
                </h2>
                <p className="text-gray-600 font-primaryRegular">
                  You need to be logged in to access this page. Please log in to
                  continue.
                </p>
              </div>
              <button
                onClick={redirectToLogin}
                className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-primaryMedium rounded-lg text-sm px-5 py-3 transition-colors"
              >
                Go to Login Page
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Show loading screen for initial page load
  if (loading && categories.length === 0) {
    return (
      <div className="max-w-7xl mx-auto my-36">
        <Loading size="lg" className="py-20" />
      </div>
    );
  }

  const handleNewCategoryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCategoryName(e.target.value);
    if (error) {
      dispatch(clearCategoryError());
      setCreateError(null);
    }
  };

  const handleEditCategoryNameChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (editCategory) {
      setEditCategory({
        ...editCategory,
        name: e.target.value,
      });
    }
    if (updateError || error) {
      dispatch(clearCategoryError());
      setUpdateError(null);
    }
  };

  const handleEditCategorySelectedChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (editCategory) {
      setEditCategory({
        ...editCategory,
        is_selected: e.target.checked,
      });
    }
    if (updateError || error) {
      dispatch(clearCategoryError());
      setUpdateError(null);
    }
  };

  const handleParticipantCheckboxChange = (
    participantId: string,
    isChecked: boolean
  ): void => {
    setSelectedParticipants((prev) => {
      // Get the participant's paymentBefore value
      let defaultAmount = 0;
      if (editCategory) {
        const participant = participants[editCategory._id]?.find(
          (p) => p._id === participantId
        );
        defaultAmount = participant?.paymentBefore || 0;
      }

      return {
        ...prev,
        [participantId]: {
          selected: isChecked,
          // If participant already exists in state, keep their amount, otherwise use paymentBefore
          amount: prev[participantId]
            ? prev[participantId].amount
            : defaultAmount,
        },
      };
    });
  };

  // Handler for participant amount change
  const handleParticipantAmountChange = (
    participantId: string,
    amount: string
  ): void => {
    setSelectedParticipants((prev) => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        selected: prev[participantId]?.selected || false,
        amount: parseFloat(amount) || 0,
      },
    }));
  };

  return (
    <>
      {/* Toast Container */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 space-y-2">
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
            } motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-top-4 motion-safe:duration-300 group-[.toast-container]:motion-safe:animate-out group-[.toast-container]:motion-safe:fade-out group-[.toast-container]:motion-safe:slide-out-to-top-4`}
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

      <div className="my-16 flex justify-center">
        <div className="max-w-4xl w-full px-2 sm:px-2 md:px-4 lg:px-6 xl:px-6 2xl:px-8">
          <div className="flex justify-between items-center mb-16 pb-4 border-b-2 border-gray-500">
            <h1 className="text-3xl font-primaryBold">
              Welcome, {username || "Admin"}
            </h1>
            <button
              onClick={handleLogout}
              className="text-black bg-red-400 hover:bg-red-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5"
            >
              {logoutLoading ? <Loading size="sm" /> : "Logout"}
            </button>
          </div>

          {/* Create Category Modal */}
          <div className="mb-6">
            <h2 className="text-xl font-primaryMedium mb-2">Create New Date</h2>
            <div className="flex space-x-4">
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-gray-300 focus:border-gray-100 block w-full p-2.5"
                placeholder="Ngày 27/6, 19h30"
                value={newCategoryName}
                onChange={handleNewCategoryChange}
              />
              <button
                onClick={handleCreateCategory}
                disabled={loading}
                className="text-black bg-green-400 hover:bg-green-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-2 py-2.5 disabled:opacity-50 flex items-center justify-center space-x-2 min-w-28"
              >
                {createdLoading ? <Loading size="sm" /> : "Create Date"}
              </button>
            </div>
          </div>

          {/* Error Display */}
          {createError && (
            <p className="text-red-400 text-sm mb-4">{createError}</p>
          )}

          {/* Category List */}
          <h2 className="text-xl font-primaryMedium mb-4 mt-12">List Dates</h2>
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
                          ? `Show participant`
                          : `Hide participant`
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
                        Selected Date: {category.is_selected ? "Yes" : "No"}
                      </p>
                    </div>
                  </div>
                  <div className="sm:flex space-x-2 hidden mr-0.5">
                    <button
                      onClick={() => setEditCategory(category)}
                      className="text-black bg-yellow-400 hover:bg-yellow-500 focus:ring-2 focus:ring-yellow-300 font-primaryMedium rounded-lg text-sm px-4 py-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteCategoryId(category._id)}
                      className="text-black bg-red-400 hover:bg-red-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-4 py-2"
                    >
                      Delete
                    </button>
                  </div>
                  <div className="flex space-x-2 sm:hidden mr-0.5">
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
                    <div className="mt-5 mb-1 ml-1">
                      <h4 className="text-md font-primaryMedium mb-4 text-black flex">
                        <UserGroupIcon size={25} className="mr-1.5 -mt-0.5" />{" "}
                        Participants:
                      </h4>
                      {participants[category._id]?.length ? (
                        <ul className="list-disc pl-0 font-primaryRegular space-y-4 ml-2">
                          {participants[category._id].map(
                            (participant: Participant, index) => (
                              <li
                                key={participant._id}
                                className="text-sm flex justify-between"
                              >
                                <span className="w-3/4">
                                  <p className="pb-1 font-primaryBold">
                                    <span className="mr-1">{index + 1}.</span>
                                    {participant.name}{" "}
                                    {participant.paymentDone && (
                                      <span className="text-green-600">
                                        (Done)
                                      </span>
                                    )}
                                  </p>
                                  <table className="w-full ml-4">
                                    <tbody>
                                      <tr>
                                        <td className="py-1 w-24 font-primaryRegula flex items-start">
                                          - Share:
                                        </td>
                                        <td className="py-1 text-left font-primaryRegular">
                                          {participant.shareAmount}k
                                        </td>
                                      </tr>
                                      <tr>
                                        <td className="py-1 w-24 font-primaryRegular flex items-start">
                                          - Paid:
                                        </td>
                                        <td className="py-1 text-left font-primaryRegular">
                                          {participant.paymentBefore}k
                                        </td>
                                      </tr>
                                      {participant.otherAmount !== 0 && (
                                        <tr>
                                          <td className="py-1 w-24 font-primaryRegular flex items-start">
                                            - Other:
                                          </td>
                                          <td className="py-1 text-left font-primaryRegular">
                                            {participant.otherAmount < 0
                                              ? `Nhận lại ${Math.abs(
                                                  participant.otherAmount
                                                )}`
                                              : `Trả thêm ${participant.otherAmount}`}
                                            k{" "}
                                            {participant.reasonOtherAmount !==
                                              "" && (
                                              <span>
                                                ({participant.reasonOtherAmount}
                                                )
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      )}
                                      <tr>
                                        <td className="py-1 w-24 font-primaryMedium ">
                                          - Remaining:
                                        </td>
                                        <td className="py-1 text-left font-primaryMedium">
                                          {participant.paidAmount === 0
                                            ? `${participant.paidAmount}k`
                                            : participant.paidAmount < 0
                                            ? `Nhận lại ${Math.abs(
                                                participant.paidAmount
                                              )}k`
                                            : `Trả thêm ${participant.paidAmount}k`}
                                        </td>
                                      </tr>
                                    </tbody>
                                  </table>
                                </span>
                                <div className="hidden sm:flex mr-2">
                                  <button
                                    onClick={() =>
                                      handleEditParticipant(
                                        participant,
                                        category._id
                                      )
                                    }
                                    className="w-10 h-7 text-yellow-600 hover:text-yellow-700 font-primaryBold rounded-lg text-md py-1"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteParticipantInfo({
                                        participantId: participant._id,
                                        categoryId: category._id,
                                      })
                                    }
                                    className="w-10 h-7 text-red-500 hover:text-red-600 font-primaryBold rounded-lg text-md py-1 ml-2 sm:pl-0"
                                  >
                                    Delete
                                  </button>
                                </div>
                                <div className="flex sm:hidden mr-2">
                                  <button
                                    onClick={() =>
                                      handleEditParticipant(
                                        participant,
                                        category._id
                                      )
                                    }
                                    className="w-7 h-7 text-yellow-600 hover:text-yellow-700 focus:ring-2 focus:ring-gray-300 rounded-lg text-md py-1 px-1 flex justify-end"
                                  >
                                    <Edit02Icon size={18} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      setDeleteParticipantInfo({
                                        participantId: participant._id,
                                        categoryId: category._id,
                                      })
                                    }
                                    className="w-7 h-7 text-red-500 hover:text-red-600 focus:ring-2 focus:ring-gray-300 rounded-lg text-md py-1 px-1 ml-1 flex justify-end"
                                  >
                                    <Delete02Icon size={18} />
                                  </button>
                                </div>
                              </li>
                            )
                          )}
                        </ul>
                      ) : (
                        <p className="text-sm text-gray-600 font-primaryRegular">
                          No participants
                        </p>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        {/* Edit Category Modal */}
        {editCategory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-primaryBold mb-5">Edit Date</h2>
              <label className="font-primaryMedium">Date:</label>
              <input
                type="text"
                className="bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-gray-300 focus:border-gray-100 block w-full p-2.5 mb-3 mt-1"
                value={editCategory.name}
                onChange={handleEditCategoryNameChange}
              />
              <label className="flex items-center mb-6 font-primaryMedium">
                <input
                  type="checkbox"
                  checked={editCategory.is_selected}
                  onChange={handleEditCategorySelectedChange}
                  className="mr-2 w-4 h-4 accent-green-500"
                />
                <span className="text-sm">
                  Select Date (Choose this date to vote)
                </span>
              </label>
              {/* Participants List */}
              {participants[editCategory._id] &&
                participants[editCategory._id].length > 0 && (
                  <div className="mb-6">
                    <p className="text-md font-primaryMedium mb-2">
                      List participants:
                    </p>
                    <div className="space-y-3 max-h-60 overflow-y-auto no-scrollbar">
                      {participants[editCategory._id].map((participant) => (
                        <div
                          key={participant._id}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <input
                            type="checkbox"
                            checked={
                              selectedParticipants[participant._id]?.selected ||
                              false
                            }
                            onChange={(
                              e: React.ChangeEvent<HTMLInputElement>
                            ) =>
                              handleParticipantCheckboxChange(
                                participant._id,
                                e.target.checked
                              )
                            }
                            className="w-3 h-3 accent-green-500 bg-gray-100 border-gray-300 rounded focus:ring-gray-500"
                          />
                          <span className="flex-1 text-sm font-primaryRegular text-gray-900">
                            {participant.name}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Paid:</span>
                            <div className="flex items-center space-x-1">
                              <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={
                                  selectedParticipants[participant._id]
                                    ?.amount !== undefined
                                    ? selectedParticipants[participant._id]
                                        .amount
                                    : participant.paymentBefore || 0
                                }
                                onChange={(
                                  e: React.ChangeEvent<HTMLInputElement>
                                ) =>
                                  handleParticipantAmountChange(
                                    participant._id,
                                    e.target.value
                                  )
                                }
                                className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-gray-400 focus:border-gray-400"
                                placeholder="0"
                              />
                              <p className="font-primaryRegular text-gray-500">
                                k
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              {updateError && (
                <p className="text-red-400 text-sm mb-4">{updateError}</p>
              )}
              <div className="flex space-x-4 items-center justify-center mt-4">
                <button
                  onClick={() => handleUpdateCategory(editCategory)}
                  disabled={loading}
                  className="text-black bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 flex items-center justify-center space-x-2 min-w-[80px]"
                >
                  {loading ? <Loading size="sm" /> : "Save"}
                </button>
                <button
                  onClick={() => {
                    setEditCategory(null);
                    setSelectedParticipants({}); // Reset selected participants
                    setUpdateError(null); // Clear any error messages
                  }}
                  className="text-black bg-gray-400 hover:bg-gray-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Delete Category Modal */}
        {deleteCategoryId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-primaryBold mb-5">Confirm Delete</h2>
              <p className="text-sm mb-4">
                Are you sure you want to delete this date?
              </p>
              <div className="flex space-x-4 items-center justify-center">
                <button
                  onClick={() => handleDeleteCategory(deleteCategoryId)}
                  disabled={loading}
                  className="text-black bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 flex items-center space-x-2 min-w-[80px]"
                >
                  {loading ? <Loading size="sm" /> : "Delete"}
                </button>
                <button
                  onClick={() => setDeleteCategoryId(null)}
                  className="text-black bg-gray-400 hover:bg-gray-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Edit Participant Modal */}
        {editParticipant && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
              <h2 className="text-xl font-primaryBold mb-5">
                Edit Participant: {editParticipant.name}
              </h2>

              {/* Payment Done Checkbox */}
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={participantFormData.paymentDone}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleParticipantFormChange(
                        "paymentDone",
                        e.target.checked
                      )
                    }
                    className="w-4 h-4 bg-gray-100 border-gray-300 rounded focus:ring-gray-500 accent-green-500 mr-3"
                  />
                  <span className="text-sm font-primaryMedium">
                    Payment Done
                  </span>
                </label>
              </div>

              {/* Other Amount Input */}
              <div className="mb-4">
                <label className="block text-sm font-primaryMedium text-gray-700 mb-2">
                  Other Amount (k):
                </label>

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={participantFormData.otherAmount}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleParticipantFormChange(
                      "otherAmount",
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                  placeholder="Enter amount"
                />

                <span className="text-[12px] font-primaryMedium text-gray-500 italic">
                  ("Amount &lt; 0": nhận thêm, "Amount &gt; 0": trả thêm)
                </span>
              </div>

              {/* Reason Input */}
              <div className="mb-4">
                <label className="block text-sm font-primaryMedium text-gray-700 mb-2">
                  Note:
                </label>
                <textarea
                  value={participantFormData.reason}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    handleParticipantFormChange("reason", e.target.value)
                  }
                  className="bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-20 resize-none"
                  placeholder="Điền note (người trả tiền trước)"
                />
              </div>

              {/* Error Message */}
              {participantUpdateError && (
                <p className="text-red-400 text-sm mb-5">
                  {participantUpdateError}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex space-x-4 items-center justify-center mt-4">
                <button
                  onClick={handleUpdateParticipant}
                  disabled={loading}
                  className="text-black bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50 flex items-center justify-center space-x-2 min-w-[80px]"
                >
                  {participantsLoading ? <Loading size="sm" /> : "Update"}
                </button>
                <button
                  onClick={handleCloseParticipantModal}
                  className="text-black bg-gray-400 hover:bg-gray-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5 flex items-center justify-center"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Participant Modal */}
        {deleteParticipantInfo && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg mx-4">
              <h2 className="text-xl font-primaryBold mb-5">Confirm Delete</h2>
              <p className="text-md font-primaryMedium mb-4">
                Are you sure you want to delete this participant?
              </p>
              {deleteParticipantError && (
                <p className="text-red-400 text-sm mb-7 text-center">
                  {deleteParticipantError}
                </p>
              )}
              <div className="flex space-x-4 items-center justify-center">
                <button
                  onClick={() =>
                    handleDeleteParticipant(
                      deleteParticipantInfo.participantId,
                      deleteParticipantInfo.categoryId
                    )
                  }
                  disabled={loading}
                  className="text-black bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5 disabled:opacity-50"
                >
                  {participantsLoading ? <Loading size="sm" /> : "Delete"}
                </button>
                <button
                  onClick={() => setDeleteParticipantInfo(null)}
                  className="text-black bg-gray-400 hover:bg-gray-500 focus:ring-2 focus:ring-gray-300 font-primaryMedium rounded-lg text-sm px-5 py-2.5"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
