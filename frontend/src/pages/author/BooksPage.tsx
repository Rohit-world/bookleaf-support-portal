import { useEffect, useState } from "react";
import api from "../../api/axios";
import type { Book, BooksResponse } from "../../types/book";

export default function BooksPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await api.get<BooksResponse>("/author/books", {
          signal: controller.signal,
        });

        setBooks(data.data || []);
      } catch (err: any) {
        if (err?.name === "CanceledError") return;

        setError(
          err?.response?.data?.message || "Failed to load your books"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">My Books</h2>
        <p className="mt-3 text-sm text-slate-500">Loading books...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">My Books</h2>
        <p className="mt-3 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-900">My Books</h2>
        <p className="mt-2 text-sm text-slate-500">
          View all books linked to your author account.
        </p>
      </div>

      {books.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">No books found.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {books.map((book) => (
            <div
              key={book._id}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-slate-900">
                {book.title}
              </h3>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p>
                  <span className="font-medium text-slate-800">Book ID:</span>{" "}
                  {book.bookId || "—"}
                </p>
                <p>
                  <span className="font-medium text-slate-800">ISBN:</span>{" "}
                  {book.isbn || "—"}
                </p>
                <p>
                  <span className="font-medium text-slate-800">Genre:</span>{" "}
                  {book.genre || "—"}
                </p>
                <p>
                  <span className="font-medium text-slate-800">Status:</span>{" "}
                  {book.status || "—"}
                </p>
                <p>
                  <span className="font-medium text-slate-800">Language:</span>{" "}
                  {book.language || "—"}
                </p>
                <p>
                  <span className="font-medium text-slate-800">MRP:</span>{" "}
                  {book.mrp ? `₹${book.mrp}` : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
