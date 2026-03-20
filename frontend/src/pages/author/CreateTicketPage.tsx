import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import type { Book, BooksResponse } from "../../types/book";
import type { CreateTicketResponse } from "../../types/ticket";

export default function CreateTicketPage() {
  const navigate = useNavigate();

  const [books, setBooks] = useState<Book[]>([]);
  const [bookId, setBookId] = useState("GENERAL");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [loadingBooks, setLoadingBooks] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoadingBooks(true);

        const { data } = await api.get<BooksResponse>("/author/books");
        setBooks(data.data || []);
      } catch (err: any) {
        setError(err?.response?.data?.message || "Failed to load books");
      } finally {
        setLoadingBooks(false);
      }
    };

    fetchBooks();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(files);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!subject.trim() || !description.trim()) {
      setError("Subject and description are required");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append("bookId", bookId);
      formData.append("subject", subject.trim());
      formData.append("description", description.trim());

      attachments.forEach((file) => {
        formData.append("attachments", file);
      });

      const { data } = await api.post<CreateTicketResponse>(
        "/author/tickets",
        formData
      );

      setSuccessMessage(data.message || "Ticket created successfully");
      setSubject("");
      setDescription("");
      setAttachments([]);
      setBookId("GENERAL");

      setTimeout(() => {
        navigate("/author/tickets");
      }, 1200);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-900">Create Ticket</h2>
      <p className="mt-2 text-sm text-slate-500">
        Raise a support request for a book issue or general inquiry.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Select Book
          </label>
          <select
            value={bookId}
            onChange={(e) => setBookId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
            disabled={loadingBooks}
          >
            <option value="GENERAL">General Inquiry</option>
            {books.map((book) => (
              <option key={book._id} value={book._id}>
                {book.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Subject
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Enter ticket subject"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Describe your issue in detail"
            className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Attachments
          </label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full rounded-xl border border-slate-300 px-4 py-3"
          />
          {attachments.length > 0 ? (
            <div className="mt-3 space-y-1 text-sm text-slate-600">
              {attachments.map((file) => (
                <p key={`${file.name}-${file.size}`}>{file.name}</p>
              ))}
            </div>
          ) : null}
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {successMessage ? (
          <p className="text-sm text-green-600">{successMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={submitting}
          className="rounded-xl bg-slate-900 px-5 py-3 text-white disabled:opacity-60"
        >
          {submitting ? "Creating..." : "Create Ticket"}
        </button>
      </form>
    </div>
  );
}
