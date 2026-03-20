import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "react-toastify";
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

export default function AdminTicketDetailsPage() {
    const { id } = useParams();

    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [status, setStatus] = useState("Open");
    const [responseMessage, setResponseMessage] = useState("");
    const [internalNote, setInternalNote] = useState("");

    const [statusLoading, setStatusLoading] = useState(false);
    const [responseLoading, setResponseLoading] = useState(false);
    const [noteLoading, setNoteLoading] = useState(false);
    const [aiDraftLoading, setAiDraftLoading] = useState(false);

    const fetchTicket = useCallback(async (ticketId: string, signal?: AbortSignal) => {
        const { data } = await api.get<TicketDetailResponse>(
            `/admin/tickets/${ticketId}`,
            { signal }
        );

        const ticketData = data.data || null;
        setTicket(ticketData);
        setStatus(ticketData?.status || "Open");
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

        const handleAdminTicketUpdated = (event: MessageEvent) => {
            try {
                const payload = JSON.parse(event.data);

                if (payload.ticketId === id) {
                    fetchTicket(id).catch(() => { });
                }
            } catch {
                //
            }
        };

        sse.addEventListener("admin_ticket_updated", handleAdminTicketUpdated);

        sse.onerror = () => {
            console.error("SSE connection error");
        };

        return () => {
            sse.removeEventListener("admin_ticket_updated", handleAdminTicketUpdated);
            sse.close();
        };
    }, [id, fetchTicket]);

    const handleStatusUpdate = async (e: FormEvent) => {
        e.preventDefault();
        if (!id) return;

        try {
            setStatusLoading(true);

            const { data } = await api.patch(`/admin/tickets/${id}`, { status });

            toast.success(data?.message || "Status updated successfully");
            await fetchTicket(id);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to update status");
        } finally {
            setStatusLoading(false);
        }
    };

    const handleAddResponse = async (e: FormEvent) => {
        e.preventDefault();

        if (!id) return;

        if (!responseMessage.trim()) {
            toast.error("Response message is required");
            return;
        }

        try {
            setResponseLoading(true);

            const { data } = await api.post(`/admin/tickets/${id}/respond`, {
                message: responseMessage.trim(),
            });

            toast.success(data?.message || "Response added successfully");
            setResponseMessage("");
            await fetchTicket(id);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to add response");
        } finally {
            setResponseLoading(false);
        }
    };

    const handleAddNote = async (e: FormEvent) => {
        e.preventDefault();

        if (!id) return;

        if (!internalNote.trim()) {
            toast.error("Internal note is required");
            return;
        }

        try {
            setNoteLoading(true);

            const { data } = await api.post(`/admin/tickets/${id}/notes`, {
                note: internalNote.trim(),
            });

            toast.success(data?.message || "Internal note added successfully");
            setInternalNote("");
            await fetchTicket(id);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to add internal note");
        } finally {
            setNoteLoading(false);
        }
    };

    const handleGenerateAiDraft = async () => {
        if (!id) return;

        try {
            setAiDraftLoading(true);

            const { data } = await api.post(`/admin/tickets/${id}/ai-draft`);

            toast.success(data?.message || "AI draft generated successfully");

            if (data?.data) {
                setTicket(data.data);
                setStatus(data.data.status || "Open");
            } else {
                await fetchTicket(id);
            }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to generate AI draft");
        } finally {
            setAiDraftLoading(false);
        }
    };

    const handleCopyAiDraft = async () => {
        const text = ticket?.aiDraftResponse?.trim();

        if (!text) {
            toast.error("No AI draft available to copy");
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            toast.success("AI draft copied");
        } catch {
            toast.error("Failed to copy AI draft");
        }
    };

    const handleUseAiDraftInResponse = () => {
        const text = ticket?.aiDraftResponse?.trim();

        if (!text) {
            toast.error("No AI draft available");
            return;
        }

        setResponseMessage(text);
        toast.success("AI draft inserted into response box");
    };

    if (loading) {
        return (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">
                    Admin Ticket Details
                </h2>
                <p className="mt-3 text-sm text-slate-500">Loading ticket details...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">
                    Admin Ticket Details
                </h2>
                <p className="mt-3 text-sm text-red-600">{error}</p>
                <Link
                    to="/admin/tickets"
                    className="mt-4 inline-block text-sm font-medium text-slate-900"
                >
                    Back to Admin Tickets
                </Link>
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-slate-900">
                    Admin Ticket Details
                </h2>
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

            <div className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900">AI Draft</h3>
                        <p className="mt-2 text-sm text-slate-500">
                            Generate a suggested support reply based on ticket details.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleGenerateAiDraft}
                        disabled={aiDraftLoading}
                        className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:opacity-60"
                    >
                        {aiDraftLoading ? "Generating..." : "Generate AI Draft"}
                    </button>
                </div>

                {ticket.aiDraftResponse ? (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <p className="whitespace-pre-line text-sm leading-6 text-slate-700">
                            {ticket.aiDraftResponse}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-3">
                            <button
                                type="button"
                                onClick={handleCopyAiDraft}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-800"
                            >
                                Copy Draft
                            </button>

                            <button
                                type="button"
                                onClick={handleUseAiDraftInResponse}
                                className="rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-800"
                            >
                                Use in Response
                            </button>
                        </div>
                    </div>
                ) : (
                    <p className="mt-4 text-sm text-slate-500">
                        No AI draft generated yet.
                    </p>
                )}
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
                    <h3 className="text-lg font-semibold text-slate-900">Status Update</h3>

                    <form onSubmit={handleStatusUpdate} className="mt-4 space-y-4">
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                        >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                        </select>

                        <button
                            type="submit"
                            disabled={statusLoading}
                            className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:opacity-60"
                        >
                            {statusLoading ? "Updating..." : "Update Status"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Add Response</h3>

                    <form onSubmit={handleAddResponse} className="mt-4 space-y-4">
                        <textarea
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            rows={6}
                            placeholder="Write a response for the author"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                        />

                        <button
                            type="submit"
                            disabled={responseLoading}
                            className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:opacity-60"
                        >
                            {responseLoading ? "Adding..." : "Add Response"}
                        </button>
                    </form>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900">Add Internal Note</h3>

                    <form onSubmit={handleAddNote} className="mt-4 space-y-4">
                        <textarea
                            value={internalNote}
                            onChange={(e) => setInternalNote(e.target.value)}
                            rows={6}
                            placeholder="Write an internal admin note"
                            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
                        />

                        <button
                            type="submit"
                            disabled={noteLoading}
                            className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:opacity-60"
                        >
                            {noteLoading ? "Adding..." : "Add Note"}
                        </button>
                    </form>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
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
                                        By: {item.respondedBy || "Support"} •{" "}
                                        {formatDate(item.createdAt || item.sentAt)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-slate-500">No responses yet.</p>
                    )}
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
                                        By: {note.createdBy || "Admin"} •{" "}
                                        {formatDate(note.createdAt)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="mt-3 text-sm text-slate-500">No internal notes.</p>
                    )}
                </div>
            </div>

            <div>
                <Link
                    to="/admin/tickets"
                    className="inline-block rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-800"
                >
                    Back to Admin Tickets
                </Link>
            </div>
        </div>
    );
}
