import test from "node:test";
import assert from "node:assert/strict";
import {
  answerHotelCall,
  attemptEscape,
  availableMissions,
  choosePath,
  driveTeam,
  eatTogether,
  escapeReadiness,
  getObjective,
  missionCalculation,
  restTogether,
  startTeamMission
} from "../game/engine";
import { createInitialState, restoreState, TARGET_CASH } from "../game/state";

function afterHotelCall(seed = 42) {
  const state = createInitialState("Michael", seed);
  const drive = driveTeam(state, "hotel");
  assert.equal(drive.ok, true);
  assert.equal(state.phase, "hotel-call");
  const call = answerHotelCall(state);
  assert.equal(call.ok, true);
  return state;
}

test("a new game begins at the airport with the hotel tutorial objective", () => {
  const state = createInitialState("Michael", 1);
  assert.equal(state.currentLocation, "airport");
  assert.equal(state.objectiveUnlocked, false);
  assert.equal(getObjective(state).title, "Reach Hotel Aster");
  assert.deepEqual(state.discoveredLocations.sort(), ["airport", "hotel"]);
});

test("airport-to-hotel runs as a structured tutorial and pauses for the handler call", () => {
  const state = createInitialState("Nora", 2);
  const result = startTeamMission(state, "airport-to-hotel");
  assert.equal(result.outcome, "success");
  assert.equal(state.currentLocation, "hotel");
  assert.equal(state.flags.tutorialComplete, true);
  assert.equal(state.flags.hotelCallPending, true);
  assert.equal(state.phase, "hotel-call");
  assert.ok(state.dialogue.some((line) => line.text.includes("bigger than I expected")));
});

test("the hotel call unlocks the target, pistol, island, and three major jobs", () => {
  const state = afterHotelCall();
  assert.equal(state.objectiveUnlocked, true);
  assert.equal(state.clientMet, true);
  assert.equal(state.characters.alex.weapon, "pistol");
  assert.ok(state.discoveredLocations.includes("marina"));
  const major = availableMissions(state, true).filter(({ mission }) => mission.kind === "major");
  assert.equal(major.length, 3);
  assert.ok(major.every(({ available }) => available));
});

test("major missions execute routine scenes and pause on a human decision", () => {
  const state = afterHotelCall(99);
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
  const state = afterHotelCall(7);
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
  const state = afterHotelCall();
  const before = missionCalculation(state, "casino-job");
  state.flags.marinaContact = true;
  const after = missionCalculation(state, "casino-job");
  assert.equal(after.chance, before.chance + 6);
  assert.ok(after.factors.some((factor) => factor.label.includes("Inés")));
});

test("food and safe rest restore survival resources", () => {
  const state = afterHotelCall();
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

test("escape requires the fund, low heat, live team, airfield, and time", () => {
  const state = afterHotelCall();
  state.cash = TARGET_CASH;
  state.currentLocation = "airfield";
  state.characters.alex.heat = 2;
  state.characters.maya.heat = 2;
  assert.deepEqual(escapeReadiness(state), { objective: true, cash: true, alive: true, airfield: true, heat: true, time: true });
  const escaped = attemptEscape(state);
  assert.equal(escaped.outcome, "won");
  assert.equal(state.phase, "won");

  const short = afterHotelCall();
  short.currentLocation = "airfield";
  const denied = attemptEscape(short);
  assert.equal(denied.ok, false);
  assert.match(denied.message, /secure/);
});

test("versioned state survives a localStorage round trip", () => {
  const state = afterHotelCall(77);
  state.handler.directive = "Keep heat below two stars.";
  const restored = restoreState(JSON.parse(JSON.stringify(state)));
  assert.equal(restored?.handler.directive, "Keep heat below two stars.");
  assert.equal(restored?.version, 2);
  assert.equal(restored?.objectiveUnlocked, true);
});
