# AlbumDashboard Development Guidelines

**Last Updated**: 2025-11-19
**Constitution**: See `.specify/memory/constitution.md` for governance principles

## Overview

AlbumDashboard is a client-side React application for tracking music album progress. This document outlines the technology stack, development practices, and architectural decisions.

## Technology Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| JavaScript | ES2020+ | Primary language (ES modules) |
| React | 19.1.1 | UI framework |
| React DOM | 19.1.1 | DOM rendering |
| Vite | 7.1.0 | Build tool & dev server |
| Tailwind CSS | 4.1.11 | Utility-first styling |
| ESLint | 9.32.0 | Code quality & linting |

### Build & Development Tools

**Vite Configuration**
- Fast dev server with HMR (Hot Module Replacement)
- Optimized production builds
- ES modules-first approach
- Plugin: `@vitejs/plugin-react` (4.7.0) for Fast Refresh

**CSS Processing**
- PostCSS 8.5.6 - CSS transformation
- Autoprefixer 10.4.21 - Cross-browser vendor prefixes
- Tailwind CSS via CDN (loaded in index.html)

**Code Quality**
- ESLint with flat config format (modern API)
- `eslint-plugin-react-hooks` (5.2.0) - Enforces Hooks rules
- `eslint-plugin-react-refresh` (0.4.20) - Validates Fast Refresh patterns
- No formatter installed (manual formatting)

### Architecture Decisions

**State Management**
- Pure React hooks (no Redux/Zustand/MobX)
- LocalStorage for persistence (`STORAGE_KEY: "albumProgress_v3"`)
- No external state management libraries (aligns with Simplicity First principle)

**Routing**
- Hash-based routing (`#song/{id}`) for zoom view
- No React Router - custom `useHashRoute()` hook
- URL state managed via `window.location.hash`

**Styling Approach**
- Tailwind utility classes for all styling
- Dark theme as default (bg-neutral-950, text-neutral-100)
- Minimal custom CSS (index.css, App.css for base styles only)
- No CSS modules or CSS-in-JS libraries

**Data Persistence**
- Client-side only (no backend/API)
- LocalStorage for state persistence
- File System Access API for import/export
- JSON format for data portability

## Project Structure

```text
AlbumDashboard/
├── public/                 # Static assets
├── src/
│   ├── main.jsx           # Application entry point
│   ├── App.jsx            # Main application component
│   ├── index.css          # Global base styles
│   └── App.css            # Component-specific styles & animations
├── .specify/
│   ├── memory/
│   │   └── constitution.md # Project governance principles
│   └── templates/          # Spec templates for features
├── index.html             # HTML entry point (includes Tailwind CDN)
├── vite.config.js         # Vite configuration
├── eslint.config.js       # ESLint flat config
├── package.json           # Dependencies & scripts
└── DEVELOPMENT.md         # This file
```

## Development Workflow

### Getting Started

1. **Install dependencies:**
   ```bash
   npm ci
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173` with HMR enabled

3. **Run linter:**
   ```bash
   npm run lint
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

5. **Preview production build:**
   ```bash
   npm run preview
   ```

### Development Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Create optimized production build in `dist/` |
| `npm run lint` | Run ESLint on all source files |
| `npm run preview` | Preview production build locally |

### Code Style Guidelines

**JavaScript/React**
- Use functional components with hooks (no class components)
- Prefer `const` over `let`; avoid `var`
- Use arrow functions for inline handlers
- Destructure props and state where appropriate
- Use template literals for string interpolation

**React Hooks Patterns**
- `useState` for component state
- `useEffect` for side effects and lifecycle
- `useMemo` for expensive computations (e.g., averages, sorting)
- `useCallback` implied for event handlers passed to child components
- Custom hooks for reusable logic (e.g., `useHashRoute`, `useCountdown`)

**Naming Conventions**
- Components: PascalCase (`SongCard`, `EditStagePrompt`)
- Functions/variables: camelCase (`songAverage`, `updateStageAt`)
- Constants: UPPER_SNAKE_CASE (`DEFAULT_SONGS`, `STORAGE_KEY`)
- CSS classes: Tailwind utilities (kebab-case applied via className)

**File Organization**
- One component per file (if splitting App.jsx)
- Co-locate related utilities near usage
- Keep all components in `src/` (no nested component folders yet)

### Styling Guidelines

**Tailwind CSS**
- Use utility classes exclusively in JSX (`className` prop)
- Avoid creating new CSS files unless absolutely necessary
- Follow dark theme palette: neutral-950 (bg), neutral-900 (cards), neutral-800 (inputs)
- Use Tailwind responsive prefixes: `sm:`, `md:`, `lg:`
- Prefer Tailwind colors over custom hex values

**Color Palette**
- **Backgrounds**: `bg-neutral-950` (app), `bg-neutral-900` (cards), `bg-neutral-800` (inputs/buttons)
- **Text**: `text-neutral-100` (primary), `text-neutral-400` (secondary), `text-neutral-500` (tertiary)
- **Borders**: `border-neutral-800`, `border-neutral-700`
- **Progress Complete**: `bg-emerald-700`
- **Progress In-Progress**: `bg-amber-700`

**Responsive Design**
- Desktop-first approach (designed for 1920×1080)
- Grid: 5 columns on desktop (`grid-cols-5`)
- Card dimensions: `h-[232px] w-[376px]`
- Zoom view: `740px × 724px` centered on black background

### Component Patterns

**State Management**
```jsx
// Centralize state in App.jsx
const [songs, setSongs] = useState(() => migrateSongs(stored.songs));

// Pass update handlers down
<SongCard song={song} onUpdate={updateSong} />

// Update immutably
const updateSong = (updated) =>
  setSongs(prev => prev.map(s => s.id === updated.id ? updated : s));
```

**Event Handlers**
```jsx
// Inline for simple cases
onClick={() => setEditingDate(true)}

// Named for complex logic
const removeStageAt = (idx) =>
  onUpdate({ ...song, stages: song.stages.filter((_, i) => i !== idx) });
```

**Custom Hooks**
```jsx
// Encapsulate reusable logic
function useHashRoute() {
  const [hash, setHash] = useState(() => window.location.hash);
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  return hash;
}
```

### Data Management

**LocalStorage Schema**
```json
{
  "songs": [
    {
      "id": 1,
      "title": "Song Name",
      "stages": [
        { "name": "Demo", "value": 75 },
        { "name": "Drums", "value": 50 }
      ]
    }
  ],
  "albumTitle": "Album Dashboard",
  "targetISO": "2026-08-01T00:00:00.000Z"
}
```

**Storage Key**: `albumProgress_v3`

**Data Operations**
- All state changes persist to localStorage via `useEffect`
- Export creates JSON blob for download
- Import reads JSON and replaces localStorage + reloads page
- Schema migrations handled in `migrateSongs()` function

### Browser API Usage

**File System Access API** (Modern browsers)
```javascript
// Export with file picker
const handle = await window.showSaveFilePicker({
  suggestedName: 'album_dashboard.json',
  types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }]
});

// Import with file picker
const [handle] = await window.showOpenFilePicker({
  types: [{ description: 'JSON', accept: { 'application/json': ['.json'] } }],
  multiple: false
});
```

**Fallback Support**
- Uses `<input type="file">` for import if File System Access API unavailable
- Uses Blob + `URL.createObjectURL()` for export fallback

## Testing Philosophy

Per constitution (Section: Development Workflow → Testing Philosophy):

**Manual Testing Acceptable For:**
- UI interactions and visual validation
- Layout and responsive design
- User workflows and navigation
- Animation and transition smoothness

**Automated Tests Required For:**
- Data persistence logic (localStorage read/write)
- Import/export functionality
- Complex calculations (songAverage, albumAverage, countdown)
- Schema migrations (migrateSongs)

**No Testing Framework Currently Installed**
- Add Jest/Vitest if automated tests become necessary
- Prioritize end-to-end tests over unit tests for critical paths

## Performance Guidelines

**Targets** (from Constitution: User Experience is Non-Negotiable):
- 60fps interactions (smooth animations and transitions)
- <100ms response to user input
- No janky scrolling or UI blocking

**Optimization Techniques**
- Use `useMemo` for expensive calculations (averages, derived state)
- Avoid inline object/array creation in render (causes re-renders)
- Use `key` props correctly in lists (stable IDs, not indices)
- Lazy load components if app grows (React.lazy + Suspense)

**Current Optimizations**
```jsx
// Memoize expensive calculations
const currentSong = useMemo(() =>
  songIdFromHash ? songs.find(s => s.id === songIdFromHash) : null,
  [songIdFromHash, songs]
);

// Prevent recalculation on every render
const stored = useMemo(() => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}, []);
```

## Code Review Checklist

Before merging any feature (from Constitution: Development Workflow → Code Review Gates):

- [ ] **Simplicity**: Does it maintain or improve simplicity?
- [ ] **Data Integrity**: Does it preserve all existing user data?
- [ ] **Performance**: Does it perform smoothly (no janky UI)?
- [ ] **User Experience**: Can a user accomplish their goal without friction?
- [ ] **Linting**: Does `npm run lint` pass without errors?
- [ ] **Visual Check**: Has the change been tested in the browser?

## Common Tasks

### Adding a New Feature

1. Check constitution for principle alignment
2. Define user value (what problem does it solve?)
3. Implement in small, incremental commits
4. Test manually in browser (`npm run dev`)
5. Run linter (`npm run lint`)
6. Visual inspection before commit
7. Write clear commit message

### Modifying Data Schema

1. Update the schema in `App.jsx` state initialization
2. Add migration logic in `migrateSongs()` function
3. Ensure backward compatibility (old data still loads)
4. Test import of old JSON exports
5. Update `STORAGE_KEY` version if breaking change (e.g., `v3` → `v4`)

### Updating Dependencies

```bash
# Check for outdated packages
npm outdated

# Update specific package
npm install react@latest

# Update all patch/minor versions
npm update

# Verify build after updates
npm run build
npm run lint
```

## Browser Compatibility

**Target Browsers:**
- Modern evergreen browsers (Chrome, Firefox, Safari, Edge)
- ES2020+ support required
- File System Access API (optional enhancement, has fallback)

**Not Supported:**
- Internet Explorer
- Legacy browsers without ES modules

**Features Requiring Modern Browsers:**
- File System Access API (showSaveFilePicker, showOpenFilePicker)
- LocalStorage API (widely supported)
- CSS Grid (widely supported)
- Flexbox (widely supported)

## Debugging Tips

**React DevTools**
- Install React DevTools browser extension
- Inspect component state and props
- Profile component render performance

**Vite DevTools**
- Check Network tab for HMR updates
- Use `console.log` (removed before commit)
- Vite error overlay shows stack traces

**LocalStorage Inspection**
```javascript
// View current data in browser console
JSON.parse(localStorage.getItem('albumProgress_v3'))

// Clear data for testing
localStorage.removeItem('albumProgress_v3')
window.location.reload()
```

## Common Issues

**HMR Not Working**
- Check for syntax errors in console
- Ensure components are exported correctly
- Restart dev server (`Ctrl+C` then `npm run dev`)

**State Not Persisting**
- Check localStorage quota (usually 5-10MB)
- Verify `useEffect` dependency array includes state
- Check for JSON serialization errors

**Styling Not Applying**
- Tailwind CDN must load from index.html
- Check browser console for CSS errors
- Verify className spelling (no typos)

## Resources

**Official Documentation:**
- [React Docs](https://react.dev) - React 19 documentation
- [Vite Docs](https://vitejs.dev) - Build tool and dev server
- [Tailwind CSS](https://tailwindcss.com) - Utility-first CSS
- [ESLint](https://eslint.org) - Linting configuration

**Project Files:**
- [Constitution](.specify/memory/constitution.md) - Governance principles
- [README](README.md) - Getting started guide
- [Package.json](package.json) - Dependencies and scripts

## Contributing

1. Read the [Constitution](.specify/memory/constitution.md)
2. Follow this development guide
3. Make small, focused commits
4. Run linter before committing
5. Test manually in browser
6. Use clear, descriptive commit messages

## Questions?

For questions about:
- **Governance**: See `.specify/memory/constitution.md`
- **Getting Started**: See `README.md`
- **Technology**: This document (DEVELOPMENT.md)
- **Features**: Check git history and commit messages
