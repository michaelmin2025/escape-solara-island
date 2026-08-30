# Escape Solara Island

**A crime-strategy game where a human sets the plan and an AI agent plays the world through WebMCP.**

Alex and Maya arrive on fictional Solara Island, a Mediterranean setting inspired by Menorca. Their handler has six in-game days to guide them through three interconnected major operations, secure $500,000, manage injuries and police heat, and reach the final airfield together.

## What changed in version 2

- Rebuilt with Next.js 16.3 (satisfying the plan's Next.js 15+ requirement), React 19.2, TypeScript, and Tailwind CSS.
- New mandatory airport-to-hotel tutorial with character dialogue and the handler's hotel call.
- Three full-day major missions: **The Marina Job**, **The Miraflores Count**, and **Cinderworks Recovery**.
- Structured, reusable mission scenes rather than mission logic inside UI components.
- Success, partial-success, failure, and aborted outcomes with interconnected consequences.
- An elongated, custom SVG island map inspired by Menorca's geography while keeping every place fictional.
- Side opportunities for recovering from imperfect major-mission outcomes.
- Shared React state used by both the visible interface and WebMCP tools.

## Run locally

```powershell
npm install
npm run dev
```

Open `http://localhost:3000` yourself. WebMCP requires a compatible browser build with the imperative API enabled. The manual game remains fully playable when WebMCP is unavailable.

## Verify

```powershell
npm run check
```

This performs strict TypeScript checking, runs the dependency-light engine tests, and creates a production Next.js build. No database, authentication, or backend service is required.

## Core game flow

1. Enter the human handler's name.
2. Run **First Light**, driving Alex and Maya from Solara Airport to Hotel Aster.
3. Answer the hotel call to deliver the $500,000 / six-day objective and unlock the mission network.
4. Choose the Marina, Casino, and Industrial missions in any order.
5. At consequential scenes, the AI pauses and the human handler chooses the strategy.
6. Use side work, food, rest, weapons, and vehicles to recover from partial or failed outcomes.
7. Reach $500,000, lower heat, drive to Santoro Airstrip, and attempt escape.

## WebMCP

The application feature-detects `document.modelContext.registerTool()` and registers 16 structured actions:

- `get_handler_state`
- `get_world_state`
- `get_available_missions`
- `inspect_mission`
- `drive_team`
- `answer_hotel_call`
- `meet_major_client`
- `start_team_mission`
- `choose_path`
- `eat_together`
- `rest_together`
- `equip_weapon`
- `switch_vehicle`
- `set_handler_directive`
- `request_handler_decision`
- `attempt_escape`

Tool calls go through the same engine and state object as the React UI. Their activity appears in the visible agent feed.

## Structure

```text
app/                 Next.js App Router entry and global Tailwind styles
components/          React game UI
game/engine.ts       Shared rules and structured scene runner
game/missions/       Data-authored tutorial, major missions, and side jobs
game/locations.ts    Fictional Mediterranean island geography
game/state.ts        Initial and persisted game state
webmcp/              Browser tool registration
types/               Game and WebMCP TypeScript declarations
tests/               Engine verification
```

## Deployment

The project is ready for a standard Vercel import. It has no environment variables, private credentials, database, or server-side runtime dependency.

All characters, organizations, locations, dialogue, and SVG artwork are original to this project. Solara Island is fictional and uses Menorca only as geographic and visual inspiration.
