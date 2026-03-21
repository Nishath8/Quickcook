# QuickCook

A full-stack web application that allows users to find local cooks and chefs based on their location and cuisine preferences. Users can apply to be a cook, and administrators can manage the cook applications.

## Project Structure

- **`client/`** - React frontend built with Vite and Tailwind CSS.
- **`server/`** - Node.js backend using Express and Mongoose.

## Features

- **User Portal:** View, search, and filter available cooks based on location and cuisine.
- **Cook Registration:** Apply to become a cook on the platform.
- **Admin Dashboard:** Manage cook applications (approve, edit, delete, deny).

## Local Development

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (running locally or a MongoDB Atlas URI)

### Backend Setup
1. Navigate to the `server` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the backend:
   ```bash
   npm start
   ```

### Frontend Setup
1. Navigate to the `client` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```

## API Contract

Please see [`api_contract.md`](api_contract.md) for full details on frontend-backend communication endpoints.

## Deployment

- The **frontend** is designed and configured to easily deploy under Vercel. Environment variable `VITE_API_BASE_URL` controls the targeted backend API.
- The **backend** is designed to deploy seamlessly to platforms like Render, using `MONGO_URI` and `FRONTEND_URL` environment variables for correct operation and CORS configuration.
