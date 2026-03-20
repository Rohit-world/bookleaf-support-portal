import { storage } from "./storage";

export function createSseConnection() {
  const token = storage.getToken();

  if (!token) return null;

  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "https://bookleaf-support-portal-r4pt.onrender.com/api";

  return new EventSource(
    `${baseUrl}/events/stream?token=${encodeURIComponent(token)}`
  );
}
