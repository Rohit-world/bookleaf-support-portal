import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios";
import type { Ticket, TicketsResponse } from "../../types/ticket";

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchTickets = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get<TicketsResponse>("/author/tickets", {
          signal: controller.signal,
        });

        setTickets(data.data || []);
      } catch (err: any) {
        if (err?.name === "CanceledError") return;

        setError(err?.response?.data?.message || "Failed to load tickets");
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">My Tickets</h2>
        <p className="mt-3 text-sm text-slate-500">Loading tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">My Tickets</h2>
        <p className="mt-3 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">My Tickets</h2>
            <p className="mt-2 text-sm text-slate-500">
              Track your support requests and view their current status.
            </p>
          </div>

          <Link
            to="/author/tickets/new"
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
          >
            Create Ticket
          </Link>
        </div>
      </div>

      {tickets.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">No tickets found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket._id}
              to={`/author/tickets/${ticket._id}`}
              className="block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {ticket.subject}
                  </h3>

                  <p className="text-sm text-slate-600">
                    Ticket No: {ticket.ticketNumber}
                  </p>

                  <p className="text-sm text-slate-600 line-clamp-2">
                    {ticket.description}
                  </p>
                </div>

                <div className="flex flex-col gap-2 text-sm text-slate-600 md:items-end">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                    {ticket.status}
                  </span>

                  <span>
                    Priority: {ticket.priority || ticket.aiPriority || "—"}
                  </span>

                  <span>
                    Category: {ticket.category || ticket.aiCategory || "—"}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
