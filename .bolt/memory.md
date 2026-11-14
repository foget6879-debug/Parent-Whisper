# Project memory

## Product intent & audience

- Single-page persuasive web app explaining hardware upgrades to non-technical parents
- Uses everyday analogies (kitchen appliances, car maintenance) to make tech concepts relatable
- Goal: help young users build a case for hardware upgrades they want/need
- Tone is gentle, respectful, educational—not pushy or manipulative
- Interactive 3D visualizations (Three.js) showing old vs. new hardware comparisons
- Catalog covers multiple categories: laptops, desktops, tablets, GPUs, CPUs, RAM, storage, and complete builds
- User communicates in Ukrainian; page content language likely Ukrainian

## Brand personality & voice

- Warm, respectful, patient; explains without condescending
- Conversational, relatable, slightly playful when appropriate
- Treats parents as intelligent but non-technical
- Ukrainian user input; content localization needed

## Visual design & UX direction

- Follows global design instructions in `.bolt/prompt` (beautiful, production-grade, non-cookie-cutter)
- Vite + React + JSX with Tailwind CSS, Lucide React icons; `@/` path alias for `src/`
- Three.js for 3D visualizations
- 3D model: SSD drive with heatsink, memory chips, gold contacts, screws, sticker; tilted so top is visible immediately
- Visual metaphors bridging physical analogies to digital hardware
- Large typography, accessible contrast, large tap targets for older readers
- Responsive and touch-friendly
- Catalog: device cards with short descriptions, per-category filters
- Comparison restricted to same category only (max 3); cross-category selections disabled until cleared
- Comparison section after "Варіанти" block; nav includes "Порівняння" anchor

## Decisions, constraints & rationale

- No additional UI packages beyond template defaults unless explicitly requested; Three.js is exception
- Parent audience dictates accessible UX: large tap targets, clear navigation, plain language
- Rozetka and similar Ukrainian marketplaces lack public APIs; prices entered manually
- Product catalog is stored in browser localStorage and seeded with the catalog data on first load
- Local catalog and custom products are browser-specific and do not sync across visitors or devices
- Comparison table only meaningful within same category; cross-category disabled by design
- Catalog logic and 3D module extracted into separate `@/` modules
- Device card, selection panel, comparison table components created
- Shared price formatting extracted to catalog utility
- Build passes without errors; browser visual QA not yet performed

## Open questions & assumptions

- Page content language: Ukrainian, English, or bilingual?
- AI assistant: scope? (Q&A, persuasive talking points, troubleshooting?)
- AI integration: external API, local model, or simulated responses?
- Is this a single standalone page or part of a larger site?
- User's earlier "yfkjinedfyyz" request still needs clarification
- Catalog data: will user manually input real products/prices, or provide data for import?
- Marketplace scope: Rozetka only, or multiple (Allo, Comfy, etc.)?
- 3D model visual quality needs user review in browser
- Full catalog needs real product names, specs, and prices across all categories