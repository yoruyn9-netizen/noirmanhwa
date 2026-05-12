# **App Name**: NoirManhwa

## Core Features:

- Global MangaDex Stream: Native integration with MangaDex API v5 for high-speed, real-time fetching of trending and latest manhwa without proxy lag.
- Infinite Webtoon Viewer: An optimized vertical scrolling reader with lazy-loading and smart preloading of the next two chapters for seamless immersion.
- Zustand Navigation System: High-performance state management for a modular bottom sheet interface handling search, bookmarks, and global genre filters.
- AI Curator Tool: An AI-powered reasoning tool that analyzes your reading history and tags to dynamically suggest new series from the MangaDex library.
- Syncing Persistence Hub: Automated synchronization of reading progress and bookmarks via localized data management to ensure low-latency access to library data.
- Adaptive Image Delivery: A smart UI system utilizing next/image for blurred placeholders and adaptive fit modes including original, fit, or stretch to suit various device screens.
- Multi-Dimensional Filter Engine: A high-fidelity search interface supporting debounced queries, genre multi-selection, and sort ordering by relevance or popularity.

## Style Guidelines:

- Primary Color: Intense Blood Red (#991B1B) to evoke the high-stakes action of manhwa. Background Color: Deepest Obsidian (#080505), reflecting a cinematic late-night reading environment. Accent Color: Electric Crimson (#B91C1C) for interactive glow states and active navigation highlights.
- Font recommendation: 'Inter', a grotesque-style sans-serif for a machined, neutral, and high-readability aesthetic across both headlines and metadata. Note: currently only Google Fonts are supported.
- Thin-stroke, minimalist wireframe icons with subtle glow effects when active to maintain a tech-focused, futuristic platform feel.
- Responsive grid-based layout utilizing scroll-snap containers for mobile-first sliders and high-density content cards for larger viewports.
- Fluid bottom-sheet transitions using a cubic-bezier(0.16, 1, 0.3, 1) ease, combined with scale-based hover interactions for manga cards.