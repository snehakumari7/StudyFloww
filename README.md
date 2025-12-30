# StudyFlow 🐼

**StudyFlow** is an intelligent, AI-powered productivity workspace designed to help you organize tasks, manage your time, and build consistent habits. With a friendly interface featuring a motivating mascot, StudyFlow combines task management, a focus timer, and streak tracking into one seamless experience.

## 🚀 Features

-   **Dashboard Overview**: Get a quick glance at your daily quotes, next tasks, and productivity stats.
-   **Authentication**: Secure Sign-Up and Sign-In powered by [Supabase](https://supabase.com/).
-   **Task Management**:
    -   Create, edit, and delete tasks.
    -   Categorize by "Personal", "Work", or "Study".
    -   Set priorities (Low, Medium, High).
    -   Set due dates and reminders.
-   **Kanban Board**: Visual drag-and-drop interface to manage task progress (To Do, In Progress, Completed).
-   **Focus Timer**: Built-in Pomodoro-style timer to keep you focused on your work sessions.
-   **Streaks & Analytics**: Track your daily login streaks and visualize your consistency over time.
-   **Settings**: Customize your profile, manage account preferences, and view system info.
-   **Responsive Design**: A beautiful, mobile-friendly UI built with Tailwind CSS.

## 🛠️ Tech Stack

-   **Frontend Framework**: [React](https://react.dev/) (v18)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Styling**:
    -   [Tailwind CSS](https://tailwindcss.com/)
    -   [Shadcn UI](https://ui.shadcn.com/) (Component Library)
    -   [Lucide React](https://lucide.dev/) (Icons)
-   **State Management & Data Fetching**: [TanStack Query (React Query)](https://tanstack.com/query/latest)
-   **Backend & Authentication**: [Supabase](https://supabase.com/)
-   **Form Handling**: React Hook Form + Zod

## 📦 Prerequisites

Before you begin, ensure you have the following installed:
-   [Node.js](https://nodejs.org/) (v18 or higher recommended)
-   [npm](https://www.npmjs.com/) (or yarn/bun)

## 🏁 Getting Started

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd StudyFlow
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment Variables**
    Create a `.env` file in the root directory. You will need your Supabase credentials.
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
    ```
    *Note: Ensure you have a Supabase project set up with `profiles` and `timer_settings` tables.*

4.  **Run the development server**
    ```bash
    npm run dev
    ```
    Open [http://localhost:8080](http://localhost:8080) (or the port shown in your terminal) to view the app.

## 📜 Scripts

-   `npm run dev`: Starts the development server.
-   `npm run build`: Builds the app for production.
-   `npm run preview`: Locally previews the production build.
-   `npm run lint`: Runs ESLint to check for code quality issues.

## 📂 Project Structure

```
src/
├── components/     # Reusable UI components (buttons, dialogs, etc.)
├── context/        # React Context providers (Auth, Task, Timer context)
├── hooks/          # Custom hooks (useAuth, useToast, etc.)
├── integrations/   # Third-party integrations (Supabase client)
├── lib/            # Utility functions (utils.ts)
├── pages/          # Main page components (Dashboard, Tasks, Auth, etc.)
├── App.tsx         # Main application root and routing
└── main.tsx        # Entry point
```

## 🤝 Contributing

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
