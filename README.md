# project-treasure-map
This project is a simple React + Vite frontend and supabase for backend.

## React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

### React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.

### Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## supabase
Integrating database `Project Treasure Map`

# CPE Tracker — Project Structure

## Folder Overview

```
src/
├── api/              ← All Supabase query functions
│   ├── courses.js    → getCourses, addCourse, updateCourse, deleteCourse
│   ├── users.js      → signUp, signIn, signOut, getCurrentUser, updateUserProfile
│   └── categories.js → getCategories, addCategoryToCourse, removeCategoryFromCourse
├── lib/
│   └── supabase.js   ← Supabase client (initialized once, imported everywhere)
├── components/       ← Reusable UI components
├── pages/            ← Page-level components (one per route)
├── App.jsx
└── main.jsx

supabase/
└── migrations/       ← SQL schema files (managed by Supabase CLI)

.env                  ← Your actual secrets (never commit this!)
.env.example          ← Template to share with teammates
```

## Setup

1. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   cp .env.example .env
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Install Supabase client if not already:
   ```
   npm install @supabase/supabase-js
   ```

4. Run the app:
   ```
   npm run dev
   ```

## Usage Example

```jsx
import { getCourses, addCourse } from './api/courses'

// In a component
const courses = await getCourses()

await addCourse({
  title: 'Advanced Tax Planning',
  provider: 'AICPA',
  credits: 4,
  completion_date: '2026-05-01',
})
```
