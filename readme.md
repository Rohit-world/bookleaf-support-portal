
# BookLeaf Support System

A full-stack support ticket platform for BookLeaf Publishing where authors can raise support requests and admins can manage them in real time.

## Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS
- **Backend:** Node.js, Express, TypeScript
- **Database:** MongoDB
- **Auth:** JWT
- **Uploads:** Cloudinary
- **Realtime:** Server-Sent Events (SSE)
- **AI:** OpenAI
- **API Docs:** Swagger

## Features

### Author
- Create support tickets
- Upload attachments
- View ticket status and responses
- Get realtime updates

### Admin
- View and manage all tickets
- Update status
- Add responses and internal notes
- Generate AI draft replies
- Get realtime updates

## Backend Features

- JWT-based authentication for author and admin access
- Ticket management APIs for create, read, update, and response handling
- File upload support using Cloudinary
- OpenAI integration for ticket classification, priority scoring, and draft generation
- SSE-based realtime updates for admin and author dashboards
- Swagger API documentation for testing and endpoint reference

## Swagger API Docs

Swagger is available for interactive API documentation and testing.

- **Docs URL:** `http://localhost:5000/api/docs`

Use it to:
- view all backend endpoints
- test protected and public APIs
- inspect request and response formats

## Project Structure

```bash
bookleaf-support/
├── frontend/
├── backend/
└── README.md
```

## Environment Variables

### Backend
```env
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
OPENAI_API_KEY=your_openai_api_key
CLIENT_URL=http://localhost:5173
```

### Frontend
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## Installation

```bash
git clone <your-repo-url>
cd bookleaf-support
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

## Run Locally

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Swagger Docs: `http://localhost:5000/api/docs`

## Author

Built by **Rohit Kumar**
```