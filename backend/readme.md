# BookLeaf Support API

Backend service for the BookLeaf support platform, built to handle author support workflows, admin operations, AI-assisted ticket handling, file attachments, and realtime updates.

---

## Features

- JWT authentication
- Role-based access for authors and admins
- Author book access and support ticket creation
- Admin ticket queue, assignment, notes, and responses
- AI-powered ticket classification and priority scoring
- AI-generated response drafts
- Cloudinary attachment uploads
- Server-Sent Events for live ticket updates
- Zod-based request validation
- Swagger API documentation

---

## API Endpoints

### Auth
- `POST /api/auth/login`
- `GET /api/auth/me`

### Author
- `GET /api/author/books`
- `GET /api/author/tickets`
- `GET /api/author/tickets/:ticketId`
- `POST /api/author/tickets`

### Admin
- `GET /api/admin/tickets`
- `GET /api/admin/tickets/:ticketId`
- `PATCH /api/admin/tickets/:ticketId`
- `POST /api/admin/tickets/:ticketId/assign`
- `POST /api/admin/tickets/:ticketId/notes`
- `POST /api/admin/tickets/:ticketId/respond`
- `POST /api/admin/tickets/:ticketId/ai-draft`

### Realtime
- `GET /api/events/stream`

---

## AI Layer

The API includes an AI service layer for:
- category prediction
- priority scoring
- draft response generation
- safe fallback handling when AI is unavailable

---

## Attachments

Attachments are uploaded through multipart requests and stored in Cloudinary with file metadata preserved in the ticket record.

---

## API Docs

Swagger UI:
```txt
http://localhost:5000/api-docs


npm install
npm run dev


admin@bookleaf.com / Admin@123
ops@bookleaf.com / Admin@123


priya.sharma@email.com / Author@123

