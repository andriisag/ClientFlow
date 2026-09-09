import { useState } from "react";
import {
  BriefcaseBusiness,
  DollarSign,
  GripVertical,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import api from "../services/api";
import type {
  Deal,
  DealStatus,
} from "../types/deal";
import type { Client } from "../types/client";

const statuses: DealStatus[] = [
  "lead",
  "in_progress",
  "won",
  "lost",
];

const statusLabels: Record<DealStatus, string> = {
  lead: "Lead",
  in_progress: "In Progress",
  won: "Won",
  lost: "Lost",
};

const statusStyles: Record<
  DealStatus,
  {
    header: string;
    badge: string;
    dot: string;
    dropzone: string;
  }
> = {
  lead: {
    header: "text-blue-700",
    badge: "bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
    dropzone: "border-blue-400 bg-blue-50/60",
  },
  in_progress: {
    header: "text-amber-700",
    badge: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
    dropzone: "border-amber-400 bg-amber-50/60",
  },
  won: {
    header: "text-emerald-700",
    badge: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
    dropzone: "border-emerald-400 bg-emerald-50/60",
  },
  lost: {
    header: "text-red-700",
    badge: "bg-red-50 text-red-700",
    dot: "bg-red-500",
    dropzone: "border-red-400 bg-red-50/60",
  },
};

function Deals() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const [title, setTitle] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<DealStatus>("lead");
  const [clientId, setClientId] = useState("");

  const [draggedDealId, setDraggedDealId] = useState<number | null>(
    null,
  );
  const [dragOverStatus, setDragOverStatus] =
    useState<DealStatus | null>(null);

  const queryClient = useQueryClient();

  const {
    data: deals,
    isLoading: isDealsLoading,
    isError: isDealsError,
  } = useQuery<Deal[]>({
    queryKey: ["deals"],
    queryFn: async () => {
      const response = await api.get<Deal[]>("/deals");
      return response.data;
    },
  });

  const {
    data: clients,
    isLoading: isClientsLoading,
  } = useQuery<Client[]>({
    queryKey: ["clients"],
    queryFn: async () => {
      const response = await api.get<Client[]>("/clients");
      return response.data;
    },
  });

  const createDealMutation = useMutation({
    mutationFn: async () => {
      const response = await api.post<Deal>("/deals", {
        title,
        value: value ? Number(value) : null,
        status,
        client_id: Number(clientId),
      });

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["deals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });

      closeForm();
    },
  });

  const updateDealMutation = useMutation({
    mutationFn: async () => {
      if (!editingDeal) {
        throw new Error("No deal selected");
      }

      const response = await api.put<Deal>(
        `/deals/${editingDeal.id}`,
        {
          title,
          value: value ? Number(value) : null,
          status,
          client_id: Number(clientId),
        },
      );

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["deals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });

      closeForm();
    },
  });

  const deleteDealMutation = useMutation({
    mutationFn: async (dealId: number) => {
      await api.delete(`/deals/${dealId}`);
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["deals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });
    },
  });

  const updateDealStatusMutation = useMutation({
    mutationFn: async ({
      deal,
      newStatus,
    }: {
      deal: Deal;
      newStatus: DealStatus;
    }) => {
      const response = await api.put<Deal>(
        `/deals/${deal.id}`,
        {
          title: deal.title,
          value: deal.value,
          status: newStatus,
          client_id: deal.client_id,
        },
      );

      return response.data;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["deals"],
      });

      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats"],
      });
    },
  });

  function closeForm() {
    setIsFormOpen(false);
    setEditingDeal(null);

    setTitle("");
    setValue("");
    setStatus("lead");
    setClientId("");
  }

  function openCreateForm() {
    setEditingDeal(null);

    setTitle("");
    setValue("");
    setStatus("lead");
    setClientId("");

    setIsFormOpen(true);
  }

  function openEditForm(deal: Deal) {
    setEditingDeal(deal);

    setTitle(deal.title);
    setValue(deal.value?.toString() || "");
    setStatus(deal.status);
    setClientId(deal.client_id.toString());

    setIsFormOpen(true);
  }

  function handleDelete(deal: Deal) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${deal.title}"?`,
    );

    if (!confirmed) {
      return;
    }

    deleteDealMutation.mutate(deal.id);
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (editingDeal) {
      updateDealMutation.mutate();
    } else {
      createDealMutation.mutate();
    }
  }

  function handleDragStart(
    event: React.DragEvent<HTMLDivElement>,
    deal: Deal,
  ) {
    setDraggedDealId(deal.id);

    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "text/plain",
      deal.id.toString(),
    );
  }

  function handleDragEnd() {
    setDraggedDealId(null);
    setDragOverStatus(null);
  }

  function handleDragOver(
    event: React.DragEvent<HTMLDivElement>,
    targetStatus: DealStatus,
  ) {
    event.preventDefault();

    event.dataTransfer.dropEffect = "move";

    setDragOverStatus(targetStatus);
  }

  function handleDragLeave(
    event: React.DragEvent<HTMLDivElement>,
  ) {
    if (
      !event.currentTarget.contains(
        event.relatedTarget as Node,
      )
    ) {
      setDragOverStatus(null);
    }
  }

  function handleDrop(
    event: React.DragEvent<HTMLDivElement>,
    targetStatus: DealStatus,
  ) {
    event.preventDefault();

    const dealId = Number(
      event.dataTransfer.getData("text/plain"),
    );

    const deal = deals?.find(
      (item) => item.id === dealId,
    );

    if (!deal) {
      handleDragEnd();
      return;
    }

    if (deal.status !== targetStatus) {
      updateDealStatusMutation.mutate({
        deal,
        newStatus: targetStatus,
      });
    }

    handleDragEnd();
  }

  const isSaving =
    createDealMutation.isPending ||
    updateDealMutation.isPending;

  const isLoading =
    isDealsLoading || isClientsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <BriefcaseBusiness size={18} />
        Loading deals...
      </div>
    );
  }

  if (isDealsError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
        Failed to load deals.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-600">
              <BriefcaseBusiness size={22} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Deals
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Manage your sales pipeline
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          + Add Deal
        </button>
      </div>

      {/* Form */}
      {isFormOpen && (
        <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingDeal ? "Edit Deal" : "Add Deal"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {editingDeal
                  ? "Update deal information"
                  : "Create a new deal"}
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {/* Title */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Deal Title
              </label>

              <input
                type="text"
                value={title}
                onChange={(event) =>
                  setTitle(event.target.value)
                }
                placeholder="Website redesign"
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* Client */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Client
              </label>

              <select
                value={clientId}
                onChange={(event) =>
                  setClientId(event.target.value)
                }
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">
                  Select client
                </option>

                {clients?.map((client) => (
                  <option
                    key={client.id}
                    value={client.id}
                  >
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Value */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Value
              </label>

              <div className="relative">
                <DollarSign
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="number"
                  min="0"
                  step="1"
                  value={value}
                  onChange={(event) =>
                    setValue(event.target.value)
                  }
                  placeholder="5000"
                  className="w-full rounded-lg border border-gray-300 py-3 pl-10 pr-4 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Status
              </label>

              <select
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target.value as DealStatus,
                  )
                }
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              >
                {statuses.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {statusLabels[item]}
                  </option>
                ))}
              </select>
            </div>

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
                className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSaving
                  ? "Saving..."
                  : editingDeal
                    ? "Save Changes"
                    : "Create Deal"}
              </button>
            </div>

            {(createDealMutation.isError ||
              updateDealMutation.isError) && (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 md:col-span-2">
                Failed to save deal. Please try again.
              </p>
            )}
          </form>
        </div>
      )}

      {/* Kanban */}
      <div className="mt-8 overflow-x-auto pb-4">
        <div className="grid min-w-[1120px] grid-cols-4 gap-5">
          {statuses.map((columnStatus) => {
            const columnDeals =
              deals?.filter(
                (deal) => deal.status === columnStatus,
              ) ?? [];

            const totalValue = columnDeals.reduce(
              (sum, deal) =>
                sum + (deal.value ?? 0),
              0,
            );

            const isDropTarget =
              dragOverStatus === columnStatus;

            return (
              <div
                key={columnStatus}
                onDragOver={(event) =>
                  handleDragOver(
                    event,
                    columnStatus,
                  )
                }
                onDragLeave={handleDragLeave}
                onDrop={(event) =>
                  handleDrop(
                    event,
                    columnStatus,
                  )
                }
                className={`min-h-[560px] rounded-2xl border p-4 transition-all duration-200 ${
                  isDropTarget
                    ? `border-dashed ${statusStyles[columnStatus].dropzone}`
                    : "border-gray-200 bg-gray-50/80"
                }`}
              >
                {/* Column header */}
                <div className="mb-5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${statusStyles[columnStatus].dot}`}
                    />

                    <h2
                      className={`text-sm font-semibold ${statusStyles[columnStatus].header}`}
                    >
                      {statusLabels[columnStatus]}
                    </h2>

                    <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-gray-500 shadow-sm">
                      {columnDeals.length}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-gray-500">
                    ${totalValue.toLocaleString()}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-3">
                  {columnDeals.map((deal) => {
                    const isDragging =
                      draggedDealId === deal.id;

                    return (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={(event) =>
                          handleDragStart(
                            event,
                            deal,
                          )
                        }
                        onDragEnd={handleDragEnd}
                        className={`group rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-200 ${
                          isDragging
                            ? "scale-[0.98] cursor-grabbing opacity-40"
                            : "cursor-grab hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-md"
                        }`}
                      >
                        {/* Card header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex min-w-0 gap-2">
                            <GripVertical
                              size={16}
                              className="mt-0.5 shrink-0 text-gray-300 transition group-hover:text-gray-400"
                            />

                            <h3 className="line-clamp-2 font-semibold leading-5 text-gray-900">
                              {deal.title}
                            </h3>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-semibold ${statusStyles[deal.status].badge}`}
                          >
                            {statusLabels[deal.status]}
                          </span>
                        </div>

                        {/* Client */}
                        <p className="mt-4 text-sm text-gray-500">
                          {deal.client_name}
                        </p>

                        {/* Value */}
                        <div className="mt-3 flex items-center gap-1.5">
                          <DollarSign
                            size={16}
                            className="text-gray-400"
                          />

                          <span className="text-base font-bold text-gray-900">
                            {deal.value !== null
                              ? deal.value.toLocaleString()
                              : "No value"}
                          </span>

                          {deal.value !== null && (
                            <span className="text-xs text-gray-400">
                              USD
                            </span>
                          )}
                        </div>

                        {/* Status select */}
                        <div className="mt-4">
                          <select
                            value={deal.status}
                            onChange={(event) =>
                              updateDealStatusMutation.mutate(
                                {
                                  deal,
                                  newStatus:
                                    event.target
                                      .value as DealStatus,
                                },
                              )
                            }
                            className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600 outline-none transition hover:bg-white focus:border-blue-500"
                          >
                            {statuses.map((item) => (
                              <option
                                key={item}
                                value={item}
                              >
                                {statusLabels[item]}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Actions */}
                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(deal)
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-blue-600"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleDelete(deal)
                            }
                            disabled={
                              deleteDealMutation.isPending
                            }
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-red-600 disabled:opacity-50"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {columnDeals.length === 0 && (
                    <div
                      className={`flex min-h-[170px] items-center justify-center rounded-xl border-2 border-dashed ${
                        isDropTarget
                          ? "border-blue-400 bg-blue-50"
                          : "border-gray-200 bg-white/50"
                      }`}
                    >
                      <p className="text-xs font-medium text-gray-400">
                        Drop deals here
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Deals;

