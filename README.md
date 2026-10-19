<div align="center">

# Project Management System — Frontend

**A responsive React application for project planning, task tracking, workspace management, and team collaboration.**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Redux Toolkit](https://img.shields.io/badge/State-Redux_Toolkit-764ABC?logo=redux&logoColor=white)](https://redux-toolkit.js.org/)
[![Clerk](https://img.shields.io/badge/Auth-Clerk-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)

</div>

---

## Overview

This directory contains the frontend for the **Project Management System**. It is a single-page application built with React and Vite. Its interface is organized into page-level views and reusable components for dashboards, projects, tasks, workspaces, teams, analytics, calendars, and settings.

The frontend integrates Clerk for authentication, Redux Toolkit for shared state, Axios for API communication, Tailwind CSS for styling, Recharts for charts, and supporting libraries for dates, icons, and toast notifications.

The frontend communicates with the separately maintained Express backend. The API base URL is configured through `VITE_BASEURL`.

---

# 👨‍💻 About Me

Hi, I'm **Satinder Singh Sall**, a Full-Stack Developer, AI Enthusiast, and MCA student passionate about building scalable digital products, intelligent software systems, and meaningful user experiences.

My journey spans across **Web Development, Mobile Applications, Artificial Intelligence, Cloud Technologies, and Creative Writing**. I enjoy transforming ideas into production-ready solutions using modern technologies while continuously exploring emerging fields like Machine Learning, Computer Vision, and Automation.

Currently, I'm pursuing my **Master of Computer Applications (MCA)** while actively developing full-stack applications, AI-powered solutions, and open-source learning resources. My work focuses on creating software that is not only functional but also scalable, maintainable, and impactful.

## 🚀 What I'm Building

- 🤖 AI-Powered Attendance System using Face Recognition & Voice Biometrics
- 🌐 Modern Full-Stack Web Applications
- 📱 Cross-Platform Mobile Applications
- 🎮 Exploring Game Development & Interactive Experiences
- 📚 Open-Source Learning Roadmaps and Technical Resources
- ✍️ Satinder Poetry — A platform for original poetry, essays, and creative writing

## 🛠️ Core Technologies

**Frontend:** React, Next.js, TypeScript, Tailwind CSS
**Backend:** Node.js, Express.js, REST APIs
**Databases:** MongoDB, PostgreSQL, MySQL, Firebase, Supabase
**DevOps & Cloud:** Docker, GitHub Actions, Vercel, Render
**Programming:** Python, Java, JavaScript, C++, C#, Kotlin
**AI / ML:** Python, Computer Vision, Face Recognition, Automation
**Mobile Apps:** High-Performance Android, iOS, Cross-Platform & Native Development

## 🌍 Connect With Me

🌐 Portfolio: https://satinder-portfolio.vercel.app

💻 GitHub: https://github.com/SatinderSinghSall

💼 LinkedIn: https://www.linkedin.com/in/satinder-singh-sall-b62049204/

🎥 YouTube: https://www.youtube.com/@satindersinghsall.3841

✍️ Satinder Poetry: https://satinderpoetry.com

🤖 AI Attendance Project: https://ai-attendance-app-satinder.vercel.app/

---

> _"I believe great software is built at the intersection of engineering excellence, continuous learning, creativity, and real-world problem solving."_

⭐ Always learning. Always building. Always improving.

---

## Features and UI Areas

The repository structure includes modules for:

- **Dashboard:** summary statistics, task summaries, and recent activity.
- **Projects:** project listing, project cards, and project creation.
- **Project details:** overview, tasks, calendar, analytics, and settings.
- **Tasks:** task details, task creation, and a personal task sidebar.
- **Workspace navigation:** workspace dropdown and project sidebar.
- **Team collaboration:** team page, member invitations, and adding project members.
- **Authentication:** Clerk React integration.
- **State management:** Redux store with theme and workspace slices.
- **Data visualization:** Recharts-based analytics components.
- **Notifications and utilities:** React Hot Toast, date-fns, and Lucide icons.

The file tree identifies these UI modules; exact feature behavior depends on the implementation and backend support.

## Technology Stack

| Technology          | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| React 19            | UI components and rendering                      |
| Vite 7              | Local development server and production bundling |
| Tailwind CSS 4      | Utility-first styling                            |
| `@tailwindcss/vite` | Tailwind integration with Vite                   |
| React Router 7      | Client-side routing                              |
| Redux Toolkit       | Shared application state                         |
| React Redux         | Connecting React components to Redux             |
| Clerk React         | Frontend authentication                          |
| Axios               | HTTP requests to the backend                     |
| Recharts            | Charts and analytics visualizations              |
| `date-fns`          | Date formatting and manipulation                 |
| Lucide React        | Icon components                                  |
| React Hot Toast     | Toast notifications                              |
| ESLint              | Code-quality checks                              |

## Project Structure

```text
client/
├── public/
│   └── favicon.ico
├── src/
│   ├── app/
│   │   └── store.js
│   ├── assets/
│   │   ├── assets.js
│   │   ├── favicon.ico
│   │   ├── profile_img_a.svg
│   │   ├── profile_img_j.svg
│   │   ├── profile_img_o.svg
│   │   └── workspace_img_default.png
│   ├── components/
│   │   ├── AddProjectMember.jsx
│   │   ├── CreateProjectDialog.jsx
│   │   ├── CreateTaskDialog.jsx
│   │   ├── InviteMemberDialog.jsx
│   │   ├── MyTasksSidebar.jsx
│   │   ├── Navbar.jsx
│   │   ├── ProjectAnalytics.jsx
│   │   ├── ProjectCalendar.jsx
│   │   ├── ProjectCard.jsx
│   │   ├── ProjectOverview.jsx
│   │   ├── ProjectSettings.jsx
│   │   ├── ProjectTasks.jsx
│   │   ├── ProjectsSidebar.jsx
│   │   ├── RecentActivity.jsx
│   │   ├── Sidebar.jsx
│   │   ├── StatsGrid.jsx
│   │   ├── TasksSummary.jsx
│   │   └── WorkspaceDropdown.jsx
│   ├── configs/
│   │   └── api.js
│   ├── features/
│   │   ├── themeSlice.js
│   │   └── workspaceSlice.js
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Layout.jsx
│   │   ├── ProjectDetails.jsx
│   │   ├── Projects.jsx
│   │   ├── Settings.jsx
│   │   ├── TaskDetails.jsx
│   │   └── Team.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── .env.example
├── .gitignore
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── vercel.json
└── vite.config.js
```

## Prerequisites

- Node.js version compatible with the project's Vite version.
- npm.
- Access to a configured Clerk application.
- A running backend API, unless you are only working on UI that does not make API calls.

Check your versions:

```bash
node --version
npm --version
```

## Installation

From this `client/` directory, install dependencies:

```bash
npm install
```

For a clean installation based on the committed lockfile, use:

```bash
npm ci
```

## Environment Configuration

Create a local `.env` file from the example file.

**Windows Command Prompt:**

```bat
copy .env.example .env
```

**macOS / Linux / Git Bash:**

```bash
cp .env.example .env
```

Configure the following variables in `client/.env`:

```dotenv
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
VITE_BASEURL=http://localhost:5000
```

| Variable                     | Description                                               |
| ---------------------------- | --------------------------------------------------------- |
| `VITE_CLERK_PUBLISHABLE_KEY` | Public Clerk publishable key for the frontend application |
| `VITE_BASEURL`               | Base URL of the backend API                               |

### Environment security

Vite exposes variables prefixed with `VITE_` to client-side code. Use this prefix only for values that are safe to expose publicly. **Never put Clerk secret keys, database connection strings, SMTP passwords, or other private credentials in the frontend environment.**

Restart the Vite server after changing environment variables. Check `src/configs/api.js` to confirm how `VITE_BASEURL` is consumed.

## Run in Development

Start the frontend development server:

```bash
npm run dev
```

Vite prints the local URL in the terminal. The default is commonly `http://localhost:5173`.

Ensure the backend is running and `VITE_BASEURL` points to the correct backend address. If the backend uses another port or a deployed URL, update the environment value accordingly.

## Available Scripts

The scripts are defined in `package.json`:

| Command           | Purpose                              |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Start the Vite development server    |
| `npm run build`   | Build the production frontend bundle |
| `npm run lint`    | Run ESLint                           |
| `npm run preview` | Preview the production build locally |

Run the checks before committing:

```bash
npm run lint
npm run build
```

To preview the production output:

```bash
npm run preview
```

## Application Entry Points

- `src/main.jsx` — frontend bootstrap and root rendering.
- `src/App.jsx` — application composition and route setup.
- `src/app/store.js` — Redux store configuration.
- `src/configs/api.js` — API client or base URL configuration.
- `src/features/themeSlice.js` — theme-related Redux state.
- `src/features/workspaceSlice.js` — workspace-related Redux state.
- `src/index.css` — global styles and Tailwind-related CSS.
- `index.html` — Vite HTML entry document.

## Backend Integration

The frontend is designed to communicate with the Express API in the sibling `server/` directory.

When investigating API issues:

1. Confirm `VITE_BASEURL` is correct.
2. Inspect the request setup in `src/configs/api.js`.
3. Check browser developer tools for failed requests and response status codes.
4. Confirm the backend is running.
5. Check backend CORS settings and authentication middleware.
6. Verify the request and response formats against the corresponding backend route and controller.

Do not assume an endpoint exists based only on a component name; verify its route and implementation in the backend.

## Authentication

Clerk React is used for frontend authentication integration. Configure the correct publishable key and the required sign-in, sign-up, and redirect settings in the Clerk dashboard.

Frontend route guards improve the user experience, but they do not replace backend authorization. The server must independently validate requests and enforce access to workspaces, projects, tasks, and other protected resources.

## Build and Deployment

Build the frontend:

```bash
npm ci
npm run lint
npm run build
```

Vite generates production assets in `dist/`. The `vercel.json` file contains deployment configuration; review it alongside the hosting platform's project root, build command, output directory, environment variables, and SPA routing requirements.

For deployment, configure:

- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_BASEURL` pointing to the deployed backend
- Correct Clerk allowed origins and redirect URLs
- Backend CORS to allow the deployed frontend origin
- SPA fallback routing if required by the hosting platform

Only public frontend configuration should be included in the built bundle.

## Troubleshooting

### API requests fail

- Check `VITE_BASEURL`.
- Verify the backend is available.
- Inspect the browser Network tab.
- Confirm CORS allows the frontend origin.
- Check whether the endpoint requires authentication.

### Clerk does not initialize

- Verify `VITE_CLERK_PUBLISHABLE_KEY`.
- Confirm the key matches the intended Clerk application.
- Check the configured domains and redirect URLs.
- Restart Vite after environment changes.

### Styling or Tailwind utilities do not appear

- Review `src/index.css` and `vite.config.js`.
- Confirm the Tailwind Vite plugin is configured as expected.
- Check the terminal for build errors.
- Verify that the relevant CSS file is imported by the application.

### Production build fails

```bash
npm ci
npm run lint
npm run build
```

Resolve reported dependency, lint, or compilation errors and rerun the build.

## Suggested Engineering Improvements

- Add component and integration tests.
- Add end-to-end tests for core project and task workflows.
- Document routes and API response contracts.
- Improve accessible labels, keyboard navigation, and responsive behavior.
- Standardize loading, empty, and error states.
- Add CI checks for linting and production builds.
- Audit dependencies and keep the lockfile updated.
- Add frontend performance monitoring where appropriate.

## Related Documentation

- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vite.dev/guide/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Clerk React Documentation](https://clerk.com/docs)
- [Axios Documentation](https://axios-http.com/)
- [Recharts Documentation](https://recharts.org/)
- [Lucide React](https://lucide.dev/guide/packages/lucide-react)
- [ESLint Documentation](https://eslint.org/docs/latest/)

---

**Frontend package:** `client/`  
**Backend package:** `server/`  
**Development server:** Vite  
**Production output:** `dist/`
