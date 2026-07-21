import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { rejectTokenRefresh } from "../../helpers/axiosInstance";
import { clearAuth, refreshAccessToken } from "../../redux/authSlice";
import { useAppDispatch, type RootState } from "../../redux/store";
import Loading from "../Loading";

const COUNTDOWN_SEC = 60;
const RADIUS = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const SessionExpiredModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const sessionExpired = useSelector((s: RootState) => s.auth.sessionExpired);

  const [countdown, setCountdown] = useState(COUNTDOWN_SEC);
  const [timedOut, setTimedOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!sessionExpired) {
      setCountdown(COUNTDOWN_SEC);
      setTimedOut(false);
      setRefreshing(false);
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    setCountdown(COUNTDOWN_SEC);
    setTimedOut(false);

    intervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sessionExpired]);

  useEffect(() => {
    if (countdown === 0 && sessionExpired && !timedOut) {
      setTimedOut(true);
      rejectTokenRefresh();
    }
  }, [countdown, sessionExpired, timedOut]);

  const handleRefresh = async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setRefreshing(true);

    const result = await dispatch(refreshAccessToken());

    if (refreshAccessToken.rejected.match(result)) {
      handleGoToLogin();
    }

    setRefreshing(false);
  };

  const handleGoToLogin = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    rejectTokenRefresh();
    dispatch(clearAuth());
    navigate("/login-to-ql-page-110");
  };

  if (!sessionExpired) return null;

  const progress = (countdown / COUNTDOWN_SEC) * 100;
  const strokeDashoffset = CIRCUMFERENCE - (progress / 100) * CIRCUMFERENCE;
  const isUrgent = countdown <= 10 && !timedOut;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-yellow-50 px-6 pt-6 pb-4 flex flex-col items-center border-b border-yellow-100">
          {/* Countdown ring */}
          <div className="relative w-20 h-20 mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 72 72">
              <circle
                cx="36"
                cy="36"
                r={RADIUS}
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="6"
              />
              <circle
                cx="36"
                cy="36"
                r={RADIUS}
                fill="none"
                stroke={isUrgent ? "#ef4444" : "#f59e0b"}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={timedOut ? CIRCUMFERENCE : strokeDashoffset}
                style={{
                  transition: "stroke-dashoffset 1s linear, stroke 0.3s",
                }}
              />
            </svg>
            <span
              className={`absolute inset-0 flex items-center justify-center text-xl font-primaryBold ${isUrgent ? "text-red-500" : "text-yellow-400"}`}
            >
              {timedOut ? "!" : countdown}
            </span>
          </div>

          <h2 className="text-lg font-primaryBold text-gray-800 text-center">
            {timedOut
              ? t("admin.sessionModal.titleTimedOut")
              : t("admin.sessionModal.title")}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-sm text-gray-500 text-center mb-5">
            {timedOut
              ? t("admin.sessionModal.messageTimedOut")
              : t("admin.sessionModal.message", { count: countdown })}
          </p>

          <div className="flex flex-col gap-3">
            {!timedOut && (
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="w-full bg-green-400 hover:bg-green-500 text-black font-primaryMedium rounded-lg px-5 py-2.5 flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
              >
                {refreshing ? (
                  <Loading size="sm" />
                ) : (
                  t("admin.sessionModal.continue")
                )}
              </button>
            )}
            <button
              onClick={handleGoToLogin}
              disabled={refreshing}
              className="w-full font-primaryMedium rounded-lg px-5 py-2.5 disabled:opacity-50 transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700"
            >
              {t("admin.sessionModal.login")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
