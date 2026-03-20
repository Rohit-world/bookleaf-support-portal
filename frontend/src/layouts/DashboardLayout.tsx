
import { Link, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">
              BookLeaf Support
            </h1>
            <p className="text-sm text-slate-500">
              {user?.name} · {user?.role}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {user?.role === "author" ? (
              <>
                <Link to="/author/books" className="text-sm text-slate-700">
                  Books
                </Link>
                <Link to="/author/tickets" className="text-sm text-slate-700">
                  My Tickets
                </Link>
                <Link
                  to="/author/tickets/new"
                  className="text-sm text-slate-700"
                >
                  Create Ticket
                </Link>
              </>
            ) : (
              <Link to="/admin/tickets" className="text-sm text-slate-700">
                Admin Tickets
              </Link>
            )}

            <button
              onClick={logout}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl p-6">
        <Outlet />
      </main>
    </div>
  );
}
