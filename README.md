# MathsStreak — Frontend

The frontend for QuizStreak, a daily math quiz app. One AI-generated question a day, answer it, build your streak.

## Live Demo

https://quiz-streak-client.vercel.app

## Tech Stack

- **Framework:** React + TypeScript
- **Styling:** Tailwind CSS v4
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Build Tool:** Vite
- **Deployment:** Vercel

## Features

- User registration and login with JWT auth
- Protected routes (unauthenticated users redirected to login)
- Daily AI-generated math question fetched from the backend
- Answer submission with correct/incorrect feedback
- Streak counter that persists across days
- Confetti burst on correct answers
- Haptic feedback + card shake animation on wrong answers
- localStorage token persistence (stay logged in on refresh)
- Responsive, mobile-friendly UI

## Getting Started

### Prerequisites

- Node.js installed
- QuizStreak backend running (see [QuizStreak API](https://github.com/Liciacodes/QuizStreak-api))

### Setup

1. Clone the repo and install dependencies:

\`\`\`bash
git clone <your-repo-url>
cd quizstreak-frontend
npm install
\`\`\`

2. Update the API base URL in \`src/api.ts\` to point to your backend:

\`\`\`ts
const API_BASE_URL = "http://localhost:3000"; // or your Render URL
\`\`\`

3. Start the dev server:

\`\`\`bash
npm run dev
\`\`\`

App runs at \`http://localhost:5173\`.

## Project Structure

\`\`\`
src/
├── pages/
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   └── QuizPage.tsx
├── AuthContext.tsx      # JWT auth state + localStorage persistence
├── ProtectedRoute.tsx   # Guards /quiz from unauthenticated access
├── api.ts               # Axios client + typed API functions
├── App.tsx              # Router setup
└── main.tsx
\`\`\`

## Roadmap

- [ ] Multiple choice answers
- [ ] Question categories
- [ ] Streak history and stats view
- [ ] Leaderboard
