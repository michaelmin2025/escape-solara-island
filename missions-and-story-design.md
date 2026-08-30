# Escape Solara Island — Content Design: Missions, Story, and Handler Decisions

Companion to `escape-solara-island-hackathon-plan.md`. This doc is written to be
handed directly to a coding agent: everything here is meant to become **data**,
not hardcoded logic. Keep missions and decisions in content files (e.g.
`content/missions.ts`, `content/decisions.ts`) and make the engine interpret them.

---

## 1. Story arc (six days)

**Premise glue:** the $500K and the escape are one story. **Dahlia Marchand**,
the island's discreet fixer-in-chief, owns the only charter plane leaving Solara
Key on Day 6 night. She will not take strangers. The deal: Alex and Maya work
her island, hand her **$500,000**, and she puts them on that plane with clean
papers. The pistol she gifts them is an investment, not kindness. This makes the
airfield access diegetic — the escape is *earned* from the same person who gives
the objective.

### Day 1 — Strangers on the island
- 09:12 — Opening call to the handler (script in the plan). Passports gone, no money, one old sedan.
- Explore: Hotel (cover/base), Nightclub. Bartender tips them to **Kiko**, the nightclub fixer.
- Kiko: "Nobody meets Dahlia. People get *brought* to Dahlia." He names the price of an introduction — a job that makes noise or a job that makes discretion.
- **DECISION 1 — The Introduction** (see §5).
- Evening: drive to the Client Mansion. Dahlia meeting (scripted, no risk): pistol, $500K objective, the plane deadline. Maya mistrusts her; Alex wants the gun.

### Day 2 — Small work, big mouth
- Entry jobs open: Street Race, Poker Game, Repo Job, Contraband Delivery.
- Meet **Bruno** at the Marina (vehicle upgrade path).
- First police chase tutorial — heat meter explained in-fiction by a news radio line.
- Optional: **DECISION 2 — Poker Game** (accused of cheating) if played.

### Day 3 — Real money
- Corporate Job and Smuggling Run open (reputation-gated).
- Tip from Dahlia or Bruno reveals a **smuggler's cache in the Mountains** → shotgun.
- Optional: **DECISION 3 — Corporate Job lobby lockdown**; **DECISION 4 — Checkpoint** during a delivery/smuggling run.

### Day 4 — The crackdown
- **Capitana Ruiz** announces a task force. Checkpoint frequency up, heat decays slower.
- **DECISION 5 — The Crackdown** (strategic, not mission-tied).
- Armored Car Job opens. Rival crew **The Coral Boys** (Tavo) start interfering — ambush travel encounter.
- **DECISION 6 — Tavo's Offer** (recommended if time allows).

### Day 5 — The big score
- Solara Grand Casino Heist becomes available.
- **DECISION 7 — Heist Plan** (choose approach before starting).
- Dahlia calls: a storm is coming; the departure window may move. Foreshadows Day 6 compression.
- SMG obtainable (Tavo's deal, armored car reward, or bought from Dahlia's armorer).

### Day 6 — The window
- Storm confirmed: **Dahlia's plane now leaves 20:00, not midnight.**
- **DECISION 8 — Push or Run** (soft/directive decision, no modal needed).
- Escape prep: reach the airfield with ≥ $500K. Fuel/gate micro-event optional.
- **DECISION 9 — The Last Roadblock** (finale, always fires on escape route).
- Escape → final screen (stats per the plan). Miss the window → loss screen with one last radio call from Maya (emotional button for judges).

---

## 2. NPCs and contacts (all original)

| NPC | Role | Location | Function |
|---|---|---|---|
| **Dahlia Marchand** | Major client | Client Mansion | Objective giver, pistol, plane seats, armorer (sells SMG late-game) |
| **Kiko** | Nightclub fixer | Nightclub | Job broker; gates Poker, Repo, Corporate |
| **Bruno** | Marina mechanic | Marina | Vehicle sales/upgrades, cache tip |
| **Tavo** | Coral Boys crew chief | Docks | Rival; ambusher or heist partner depending on Decision 6 |
| **Capitana Ruiz** | Police task force | (radio/news presence) | Face of the heat system; final roadblock |

Contacts are flavor + gating flags in state, not full dialogue systems. One
`interact(character, npc)` call per story beat is enough.

---

## 3. Missions

Payouts match the plan's ranges exactly. Two pre-client missions (Race, Repo)
are available on Day 1 so the agent has something to do before the pistol, and
seed cash for food. Small jobs are **repeatable with −20% payout per repeat**
(safety valve so $500K is always reachable even after failures).

| # | Mission | Location | Opens | Duration | Payout | Risk | Requirements |
|---|---|---|---|---|---|---|---|
| M1 | **Sunset Street Race** | Beach loop | Day 1 | 1.5h | $50–80K | Medium | None (Alex drives) |
| M2 | **Repo Job** (steal a marked luxury car) | Hotel valet | Day 1–2 | 2h | $75–100K | Medium | Kiko contact |
| M3 | **Private Poker Game** | Hotel back room | Day 2 | 2h | $40–70K | Low/Med | Maya plays; branch D2 |
| M4 | **Contraband Delivery** | Marina → Docks | Day 2 | 2.5h | $50–100K | Medium | Bruno; branch D4 |
| M5 | **Corporate Job** (resort data exfiltration) | Industrial District tower | Day 3 | 3h | $75–125K | Medium | Kiko rep 2; branch D3 |
| M6 | **Smuggling Run** (night boat handoff) | Docks | Day 3 | 4h | $125–180K | High | Pistol, rep 3; branch D4 |
| M7 | **Armored Car Job** | Coastal highway | Day 4 | 4h solo / 2.5h team | $100–150K | High | Pistol + sports car or SUV |
| M8 | **Smuggler's Cache** (weapon unlock) | Mountains | Day 3, after tip | 2h | $0 → **Shotgun** | Low/Med | Tip (Bruno or Dahlia) |
| M9 | **Casino Heist** (Solara Grand) | Casino node (new, on the Downtown strip) | Day 5 | 5h | $200–300K | Extreme | SMG **or** Tavo deal; branch D7 |
| M10 | **Last Chance** (desperation job) | Docks | Day 6 morning, only if cash < $500K | 2h | $60–90K | High | None |
| M11 | **Airfield Gate Job** (escape prep, optional) | Airfield | Day 6 | 1h | $0 | Medium | Pays off in the finale: removes one roadblock option / improves escape odds |

### Team bonus (standard formula, per the plan's example)
Working together: success +25–30 points combined, duration ×0.6, risk one tier
lower. Armored Car example numbers from the plan (55% solo → 82% team) are the
reference tuning point.

### Suggested success-modifier weights (transparent, additive)
Base by risk tier: Low 60 / Medium 50 / High 42 / Extreme 35.
Then: Alex present +10, Maya present +10, both healthy (>70) +10, weapon tier
(pistol +8, shotgun +14, SMG +18, rifle +22), correct vehicle +7, energy <30
−12, hunger >70 −8, heat ≥4 stars −10. Clamp 5–95. The AI can read these
factors from `inspect_mission` before committing — that readability **is** the
strategy game.

### Failure consequences (never instant game-over)
One or two of: health −10–25 (random split across present characters), heat +1
star, vehicle damage tier, time lost (half mission duration), $10–30K lost if
it was a buy-in job, mission locked for 12h. Corporate/Heist failure also drops
reputation one step (affects future unlocks).

---

## 4. Weapons, vehicles, money sinks

Cash otherwise only accumulates, so the economy needs sinks or the $500K
threshold becomes trivial after Day 3.

**Weapons** (rare progression, per the plan):
1. None → 2. **Pistol** — gifted by Dahlia (Day 1, scripted) → 3. **Shotgun** — Mountains Cache (M8) or Smuggling Run reward → 4. **SMG** — Tavo's deal / armored car reward / **$40K from Dahlia's armorer** → 5. Assault rifle — one late reward or $90K (endgame sink, optional).

**Vehicles** (Bruno's Marina garage):
1. Old sedan (start) → 2. Sports car **$45K** (fast, flashy: +heat gain) → 3. SUV **$70K** (required-edge for M6/M7, durable, low heat) → 4. Escape runner **$120K or earned** (endgame; reduces final roadblock risk).

**Other sinks:** food ($20–100), bribes ($30K in Decision 5), Tavo payoff
($25K), vehicle repairs. Target: an aggressive run spends $150–250K on the way
to $500K. **The win condition is *holding* $500K at the airfield, not earning
$500K cumulatively** — sinks create the real tension.

---

## 5. Handler decisions

Design rules (keep the plan's "use sparingly" promise):
- Every option is a real tradeoff (time vs. money vs. heat vs. health vs. team integrity). No strictly dominant option.
- Alex and Maya each argue for a different option, in character, addressed to the handler **by name**. The modal is framed as an **incoming call** — it reinforces the handler fantasy.
- Each decision echoes later (a cheap choice on Day 1 should resurface on Day 5).
- Cap: at most one modal decision per in-game day. Full run ≈ 5–7 decisions.

**Shipping tiers:** Tier 1 = must ship (4). Tier 2 = ship if time (3). Tier 3 =
directive-flavored, no modal (2).

---

### D1 — The Introduction *(Tier 1 — Day 1)*
*Kiko: "So how do you want to meet the lady? Loud or quiet?"*
- **A — Make noise:** win the Sunset Street Race in Dahlia's honor. Fast, +reputation, heat +1 star, small purse.
- **B — Do the quiet repo job** for her lieutenant. +1 day slower, no heat, cleaner reputation with Dahlia (unlocks her armorer discount).
- **C — Spend their last $5K** bribing the maître d' at her dinner party. Instant meeting, no reputation, Dahlia's trust starts lower (armorer prices +10%).

*Echo:* A raises Day-4 crackdown intensity; B gives the armorer discount; C lowers Dahlia's Day-5 storm warning by a few hours (less notice).

### D2 — Accused at the Poker Table *(Tier 2 — Day 2, M3 mid-mission)*
*The pit boss says Maya's wrist did something funny.*
- **A — Maya talks her way out** (negotiation): needs energy ≥ 40. Success keeps the pot; failure = health −15, tossed out, mission locked 12h.
- **B — Alex tips a bartender glass, everyone looks left** (distraction): +1h, low risk, leave with half the pot.
- **C — Flip the table** (Alex): keep full pot, heat +1, health −10–20, reputation +1 (street cred unlocks a better race purse later).

### D3 — Lobby Lockdown *(Tier 1 — Day 3, M5 mid-mission — the plan's canonical branch)*
*Security seals the east entrance. 40 floors to go.*
- **A — Split:** Alex causes a scene in the lobby while Maya takes the service elevator. Faster (+1h saved), but **who carries the pistol?** Sub-prompt: give the weapon to Alex (distractor is the one who gets caught) or Maya (infiltrator is the one who gets found). Whomever goes unarmed fails their half on a bad roll.
- **B — Stay together**, enter through the parking garage. Slower (+1.5h), success uses the team bonus, no split risk.
- **C — Abort.** Lose the job, reputation −1, keep the day.

### D4 — Checkpoint on the Coast Road *(Tier 1 — Day 2–3, M4/M6 travel branch — the plan's example)*
*Lights in the mirror. The trunk is not empty.*
- **A — Punch through:** fast, vehicle damage risk, heat +1–2.
- **B — Mountain detour:** +1.5h, breakdown risk (sedan rolls badly), no heat.
- **C — Abort the delivery:** lose the payout, partial cargo penalty ($10K), mission locked 12h.

### D5 — The Crackdown *(Tier 1 — Day 4, strategic)*
*Ruiz puts a bounty on "two out-of-towners." Radio names the Hotel district.*
- **A — Lay low 12h** at the safehouse: heat −2, energy full, but a third of the best earning day is gone.
- **B — Bribe the desk sergeant ($30K):** heat −1 now and checkpoints skip the team for 24h.
- **C — Keep working hot:** no cost, but every mission while the crackdown lasts takes −10% success and +1 heat on failure.

### D6 — Tavo's Offer *(Tier 2 — Day 4, after ambush encounter)*
*Tavo, leaning on the sedan's hood: "You're paying me one way or another."*
- **A — Pay him off ($25K):** clean, but he remembers they're easy marks (repeat toll $10K on future dock jobs).
- **B — Fight:** health −15–25, heat +1, reputation +1; Coral Boys stop ambushing travel for the rest of the run.
- **C — Take the deal:** Tavo's crew backs the Casino Heist — heist success +15 and an extra gun (SMG now), but heist payout −20% ($40–60K). Makes the finale easier, the goal harder.

### D7 — Heist Plan *(Tier 1 — Day 5, M9 pre-mission)*
*Three ways into the Solara Grand's cage.*
- **A — Front door, high rollers:** Maya's social play; costs $15K stake (sink), low initial heat, mid risk, standard payout.
- **B — Back of house, kitchens:** Alex's muscle; requires SMG, combat risk (health), high risk, +10% payout.
- **C — Count room at shift change:** requires the M5 corporate data (interconnection!), extreme risk, +20% payout, heat +2 on success. Only available if M5 succeeded.

### D8 — Push or Run *(Tier 3 — Day 6 morning, directive-flavored)*
No modal. Dahlia calls: storm moved the plane to 20:00. The game just shortens
the clock and Maya sends one line to the handler: *"Michael, we going now or
going rich?"* The agent re-plans from the directive. Judges see the AI adapt to
a changed constraint — that's the demo.

### D9 — The Last Roadblock *(Tier 1 — finale, always fires en route to the airfield)*
*Ruiz's last roadblock, 2 km from the runway. Headlights off.*
- **A — Run it:** fast; vehicle damage (may strand them pre-runway if car already damaged), heat irrelevant after wheels-up.
- **B — Beach track:** +45 min against the 20:00 deadline; car-dependent; no violence.
- **C — Split at the end:** Alex runs the roadblock loud as bait while Maya hikes the money through the hills. Both must arrive. Tensest option; if Maya's energy < 25 she doesn't make the window.
- M11 (Airfield Gate Job) removes option A's damage risk / adds a fourth quiet option "the gate guard is paid" if completed.

---

## 6. Heat & news flavor (cheap immersion)

Heat is 5 stars. Gains: missions (+1, +2 high tier), chases, flashy car.
Decay: full sleep (−1), laying low (−2), bribes. ≥4 stars: −10% mission success
and checkpoint frequency doubles.

One news radio headline per day-transition (single line, big flavor payoff):
- D1: "Tourism board insists the island is *perfectly safe*."
- D2: "Unlicensed poker room robbed; pit boss describes 'a very polite woman.'"
- D3: "Verde Resort denies its data was for sale. It was."
- D4: "Capitana Ruiz: 'Nobody escapes Solara Key on my watch.'" (crackdown)
- D5: "Storm Celina strengthens; marina ordered cleared by tomorrow evening."
- D6: "Airport operations confirm one charter departing before the storm line."

## 7. Voice guide (short)

- **Alex:** blunt, protective, all-in instinct. "Tell me where to point the car."
- **Maya:** measured, suspicious, reads rooms. "Nothing on this island is free, Michael."
- **Dahlia:** silky, transactional. "Everyone leaves Solara Key broke or bought. You're choosing *bought*."
- **Kiko:** fast talker, broker slang. **Bruno:** few words, honest prices. **Tavo:** friendly menace. **Ruiz (radio):** clipped, official.
- Address the handler by entered name in every call/modal — it's the cheapest immersion win in the whole build.

## 8. Economy sanity check (three viable paths)

| Path | Days 1–2 | Day 3 | Day 4 | Day 5 | Total |
|---|---|---|---|---|---|
| **Sprinter** (risky) | Repo $85K + Race $65K | Smuggling $150K | Armored Car $125K | Heist (Tavo deal, −20%) $200K | ≈ $625K − sinks |
| **Steady** | Poker $55K + Contraband $75K | Corporate $100K + Cache | Armored Car $125K + Contraband rpt $60K | Heist plan A $250K | ≈ $665K − sinks |
| **Grinder** (repeats) | Race $65K + Race rpt $52K | Contraband $75K + Repo rpt $68K | Smuggling $150K | Last Chance + Armored Car | ≈ $570K − sinks |

All three land above $500K after realistic sinks ($100–250K) **if** mission
failures are rare; one failure per run lands a path right at the wire, which is
exactly the tension wanted. Repeatable small jobs guarantee the Grinder path
can't be hard-stuck.

## 9. Implementation notes for the coding agent

- Encode missions/decisions as data (id, location, unlock conditions, duration,
  payout range, risk tier, modifiers, branch id, failure table). Engine stays
  generic; content stays editable.
- Decisions use the existing `request_handler_decision(context)` WebMCP tool;
  `choose_path(option)` resumes. While a decision is pending, the game clock is
  paused and the agent's next tool call returns a "waiting on handler" state
  rather than an error.
- The decision modal UI = incoming-call card: caller (ALEX/MAYA/BOTH), 2–3
  option buttons, each option showing its mechanical cost/benefit inline (the
  AI reads the same data via `inspect_mission` — same numbers, no cheating).
- Branch options map to enum values (`"split" | "together" | "abort"` etc.) so
  `choose_path` stays generic.
