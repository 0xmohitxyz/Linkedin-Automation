# AI LinkedIn Automation Scheduler

A full-stack application to automatically generate, schedule, and post content on LinkedIn. It uses an AI-powered Node.js backend with Puppeteer for browser automation and cron-based scheduling, along with a React frontend to manage posts.

## Features

- **Frontend**: React + Vite + TailwindCSS for managing and scheduling posts.
- **Backend**: Node.js + Express with MongoDB to store scheduled posts.
- **AI Content Generation**: Uses `@google/genai` to help write posts.
- **Browser Automation**: Puppeteer handles automated interaction with LinkedIn's security login flow and posts the content.
- **Task Orchestration**: Includes an `n8n-workflow.json` for external workflow automation.

## Project Structure

- `/` - Root directory containing the React (Vite) frontend.
- `/backend` - Contains the Node.js Express server, MongoDB models, Puppeteer service, and Cron jobs.
- `n8n-workflow.json` - n8n workflow configuration file.

## Prerequisites

- Node.js (v18 or higher recommended)
- MongoDB (Local instance or MongoDB Atlas)

## Setup Instructions

### 1. Environment Variables

Create a `.env` file in the `src/` directory (i.e., `src/.env`) and add the following variables. *Note: The backend looks for this file at `../src/.env`.*

```env
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=your_mongodb_connection_string
LINKEDIN_EMAIL=your_linkedin_email
LINKEDIN_PASSWORD=your_linkedin_password
LINKEDIN_ACCESS_TOKEN="your_token_here"
LINKEDIN_PERSON_URN="urn:li:person:YOUR_ID"
```

### 2. Backend Setup

Open a terminal and navigate to the backend directory:

```bash
cd backend
npm install
node server.js
```

The backend server will start running, connect to MongoDB, and initialize the scheduler.

### 3. Frontend Setup

Open a new terminal in the project root directory:

```bash
npm install
npm run dev
```

This will start the Vite development server. Open the URL provided in your terminal (usually `http://localhost:5173`) to view the application.

### 4. n8n Workflow (Optional)

If you are using n8n for orchestration, you can import the `n8n-workflow.json` file into your n8n instance to set up the automation flows.
