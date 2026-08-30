# Escape Solara Island

**A crime-strategy game where a human sets the plan and an AI agent plays the world through WebMCP.**

Alex and Maya arrive on fictional Solara Island, a Mediterranean setting inspired by Menorca. Their handler has six in-game days to guide them through three interconnected major operations, secure $500,000, manage injuries and police heat, and reach the final airfield together.

## What changed in version 3

- Rebuilt with Next.js 16.3 (satisfying the plan's Next.js 15+ requirement), React 19.2, TypeScript, and Tailwind CSS.
- Alex and Maya now run a deterministic autonomous field loop in ordinary browsers, even when WebMCP is unavailable.
- Routine travel, mission selection, loadouts, meal purchases, rest, sleep, vehicle choice, and recovery are managed by the field team.
- Consequential mission branches and final extraction authorization always pause for the human handler.
- Alex and Maya use distinct operational priorities and visible character portraits.
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

1. Enter the human handler's name. Field autonomy starts enabled and can be paused from the team panel.
2. Alex runs **First Light**, driving the team from Solara Airport to Hotel Aster.
3. Answer the hotel call to deliver the $500,000 / six-day objective and unlock the mission network.
4. Alex and Maya prepare, travel, and choose work according to the handler directive and their current needs.
5. At consequential scenes, the AI pauses and the human handler chooses the strategy.
6. The team resumes autonomously, purchases meals, rests, sleeps, and replans after each outcome.
7. At $500,000, relay an extraction directive; the team lowers heat, reaches Santoro Airstrip, and escapes.

## WebMCP

The application feature-detects `document.modelContext.registerTool()` and registers 18 structured actions:

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
- `get_agent_intention`
- `set_agent_autonomy`
- `request_handler_decision`
- `attempt_escape`

Tool calls go through the same engine and state object as the React UI. Their activity appears in the visible agent feed.

## Structure

```text
app/                 Next.js App Router entry and global Tailwind styles
components/          React game UI
game/engine.ts       Shared rules and structured scene runner
game/autonomy.ts     Alex and Maya's deterministic field-team planner
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
