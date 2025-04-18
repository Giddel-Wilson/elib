import type { LayoutLoad } from "./$types";
import type { AuthData } from "$lib/types/auth";

export const load = (async () => {
  const authData =
    typeof window !== "undefined" ? window.localStorage.getItem("auth") : null;
  const auth: AuthData = authData
    ? JSON.parse(authData)
    : {
        isAuthenticated: false,
        user: null,
        token: null,
      };

  return { auth };
}) satisfies LayoutLoad;
