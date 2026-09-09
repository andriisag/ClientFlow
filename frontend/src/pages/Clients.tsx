import { useEffect, useState } from "react";
import {
  Building2,
  Mail,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import api from "../services/api";
import type { Client } from "../types/client";

function Clients() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] =
    useState<Client | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");

  const queryClient = useQueryClient();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
  } = useQuery<Client[]>({
    queryKey: ["clients", debouncedSearch],
    queryFn: async () => {
      const response = await api.get<Client[]>(
        "/clients",
        {
          params: {
            search:
              debouncedSearch || undefined,
          },
        },
      );

      return response.data;
    },
    placeholderData: (previousData) =>
      previousData,
  });

  const createClientMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<Client>(
        "/clients",
        {
          name,
          email: email || null,
          phone: phone || null,
          company: company || null,
        },
      );

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      });

      closeForm();
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: async () => {
      if (!editingClient) {
        throw new Error("No client selected");
      }

      const response = await api.put<Client>(
        `/clients/${editingClient.id}`,
        {
          name,
          email: email || null,
          phone: phone || null,
          company: company || null,
        },
      );

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      });

      closeForm();
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: number) => {
      await api.delete(`/clients/${clientId}`);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["clients"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });
    },
  });

  function resetForm() {
    setName("");
    setEmail("");
    setPhone("");
    setCompany("");
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingClient(null);
    resetForm();
  }

  function openCreateForm() {
    setEditingClient(null);
    resetForm();
    setIsFormOpen(true);
  }

  function openEditForm(client: Client) {
    setEditingClient(client);

    setName(client.name);
    setEmail(client.email || "");
    setPhone(client.phone || "");
    setCompany(client.company || "");

    setIsFormOpen(true);
  }

  function handleDelete(client: Client) {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${client.name}?`,
    );

    if (!confirmed) {
      return;
    }

    deleteClientMutation.mutate(client.id);
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (editingClient) {
      updateClientMutation.mutate();
    } else {
      createClientMutation.mutate();
    }
  }

  const isSaving =
    createClientMutation.isPending ||
    updateClientMutation.isPending;

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="text-sm text-gray-500">
          Loading clients...
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
        Failed to load clients. Please try again.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <UsersIcon />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Clients
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your client relationships
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={18} />
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-lg">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search by name, email or company..."
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-10 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {isFetching && (
          <span className="text-xs font-medium text-gray-400">
            Searching...
          </span>
        )}
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingClient
                  ? "Edit Client"
                  : "Add Client"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {editingClient
                  ? "Update client information"
                  : "Add a new client to your CRM"}
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={19} />
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {/* Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Name
              </label>

              <div className="relative">
                <UserRound
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  placeholder="John Doe"
                  required
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Email
              </label>

              <div className="relative">
                <Mail
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="john@example.com"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Phone
              </label>

              <div className="relative">
                <Phone
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="+380..."
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Company
              </label>

              <div className="relative">
                <Building2
                  size={17}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={company}
                  onChange={(event) =>
                    setCompany(event.target.value)
                  }
                  placeholder="Company name"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Error */}
            {(createClientMutation.isError ||
              updateClientMutation.isError) && (
              <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 md:col-span-2">
                Failed to save client. Please try again.
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end gap-3 md:col-span-2">
              <button
                type="button"
                onClick={closeForm}
                className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingClient
                    ? "Save Changes"
                    : "Create Client"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Client count */}
      <div className="mt-8 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {data?.length ?? 0}{" "}
            {data?.length === 1
              ? "client"
              : "clients"}
          </p>

          {search && (
            <p className="mt-1 text-xs text-gray-500">
              Results for "{search}"
            </p>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px]">
            <thead className="border-b border-gray-200 bg-gray-50/80">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Client
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Email
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Phone
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Company
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {data?.map((client) => (
                <tr
                  key={client.id}
                  className="group transition hover:bg-gray-50/70"
                >
                  {/* Client */}
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-600">
                        {getInitials(client.name)}
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-semibold text-gray-900">
                          {client.name}
                        </p>

                        <p className="mt-0.5 text-xs text-gray-400">
                          Client #{client.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="px-6 py-4">
                    {client.email ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail
                          size={15}
                          className="shrink-0 text-gray-400"
                        />

                        <span>
                          {client.email}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* Phone */}
                  <td className="px-6 py-4">
                    {client.phone ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone
                          size={15}
                          className="shrink-0 text-gray-400"
                        />

                        <span>
                          {client.phone}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* Company */}
                  <td className="px-6 py-4">
                    {client.company ? (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2
                          size={15}
                          className="shrink-0 text-gray-400"
                        />

                        <span>
                          {client.company}
                        </span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">
                        —
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex justify-end gap-2 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(client)
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(client)
                        }
                        disabled={
                          deleteClientMutation.isPending
                        }
                        className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {data?.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center"
                  >
                    <div className="mx-auto flex max-w-sm flex-col items-center">
                      <div className="rounded-full bg-gray-100 p-4 text-gray-400">
                        <UsersIcon />
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-gray-900">
                        No clients found
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        {search
                          ? "Try a different search term."
                          : "Add your first client to get started."}
                      </p>

                      {!search && (
                        <button
                          type="button"
                          onClick={openCreateForm}
                          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          <Plus size={16} />
                          Add Client
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function getInitials(name: string) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "?";
  }

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    words[0][0] + words[1][0]
  ).toUpperCase();
}

function UsersIcon() {
  return <UserRound size={22} />;
}

export default Clients;

