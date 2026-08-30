# Escape Solara Island --- WebMCP Hackathon Project Plan

## 1. Project Summary

**Escape Solara Island** is a browser-based crime-strategy game designed
to demonstrate human--AI collaboration through WebMCP.

The player follows **Alex and Maya**, a couple trapped on the fictional
island of **Solara Key**. They have **six days** to make contact with a
major client, complete jobs, accumulate **\$500,000**, survive
escalating danger, and reach an airfield together before their final
flight leaves.

The human provides high-level strategy and makes important branching
decisions. An AI agent interacts with the game through WebMCP tools,
allowing it to inspect game state, travel, choose missions, manage
resources, and execute actions without needing to visually operate the
UI.

The project should capture the feel of a modern tropical crime sandbox
while using **original characters, locations, artwork, names, and
branding**.

------------------------------------------------------------------------

## 2. Hackathon Goal

Build a polished, understandable WebMCP demo that can be completed in
approximately **1--2 focused development days**.

The project is not intended to be a full open-world game. It is a
compact strategy simulation presented through an island map.

The core demonstration is:

> **Human provides intent → AI develops a plan → WebMCP lets the AI act
> → game state changes visually → human intervenes at key decisions.**

A judge should understand why WebMCP matters within the first minute of
the demo.

------------------------------------------------------------------------

## 3. Human Player Role --- The Handler

The human player is a major character inside the game world rather than
an outside observer.

At the beginning of every new game:

``` text
ESCAPE SOLARA ISLAND

Enter your name:
[ Michael ]

BEGIN
```

The entered name becomes the player's **handler identity** and is stored
in game state.

Alex and Maya know the handler by name and communicate directly with
them throughout the six-day operation.

### Opening Example

``` text
DAY 1 — 09:12

INCOMING CALL

ALEX:
"Michael, we're on Solara Key.

Our passports are gone.
We're almost out of money.

Maya says someone here might be able
to get us off this island.

We need you to tell us what to do."
```

The handler's job is to get Alex and Maya off the island.

The handler:

-   Sets strategic priorities
-   Directs Alex and Maya toward opportunities
-   Chooses how aggressively or cautiously they should operate
-   Decides whether to accept major risks
-   Makes branching mission decisions
-   Decides when Alex and Maya should rest, eat, recover, or continue
-   Influences weapon and vehicle priorities
-   Responds when Alex and Maya encounter unexpected situations
-   Ultimately directs the operation toward \$500,000 and escape

### The Handler Does Not Micromanage

The human should not manually click every movement or combat action.

Instead:

``` text
HANDLER
"Keep heat low. Find us a job worth at least $75K."

        ↓

AI PLANS FOR ALEX + MAYA

        ↓

WEBMCP ACTIONS

        ↓

ALEX + MAYA OPERATE IN THE WORLD

        ↓

IMPORTANT DECISION

        ↓

ALEX/MAYA CONTACT HANDLER

        ↓

HUMAN MAKES THE CALL
```

This relationship is the heart of the game.

### Handler in Game State

Example:

``` json
{
  "handler": {
    "name": "Michael",
    "currentDirective": "Keep heat low and prioritize high-value jobs"
  }
}
```

The handler name should appear naturally throughout the game rather than
merely on the opening screen.

------------------------------------------------------------------------

## 5. Core Premise

The game begins with Alex and Maya arriving at **Solara Island Airport**.

They do not begin with the $500,000 objective immediately.

The opening sequence establishes:

- Alex
- Maya
- Their relationship
- The island
- Driving
- Dialogue
- The handler's role
- The cellphone communication system

### Opening Mission — Airport to Hotel

The **first mission of every game** is simple:

> **Drive Alex and Maya from Solara Island Airport to their hotel.**

This acts as the tutorial mission.

The player sees Alex and Maya together for the first time.

During the drive they should talk naturally.

Example:

```text
MAYA:
"This place is bigger than I expected."

ALEX:
"We get to the hotel, sleep, and figure things out tomorrow."

MAYA:
"Assuming our contact doesn't have other plans."
```

The AI agent uses WebMCP to:

1. Inspect the world
2. Identify the hotel
3. Start the vehicle
4. Drive from the airport to the hotel
5. Respond to any simple travel event
6. Arrive at the hotel

This first mission should be low-risk and primarily introduce the game's systems.

### The Hotel Call

When Alex and Maya arrive at the hotel, the handler calls them.

This is the moment the main game begins.

Example:

```text
INCOMING CALL
MICHAEL

ALEX:
"We made it."

HANDLER:
"Good. Now listen carefully."

HANDLER:
"You need five hundred thousand dollars."

MAYA:
"Five hundred thousand?"

HANDLER:
"You have six days."
```

The handler explains the objective:

> **Obtain $500,000 within six days and prepare to leave Solara Island.**

The handler then provides Alex and Maya with **three major mission opportunities**.

These three missions form the backbone of the main game.

### Three Major Missions

Each major mission:

- Represents one major opportunity
- Takes approximately **one full in-game day**
- Contains multiple scenes
- Includes dialogue
- Includes travel
- Contains at least one major branching decision
- Can succeed, partially succeed, or fail
- Changes later mission conditions
- Pays a significant portion of the $500,000 target
- May unlock weapons, contacts, vehicles, or information
- Can create new consequences such as heat, injuries, debts, or enemies

The three missions should not be completely linear.

The handler chooses strategy, while Alex and Maya execute it.

A typical game structure:

```text
DAY 1
Airport → Hotel
Handler gives $500K objective
Choose first major mission

DAY 2
Major Mission 1

DAY 3
Major Mission 2

DAY 4
Major Mission 3

DAY 5
Recovery / side opportunities / unfinished business / final money push

DAY 6
Final preparation and escape
```

The exact schedule can shift depending on mission outcomes.

A mission can cost extra time if:

- Alex or Maya is injured
- The team takes a slower route
- The handler chooses a cautious strategy
- The vehicle is damaged
- Police heat becomes too high
- A branch creates an additional objective

### Major Mission Selection

After the hotel call, the handler presents three opportunities.

Example:

```text
HANDLER:
"I've got three ways for you to make serious money."

1. THE MARINA JOB
   High payout
   Smuggling / negotiation
   Moderate heat

2. THE CASINO JOB
   Very high payout
   Social infiltration / theft
   High risk

3. THE INDUSTRIAL JOB
   High payout
   Recovery operation
   Requires preparation
```

The player does not necessarily need to complete them in a fixed order.

Mission order can affect:

- Difficulty
- Dialogue
- Contacts
- Available equipment
- Police heat
- Character injuries
- Future branches

This creates replayability without requiring dozens of separate missions.


## 6. Design Principles

### Alex and Maya Are a Team

Most missions should be completed together.

Working together provides:

-   Faster mission completion
-   Higher success probability
-   Lower individual risk
-   Access to joint mission strategies
-   Better recovery from unexpected events

Separating them should be a **strategic exception**, not the default.

Certain missions may require them to split temporarily.

Example:

-   Alex creates a distraction.
-   Maya enters through a service entrance.
-   They reunite after completing their individual objectives.

### Human Handler Makes Important Decisions

The AI should handle routine tactical execution while Alex and Maya
remain the visible field operatives.

When a meaningful strategic choice appears, Alex and/or Maya contact the
handler directly and the game pauses for a decision.

Example:

**Security has locked down the lobby.**

-   **Option A:** Alex creates a distraction while Maya enters through
    the service elevator.
-   **Option B:** Stay together and enter through the garage.
-   **Option C:** Abandon the mission.

Alex and Maya might frame the choice directly:

``` text
MAYA:
"Michael, security closed the east entrance."

ALEX:
"I can pull them away while Maya goes upstairs."

MAYA:
"Or we stay together and use the garage."

WHAT'S THE CALL?

[A] Split up
[B] Stay together
[C] Abort
```

The handler selects the strategy, then the AI continues.

This **field team → handler → field team** handoff is one of the central
WebMCP demonstrations.

------------------------------------------------------------------------

## 7. Six-Day Structure

The entire game takes place over six in-game days.

Suggested time system:

-   Morning
-   Afternoon
-   Evening
-   Night

Actions consume time.

Examples:

  Action            Approximate Cost
  --------------- ------------------
  Short drive         30--60 minutes
  Eat                 30--60 minutes
  Small mission           1--2 hours
  Major mission           3--5 hours
  Short rest              2--3 hours
  Full sleep              6--8 hours

Time creates pressure without requiring real-time gameplay.

### World Escalation

**Day 1** - Explore island - Find contacts - Locate major client -
Receive pistol and \$500K objective

**Day 2** - Entry-level jobs - Build cash and reputation

**Day 3** - Better-paying opportunities - New contacts - Possible
weapon/vehicle progression

**Day 4** - Higher-risk missions - Increased police attention - Larger
payouts

**Day 5** - Major scores become available - Risk/reward increases
substantially

**Day 6** - Final push for remaining money - Reduce heat - Prepare
vehicle - Reach airfield - Escape

This progression should remain flexible. A strong AI strategy may
advance faster.

------------------------------------------------------------------------

## 8. Character Systems

Both characters maintain individual state.

### Alex

Potential strengths:

-   Driving
-   Physical missions
-   Intimidation
-   Street contacts
-   Combat-oriented tasks

### Maya

Potential strengths:

-   Negotiation
-   Information gathering
-   Social engineering
-   Business-oriented missions
-   Technical/infiltration tasks

### Core Stats

Each character has:

-   **Health**
-   **Energy**
-   **Hunger**
-   **Heat**
-   Optional: Reputation

Example:

``` text
ALEX
Health: 78/100
Energy: 42/100
Hunger: 63/100
Heat: ★★★☆☆

MAYA
Health: 94/100
Energy: 67/100
Hunger: 31/100
Heat: ★☆☆☆☆
```

Cash is shared.

------------------------------------------------------------------------

## 9. Food, Rest, and Health

Characters must eat and rest.

This adds resource-management strategy to the six-day deadline.

### Eating

Food costs money and time.

Example:

**Fast Food** - Cost: \$20 - Time: 30 minutes - Hunger improvement:
large - Small health recovery

**Restaurant** - Cost: \$100 - Time: 1 hour - Hunger fully restored -
Better health/energy recovery

### Rest

**Short Rest** - 2--3 hours - Moderate energy recovery - Small health
recovery

**Full Sleep** - 6--8 hours - Major energy recovery - Significant health
recovery - Possible heat reduction

Ignoring hunger or exhaustion should reduce mission success rates.

Severe exhaustion can increase health damage.

------------------------------------------------------------------------

## 10. Mission System

Missions are the primary way to accumulate \$500,000.

Possible missions:

  Mission                         Reward Risk
  --------------------- ---------------- ------------
  Street Race               \$50K--\$80K Medium
  Vehicle Theft            \$75K--\$100K Medium
  Private Poker Game        \$40K--\$70K Low/Medium
  Corporate Job            \$75K--\$125K Medium
  Contraband Delivery      \$50K--\$100K Medium
  Smuggling Run           \$125K--\$180K High
  Armored Car Job         \$100K--\$150K High
  Casino/Bank Heist       \$200K--\$300K Extreme

Mission availability can depend on:

-   Day
-   Location
-   Reputation
-   Contacts
-   Weapons
-   Vehicle
-   Character health
-   Heat
-   Previous missions

### Team Bonus

Most missions become easier when Alex and Maya work together.

Example:

``` text
ARMORED CAR JOB

Solo
Success: 55%
Duration: 4 hours
Risk: High

Alex + Maya
Success: 82%
Duration: 2.5 hours
Risk: Medium
```

------------------------------------------------------------------------

## 11. Mission Branching

Some missions should pause at major decision points.

The AI progresses until human judgment becomes useful.

Example:

``` text
POLICE HAVE BLOCKED THE MAIN ROAD.

A — Drive through the checkpoint
Fast / High risk

B — Take the mountain road
Slow / Vehicle damage risk

C — Abandon the mission
Lose opportunity / Preserve team
```

The human selects an option.

The agent then resumes execution.

This should be used sparingly so decisions feel important.

------------------------------------------------------------------------

## 12. Weapons

Weapons are **rare progression items**, not disposable store purchases.

Obtaining a weapon should feel significant.

### Suggested Progression

1.  No weapon
2.  Pistol --- provided by major client
3.  Shotgun
4.  SMG
5.  Assault rifle
6.  Optional special late-game weapon

Weapons may be obtained through:

-   Major mission rewards
-   Trusted contacts
-   Hidden caches
-   Rival encounters
-   Special objectives

### Gameplay Effect

Weapons modify mission probability rather than creating a full combat
system.

Example:

``` text
WAREHOUSE MISSION

No Weapon
Success: 35%

Pistol
Success: 55%

Shotgun
Success: 70%

Assault Rifle
Success: 82%
```

Other variables still matter:

-   Team composition
-   Health
-   Energy
-   Heat
-   Vehicle
-   Mission strategy

When Alex and Maya temporarily separate, the human may need to decide
who carries a rare weapon.

------------------------------------------------------------------------

## 13. Driving System

Driving connects the entire island.

The island map functions as a road network with locations represented as
nodes.

Possible locations:

-   Downtown
-   Hotel
-   Nightclub
-   Marina
-   Docks
-   Beach
-   Mountains
-   Safehouse
-   Client Mansion
-   Industrial District
-   Airfield

Travel consumes time.

The team's vehicle visibly moves across the map.

### Vehicle Progression

Keep the vehicle system small.

Possible tiers:

1.  Old sedan
2.  Sports car
3.  SUV
4.  High-end escape vehicle

Vehicle properties:

-   Speed
-   Durability
-   Storage
-   Attention/heat

Different missions favor different vehicles.

### Driving Encounters

Travel may trigger occasional events:

-   Police checkpoint
-   Rival ambush
-   Vehicle breakdown
-   Shortcut discovered
-   Roadblock
-   Nothing happens

Some encounters become human decision points.

------------------------------------------------------------------------

## 14. Island Map

The entire game takes place on one visual island map.

This is **not** a 3D open world.

The map provides the illusion of a larger world while keeping
implementation small.

Example structure:

``` text
                         AIRFIELD
                            |
                       MOUNTAINS
                            |
         BEACH ---- DOWNTOWN ---- CLIENT MANSION
                       |
                   NIGHTCLUB
                       |
                     HOTEL
                       |
               MARINA ---- DOCKS
```

Alex, Maya, and their vehicle should have visible map markers.

Locations can unlock as contacts and information are discovered.

------------------------------------------------------------------------

## 15. WebMCP Architecture

The visible game UI and WebMCP agent must manipulate the **same game
state**.

The AI should not need to visually inspect buttons or infer the
interface.

WebMCP exposes structured actions.

### Initial Tool Set

``` text
get_world_state()

get_team_status()

get_available_missions()

inspect_mission(missionId)

drive_team(destination)

meet_major_client()

start_team_mission(missionId)

choose_path(option)

eat_together(location)

rest_together(hours)

equip_weapon(character, weapon)

switch_vehicle(vehicle)

interact(character, npc)

request_handler_decision(context)

attempt_escape()
```

The exact number should remain small.

Prefer powerful generic tools over dozens of highly specific actions.

------------------------------------------------------------------------

## 16. Agent Activity Feed

The right side of the UI should visibly show WebMCP activity.

Example:

``` text
AGENT ACTIVITY

13:42  get_world_state

13:42  drive_team
       Downtown → Nightclub

13:43  interact
       Maya → Bartender

13:43  contact_discovered
       Major Client Lead

13:44  drive_team
       Nightclub → Mansion

13:45  meet_major_client

13:45  ITEM ACQUIRED
       Pistol
```

This is important for the hackathon demo.

A judge should be able to visually understand that the AI is operating
the application through structured tools.

------------------------------------------------------------------------

## 17. Human-Agent Interaction

The handler should be able to provide high-level instructions to Alex
and Maya such as:

> Earn \$500K without letting either character fall below 50 health.

> Play aggressively.

> Keep police heat low.

> Prioritize upgrading our weapons.

> Don't attempt the casino heist.

> We only have two days left. Take more risk.

The AI interprets the intent and uses WebMCP tools to execute a
strategy.

When a major decision appears, control returns to the human.

This creates the central interaction model:

``` text
Human Strategy
      ↓
AI Planning
      ↓
WebMCP Actions
      ↓
Game State Changes
      ↓
Strategic Decision
      ↓
Human Choice
      ↓
AI Continues
```

------------------------------------------------------------------------

## 18. Mission Success Calculation

Keep the underlying model simple and transparent.

Example:

``` text
Base Success             45%
Alex Present            +10%
Maya Present            +10%
Both Healthy            +10%
Pistol                   +8%
Correct Vehicle          +7%
Low Energy              -12%
High Heat               -10%

Final Success            68%
```

The AI can inspect these factors before deciding whether to attempt a
mission.

Failure may cause:

-   Health damage
-   Lost time
-   Increased heat
-   Vehicle damage
-   Lost money
-   Temporary mission lockout

Failure should create new strategic problems rather than immediately
ending the game.

------------------------------------------------------------------------

## 19. Win and Loss Conditions

### Win

Alex and Maya must:

-   Contact the major client
-   Accumulate at least \$500,000
-   Remain alive
-   Reach the airfield
-   Meet any acceptable heat requirement
-   Escape before the deadline

### Possible Loss Conditions

-   Day 6 deadline expires
-   Both characters become incapacitated
-   Critical escape conditions cannot be satisfied

Avoid excessive game-over states during the MVP. Failure should usually
cost resources/time rather than immediately end the run.

------------------------------------------------------------------------

## 20. MVP UI Layout

Suggested desktop layout:

``` text
┌─────────────────────────────────────────────────────────┐
│ HANDLER: MICHAEL   DAY 3 — 16:30   $218K/$500K   3 DAYS │
├───────────────┬─────────────────────────┬───────────────┤
│               │                         │               │
│ ALEX          │                         │ AGENT         │
│ Health        │      ISLAND MAP         │ ACTIVITY      │
│ Energy        │                         │               │
│ Hunger        │      🚗 Alex + Maya     │ WebMCP calls  │
│ Heat          │                         │ appear here   │
│               │                         │               │
│ MAYA          │                         │               │
│ Health        │                         │               │
│ Energy        │                         │               │
│ Hunger        │                         │               │
│ Heat          │                         │               │
├───────────────┴─────────────────────────┴───────────────┤
│ CURRENT OBJECTIVE                                      │
│ Accumulate $500,000                                    │
│ ███████████░░░░░░░░░░ $218,000                        │
├─────────────────────────────────────────────────────────┤
│ Directive to Alex + Maya: [ Keep heat low; find a big job ]│
└─────────────────────────────────────────────────────────┘
```

------------------------------------------------------------------------



## Solara Island — Menorca Inspiration

**Solara Island is a fictional island strongly inspired by Menorca, Spain.**

Menorca should provide the visual and geographic foundation for the game while Solara remains its own fictional setting. The goal is not to reproduce Menorca exactly, but to use its recognizable Mediterranean character to make the island feel coherent and believable.

### Visual Direction

Solara Island should draw inspiration from Menorca's:

- Mediterranean coastline
- Turquoise coves and beaches
- Rocky cliffs
- Dry-stone walls
- Pine-covered areas
- Rural interior roads
- Small coastal towns
- Marinas and harbors
- White and sandstone-colored buildings
- Winding roads between settlements
- Open countryside
- Resorts and hotels
- Historic-looking urban areas

The overall atmosphere should feel like a beautiful Mediterranean vacation island hiding a dangerous criminal underworld.

### Fictionalized Geography

Real Menorcan geography can inspire the overall shape and environmental variety, but locations should receive fictional names.

Solara Island can contain equivalents of:

- A primary airport
- A major eastern port city
- A western historic city
- Resort districts
- Remote northern coastline
- Southern beach coves
- Marina districts
- Industrial areas
- Rural interior roads
- Wealthy coastal estates
- Mountain/high-ground routes
- Hidden docks
- The final escape airfield

This gives the mission designers several distinct environments without requiring a huge map.

### Map Design

The custom SVG map should use **Menorca as geographic inspiration** rather than drawing a generic circular island.

The map should have:

- An elongated east–west island shape
- A primary road connecting the major population centers
- Smaller winding coastal and rural roads
- Distinct northern and southern routes
- Ports at opposite ends of the island
- Interior shortcuts
- Remote mission locations
- Beach and marina areas
- An airport near the opening hotel route

The map remains schematic rather than geographically exact.

This is useful for gameplay because the long island shape naturally creates meaningful decisions between:

- Fast main-road travel
- Slower rural routes
- Coastal routes
- Police checkpoints
- Shortcuts
- Remote mission locations

### Opening Route

The first mission should immediately establish the Mediterranean setting.

```text
SOLARA ISLAND AIRPORT
        ↓
Coastal / main road
        ↓
Alex + Maya dialogue
        ↓
Hotel district
        ↓
HOTEL
        ↓
Handler phone call
        ↓
$500,000 / six-day objective
```

During the drive, the player should see the island for the first time through the map, environmental art, dialogue, and location descriptions.

Alex and Maya can comment on the contrast between the island's vacation atmosphere and the situation they have entered.

### Art Direction

Location artwork and backgrounds should reinforce the Menorca-inspired identity.

Potential visual references for original game art:

```text
Mediterranean airport
white coastal hotel
turquoise cove
limestone cliffs
Mediterranean marina
old stone streets
rural island road
pine forest
luxury coastal villa
industrial harbor
remote beach
historic port
```

All final game assets should remain original or appropriately licensed.

Do not use copyrighted tourism photography as permanent game assets unless its license explicitly permits the intended use.

### Mission Design Opportunities

The Menorca-inspired geography should directly influence missions.

Examples:

**Marina Mission**
- Luxury yachts
- Harbor contact
- Smuggling branch
- Boat-related escape option

**Rural Mission**
- Narrow interior roads
- Isolated property
- Low police presence
- Vehicle breakdown risk

**Old City Mission**
- Dense streets
- Social/infiltration gameplay
- Difficult vehicle escape

**Northern Coast Mission**
- Remote cliffs
- Hidden dock
- Long travel time
- Low surveillance

**Southern Resort Mission**
- Hotels
- Wealthy targets
- Tourists
- Security
- Social engineering

The island itself should therefore become part of the strategy rather than merely serving as a background.

### Fictional Setting Rule

Use Menorca as **inspiration, not as the literal game world**.

The game should continue to use:

- **Solara Island** as the island name
- Fictional towns
- Fictional businesses
- Fictional hotels
- Fictional criminal organizations
- Fictional characters

This preserves creative freedom and allows roads, locations, travel times, missions, and geography to be changed whenever gameplay requires it.


## Mission Design Framework

The mission system must be designed so new missions can be created rapidly while the project evolves.

**Do not hardcode mission logic directly into UI components.**

Each mission should be primarily defined through structured data and reusable scene types.

### Mission Definition

Suggested mission structure:

```ts
type Mission = {
  id: string;
  title: string;
  summary: string;

  contact: string;
  startingLocation: string;

  estimatedHours: number;
  baseReward: number;

  requirements?: MissionRequirement[];

  scenes: MissionScene[];

  rewards: MissionReward[];
  consequences: MissionConsequence[];
};
```

### Reusable Scene Types

A mission is assembled from reusable scenes.

Possible scene types:

```text
dialogue
phone_call
drive
investigate
meet_contact
decision
skill_check
mission_action
escape
reward
consequence
```

Example:

```ts
type MissionScene =
  | DialogueScene
  | DriveScene
  | DecisionScene
  | ActionScene
  | RewardScene;
```

This lets us design missions like a sequence of building blocks.

Example:

```text
MISSION: Marina Job

Scene 1
Phone briefing

Scene 2
Drive to marina

Scene 3
Alex and Maya meet contact

Scene 4
Human decision

Scene 5A
Negotiate with captain

Scene 5B
Steal access credentials

Scene 6
Drive to docks

Scene 7
Mission execution

Scene 8
Escape

Scene 9
Reward + consequences
```

### Branching Paths

Branches should be represented as data.

Example:

```ts
type DecisionOption = {
  id: string;
  label: string;
  description: string;

  nextSceneId: string;

  effects?: {
    time?: number;
    heat?: number;
    health?: number;
    cash?: number;
    successModifier?: number;
  };
};
```

A decision might look like:

```text
MAYA:
"The guard knows something is wrong."

ALEX:
"We can pay him, scare him, or leave."

CALL MICHAEL

A — Bribe the guard
Cost: $10,000
Risk: Low

B — Threaten him
Cost: $0
Risk: High
Heat: +1

C — Abort
Reward: $0
```

Each option simply directs the mission engine to another scene.

### Mission Outcomes

Avoid binary success/failure whenever possible.

Possible outcomes:

```text
SUCCESS
PARTIAL SUCCESS
FAILURE
ABORTED
```

Example:

**Success**
- $180,000
- New contact
- No injuries

**Partial Success**
- $95,000
- Alex injured
- Heat +2

**Failure**
- No payout
- Vehicle damaged
- New police heat

This lets the story continue even when the AI or handler makes poor decisions.

### Mission Context

Later missions should be able to read previous game state.

Examples:

```text
if player owns pistol:
    unlock intimidation branch

if Maya is injured:
    disable climbing route

if heat >= 3:
    police checkpoint appears

if marina contact was saved:
    unlock boat escape option
```

This makes a small number of missions feel interconnected.

### Mission Authoring Goal

A new mission should ideally be creatable by:

1. Adding one mission data file
2. Writing dialogue lines
3. Defining scene order
4. Defining decision options
5. Adding rewards and consequences
6. Adding any new portrait assets

The game engine should handle the rest.

Suggested folder structure:

```text
game/
  missions/
    airport-to-hotel.ts
    marina-job.ts
    casino-job.ts
    industrial-job.ts

  dialogue/
    airport.ts
    hotel-call.ts
    marina.ts
    casino.ts
    industrial.ts

  characters/
    alex.ts
    maya.ts
    contacts.ts
```

### Mission Design Template

Use this template whenever creating a new major mission:

```text
MISSION NAME:

Narrative Goal:

Estimated Duration:

Starting Location:

Primary Contact:

Main Reward:

Secondary Reward:

Requirements:

OPENING
- Phone call/dialogue
- Why Alex and Maya are doing this

TRAVEL
- Destination
- Character dialogue
- Possible encounter

PHASE 1
- Initial objective

DECISION 1
A:
B:
C:

PHASE 2A:
PHASE 2B:
PHASE 2C:

DECISION 2 (optional)

CLIMAX

ESCAPE / EXIT

OUTCOMES
Success:
Partial:
Failure:

STATE CHANGES
Cash:
Heat:
Health:
Energy:
Weapons:
Vehicle:
Contacts:
Unlocked Missions:

FOLLOW-UP DIALOGUE:
```

This template should let us design the three major missions one at a time as development continues.

---

## 21. Technical Scope


## Tech Stack

The project should use a deliberately small, fast-moving stack optimized for a 1–2 day hackathon build.

### Frontend Framework

**Next.js 15+ with the App Router**

Use Next.js as the main application framework.

Why:

- Fast project setup
- Easy deployment to Vercel
- Strong React and TypeScript support
- Simple routing if additional screens are added
- Good fit for a browser-based WebMCP demo
- Familiar development workflow

The game should remain primarily client-side for the MVP.

### Language

**TypeScript**

Use TypeScript across the project.

Why:

- Strong typing for game state
- Safer WebMCP tool schemas
- Easier reasoning about missions, characters, locations, inventory, and events
- Better maintainability as game systems expand

### UI

**React**

React manages:

- Game state
- Character status
- Mission cards
- Handler decisions
- Map interactions
- Agent activity feed
- Dialogue
- Game progression

### Styling

**Tailwind CSS**

Use Tailwind for layout and styling.

Optional:

**shadcn/ui**

Use shadcn components only where they save development time, such as:

- Dialogs
- Buttons
- Progress bars
- Cards
- Inputs
- Alerts

Do not spend significant time building a complex design system.

### Game State

For the MVP, use **React state** or a small lightweight state store.

Recommended starting option:

```text
React useState / useReducer
```

If the game state becomes difficult to manage:

```text
Zustand
```

Suggested global state structure:

```ts
type GameState = {
  handler: HandlerState;
  day: number;
  hour: number;
  cash: number;
  targetCash: number;

  alex: CharacterState;
  maya: CharacterState;

  vehicle: VehicleState;
  inventory: InventoryState;

  currentLocation: LocationId;
  discoveredLocations: LocationId[];

  availableMissions: Mission[];
  completedMissions: string[];

  currentDecision?: DecisionState;
  escaped: boolean;

  activityLog: ActivityEntry[];
};
```

Avoid Redux for the hackathon unless the project unexpectedly grows large enough to justify it.

### WebMCP

Use the browser's **WebMCP imperative API**.

Core pattern:

```ts
document.modelContext.registerTool({
  name: "get_world_state",
  description: "Returns the current Escape Solara Island game state.",
  inputSchema: {},
  execute: async () => {
    return getCurrentGameState();
  }
});
```

WebMCP tools should operate on the exact same state used by the visible React UI.

Do not create a separate simulation specifically for the AI.

The agent and human interface must interact with one shared world.

Priority WebMCP tools:

```text
get_handler_state
get_world_state
get_available_missions
drive_team
meet_major_client
start_team_mission
eat_together
rest_together
request_handler_decision
attempt_escape
```

Additional tools can be added only when required by gameplay.

### AI Interaction

The AI agent represents the operational intelligence controlling Alex and Maya.

The human remains their in-world contact/handler.

The AI should:

- Read the current world state through WebMCP
- Interpret the handler's directive
- Choose appropriate actions
- Move Alex and Maya around the map
- Execute routine mission actions
- Manage health, hunger, energy, heat, and time
- Pause when a consequential decision requires the handler

The AI should not require direct knowledge of the React component tree or manually search the UI for buttons.

### Map

Use a custom **SVG island map** rendered directly inside React.

The SVG should be designed as a fictionalized, simplified interpretation of **Menorca, Spain**, preserving its elongated Mediterranean-island character while allowing roads and locations to be repositioned for gameplay.

The map should contain:

- Roads
- Location nodes
- Alex/Maya marker
- Vehicle marker
- Locked/discovered locations
- Basic route animation

Avoid using Google Maps, Mapbox, or any real-world mapping API.

Solara Island is fictional, so a custom SVG gives complete control and avoids unnecessary dependencies.

### Driving Animation

Use simple browser animation.

Recommended options:

- CSS transitions
- SVG path animation
- `requestAnimationFrame` if required

Do not add a game engine solely for vehicle movement.

The vehicle marker only needs to visibly travel between map nodes.

### Persistence

For the first version:

**No database is required.**

Use:

```text
React state
```

Optional:

```text
localStorage
```

for:

- Saving the current run
- Remembering handler name
- Reload recovery

A database can be added later if persistence becomes useful.

### Backend

Avoid creating a traditional backend unless absolutely necessary.

The MVP should preferably run as:

```text
Next.js
    ↓
React game state
    ↓
WebMCP
```

Possible Next.js API routes may be added for limited functionality, but they should not become a core dependency.

### Hosting

**Vercel**

Deploy the public game using Vercel.

Reasons:

- Fast Next.js deployment
- Automatic builds from GitHub
- Preview deployments
- HTTPS by default
- Easy public demo URL

Suggested structure:

```text
GitHub
escape-solara-island
        ↓
Vercel
        ↓
Public Hackathon Demo
```

### Source Control

**GitHub**

Repository:

```text
escape-solara-island
```

The repository must be suitable for public viewing.

Include:

```text
README.md
LICENSE
.gitignore
```

Recommended license:

```text
MIT
```

Never commit:

```text
.env
API keys
private credentials
personal tokens
private assets
```

### Testing

Keep testing lightweight.

Minimum checks:

- Game starts successfully
- Handler name entry works
- Alex and Maya can travel
- Missions modify state correctly
- Hunger/energy/health update correctly
- Client encounter unlocks objective
- $500K can be reached
- Escape conditions work
- WebMCP tools expose correct state
- Agent actions update the visible UI
- Human decision checkpoints pause progression correctly
- Reset starts a clean run

Automated tests are optional for the hackathon unless they save time.

### Development Tools

Recommended:

```text
VS Code
GitHub
Chrome
Chrome DevTools
Vercel
```

Use a compatible Chrome build with WebMCP enabled during local testing.

### Proposed Project Structure

```text
escape-solara-island/
│
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
│
├── components/
│   ├── Game.tsx
│   ├── IslandMap.tsx
│   ├── CharacterCard.tsx
│   ├── MissionPanel.tsx
│   ├── HandlerDecision.tsx
│   ├── AgentActivityFeed.tsx
│   ├── ObjectiveBar.tsx
│   └── DialoguePanel.tsx
│
├── game/
│   ├── state.ts
│   ├── missions.ts
│   ├── locations.ts
│   ├── characters.ts
│   ├── vehicles.ts
│   ├── events.ts
│   └── engine.ts
│
├── webmcp/
│   ├── registerTools.ts
│   ├── worldTools.ts
│   ├── missionTools.ts
│   └── handlerTools.ts
│
├── types/
│   └── game.ts
│
├── public/
│   └── assets/
│       ├── portraits/
│       ├── locations/
│       └── ui/
│
├── README.md
├── LICENSE
├── package.json
└── tsconfig.json
```

### Stack Summary

```text
Framework        Next.js 15+
UI               React
Language         TypeScript
Styling          Tailwind CSS
Components       shadcn/ui when useful
State            React state / useReducer
Optional State   Zustand
Agent Interface  WebMCP
Map              Custom SVG
Persistence      Local state / optional localStorage
Backend          None for MVP
Hosting          Vercel
Repository       GitHub
License          MIT
Browser Testing  Chrome with WebMCP support
```

### Explicitly Out of Scope

Do not introduce these technologies during the hackathon unless the game absolutely requires them:

- PostgreSQL
- Supabase
- Firebase
- AWS
- Kubernetes
- Docker infrastructure
- Microservices
- Redis
- GraphQL
- Unity
- Unreal Engine
- Three.js
- Multiplayer networking
- Authentication
- Complex backend services

Every added technology creates integration risk.

For the MVP, the preferred architecture is intentionally simple:

```text
HUMAN HANDLER
      ↓
AI AGENT
      ↓
WEBMCP
      ↓
NEXT.JS / REACT GAME
      ↓
SHARED GAME STATE
      ↓
VISIBLE SOLARA ISLAND WORLD
```


## 22. 48-Hour Build Plan

### Phase 1 --- Core State

Implement:

-   Six-day clock
-   Alex state
-   Maya state
-   Shared cash
-   Shared inventory
-   Objective progression
-   Game reset

**Checkpoint:** game state can be changed and rendered reliably.

### Phase 2 --- Island and Driving

Implement:

-   Island map
-   Location nodes
-   Team marker
-   Vehicle marker
-   Travel
-   Time cost
-   Basic travel animation

**Checkpoint:** Alex and Maya can visibly travel around the island.

### Phase 3 --- Client and Main Objective

Implement:

-   Initial investigation
-   Client location unlock
-   Client encounter
-   Pistol reward
-   \$500,000 objective unlock

**Checkpoint:** complete opening sequence works.

### Phase 4 --- Missions

Implement approximately 6--8 missions.

Each mission needs:

-   Location
-   Duration
-   Reward
-   Risk
-   Requirements
-   Success calculation
-   Failure consequences

**Checkpoint:** player can realistically reach \$500K through multiple
strategies.

### Phase 5 --- Survival Systems

Implement:

-   Hunger
-   Energy
-   Health
-   Eating
-   Sleeping/rest
-   Mission penalties

**Checkpoint:** ignoring character needs materially affects strategy.

### Phase 6 --- Weapons and Vehicles

Implement:

-   Pistol
-   2--3 additional weapon unlocks
-   2--3 vehicle upgrades
-   Mission modifiers

**Checkpoint:** progression visibly improves capability.

### Phase 7 --- WebMCP

Expose game actions through WebMCP.

Priority tools:

1.  `get_world_state`
2.  `get_available_missions`
3.  `drive_team`
4.  `meet_major_client`
5.  `start_team_mission`
6.  `eat_together`
7.  `rest_together`
8.  `attempt_escape`

Add additional tools only if necessary.

**Checkpoint:** an AI agent can complete the basic game loop without
operating the visible UI.

### Phase 8 --- Human Decisions

Implement 2--3 missions containing branching strategic choices.

Pause agent progression until human selects an option.

**Checkpoint:** demo clearly shows human → agent → human collaboration.

### Phase 9 --- Polish

Add:

-   Agent activity feed
-   Objective progress
-   Mission notifications
-   Weapon acquired presentation
-   Day transitions
-   Final escape screen
-   Reset button
-   Responsive layout

**Checkpoint:** a new viewer understands the game without explanation.

------------------------------------------------------------------------

## 23. Demo Scenario

Design the submission around a short, reliable demo.

### Opening

Human tells agent:

> Get us off this island. Keep Alex and Maya together and avoid
> unnecessary risk.

### Agent

1.  Inspects world
2.  Follows lead
3.  Drives to nightclub
4.  Finds client information
5.  Drives to mansion
6.  Meets major client
7.  Receives pistol
8.  Receives \$500K objective

### Midgame

Agent:

1.  Inspects available missions
2.  Selects profitable team mission
3.  Drives there
4.  Begins mission
5.  Encounters strategic branch

Game pauses.

Human chooses:

> Take the mountain route.

Agent continues.

Mission succeeds.

Cash increases.

### Later

Show:

-   Weapon progression
-   Food/rest decision
-   Health management
-   Higher-risk mission
-   Vehicle progression

### Finale

Agent reaches \$500K.

Alex and Maya drive to airfield.

Agent calls escape.

Final screen:

``` text
ESCAPE SOLARA ISLAND

ESCAPED SOLARA KEY

Handler: Michael
Day: 6
Final Cash: $527,000
Missions Completed: 9
Failed Missions: 1
Final Heat: ★★☆☆☆
Time Remaining: 2h 25m
```

------------------------------------------------------------------------

## 24. Hackathon Pitch

### One-Line Pitch

**A crime-strategy game where a human sets the plan and an AI agent
plays the world through WebMCP.**

### Short Pitch

**Escape Solara Island** puts two characters on an island with six days
to earn \$500,000 and escape. Instead of controlling every action
manually, the human provides strategic direction while an AI agent uses
WebMCP to understand and operate the game directly. The agent drives,
chooses missions, manages health and resources, and reacts to changing
conditions, while the human takes control at consequential strategic
decisions.

### Why WebMCP Matters

Without WebMCP, an agent would need to interpret the game's visual
interface and simulate UI interactions.

With WebMCP, the game explicitly exposes its available actions and
structured state.

The AI can therefore reason about the game rather than reason about
**where the buttons are**.

------------------------------------------------------------------------

## 25. Definition of Done

The hackathon MVP is complete when:

-   The game runs reliably in-browser.
-   Alex and Maya can travel together around the island.
-   Six-day time pressure works.
-   Health, energy, hunger, and heat affect gameplay.
-   The client encounter unlocks the pistol and \$500K mission.
-   At least six playable missions exist.
-   Team missions have meaningful advantages.
-   At least two missions contain human decision branches.
-   Weapons meaningfully improve mission performance.
-   At least one vehicle upgrade exists.
-   \$500K can be reached through multiple mission combinations.
-   The airfield escape sequence works.
-   WebMCP can operate the core game loop.
-   WebMCP actions are visible in an activity feed.
-   The game can be reset for repeated demos.
-   A complete demo can be shown in approximately 1--3 minutes.

------------------------------------------------------------------------

## 26. Scope Rule

If a feature does not improve one of these three things, defer it:

1.  **Human--AI collaboration**
2.  **WebMCP demonstration**
3.  **The six-day \$500K strategy problem**

The goal is to **ship a memorable working game**, not build a complete
open-world game during the hackathon.