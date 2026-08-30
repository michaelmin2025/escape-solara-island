import { locations, postCallLocations, getLocation } from "./locations";
import { majorMissionIds, missions } from "./missions";
import { DEADLINE_MINUTES, TARGET_CASH } from "./state";
import { vehicles, weapons } from "./vehicles";
import type {
  ActionResult,
  ActivityEntry,
  CharacterId,
  DecisionOption,
  DialogueLine,
  GameState,
  MissionDefinition,
  MissionOutcome,
  MissionScene,
  Requirement,
  SceneEffects,
  VehicleId,
  WeaponId
} from "@/types/game";

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const stat = (value: number) => Math.round(clamp(value, 0, 100));

export function dayOf(state: GameState): number {
  return Math.floor(state.totalMinutes / 1440) + 1;
}

export function formatClock(state: GameState): string {
  const minute = state.totalMinutes % 1440;
  return `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  const safe = Math.max(0, Math.round(minutes));
  const days = Math.floor(safe / 1440);
  const hours = Math.floor((safe % 1440) / 60);
  const mins = safe % 60;
  return days ? `${days}d ${hours}h` : hours ? `${hours}h ${mins}m` : `${mins}m`;
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function timeRemaining(state: GameState): number {
  return Math.max(0, DEADLINE_MINUTES - state.totalMinutes);
}

export function teamAverages(state: GameState) {
  const { alex, maya } = state.characters;
  return {
    health: (alex.health + maya.health) / 2,
    energy: (alex.energy + maya.energy) / 2,
    hunger: (alex.hunger + maya.hunger) / 2,
    heat: (alex.heat + maya.heat) / 2
  };
}

export function addActivity(state: GameState, kind: ActivityEntry["kind"], title: string, detail: string) {
  state.activitySerial += 1;
  state.activityLog.unshift({
    id: `${state.activitySerial}-${state.totalMinutes}`,
    day: dayOf(state),
    time: formatClock(state),
    kind,
    title,
    detail
  });
  state.activityLog = state.activityLog.slice(0, 100);
}

function addDialogue(state: GameState, lines: DialogueLine[]) {
  state.dialogue.push(...lines);
  state.dialogue = state.dialogue.slice(-24);
}

function checkTerminal(state: GameState) {
  if (state.phase === "won" || state.phase === "lost") return;
  if (state.totalMinutes >= DEADLINE_MINUTES) {
    state.phase = "lost";
    state.activeMission = undefined;
    state.currentDecision = undefined;
    state.ending = { title: "The final flight is gone", message: "Day 6 ended before Alex and Maya cleared Solara Island." };
    addActivity(state, "danger", "OPERATION FAILED", "The six-day escape window closed.");
  } else if (state.characters.alex.health <= 0 && state.characters.maya.health <= 0) {
    state.phase = "lost";
    state.activeMission = undefined;
    state.currentDecision = undefined;
    state.ending = { title: "The field team is down", message: "Both Alex and Maya were incapacitated." };
    addActivity(state, "danger", "OPERATION FAILED", "Neither operative can continue.");
  }
}

export function advanceTime(state: GameState, minutes: number, reason: string) {
  const before = dayOf(state);
  const hours = Math.max(0, minutes) / 60;
  state.totalMinutes += Math.max(0, Math.round(minutes));
  Object.values(state.characters).forEach((character) => {
    character.energy = stat(character.energy - hours * 5.2);
    character.hunger = stat(character.hunger + hours * 4.5);
    character.heat = Math.round(clamp(character.heat - hours * 0.07, 0, 5) * 10) / 10;
    if (character.energy < 12 || character.hunger > 90) character.health = stat(character.health - hours * 2.4);
  });
  const after = dayOf(state);
  if (after > before && after <= 6) addActivity(state, "system", `Day ${after} begins`, reason);
  checkTerminal(state);
}

function applyEffects(state: GameState, effects?: SceneEffects) {
  if (!effects) return;
  if (effects.cash) state.cash = Math.max(0, state.cash + effects.cash);
  if (effects.timeMinutes) advanceTime(state, effects.timeMinutes, "Mission branch");
  Object.values(state.characters).forEach((character) => {
    if (effects.heat) character.heat = Math.round(clamp(character.heat + effects.heat, 0, 5) * 10) / 10;
    if (effects.health) character.health = stat(character.health + effects.health);
    if (effects.energy) character.energy = stat(character.energy + effects.energy);
    if (effects.hunger) character.hunger = stat(character.hunger + effects.hunger);
  });
  if (effects.flags) Object.assign(state.flags, effects.flags);
  if (effects.successModifier && state.activeMission) state.activeMission.successModifier += effects.successModifier;
}

function requirementStatus(state: GameState, requirement: Requirement): { ok: boolean; reason?: string } {
  switch (requirement.type) {
    case "flag": {
      const key = String(requirement.value);
      const active = key === "objectiveUnlocked" ? state.objectiveUnlocked : Boolean(state.flags[key]);
      return { ok: active, reason: active ? undefined : requirement.label };
    }
    case "weapon": {
      const armed = Object.values(state.characters).some((character) => character.weapon !== "none");
      return { ok: armed, reason: armed ? undefined : requirement.label };
    }
    case "vehicle": {
      const ok = state.inventory.activeVehicle === requirement.value;
      return { ok, reason: ok ? undefined : requirement.label };
    }
    case "cash": {
      const ok = state.cash >= Number(requirement.value);
      return { ok, reason: ok ? undefined : requirement.label };
    }
    case "health": {
      const character = state.characters[requirement.character ?? "alex"];
      const ok = character.health >= Number(requirement.value);
      return { ok, reason: ok ? undefined : requirement.label };
    }
    case "completed": {
      const count = majorMissionIds.filter((id) => state.completedMissions[id] && state.completedMissions[id] !== "aborted").length;
      const ok = count >= Number(requirement.value);
      return { ok, reason: ok ? undefined : requirement.label };
    }
  }
}

function optionWithStatus(state: GameState, option: DecisionOption) {
  const failed = option.requirements?.map((requirement) => requirementStatus(state, requirement)).find((status) => !status.ok);
  return { ...option, available: !failed, unavailableReason: failed?.reason };
}

export function getMissionAvailability(state: GameState, mission: MissionDefinition): { available: boolean; reason: string } {
  if (state.phase !== "playing") return { available: false, reason: "Operation paused" };
  if (state.activeMission || state.currentDecision) return { available: false, reason: "Another mission is active" };
  if (mission.id === "airport-to-hotel") {
    return state.flags.tutorialComplete ? { available: false, reason: "Tutorial complete" } : { available: true, reason: "Opening mission" };
  }
  if (state.completedMissions[mission.id] && !mission.repeatable) return { available: false, reason: state.completedMissions[mission.id].toUpperCase() };
  const failed = mission.requirements?.map((requirement) => requirementStatus(state, requirement)).find((status) => !status.ok);
  return failed ? { available: false, reason: failed.reason ?? "Requirements not met" } : { available: true, reason: "Available" };
}

export function availableMissions(state: GameState, includeLocked = false) {
  return Object.values(missions)
    .filter((mission) => mission.id === "airport-to-hotel" ? !state.flags.tutorialComplete : state.objectiveUnlocked)
    .map((mission) => ({ mission, ...getMissionAvailability(state, mission) }))
    .filter((entry) => includeLocked || entry.available);
}

function nextRoll(state: GameState, label: string): number {
  let labelHash = 0;
  for (let index = 0; index < label.length; index += 1) labelHash = Math.imul(labelHash ^ label.charCodeAt(index), 16777619);
  state.rng = (Math.imul(state.rng >>> 0, 1664525) + 1013904223 + (labelHash >>> 0)) >>> 0;
  return (state.rng % 100) + 1;
}

export function missionCalculation(state: GameState, missionId: string, baseSuccess?: number) {
  const mission = missions[missionId];
  if (!mission) return { chance: 0, factors: [] as Array<{ label: string; value: number }> };
  const avg = teamAverages(state);
  const base = baseSuccess ?? (mission.risk === "tutorial" ? 100 : mission.risk === "side" ? 62 : mission.risk === "moderate" ? 54 : mission.risk === "high" ? 50 : 44);
  const factors = [{ label: "Base plan", value: base }, { label: "Alex + Maya together", value: 12 }];
  if (avg.health >= 75) factors.push({ label: "Team healthy", value: 7 });
  else if (avg.health < 45) factors.push({ label: "Injuries", value: -13 });
  if (avg.energy >= 55) factors.push({ label: "Good energy", value: 6 });
  else if (avg.energy < 30) factors.push({ label: "Exhaustion", value: -12 });
  if (avg.hunger < 60) factors.push({ label: "Team fed", value: 4 });
  else if (avg.hunger > 80) factors.push({ label: "Severe hunger", value: -10 });
  const bestWeapon = Math.max(...Object.values(state.characters).map((character) => weapons[character.weapon].modifier));
  if (bestWeapon) factors.push({ label: "Weapon loadout", value: bestWeapon });
  const vehicleModifier = vehicles[state.inventory.activeVehicle].missionModifier;
  if (vehicleModifier) factors.push({ label: vehicles[state.inventory.activeVehicle].name, value: vehicleModifier });
  if (avg.heat >= 1) factors.push({ label: "Police heat", value: -Math.round(avg.heat * 3) });
  if (state.activeMission?.missionId === missionId && state.activeMission.successModifier) factors.push({ label: state.activeMission.branchLabel ?? "Handler strategy", value: state.activeMission.successModifier });
  if (missionId === "casino-job" && state.flags.marinaContact) factors.push({ label: "Inés harbor intelligence", value: 6 });
  if (missionId === "industrial-job" && state.flags.casinoAccess) factors.push({ label: "Miraflores access records", value: 5 });
  if (missionId === "old-city-exchange" && state.flags.casinoAccess) factors.push({ label: "Casino buyer network", value: 8 });
  return { chance: clamp(factors.reduce((sum, factor) => sum + factor.value, 0), 22, 95), factors };
}

function unlock<T extends string>(items: T[], additions?: T[]) {
  additions?.forEach((item) => { if (!items.includes(item)) items.push(item); });
}

function finishMission(state: GameState, mission: MissionDefinition, outcome: MissionOutcome, chance?: number, roll?: number): ActionResult {
  const definition = mission.outcomes[outcome];
  state.cash += definition.payout;
  applyEffects(state, definition.effects);
  unlock<WeaponId>(state.inventory.weapons, definition.unlockWeapons);
  unlock<VehicleId>(state.inventory.vehicles, definition.unlockVehicles);
  if (definition.flags) Object.assign(state.flags, definition.flags);
  if (outcome !== "aborted") state.completedMissions[mission.id] = outcome;
  if (outcome === "failure") state.failedMissions += 1;
  if (mission.id === "airport-to-hotel" && outcome === "success") {
    state.phase = "hotel-call";
    state.currentLocation = "hotel";
  }
  state.activeMission = undefined;
  state.currentDecision = undefined;
  const kind = outcome === "success" ? "success" : outcome === "partial" ? "partial" : outcome === "failure" ? "danger" : "system";
  const odds = chance && roll ? ` · ${chance}% plan / roll ${roll}` : "";
  addActivity(state, kind, `${outcome.toUpperCase()} · ${mission.title}`, `${definition.message}${definition.payout ? ` +${formatMoney(definition.payout)}` : ""}${odds}`);
  checkTerminal(state);
  return { ok: true, message: definition.message, outcome };
}

function findScene(mission: MissionDefinition, sceneId: string): MissionScene | undefined {
  return mission.scenes.find((scene) => scene.id === sceneId);
}

function runMissionUntilPause(state: GameState): ActionResult {
  let safety = 0;
  while (state.activeMission && state.phase === "playing" && safety < 20) {
    safety += 1;
    const mission = missions[state.activeMission.missionId];
    const scene = findScene(mission, state.activeMission.sceneId);
    if (!scene) return finishMission(state, mission, "failure");

    if (scene.type === "decision") {
      state.currentDecision = {
        missionId: mission.id,
        sceneId: scene.id,
        caller: scene.caller,
        prompt: scene.prompt,
        options: scene.options.map((option) => optionWithStatus(state, option))
      };
      addActivity(state, "decision", "HANDLER DECISION REQUIRED", `${mission.title} is paused for ${state.handler.name}.`);
      return { ok: true, message: scene.prompt, decision: state.currentDecision };
    }

    if (scene.type === "mission_action") {
      advanceTime(state, scene.durationMinutes, scene.label);
      if (state.phase !== "playing") return { ok: false, message: state.ending?.message ?? "The operation ended." };
      const calculation = missionCalculation(state, mission.id, scene.baseSuccess);
      const roll = nextRoll(state, `${mission.id}-${state.missionAttempts[mission.id] ?? 0}`);
      state.missionAttempts[mission.id] = (state.missionAttempts[mission.id] ?? 0) + 1;
      const outcome: MissionOutcome = roll <= calculation.chance ? "success" : roll <= Math.min(98, calculation.chance + 24) ? "partial" : "failure";
      return finishMission(state, mission, outcome, calculation.chance, roll);
    }

    if (scene.type === "reward") return finishMission(state, mission, scene.outcome);

    applyEffects(state, scene.effects);
    if (state.phase !== "playing") return { ok: false, message: state.ending?.message ?? "The operation ended." };
    if (scene.type === "drive") {
      state.previousLocation = state.currentLocation;
      state.currentLocation = scene.destination;
      if (!state.discoveredLocations.includes(scene.destination)) state.discoveredLocations.push(scene.destination);
      advanceTime(state, scene.minutes, `${mission.title} travel`);
      if (scene.lines) addDialogue(state, scene.lines);
      addActivity(state, "travel", "Mission route", `${getLocation(state.previousLocation).name} → ${getLocation(scene.destination).name}`);
    } else {
      addDialogue(state, scene.lines);
      addActivity(state, "dialogue", scene.type.replace("_", " ").toUpperCase(), scene.lines.at(-1)?.text ?? mission.title);
    }
    if (!scene.nextSceneId) return finishMission(state, mission, "failure");
    state.activeMission.sceneId = scene.nextSceneId;
  }
  return { ok: false, message: "Mission scene limit reached." };
}

export function startTeamMission(state: GameState, missionId: string): ActionResult {
  const mission = missions[missionId];
  if (!mission) return { ok: false, message: "Unknown mission." };
  const status = getMissionAvailability(state, mission);
  if (!status.available) return { ok: false, message: status.reason };
  if (state.currentLocation !== mission.startingLocation) return { ok: false, message: `Drive to ${getLocation(mission.startingLocation).name} first.` };
  state.activeMission = { missionId, sceneId: mission.scenes[0].id, successModifier: 0 };
  addActivity(state, "system", `MISSION STARTED · ${mission.title}`, mission.summary);
  return runMissionUntilPause(state);
}

export function choosePath(state: GameState, optionId: string): ActionResult {
  const decision = state.currentDecision;
  const active = state.activeMission;
  if (!decision || !active) return { ok: false, message: "There is no pending handler decision." };
  const option = decision.options.find((candidate) => candidate.id === optionId);
  if (!option) return { ok: false, message: "Unknown decision option." };
  if (!option.available) return { ok: false, message: option.unavailableReason ?? "That option is unavailable." };
  const mission = missions[decision.missionId];
  state.currentDecision = undefined;
  active.branchLabel = option.label;
  addActivity(state, "decision", `${state.handler.name}: ${option.label}`, option.description);
  if (option.abort) return finishMission(state, mission, "aborted");
  applyEffects(state, option.effects);
  if (!option.nextSceneId) return finishMission(state, mission, "failure");
  active.sceneId = option.nextSceneId;
  return runMissionUntilPause(state);
}

function actionBlock(state: GameState): string | null {
  if (state.phase === "won" || state.phase === "lost") return "The operation has ended.";
  if (state.phase === "hotel-call") return "Answer the hotel call first.";
  if (state.currentDecision) return "The handler must answer the pending decision first.";
  if (state.activeMission) return "A mission is currently running.";
  return null;
}

export function driveTeam(state: GameState, destination: string): ActionResult {
  const blocked = actionBlock(state);
  if (blocked) return { ok: false, message: blocked };
  if (!locations[destination]) return { ok: false, message: "Unknown destination." };
  if (!state.flags.tutorialComplete && destination === "hotel" && state.currentLocation === "airport") return startTeamMission(state, "airport-to-hotel");
  if (!state.flags.tutorialComplete) return { ok: false, message: "The first route is Airport → Hotel Aster." };
  if (!state.discoveredLocations.includes(destination)) return { ok: false, message: "That location has not been discovered." };
  if (state.currentLocation === destination) return { ok: false, message: `The team is already at ${getLocation(destination).name}.` };
  const from = getLocation(state.currentLocation);
  const to = getLocation(destination);
  const distance = Math.hypot(to.x - from.x, to.y - from.y);
  const vehicle = vehicles[state.inventory.activeVehicle];
  const minutes = Math.round(clamp(28 + distance * 1.05, 30, 100) * vehicle.travelMultiplier);
  state.previousLocation = state.currentLocation;
  state.currentLocation = destination;
  advanceTime(state, minutes, "Island travel");
  addActivity(state, "travel", "drive_team", `${from.name} → ${to.name} · ${minutes}m`);
  return { ok: true, message: `Alex and Maya reached ${to.name} in ${minutes} minutes.` };
}

export function answerHotelCall(state: GameState): ActionResult {
  if (state.phase !== "hotel-call" || !state.flags.hotelCallPending) return { ok: false, message: "There is no hotel call waiting." };
  addDialogue(state, [
    { speaker: "HANDLER", text: "Good. Now listen carefully. You need five hundred thousand dollars.", channel: "phone" },
    { speaker: "MAYA", text: "Five hundred thousand?", channel: "phone" },
    { speaker: "HANDLER", text: "You have six days. Marina, casino, or industrial harbor—I have a route into each.", channel: "phone" },
    { speaker: "ALEX", text: "Then give us the first move.", channel: "phone" }
  ]);
  state.objectiveUnlocked = true;
  state.clientMet = true;
  state.flags.hotelCallPending = false;
  state.flags.objectiveUnlocked = true;
  state.phase = "playing";
  state.handler.directive = "Choose a major operation. Build the escape fund to $500,000.";
  state.discoveredLocations = Array.from(new Set([...state.discoveredLocations, ...postCallLocations]));
  if (!state.inventory.weapons.includes("pistol")) state.inventory.weapons.push("pistol");
  state.characters.alex.weapon = "pistol";
  advanceTime(state, 35, "Hotel briefing");
  addActivity(state, "success", "OBJECTIVE UNLOCKED · $500,000", "Three major opportunities are live. Valcora's pistol was delivered to the hotel.");
  return { ok: true, message: "The $500,000 objective, pistol, and three major missions are now available." };
}

export function eatTogether(state: GameState, meal: "quick" | "restaurant"): ActionResult {
  const blocked = actionBlock(state);
  if (blocked) return { ok: false, message: blocked };
  const option = meal === "restaurant"
    ? { cost: 100, minutes: 60, hunger: 70, energy: 12, health: 6, label: "restaurant meal" }
    : { cost: 20, minutes: 35, hunger: 40, energy: 5, health: 2, label: "roadside meal" };
  if (state.cash < option.cost) return { ok: false, message: "Not enough cash." };
  state.cash -= option.cost;
  advanceTime(state, option.minutes, option.label);
  Object.values(state.characters).forEach((character) => {
    character.hunger = stat(character.hunger - option.hunger);
    character.energy = stat(character.energy + option.energy);
    character.health = stat(character.health + option.health);
  });
  addActivity(state, "recovery", "eat_together", `${option.label} · -${formatMoney(option.cost)}`);
  return { ok: true, message: `The team recovered over a ${option.label}.` };
}

export function restTogether(state: GameState, hours: number): ActionResult {
  const blocked = actionBlock(state);
  if (blocked) return { ok: false, message: blocked };
  const duration = clamp(Math.round(hours), 2, 8);
  const safe = state.currentLocation === "hotel" || state.currentLocation === "rural";
  advanceTime(state, duration * 60, "Team rest");
  Object.values(state.characters).forEach((character) => {
    character.energy = stat(character.energy + duration * (safe ? 12 : 8));
    character.health = stat(character.health + duration * (safe ? 3 : 1.5));
    character.hunger = stat(character.hunger + duration * 1.2);
    character.heat = Math.round(clamp(character.heat - duration * (safe ? 0.34 : 0.18), 0, 5) * 10) / 10;
  });
  addActivity(state, "recovery", "rest_together", `${duration}h at ${getLocation(state.currentLocation).name}`);
  return { ok: true, message: `Alex and Maya rested for ${duration} hours.` };
}

export function equipWeapon(state: GameState, characterId: CharacterId, weaponId: WeaponId): ActionResult {
  const blocked = actionBlock(state);
  if (blocked) return { ok: false, message: blocked };
  if (!state.inventory.weapons.includes(weaponId)) return { ok: false, message: "That weapon has not been acquired." };
  state.characters[characterId].weapon = weaponId;
  addActivity(state, "system", "equip_weapon", `${state.characters[characterId].name} → ${weapons[weaponId].name}`);
  return { ok: true, message: `${state.characters[characterId].name} equipped ${weapons[weaponId].name}.` };
}

export function switchVehicle(state: GameState, vehicleId: VehicleId): ActionResult {
  const blocked = actionBlock(state);
  if (blocked) return { ok: false, message: blocked };
  if (!state.inventory.vehicles.includes(vehicleId)) return { ok: false, message: "That vehicle has not been acquired." };
  state.inventory.activeVehicle = vehicleId;
  addActivity(state, "system", "switch_vehicle", vehicles[vehicleId].name);
  return { ok: true, message: `The team switched to the ${vehicles[vehicleId].name}.` };
}

export function setHandlerDirective(state: GameState, directive: string): ActionResult {
  const text = directive.trim().slice(0, 180);
  if (!text) return { ok: false, message: "Enter a directive first." };
  state.handler.directive = text;
  addActivity(state, "system", `${state.handler.name} updated the plan`, text);
  return { ok: true, message: "Directive relayed to Alex and Maya." };
}

export function escapeReadiness(state: GameState) {
  const avg = teamAverages(state);
  return {
    objective: state.objectiveUnlocked,
    cash: state.cash >= TARGET_CASH,
    alive: state.characters.alex.health > 0 && state.characters.maya.health > 0,
    airfield: state.currentLocation === "airfield",
    heat: avg.heat <= 3,
    time: state.totalMinutes < DEADLINE_MINUTES
  };
}

export function attemptEscape(state: GameState): ActionResult {
  const blocked = actionBlock(state);
  if (blocked) return { ok: false, message: blocked };
  const ready = escapeReadiness(state);
  const missing: string[] = [];
  if (!ready.objective) missing.push("answer the hotel call");
  if (!ready.cash) missing.push(`secure ${formatMoney(TARGET_CASH - state.cash)} more`);
  if (!ready.alive) missing.push("get both operatives mobile");
  if (!ready.airfield) missing.push("reach Santoro Airstrip");
  if (!ready.heat) missing.push("reduce heat to 3 or below");
  if (!ready.time) missing.push("the deadline has passed");
  if (missing.length) return { ok: false, message: `Escape unavailable: ${missing.join("; ")}.` };
  advanceTime(state, 25, "Final runway approach");
  if (state.phase === "lost") return { ok: false, message: state.ending?.message ?? "The flight is gone." };
  state.phase = "won";
  state.ending = { title: "Escaped Solara Island", message: `${state.handler.name} got Alex and Maya off the island with ${formatMoney(state.cash)}.` };
  addActivity(state, "success", "ESCAPE COMPLETE", `Day ${dayOf(state)} · ${formatClock(state)} · ${formatMoney(state.cash)}`);
  return { ok: true, message: state.ending.message, outcome: "won" };
}

export function getObjective(state: GameState) {
  if (!state.flags.tutorialComplete) return { title: "Reach Hotel Aster", detail: "Opening mission · Airport → Hotel", progress: 0.04 };
  if (state.phase === "hotel-call") return { title: "Answer the handler", detail: "Incoming call at Hotel Aster", progress: 0.08 };
  if (state.activeMission) return { title: `Complete ${missions[state.activeMission.missionId].title}`, detail: state.handler.directive, progress: Math.max(0.1, state.cash / TARGET_CASH) };
  if (state.cash < TARGET_CASH) return { title: "Build the escape fund", detail: `${formatMoney(state.cash)} of ${formatMoney(TARGET_CASH)}`, progress: state.cash / TARGET_CASH };
  if (state.currentLocation !== "airfield") return { title: "Reach Santoro Airstrip", detail: "Cash secured. Keep team heat at 3 or below.", progress: 1 };
  return { title: "Call the final extraction", detail: "All escape conditions are ready.", progress: 1 };
}

export function worldState(state: GameState) {
  return {
    handler: state.handler,
    day: dayOf(state),
    time: formatClock(state),
    timeRemaining: formatDuration(timeRemaining(state)),
    cash: state.cash,
    targetCash: state.targetCash,
    objective: getObjective(state),
    location: getLocation(state.currentLocation),
    characters: state.characters,
    inventory: state.inventory,
    completedMissions: state.completedMissions,
    activeMission: state.activeMission,
    pendingDecision: state.currentDecision,
    escapeReadiness: escapeReadiness(state),
    phase: state.phase
  };
}
