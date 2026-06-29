import React, { useEffect, useState } from "react";
import { clearError, login } from "../redux/authSlice";
import { useSelector } from "react-redux";
import { useAppDispatch, type RootState } from "../redux/store";
import { useNavigate } from "react-router";
import Loading from "../components/Loading";
import { useTranslation } from "react-i18next";

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { error, loading } = useSelector((state: RootState) => state.auth);
  const isAuthenticated = useSelector(
    (state: RootState) => state.auth.isAuthenticated,
  );
  const { t } = useTranslation();

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      return;
    }

    try {
      await dispatch(login({ username, password })).unwrap();
      // Success - user will be redirected by the router
    } catch (error) {
      // Error is already handled by Redux
      console.error("Login failed:", error);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    // Clear error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/admin-ql-nnh-110-page", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    document.title = t("login.title");
  }, []);

  return (
    <div className="my-36 flex items-center justify-center">
      <div className="max-w-md w-full px-2 sm:px-2 md:px-4 lg:px-6 xl:px-6 2xl:px-8">
        <h1 className="text-2xl font-primaryBold text-center mb-6">
          {t("login.header")}
        </h1>
        <div className="mb-5">
          <input
            type="text"
            className="bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-gray-300 focus:border-gray-100 block w-full p-2.5"
            placeholder="Username"
            value={username}
            onChange={handleUsernameChange}
            onKeyDown={handleKeyPress}
            required
          />
        </div>
        <div className="mb-5">
          <input
            type="password"
            className="bg-gray-50 border border-gray-300 font-primaryRegular text-gray-900 text-sm rounded-lg focus:ring-gray-300 focus:border-gray-100 block w-full p-2.5"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            onKeyDown={handleKeyPress}
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="text-black bg-green-500 hover:bg-green-600 focus:ring-2 focus:outline-none focus:ring-gray-300 font-primaryMedium rounded-lg text-sm w-full px-5 py-2.5 text-center disabled:opacity-50"
        >
          {loading ? <Loading size="sm" /> : t("login.loginButton")}
        </button>
      </div>
    </div>
  );
};
