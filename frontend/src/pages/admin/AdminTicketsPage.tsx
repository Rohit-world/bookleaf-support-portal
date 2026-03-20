import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import type { Ticket, TicketsResponse } from "../../types/ticket";
import { createSseConnection } from "../../utils/sse";

const getStatusBadgeClass = (status?: string) => {
  switch (status) {
    case "Open":
      return "bg-amber-100 text-amber-800";
    case "In Progress":
      return "bg-blue-100 text-blue-800";
    case "Resolved":
      return "bg-emerald-100 text-emerald-800";
    case "Closed":
      return "bg-slate-200 text-slate-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

const getPriorityBadgeClass = (priority?: string) => {
  switch (priority) {
    case "Critical":
      return "bg-red-100 text-red-800";
    case "High":
      return "bg-orange-100 text-orange-800";
    case "Medium":
      return "bg-yellow-100 text-yellow-800";
    case "Low":
      return "bg-emerald-100 text-emerald-800";
    default:
      return "bg-slate-100 text-slate-700";
  }
};

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  const fetchTickets = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError("");

      const { data } = await api.get<TicketsResponse>("/admin/tickets", {
        signal,
      });

      setTickets(data.data || []);
    } catch (err: any) {
      if (err?.name === "CanceledError") return;
      setError(err?.response?.data?.message || "Failed to load admin tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    fetchTickets(controller.signal);

    return () => {
      controller.abort();
    };
  }, [fetchTickets]);

  useEffect(() => {
    const sse = createSseConnection();

    if (!sse) return;

    const handleAdminTicketUpdated = () => {
      fetchTickets();
    };

    sse.addEventListener("admin_ticket_updated", handleAdminTicketUpdated);

    sse.onerror = () => {
      console.error("SSE connection error");
    };

    return () => {
      sse.removeEventListener("admin_ticket_updated", handleAdminTicketUpdated);
      sse.close();
    };
  }, [fetchTickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const ticketPriority = ticket.priority || ticket.aiPriority || "";
      const ticketStatus = ticket.status || "";
      const query = search.trim().toLowerCase();

      const matchesStatus =
        statusFilter === "ALL" || ticketStatus === statusFilter;

      const matchesPriority =
        priorityFilter === "ALL" || ticketPriority === priorityFilter;

      const matchesSearch =
        !query ||
        ticket.subject?.toLowerCase().includes(query) ||
        ticket.description?.toLowerCase().includes(query) ||
        ticket.ticketNumber?.toLowerCase().includes(query);

      return matchesStatus && matchesPriority && matchesSearch;
    });
  }, [tickets, statusFilter, priorityFilter, search]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Admin Tickets</h2>
        <p className="mt-3 text-sm text-slate-500">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Admin Tickets</h2>
        <p className="mt-3 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Admin Tickets</h2>
        <p className="mt-2 text-sm text-slate-500">
          Review, filter, and open support tickets from authors.
        </p>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <input
            type="text"
            placeholder="Search by subject, description, or ticket no"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
            <option value="Critical">Critical</option>
          </select>
        </div>
      </div>

      {filteredTickets.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">No tickets found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="min-w-full text-left">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4">Ticket No</th>
                <th className="px-5 py-4">Subject</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4">Priority</th>
                <th className="px-5 py-4">Category</th>
                <th className="px-5 py-4">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredTickets.map((ticket) => {
                const priority = ticket.priority || ticket.aiPriority || "—";

                return (
                  <tr key={ticket._id} className="border-b border-slate-100">
                    <td className="px-5 py-4 text-sm text-slate-700">
                      {ticket.ticketNumber}
                    </td>

                    <td className="px-5 py-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {ticket.subject}
                        </p>
                        <p className="mt-1 max-w-md truncate text-xs text-slate-500">
                          {ticket.description}
                        </p>
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusBadgeClass(
                          ticket.status
                        )}`}
                      >
                        {ticket.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPriorityBadgeClass(
                          priority
                        )}`}
                      >
                        {priority}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {ticket.category || ticket.aiCategory || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <Link
                        to={`/admin/tickets/${ticket._id}`}
                        className="inline-block rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
