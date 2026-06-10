import React from "react";

// Register custom real-time listeners so useSession is fully synchronized throughout the React hierarchy
const listeners = new Set<() => void>();

const notifyListeners = () => {
  listeners.forEach((l) => l());
};

// Helper to inject standard Authorization Bearer token to avoid iframe storage/session partitioning issues safely
export async function safeFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const token = localStorage.getItem("sikat_session_token");
  const headers = new Headers(init?.headers);
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers,
  });
}

export const authClient = {
  getToken() {
    return localStorage.getItem("sikat_session_token") || "";
  },

  setToken(token: string) {
    if (token) {
      localStorage.setItem("sikat_session_token", token);
    } else {
      localStorage.removeItem("sikat_session_token");
    }
    notifyListeners();
  },

  signUp: {
    email: async ({ email, password, name }: any) => {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { error: { message: data.error || "Gagal registrasi" } };
        }
        authClient.setToken(data.token);
        return { data };
      } catch (err: any) {
        return { error: { message: err.message || "Gagal melakukan registrasi" } };
      }
    },
  },

  signIn: {
    email: async ({ email, password }: any) => {
      try {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { error: { message: data.error || "Email atau password salah" } };
        }
        authClient.setToken(data.token);
        return { data };
      } catch (err: any) {
        return { error: { message: err.message || "Gagal masuk" } };
      }
    },
  },

  async signOut() {
    const token = authClient.getToken();
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
      });
    } catch (e) {
      // Ignored - client cleanup takes precedence
    }
    authClient.setToken("");
  },

  useSession() {
    const [state, setState] = React.useState(() => {
      const token = localStorage.getItem("sikat_session_token");
      return {
        data: token ? { user: { id: token, email: "", name: "" } } : null,
        isPending: false,
      };
    });

    React.useEffect(() => {
      const handleUpdate = () => {
        const token = localStorage.getItem("sikat_session_token");
        setState({
          data: token ? { user: { id: token, email: "", name: "" } } : null,
          isPending: false,
        });
      };

      listeners.add(handleUpdate);
      return () => {
        listeners.delete(handleUpdate);
      };
    }, []);

    return {
      data: state.data,
      isPending: state.isPending,
      refetch: async () => {
        // Handled reactively
      },
    };
  },
};
