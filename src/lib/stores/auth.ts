import { writable } from "svelte/store";

export interface User {
  id?: string;
  email: string;
  token?: string;
}

interface AuthStore {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
}

function createAuthStore() {
  const { subscribe, set, update } = writable<AuthStore>({
    isAuthenticated: false,
    user: null,
    token: null,
  });

  return {
    subscribe,
    login: (userData: User) => {
      console.log("Auth: login called with", userData.email);

      // Create auth data object
      const authData = {
        isAuthenticated: true,
        user: userData,
        token: userData.token || null,
      };

      // Update the store first for immediate reactivity
      set(authData);

      // Then try to store in browser storage
      try {
        // Store in sessionStorage which is more reliable on mobile
        sessionStorage.setItem("authToken", userData.token || "");
        sessionStorage.setItem("auth", JSON.stringify(authData));

        // Also try localStorage for persistence between sessions
        localStorage.setItem("authToken", userData.token || "");
        localStorage.setItem("auth", JSON.stringify(authData));
      } catch (e) {
        console.error("Failed to store auth data:", e);
      }
    },
    logout: () => {
      console.log("Auth: logout called");

      // Update the store immediately
      set({
        isAuthenticated: false,
        user: null,
        token: null,
      });

      // Then clear storage
      try {
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("auth");
        localStorage.removeItem("authToken");
        localStorage.removeItem("auth");
      } catch (e) {
        console.error("Failed to clear auth data:", e);
      }
    },
    init: () => {
      console.log("Auth: init called");

      try {
        // Try sessionStorage first (more reliable on mobile)
        let authData = null;
        const sessionAuth = sessionStorage.getItem("auth");

        if (sessionAuth) {
          try {
            authData = JSON.parse(sessionAuth);
            console.log("Found auth in sessionStorage");
          } catch (e) {
            console.error("Failed to parse sessionStorage auth:", e);
          }
        }

        // If not found in sessionStorage, try localStorage
        if (!authData) {
          const localAuth = localStorage.getItem("auth");
          if (localAuth) {
            try {
              authData = JSON.parse(localAuth);
              console.log("Found auth in localStorage");
            } catch (e) {
              console.error("Failed to parse localStorage auth:", e);
            }
          }
        }

        if (authData?.isAuthenticated) {
          console.log(
            "Setting auth state to authenticated for",
            authData.user?.email
          );
          set(authData);
          return true;
        }
      } catch (e) {
        console.error("Error in auth init:", e);
      }

      return false;
    },
    getUserId: () => {
      const storedAuth = localStorage.getItem("auth");
      if (storedAuth) {
        const authData = JSON.parse(storedAuth);
        return authData.user?.id;
      }
      return null;
    },
  };
}

export const auth = createAuthStore();
