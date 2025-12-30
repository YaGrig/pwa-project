import { LoginFormFields, RegistrationFields } from "../lib/types";

export const AuthApi = {
  api: process.env.REACT_APP_BACKEND_URL || "http://localhost:3001",
  async register(data: RegistrationFields) {
    const res = await fetch(`http://localhost:3001/auth/register`, {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.json();
  },

  async login(data: LoginFormFields) {
    const res = await fetch(`http://localhost:3001/auth/login`, {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.json();
  },

  async getMe(token: string) {
    const res = await fetch(`${this.api}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.json();
  },

  async refreshToken(): Promise<{ jwt_token: string }> {
    try {
      const res = await fetch(`http://localhost:3001/auth/refresh`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        // if (res.status === 401) {
        //   redirectEvent();
        // }
        throw new Error(`Refresh failed with status: ${res.status}`);
      }

      const data = await res.json();

      if (!data.data?.jwt_token) {
        throw new Error("Invalid response structure");
      }

      return { jwt_token: data.data.jwt_token };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Unknown error during token refresh");
    }
  },
};
