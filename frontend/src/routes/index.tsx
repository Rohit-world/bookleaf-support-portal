import type { ReactNode } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";
import LoginPage from "../pages/LoginPage";
import BooksPage from "../pages/author/BooksPage";
import CreateTicketPage from "../pages/author/CreateTicketPage";
import MyTicketsPage from "../pages/author/MyTicketsPage";
import TicketDetailsPage from "../pages/author/TicketDetailsPage";
import AdminTicketsPage from "../pages/admin/AdminTicketsPage";
import AdminTicketDetailsPage from "../pages/admin/AdminTicketDetailsPage";
import { useAuth } from "../contexts/AuthContext";

function ProtectedRoute({
    children,
    role,
}: {
    children: ReactNode;
    role?: "author" | "admin";
}) {
    const { user, isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (role && user?.role !== role) {
        return (
            <Navigate
                to={user?.role === "admin" ? "/admin/tickets" : "/author/books"}
                replace
            />
        );
    }

    return <>{children}</>;
}

const router = createBrowserRouter([
    {
        path: "/login",
        element: (
            <AuthLayout>
                <LoginPage />
            </AuthLayout>
        ),
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <DashboardLayout />
            </ProtectedRoute>
        ),
        children: [
            {
                index: true,
                element: <Navigate to="/login" replace />,
            },
            {
                path: "author/books",
                element: (
                    <ProtectedRoute role="author">
                        <BooksPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "author/tickets",
                element: (
                    <ProtectedRoute role="author">
                        <MyTicketsPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "author/tickets/new",
                element: (
                    <ProtectedRoute role="author">
                        <CreateTicketPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "author/tickets/:id",
                element: (
                    <ProtectedRoute role="author">
                        <TicketDetailsPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "admin/tickets",
                element: (
                    <ProtectedRoute role="admin">
                        <AdminTicketsPage />
                    </ProtectedRoute>
                ),
            },
            {
                path: "admin/tickets/:id",
                element: (
                    <ProtectedRoute role="admin">
                        <AdminTicketDetailsPage />
                    </ProtectedRoute>
                ),
            },
        ],
    },
]);

export default router;
