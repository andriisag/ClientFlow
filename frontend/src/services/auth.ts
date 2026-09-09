import api from "./api";
import type { LoginResponse, User } from "../types/auth";

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const formData = new URLSearchParams();

  formData.append("username", email);
  formData.append("password", password);

  const response = await api.post<LoginResponse>(
    "/auth/login",
    formData,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return response.data;
}

export async function register(
  email: string,
  password: string,
): Promise<User> {
  const response = await api.post<User>(
    "/auth/register",
    {
      email,
      password,
    },
  );

  return response.data;
}