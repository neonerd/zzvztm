# Claude

## Basic Info

This project is a videogame written in Typescript, HTML and CSS. There are two main parts - the game and the editor.

## Project Structure

```
src/
├── assets/           # JSON data files
│   ├── artifacts.json
│   └── possibilities.json
├── engine/           # Game engine classes
├── model/            # TypeScript interfaces
│   ├── ArtifactDefinition.ts
│   ├── PossibilityDefinition.ts
│   ├── LocationDefinition.ts
│   └── PersonDefinition.ts
├── static/           # Static HTML files
│   ├── index.html    # Game entry point
│   └── editor.html   # Editor entry point
├── game.ts           # Game entry point
├── editor.ts         # Editor Vue app
└── editor-backend.mjs # Editor backend API
```

## Model

The model directory contains TypeScript interfaces for game entities:

- **ArtifactDefinition**: Items in the game with id, name, description, and possibilities
- **PossibilityDefinition**: Types of possibilities (e.g., "curiosity")
- **ArtifactPossibility**: Links artifacts to possibilities with a count

## Editor

The editor is a Vue 3 application with Tailwind CSS for styling. It provides CRUD operations for game assets.

### Running the Editor

Run both the backend and frontend:

```bash
# Terminal 1 - Backend API (port 3001)
npm run editor-backend

# Terminal 2 - Frontend dev server (port 8080)
npm run serve
```

Then open http://localhost:8080/editor.html

### Editor Backend

Express.js server at `src/editor-backend.mjs` providing REST API:

- `GET /api/artifacts` - Load all artifacts
- `PUT /api/artifacts` - Save all artifacts
- `GET /api/possibilities` - Load all possibilities
- `PUT /api/possibilities` - Save all possibilities

### Editor Frontend

Vue 3 app at `src/editor.ts` with:
- Tab-based navigation (Artifacts, Possibilities)
- Full CRUD for Artifacts and Possibilities
- Editable ID fields for all entities
- Auto-save to backend on changes
- Modal dialogs for editing

## Build System

Uses esbuild with plugins:
- `esbuild-plugin-vue3` for Vue SFC support
- `esbuild-plugin-copy` for static files
- Vue aliased to `vue/dist/vue.esm-bundler.js` for runtime template compilation

### NPM Scripts

- `npm run build` - Build for production
- `npm run serve` - Start dev server on port 8080
- `npm run editor-backend` - Start editor API on port 3001

## Dependencies

- **Vue 3** - Editor UI framework
- **Tailwind CSS** - Styling (via CDN)
- **Express** - Editor backend
- **esbuild** - Build tool
