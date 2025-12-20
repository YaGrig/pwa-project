import { LoginForm, RegistrationForm } from "../lib/types";

export const AuthApi = {
  api: process.env.REACT_APP_BACKEND_URL || "http://localhost:3001",
  async register(data: RegistrationForm) {
    const res = await fetch(`${this.api}/auth/register`, {
      method: "POST",
      body: JSON.stringify(data),
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return res.json();
  },

  async login(data: LoginForm) {
    const res = await fetch(`${this.api}/auth/login`, {
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

  async refreshToken(): Promise<{ access_token: string }> {
    const res = await fetch(`${this.api}/auth/refresh`, {
      credentials: "include",
    });
    const data = await res.json();
    // const {data} = res;

    return data.data;
  },
};
