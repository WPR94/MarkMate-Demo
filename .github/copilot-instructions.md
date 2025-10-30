# 🧠 MarkMate AI Agent Instructions

## 📘 Project Overview

**Project Name:** MarkMate  
**Purpose:** AI-powered essay feedback and grading platform for teachers  
**Initial Focus:** O-Level/GCSE English marking and feedback  
**Future Goal:** Expansion to other subjects (Maths, Science, etc.)

### Tech Stack
- React (TypeScript)
- Vite (build/dev)
- TailwindCSS (design)
- Supabase (Auth + Database)
- React Router DOM (Navigation)
- TanStack Query / Zustand (state management)
- PostCSS + Autoprefixer (CSS utilities)

### Project Structure
```
src/
├── pages/          # Feature pages
├── components/     # Shared UI components (to be added)
├── hooks/          # Custom logic hooks (future)
├── utils/          # Utility functions (future)
└── types/          # TypeScript interfaces
```

## 🧩 Core Components

| Page | Purpose |
|------|---------|
| `Landing.tsx` | Entry point, intro text, "Try Demo" and "Teacher Login" buttons |
| `Auth.tsx` | Supabase login/sign-up flow |
| `Dashboard.tsx` | Central navigation hub for teachers |
| `EssayFeedback.tsx` | Essay input (paste/upload/scan) → AI feedback |
| `Students.tsx` | Student profile management (CRUD) |
| `Rubrics.tsx` | Grading rubric management |
| `Analytics.tsx` | Marking statistics dashboard |
| `BatchProcessor.tsx` | Bulk essay processing (JSON/CSV) |

## 🧑‍💻 Development Setup

### Environment Configuration
```bash
# Required .env variables
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Common Commands
```bash
npm install     # Install dependencies
npm run dev     # Start dev server
npm run build   # Production build
npm run preview # Preview build
```

## ⚙️ Project Conventions

### Component Pattern
```typescript
function ComponentName() {
  // State declarations
  const [data, setData] = useState<DataType>([]);
  
  // Event handlers
  const handleAction = () => {
    // Implementation
  };
  
  return (
    <div className="p-4 max-w-4xl mx-auto">
      {/* Component JSX */}
    </div>
  );
}
```

### Styling Guidelines
- Use TailwindCSS exclusively
- Common patterns:
  - Container: `max-w-4xl mx-auto p-4`
  - Forms: `grid grid-cols-1 sm:grid-cols-2 gap-4`
  - Buttons: `bg-{color}-600 text-white py-2 px-4 rounded`
  - Headers: `text-2xl font-bold mb-4`

### Type Definitions
```typescript
// Place interfaces at the top of component files
interface EntityType {
  id: number;
  // ... other fields
}

// For shared types, create files in /src/types/
```

## 🔗 Integration Points

### Supabase Integration
```typescript
// src/supabaseClient.ts pattern
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
```

### Future AI Integration
- Edge Function/serverless API for OpenAI GPT integration
- Input: Essay text + rubric criteria
- Output: Structured feedback object

## 🧭 Code Modification Guidelines

1. **New Features**
   - Add pages in `/src/pages`
   - Add components in `/src/components`
   - Update routes in `App.tsx`
   - Link from `Dashboard.tsx` if needed

2. **State Management**
   - Local state for simple features
   - Zustand stores for complex state
   - React Query for API data

3. **Styling**
   - Use only TailwindCSS classes
   - Maintain responsive design patterns
   - Follow established color scheme

4. **Type Safety**
   - Define interfaces for all data structures
   - Use TypeScript's strict mode
   - Properly type event handlers

5. **Error Handling**
   ```typescript
   try {
     // API calls, file operations
   } catch (err) {
     console.error(err);
     // User feedback
   }
   ```

## ✅ Quality Standards

1. **Code Organization**
   - Logical component structure
   - Clear file/folder naming
   - Consistent import ordering

2. **Performance**
   - Optimize re-renders
   - Lazy load routes
   - Handle loading states

3. **Accessibility**
   - Semantic HTML
   - ARIA labels where needed
   - Keyboard navigation support

4. **Error States**
   - User-friendly error messages
   - Graceful fallbacks
   - Loading indicators

Remember: This is a teacher-focused tool - prioritize clarity and ease of use in all UI/UX decisions.