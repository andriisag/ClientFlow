import {
  BarChart3,
  BriefcaseBusiness,
  DollarSign,
  TrendingUp,
  Users,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import api from "../services/api";

interface DashboardStats {
  total_clients: number;
  total_deals: number;
  total_value: number;
  deals_by_status: {
    lead: number;
    in_progress: number;
    won: number;
    lost: number;
  };
  recent_deals: {
    id: number;
    title: string;
    value: number | null;
    status: string;
    client_name: string;
  }[];
}

const statusLabels: Record<string, string> = {
  lead: "Lead",
  in_progress: "In Progress",
  won: "Won",
  lost: "Lost",
};

const statusStyles: Record<string, string> = {
  lead: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  won: "bg-emerald-50 text-emerald-700",
  lost: "bg-red-50 text-red-700",
};

const statusBarStyles: Record<string, string> = {
  lead: "bg-blue-500",
  in_progress: "bg-amber-500",
  won: "bg-emerald-500",
  lost: "bg-red-500",
};

function Dashboard() {
  const {
    data,
    isLoading,
    isError,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const response = await api.get<DashboardStats>(
        "/dashboard/stats",
      );

      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <BarChart3 size={18} />
          Loading dashboard...
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-600">
        Failed to load dashboard. Please try again.
      </div>
    );
  }

  const statuses = [
    {
      key: "lead",
      label: "Lead",
      count: data.deals_by_status.lead,
    },
    {
      key: "in_progress",
      label: "In Progress",
      count: data.deals_by_status.in_progress,
    },
    {
      key: "won",
      label: "Won",
      count: data.deals_by_status.won,
    },
    {
      key: "lost",
      label: "Lost",
      count: data.deals_by_status.lost,
    },
  ];

  const totalStatusCount = statuses.reduce(
    (sum, item) => sum + item.count,
    0,
  );

  const wonRate =
    data.total_deals > 0
      ? Math.round(
          (data.deals_by_status.won / data.total_deals) *
            100,
        )
      : 0;

  return (
    <div>
      <div>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
            <BarChart3 size={22} />
          </div>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Dashboard
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Overview of your CRM activity
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Clients
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                {data.total_clients}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                Client records
              </p>
            </div>

            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
              <Users size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Deals
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                {data.total_deals}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                Across your pipeline
              </p>
            </div>

            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
              <BriefcaseBusiness size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Pipeline Value
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                ${data.total_value.toLocaleString()}
              </p>

              <p className="mt-2 text-xs text-gray-400">
                Total deal value
              </p>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <DollarSign size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Win Rate
              </p>

              <p className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
                {wonRate}%
              </p>

              <p className="mt-2 text-xs text-gray-400">
                {data.deals_by_status.won} won of{" "}
                {data.total_deals} deals
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <TrendingUp size={20} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm xl:col-span-2">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Pipeline
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Deals grouped by current status
            </p>
          </div>

          {totalStatusCount === 0 ? (
            <div className="mt-8 flex min-h-[240px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-center">
              <BriefcaseBusiness
                size={30}
                className="text-gray-300"
              />

              <p className="mt-3 text-sm font-medium text-gray-500">
                No deals yet
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Create a deal to see your pipeline.
              </p>
            </div>
          ) : (
            <div className="mt-8">
              <div className="flex h-5 overflow-hidden rounded-full bg-gray-100">
                {statuses.map((item) => {
                  const percentage =
                    totalStatusCount > 0
                      ? (item.count / totalStatusCount) * 100
                      : 0;

                  if (percentage === 0) {
                    return null;
                  }

                  return (
                    <div
                      key={item.key}
                      className={`h-full ${statusBarStyles[item.key]}`}
                      style={{
                        width: `${percentage}%`,
                      }}
                      title={`${item.label}: ${item.count}`}
                    />
                  );
                })}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                {statuses.map((item) => (
                  <div
                    key={item.key}
                    className="rounded-xl border border-gray-100 p-4"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-2.5 w-2.5 rounded-full ${statusBarStyles[item.key]}`}
                      />

                      <span className="text-xs font-medium text-gray-500">
                        {item.label}
                      </span>
                    </div>

                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {item.count}
                    </p>

                    <p className="mt-1 text-xs text-gray-400">
                      {totalStatusCount > 0
                        ? Math.round(
                            (item.count / totalStatusCount) *
                              100,
                          )
                        : 0}
                      % of deals
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">
            Pipeline Summary
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Current distribution
          </p>

          <div className="mt-6 space-y-3">
            {statuses.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
              >
                <div className="flex items-center gap-2.5">
                  <span
                    className={`h-2.5 w-2.5 rounded-full ${statusBarStyles[item.key]}`}
                  />

                  <span className="text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[item.key]}`}
                >
                  {item.count}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl bg-gray-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Total pipeline
            </p>

            <p className="mt-2 text-2xl font-bold text-gray-900">
              ${data.total_value.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Deals
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Your latest sales activity
            </p>
          </div>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
            Latest 5
          </span>
        </div>

        {data.recent_deals.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
            <div className="rounded-full bg-gray-100 p-4 text-gray-400">
              <BriefcaseBusiness size={24} />
            </div>

            <p className="mt-4 text-sm font-semibold text-gray-700">
              No recent deals
            </p>

            <p className="mt-1 text-sm text-gray-400">
              Your latest deals will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.recent_deals.map((deal) => (
              <div
                key={deal.id}
                className="flex flex-col gap-4 px-6 py-5 transition hover:bg-gray-50/70 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-500">
                    <BriefcaseBusiness size={18} />
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-gray-900">
                      {deal.title}
                    </h3>

                    <p className="mt-1 truncate text-sm text-gray-500">
                      {deal.client_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-13 md:pl-0">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      statusStyles[deal.status] ??
                      "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {statusLabels[deal.status] ??
                      deal.status}
                  </span>

                  <span className="min-w-[100px] text-right text-sm font-bold text-gray-900">
                    {deal.value !== null
                      ? `$${deal.value.toLocaleString()}`
                      : "—"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;