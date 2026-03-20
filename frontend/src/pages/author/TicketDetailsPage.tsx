import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios";
import type { Ticket, TicketDetailResponse } from "../../types/ticket";
import { createSseConnection } from "../../utils/sse";

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
};

export default function TicketDetailsPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchTicket = useCallback(async (ticketId: string, signal?: AbortSignal) => {
    const { data } = await api.get<TicketDetailResponse>(
      `/author/tickets/${ticketId}`,
      { signal }
    );

    setTicket(data.data || null);
  }, []);

  useEffect(() => {
    if (!id) {
      setError("Ticket id is missing");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        await fetchTicket(id, controller.signal);
      } catch (err: any) {
        if (err?.name === "CanceledError") return;

        setError(err?.response?.data?.message || "Failed to load ticket details");
      } finally {
        setLoading(false);
      }
    };

    loadData();

    return () => {
      controller.abort();
    };
  }, [id, fetchTicket]);

  useEffect(() => {
    if (!id) return;

    const sse = createSseConnection();
    if (!sse) return;

    const handleTicketUpdated = (event: MessageEvent) => {
      try {
        const payload = JSON.parse(event.data);

        if (payload.ticketId === id) {
          fetchTicket(id).catch(() => {});
        }
      } catch {
        //
      }
    };

    sse.addEventListener("ticket_updated", handleTicketUpdated);

    sse.onerror = () => {
      console.error("SSE connection error");
    };

    return () => {
      sse.removeEventListener("ticket_updated", handleTicketUpdated);
      sse.close();
    };
  }, [id, fetchTicket]);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Ticket Details</h2>
        <p className="mt-3 text-sm text-slate-500">Loading ticket details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Ticket Details</h2>
        <p className="mt-3 text-sm text-red-600">{error}</p>
        <Link
          to="/author/tickets"
          className="mt-4 inline-block text-sm font-medium text-slate-900"
        >
          Back to My Tickets
        </Link>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">Ticket Details</h2>
        <p className="mt-3 text-sm text-slate-500">Ticket not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Ticket No: {ticket.ticketNumber}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900">
              {ticket.subject}
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Created: {formatDate(ticket.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              {ticket.status}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Priority: {ticket.priority || ticket.aiPriority || "—"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              Category: {ticket.category || ticket.aiCategory || "—"}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Description</h3>
        <p className="mt-3 whitespace-pre-line text-sm leading-6 text-slate-600">
          {ticket.description}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Attachments</h3>

          {ticket.attachments?.length ? (
            <div className="mt-4 space-y-3">
              {ticket.attachments.map((file, index) => (
                <a
                  key={`${file.fileUrl}-${index}`}
                  href={file.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-slate-200 p-3 text-sm text-slate-700 hover:border-slate-300"
                >
                  <p className="font-medium text-slate-900">
                    {file.fileName || `Attachment ${index + 1}`}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {file.mimeType || "File"}
                  </p>
                </a>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No attachments.</p>
          )}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900">Responses</h3>

          {ticket.responses?.length ? (
            <div className="mt-4 space-y-4">
              {ticket.responses.map((item, index) => (
                <div
                  key={`${item.createdAt || item.sentAt || index}-${index}`}
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <p className="whitespace-pre-line text-sm text-slate-700">
                    {item.message}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    By: {item.respondedBy || item.sentByAdminId || "Support"} •{" "}
                    {formatDate(item.createdAt || item.sentAt)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm text-slate-500">No responses yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Internal Notes</h3>

        {ticket.internalNotes?.length ? (
          <div className="mt-4 space-y-4">
            {ticket.internalNotes.map((note, index) => (
              <div
                key={`${note.createdAt}-${index}`}
                className="rounded-xl border border-slate-200 p-4"
              >
                <p className="whitespace-pre-line text-sm text-slate-700">
                  {note.note}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  By: {note.createdBy || note.adminId || "Admin"} •{" "}
                  {formatDate(note.createdAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">No internal notes.</p>
        )}
      </div>

      <div>
        <Link
          to="/author/tickets"
          className="inline-block rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-800"
        >
          Back to My Tickets
        </Link>
      </div>
    </div>
  );
}
