import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { setSessionExpired } from "../redux/authSlice";
import { useAppDispatch, type RootState } from "../redux/store";

// Show modal this many ms before token actually expires
const WARN_BEFORE_MS = 60 * 1000;

function getTokenExpiryMs(token: string): number | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    return null;
  }
}

export function useTokenExpiryWatcher() {
  const dispatch = useAppDispatch();
  const accessToken = useSelector((s: RootState) => s.auth.accessToken);
  const sessionExpired = useSelector((s: RootState) => s.auth.sessionExpired);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!accessToken || sessionExpired) return;

    const expiryMs = getTokenExpiryMs(accessToken);
    if (!expiryMs) return;

    const delay = expiryMs - Date.now() - WARN_BEFORE_MS;

    if (delay <= 0) {
      // Token already expired or less than 60s remaining
      dispatch(setSessionExpired(true));
      return;
    }

    timerRef.current = setTimeout(() => {
      dispatch(setSessionExpired(true));
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [accessToken, sessionExpired, dispatch]);
}
