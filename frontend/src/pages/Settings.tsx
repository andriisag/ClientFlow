import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Check,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

import api from "../services/api";

interface User {
  id: number;
  email: string;
}

function getSavedTheme(): "light" | "dark" {
  return localStorage.getItem("theme") === "dark"
    ? "dark"
    : "light";
}

function Settings() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState<
    "light" | "dark"
  >(getSavedTheme);

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery<User>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const response = await api.get<User>("/auth/me");
      return response.data;
    },
  });

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login", { replace: true });
  }

  function handleThemeChange(
    newTheme: "light" | "dark",
  ) {
    setTheme(newTheme);

    localStorage.setItem("theme", newTheme);

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove(
        "dark",
      );
    }
  }

  if (isLoading) {
    return (
      <div className="text-gray-500">
        Loading settings...
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="text-red-600">
        Failed to load settings
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
          <Sun size={22} />
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Settings
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your account and preferences
          </p>
        </div>
      </div>

      {/* Account */}
      <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Account
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Your ClientFlow account information
        </p>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>

          <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700">
            {user.email}
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700">
            User ID
          </label>

          <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-700">
            {user.id}
          </div>
        </div>
      </section>

      {/* Appearance */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Appearance
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Choose how ClientFlow looks
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Light */}
          <button
            type="button"
            onClick={() =>
              handleThemeChange("light")
            }
            className={`relative rounded-xl border-2 p-4 text-left transition ${
              theme === "light"
                ? "border-blue-600"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {theme === "light" && (
              <div className="absolute right-4 top-4 rounded-full bg-blue-600 p-1 text-white">
                <Check size={14} />
              </div>
            )}

            <div className="flex h-32 flex-col rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="h-3 w-20 rounded bg-gray-200" />

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="h-16 rounded bg-gray-100" />
                <div className="h-16 rounded bg-gray-100" />
                <div className="h-16 rounded bg-gray-100" />
              </div>

              <div className="mt-auto h-2 w-1/2 rounded bg-gray-200" />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Sun size={17} className="text-gray-500" />

              <p className="font-medium text-gray-900">
                Light
              </p>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Use the light interface
            </p>
          </button>

          {/* Dark */}
          <button
            type="button"
            onClick={() =>
              handleThemeChange("dark")
            }
            className={`relative rounded-xl border-2 p-4 text-left transition ${
              theme === "dark"
                ? "border-blue-600"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {theme === "dark" && (
              <div className="absolute right-4 top-4 rounded-full bg-blue-600 p-1 text-white">
                <Check size={14} />
              </div>
            )}

            <div className="flex h-32 flex-col rounded-lg border border-gray-700 bg-gray-900 p-4 shadow-sm">
              <div className="h-3 w-20 rounded bg-gray-700" />

              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="h-16 rounded bg-gray-800" />
                <div className="h-16 rounded bg-gray-800" />
                <div className="h-16 rounded bg-gray-800" />
              </div>

              <div className="mt-auto h-2 w-1/2 rounded bg-gray-700" />
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Moon size={17} className="text-gray-500" />

              <p className="font-medium text-gray-900">
                Dark
              </p>
            </div>

            <p className="mt-1 text-sm text-gray-500">
              Use the dark interface
            </p>
          </button>
        </div>
      </section>

      {/* Security */}
      <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900">
          Security
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage your current session
        </p>

        <div className="mt-6 flex flex-col gap-4 rounded-xl border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-gray-900">
              Current session
            </p>

            <p className="mt-1 text-sm text-gray-500">
              You are currently signed in as{" "}
              {user.email}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
          >
            <LogOut size={16} />
            Log out
          </button>
        </div>
      </section>
    </div>
  );
}

export default Settings;