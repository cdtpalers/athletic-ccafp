# Technical Overview: Athletic Council Dashboard

This document provides a high-level summary of the technologies powering your application and explains how the system fits together. Your app follows a modern **JAMstack** (JavaScript, APIs, and Markup) methodology—it has no traditional "backend server" and instead relies entirely on client-side processing, making it incredibly fast and cheap to host.

## The Technology Stack

### 1. Framework & Core Library
*   **React 19**: The foundational library used to build the user interface. It allows the app to be separated into reusable, interactive components (like the Sidebar, stat cards, and modals).
*   **Vite**: The build tool and development server. Vite is responsible for spinning up your local `npm run dev` environment blazingly fast. When deploying to production, it bundles your React code, CSS, and images into highly optimized static files.

### 2. Routing & Navigation
*   **React Router (`react-router-dom`)**: Handles all page navigation. Since this is a "Single Page Application" (SPA), moving between "Deficiencies" and "Class Schedule" doesn't actually load a new HTML page from the server; React Router simply swaps out the components instantly in the browser.

### 3. Styling & User Interface
*   **Vanilla CSS**: All design elements (colors, layouts, responsive scaling) are handled natively in `index.css`.
*   **CSS Variables (Custom Properties)**: The app heavily utilizes variables (like `var(--bg-color)`) to manage the overarching design system. This is what allows the instant, seamless switching between Light and Dark modes.
*   **Lucide React**: The open-source icon library providing all the clean, consistent vector icons (like the hamburger menu, bells, shields, etc.) used throughout the interface.

### 4. Database & Data Storage
*   **Google Sheets (CSV Export)**: Acting as a robust, free "head-less CMS" (Content Management System). Instead of setting up a complex SQL database and a server API to handle queries, the application directly consumes data from published Google Sheets. 
*   **Lightweight CSV Parser**: Inside your data-heavy components, a custom JavaScript function parses this raw CSV text into usable Javascript objects.

### 5. Deployment
*   **Vercel**: The cloud hosting provider. Vercel acts as a global CDN (Content Delivery Network). It listens to your GitHub repository and automatically runs Vite's build process (`npm run build`) whenever you push new changes, serving your static application to users worldwide edge network.

---

## How it All Works Together (The Data Flow)

Here is a step-by-step breakdown of what happens when a user navigates to your dashboard:

1.  **Initial Load**: The user types the Vercel URL into their browser. Vercel responds instantly with `index.html`.
2.  **Mounting the App**: `main.jsx` runs, injecting the React framework into the HTML page. The global `App.jsx` layout renders the Sidebar, the Clock Widget, and checks the user's `localStorage` to determine if they prefer Light or Dark mode.
3.  **Routing Strategy**: Depending on the URL, React Router mounts a specific page module inside the main layout window. Let's assume the user clicked the **Requirements** tab.
4.  **Fetching Data**: 
    *   As soon as `Requirements.jsx` mounts, a React `useEffect` Hook triggers.
    *   This Hook makes an asynchronous network request (`fetch()`) directly to the unique Google Sheets CSV URL you provided.
    *   *While this is happening, the user sees a "Loading records..." screen.*
5.  **Processing Data**: 
    *   Google responds with raw, comma-separated text.
    *   Your custom `parseCSV` function runs, dynamically building out an array of objects mapping the CSV headers to properties (e.g., `{ course: "Math", status: "Pending" }`).
6.  **State Update and Render**:
    *   React updates its local Memory State (`useState`) with the newly parsed data.
    *   The application re-renders instantly, replacing the "Loading" text with the grouped tables, generating the distinct Gold/Crimson badges, and calculating the exact count of items.
7.  **Client-side Operations**: Because the data now lives entirely in the user's browser, operations like searching via the top-bar or filtering tabs (1CL, 2CL) happen in milliseconds, requiring zero additional network requests to Google Sheets.
