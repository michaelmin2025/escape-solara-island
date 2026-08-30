import test from "node:test";
import assert from "node:assert/strict";
import {
  attemptEscape,
  availableMissions,
  beginHotelBriefing,
  choosePath,
  completeAirportArrival,
  driveTeam,
  eatTogether,
  equipOutfit,
  escapeReadiness,
  getObjective,
  missionCalculation,
  restTogether,
  selectOpeningMission,
  startTeamMission
} from "../game/engine";
import { executeAutonomyPlan, planAutonomyStep, selectAutonomousMission } from "../game/autonomy";
import { postCallLocations } from "../game/locations";
import { createInitialState, DEADLINE_MINUTES, restoreState, TARGET_CASH } from "../game/state";

function atHotelCall(seed = 42) {
  const state = createInitialState("Michael", seed);
  const landing = completeAirportArrival(state);
  assert.equal(landing.ok, true);
  const drive = driveTeam(state, "hotel");
  assert.equal(drive.ok, true);
  assert.equal(state.phase, "hotel-call");
  return state;
}

function legacyMissionReadyState(seed = 42) {
  const state = atHotelCall(seed);
  const briefing = beginHotelBriefing(state);
  assert.equal(briefing.ok, true);
  const selection = selectOpeningMission(state, "luxury-vehicle");
  assert.equal(selection.ok, true);

  // Preserve coverage of the established mission engine without treating the
  // new player-authored story selection as an unlock for the legacy campaign.
  state.phase = "playing";
  state.objectiveUnlocked = true;
  state.clientMet = true;
  state.flags.objectiveUnlocked = true;
  state.discoveredLocations = Array.from(new Set([...state.discoveredLocations, ...postCallLocations]));
  if (!state.inventory.weapons.includes("pistol")) state.inventory.weapons.push("pistol");
  state.characters.alex.weapon = "pistol";
  return state;
}

test("a version 5 game begins on final approach to Solara Airport", () => {
  const state = createInitialState("Michael", 1);
  assert.equal(state.version, 5);
  assert.equal(state.phase, "arrival");
  assert.equal(state.currentLocation, "airport");
  assert.equal(state.flags.airportArrivalComplete, false);
  assert.equal(state.objectiveUnlocked, false);
  assert.equal(getObjective(state).title, "Land at Solara Airport");
  assert.deepEqual(state.discoveredLocations.sort(), ["airport", "hotel"]);
  assert.match(state.dialogue[0].text, /northwest/i);
  assert.equal(state.dialogue[0].id, 1);
  assert.equal(state.dialogueSerial, 1);
  assert.equal(state.dialogueReadId, 1);
});

test("arrival blocks field actions until the aircraft lands", () => {
  const state = createInitialState("Nora", 2);

  const drive = driveTeam(state, "hotel");
  assert.equal(drive.ok, false);
  assert.match(drive.message, /aircraft must land/i);

  const meal = eatTogether(state, "quick");
  assert.equal(meal.ok, false);
  assert.match(meal.message, /aircraft must land/i);

  const mission = startTeamMission(state, "airport-to-hotel");
  assert.equal(mission.ok, false);
  assert.equal(state.currentLocation, "airport");
  assert.equal(state.phase, "arrival");
});

test("completeAirportArrival lands once and opens the airport-to-hotel route", () => {
  const state = createInitialState("Nora", 2);
  const result = completeAirportArrival(state);

  assert.equal(result.ok, true);
  assert.match(result.message, /landed at Solara Island Airport/i);
  assert.equal(state.phase, "playing");
  assert.equal(state.flags.airportArrivalComplete, true);
  assert.equal(state.currentLocation, "airport");
  assert.deepEqual(state.dialogue.slice(-2).map((line) => line.speaker), ["ALEX", "MAYA"]);
  assert.deepEqual(state.dialogue.slice(-2).map((line) => line.id), [2, 3]);
  assert.equal(state.dialogueSerial, 3);
  assert.equal(state.dialogueReadId, 1);
  assert.match(state.dialogue.at(-2)?.text ?? "", /Hotel Aster/);
  assert.match(state.dialogue.at(-1)?.text ?? "", /handler/i);

  const dialogueLength = state.dialogue.length;
  const duplicate = completeAirportArrival(state);
  assert.equal(duplicate.ok, false);
  assert.equal(state.dialogue.length, dialogueLength);
});

test("airport-to-hotel uses neutral check-in dialogue and pauses for the handler call", () => {
  const state = createInitialState("Nora", 3);
  completeAirportArrival(state);
  const beforeMissionDialogue = state.dialogue.length;
  const result = driveTeam(state, "hotel");

  assert.equal(result.outcome, "success");
  assert.equal(state.currentLocation, "hotel");
  assert.equal(state.flags.tutorialComplete, true);
  assert.equal(state.flags.hotelCallPending, true);
  assert.equal(state.phase, "hotel-call");
  assert.deepEqual(state.dialogue.slice(beforeMissionDialogue).map((line) => line.text), [
    "The rental is ready. Hotel Aster is our only stop.",
    "We check in, secure the room, and wait for the handler.",
    "Keep it quiet on the way in.",
    "Low profile until we know the assignment.",
    "We're checked in. The room is secure.",
    "Call the handler. We're ready for the options."
  ]);
});

test("beginHotelBriefing presents exactly three choices without legacy unlocks", () => {
  const state = atHotelCall();
  const result = beginHotelBriefing(state);

  assert.equal(result.ok, true);
  assert.equal(state.phase, "story-choice");
  assert.equal(state.flags.hotelCallPending, false);
  assert.deepEqual(state.storyChoice?.options, [
    {
      id: "luxury-vehicle",
      label: "Steal a luxury vehicle",
      description: "Take a high-end vehicle from a secure private property.",
      available: true
    },
    {
      id: "arms-deal",
      label: "Interrupt an arms deal",
      description: "Break up a weapons exchange before the transfer is completed.",
      available: true
    },
    {
      id: "drug-shipment",
      label: "Intercept a drug shipment",
      description: "Intercept a drug shipment before it leaves the docks.",
      available: true
    }
  ]);
  assert.equal(state.objectiveUnlocked, false);
  assert.equal(state.clientMet, false);
  assert.equal(state.flags.objectiveUnlocked, false);
  assert.deepEqual(state.inventory.weapons, ["none"]);
  assert.equal(state.characters.alex.weapon, "none");
  assert.deepEqual([...state.discoveredLocations].sort(), ["airport", "hotel"]);
  const major = availableMissions(state, true).filter(({ mission }) => mission.kind === "major");
  assert.equal(major.length, 0);
});

test("selectOpeningMission records the choice and pauses before new story content", () => {
  const state = atHotelCall(5);
  beginHotelBriefing(state);
  const result = selectOpeningMission(state, "arms-deal");

  assert.equal(result.ok, true);
  assert.equal(state.openingMission, "arms-deal");
  assert.equal(state.storyChoice, undefined);
  assert.equal(state.phase, "story-paused");
  assert.equal(state.handler.directive, "Interrupt an arms deal selected. Await the full briefing.");
  assert.equal(state.objectiveUnlocked, false);
  assert.equal(state.clientMet, false);
  assert.deepEqual(state.inventory.weapons, ["none"]);
  assert.match(state.dialogue.at(-1)?.text ?? "", /Hold position/i);
});

test("autonomy waits through every player-directed opening pause", () => {
  const state = createInitialState("Nora", 6);
  const arrival = planAutonomyStep(state);
  assert.equal(arrival.type, "wait");
  assert.equal(arrival.label, "FINAL APPROACH");

  completeAirportArrival(state);
  driveTeam(state, "hotel");
  const hotel = planAutonomyStep(state);
  assert.equal(hotel.type, "wait");
  assert.equal(hotel.label, "HOTEL CHECK-IN");

  beginHotelBriefing(state);
  const choice = planAutonomyStep(state);
  assert.equal(choice.type, "wait");
  assert.equal(choice.label, "AWAITING MISSION CHOICE");

  selectOpeningMission(state, "drug-shipment");
  const paused = planAutonomyStep(state);
  assert.equal(paused.type, "wait");
  assert.equal(paused.label, "AWAITING STORY DIRECTION");
});

test("major missions execute routine scenes and pause on a human decision", () => {
  const state = legacyMissionReadyState(99);
  driveTeam(state, "marina");
  const result = startTeamMission(state, "marina-job");
  assert.equal(result.ok, true);
  assert.ok(result.decision);
  assert.equal(state.currentDecision?.missionId, "marina-job");
  assert.equal(state.currentDecision?.options.length, 4);
  const blocked = driveTeam(state, "rural");
  assert.equal(blocked.ok, false);
});

test("a handler choice resolves a major mission as success, partial, or failure", () => {
  const state = legacyMissionReadyState(7);
  driveTeam(state, "marina");
  startTeamMission(state, "marina-job");
  const beforeTime = state.totalMinutes;
  const result = choosePath(state, "service-skiff");
  assert.ok(["success", "partial", "failure"].includes(String(result.outcome)));
  assert.equal(state.currentDecision, undefined);
  assert.equal(state.activeMission, undefined);
  assert.ok(state.totalMinutes - beforeTime >= 500);
  assert.ok(state.completedMissions["marina-job"]);
});

test("mission order and branch state alter transparent success factors", () => {
  const state = legacyMissionReadyState();
  const before = missionCalculation(state, "casino-job");
  state.flags.marinaContact = true;
  const after = missionCalculation(state, "casino-job");
  assert.equal(after.chance, before.chance + 6);
  assert.ok(after.factors.some((factor) => factor.label.includes("Inés")));
});

test("operative outfits visibly factor into mission success", () => {
  const state = legacyMissionReadyState();
  state.characters.alex.outfit = "summer";
  state.characters.maya.outfit = "summer";
  const summerPlan = missionCalculation(state, "casino-job");
  assert.equal(equipOutfit(state, "alex", "formal").ok, true);
  assert.equal(equipOutfit(state, "maya", "formal").ok, true);
  const formalPlan = missionCalculation(state, "casino-job");
  assert.ok(formalPlan.chance > summerPlan.chance);
  assert.ok(formalPlan.factors.some((factor) => factor.label === "Alex · Formal Wear"));
  assert.ok(formalPlan.factors.some((factor) => factor.label === "Maya · Formal Wear"));
});

test("food and safe rest restore survival resources", () => {
  const state = legacyMissionReadyState();
  state.characters.alex.hunger = 88;
  state.characters.maya.hunger = 84;
  state.characters.alex.energy = 18;
  state.characters.maya.energy = 22;
  state.cash = 5000;
  assert.equal(eatTogether(state, "restaurant").ok, true);
  assert.ok(state.characters.alex.hunger < 30);
  assert.equal(restTogether(state, 8).ok, true);
  assert.ok(state.characters.alex.energy >= 90);
});

test("autonomy purchases food using the least costly suitable meal", () => {
  const state = legacyMissionReadyState();
  state.characters.alex.hunger = 89;
  state.characters.maya.hunger = 80;
  const fullMeal = planAutonomyStep(state);
  assert.equal(fullMeal.type, "eat");
  if (fullMeal.type === "eat") assert.equal(fullMeal.meal, "restaurant");

  state.cash = 50;
  const roadMeal = planAutonomyStep(state);
  assert.equal(roadMeal.type, "eat");
  if (roadMeal.type === "eat") assert.equal(roadMeal.meal, "quick");
  executeAutonomyPlan(state, roadMeal);
  assert.equal(state.cash, 30);
  assert.ok(state.activityLog[0].title.includes("MAYA"));
});

test("autonomy feeds the team before an unsafe full sleep", () => {
  const state = legacyMissionReadyState();
  state.characters.alex.energy = 18;
  state.characters.maya.energy = 22;
  state.characters.alex.hunger = 55;
  state.characters.maya.hunger = 52;
  const plan = planAutonomyStep(state);
  assert.equal(plan.type, "eat");
  assert.match(plan.reason, /before the team sleeps/);
});

test("autonomy chooses, travels to, and starts a mission before waiting for the handler", () => {
  const state = legacyMissionReadyState(99);
  assert.equal(selectAutonomousMission(state)?.id, "marina-job");

  let safety = 0;
  while (!state.currentDecision && safety < 8) {
    const plan = planAutonomyStep(state);
    assert.notEqual(plan.type, "wait");
    executeAutonomyPlan(state, plan);
    safety += 1;
  }

  assert.equal(state.currentDecision?.missionId, "marina-job");
  const waiting = planAutonomyStep(state);
  assert.equal(waiting.type, "wait");
  assert.match(waiting.reason, /consequential decision/);
});

test("autonomy never chooses a handler branch and requires an extraction order", () => {
  const state = legacyMissionReadyState();
  driveTeam(state, "marina");
  startTeamMission(state, "marina-job");
  assert.equal(planAutonomyStep(state).type, "wait");

  state.currentDecision = undefined;
  state.activeMission = undefined;
  state.cash = TARGET_CASH;
  const holding = planAutonomyStep(state);
  assert.equal(holding.type, "wait");
  assert.match(holding.reason, /order extraction/);

  state.handler.directive = "Extract now. Get off the island.";
  const extraction = planAutonomyStep(state);
  assert.equal(extraction.type, "drive");
  if (extraction.type === "drive") assert.equal(extraction.destination, "airfield");
});

test("autonomy pauses cleanly for manual mode and terminal phases", () => {
  const manual = legacyMissionReadyState();
  manual.autonomy.enabled = false;
  assert.equal(planAutonomyStep(manual).type, "wait");

  manual.phase = "won";
  manual.autonomy.enabled = true;
  assert.equal(planAutonomyStep(manual).type, "wait");
});

test("autonomy does not schedule sleep across the final window", () => {
  const state = legacyMissionReadyState();
  state.totalMinutes = DEADLINE_MINUTES - 120;
  state.characters.alex.energy = 10;
  state.characters.maya.energy = 12;
  const plan = planAutonomyStep(state);
  assert.equal(plan.type, "wait");
  assert.match(plan.reason, /cross the final window/);
});

test("escape requires the fund, low heat, live team, airfield, and time", () => {
  const state = legacyMissionReadyState();
  state.cash = TARGET_CASH;
  state.currentLocation = "airfield";
  state.characters.alex.heat = 2;
  state.characters.maya.heat = 2;
  assert.deepEqual(escapeReadiness(state), { objective: true, cash: true, alive: true, airfield: true, heat: true, time: true });
  const escaped = attemptEscape(state);
  assert.equal(escaped.outcome, "won");
  assert.equal(state.phase, "won");

  const short = legacyMissionReadyState();
  short.currentLocation = "airfield";
  const denied = attemptEscape(short);
  assert.equal(denied.ok, false);
  assert.match(denied.message, /secure/);
});

test("version 5 state survives a localStorage round trip", () => {
  const state = legacyMissionReadyState(77);
  state.handler.directive = "Keep heat below two stars.";
  const restored = restoreState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored?.handler.directive, "Keep heat below two stars.");
  assert.equal(restored?.version, 5);
  assert.equal(restored?.autonomy.enabled, true);
  assert.equal(restored?.objectiveUnlocked, true);
});

test("dialogue read cursor survives a version 5 round trip mid-conversation", () => {
  const state = createInitialState("Nora", 88);
  completeAirportArrival(state);
  const firstCharacterId = state.dialogue.find((line) => line.speaker === "ALEX")?.id;
  assert.equal(typeof firstCharacterId, "number");
  state.dialogueReadId = firstCharacterId as number;

  const restored = restoreState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored?.dialogueSerial, 3);
  assert.equal(restored?.dialogueReadId, firstCharacterId);
  assert.deepEqual(
    restored?.dialogue
      .filter((line) => (line.id ?? 0) > (restored.dialogueReadId ?? 0) && ["ALEX", "MAYA", "HANDLER"].includes(line.speaker))
      .map((line) => line.id),
    [3]
  );
});

test("dialogue IDs keep new portrait lines unread after the 24-line history trims", () => {
  const state = createInitialState("Nora", 89);
  state.dialogue = Array.from({ length: 24 }, (_, index) => ({
    id: index + 1,
    speaker: "SYSTEM",
    text: `Archived system line ${index + 1}`,
    channel: "system" as const
  }));
  state.dialogueSerial = 24;
  state.dialogueReadId = 24;

  completeAirportArrival(state);

  assert.equal(state.dialogue.length, 24);
  assert.equal(state.dialogue[0].id, 3);
  assert.deepEqual(state.dialogue.slice(-2).map((line) => line.id), [25, 26]);
  assert.equal(state.dialogueSerial, 26);
  assert.equal(state.dialogueReadId, 24);
  assert.deepEqual(
    state.dialogue
      .filter((line) => (line.id ?? 0) > state.dialogueReadId && ["ALEX", "MAYA", "HANDLER"].includes(line.speaker))
      .map((line) => line.id),
    [25, 26]
  );
});

test("version 2 saves migrate to autonomous version 5 state with outfits", () => {
  const legacy = JSON.parse(JSON.stringify(legacyMissionReadyState())) as Record<string, unknown>;
  legacy.version = 2;
  delete legacy.autonomy;
  delete legacy.dialogueSerial;
  delete legacy.dialogueReadId;
  (legacy.dialogue as Array<Record<string, unknown>>).forEach((line) => delete line.id);
  const restored = restoreState(legacy);
  assert.equal(restored?.version, 5);
  assert.equal(restored?.autonomy.enabled, true);
  assert.equal(restored?.phase, "story-paused");
  assert.equal(restored?.flags.airportArrivalComplete, true);
  assert.equal(restored?.characters.alex.outfit, "casual");
  assert.equal(restored?.characters.maya.outfit, "summer");
  assert.ok(restored?.dialogue.every((line) => typeof line.id === "number"));
  assert.equal(restored?.dialogueSerial, restored?.dialogue.at(-1)?.id);
  assert.equal(restored?.dialogueReadId, restored?.dialogueSerial);
});
