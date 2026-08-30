import { operativeProfiles } from "./characters";
import {
  addActivity,
  attemptEscape,
  driveTeam,
  eatTogether,
  equipWeapon,
  getMissionAvailability,
  missionCalculation,
  restTogether,
  startTeamMission,
  switchVehicle,
  teamAverages,
  timeRemaining
} from "./engine";
import { locations } from "./locations";
import { missions } from "./missions";
import { vehicles } from "./vehicles";
import type { ActionResult, CharacterId, GameState, MissionDefinition, VehicleId, WeaponId } from "@/types/game";

type AutonomyActor = CharacterId | "team";

interface PlanBase {
  actor: AutonomyActor;
  label: string;
  reason: string;
}

export type AutonomyPlan =
  | (PlanBase & { type: "wait" })
  | (PlanBase & { type: "drive"; destination: string })
  | (PlanBase & { type: "eat"; meal: "quick" | "restaurant" })
  | (PlanBase & { type: "rest"; hours: number })
  | (PlanBase & { type: "equip"; character: CharacterId; weapon: WeaponId })
  | (PlanBase & { type: "switch_vehicle"; vehicle: VehicleId })
  | (PlanBase & { type: "start_mission"; missionId: string })
  | (PlanBase & { type: "attempt_escape" });

const SAFE_LOCATIONS = ["hotel", "rural"];
const RISK_RANK: Record<MissionDefinition["risk"], number> = {
  tutorial: 0,
  side: 1,
  moderate: 1,
  high: 2,
  extreme: 3
};

function directiveMode(directive: string) {
  const text = directive.toLowerCase();
  return {
    cautious: /(low heat|avoid risk|avoid unnecessary|cautious|careful|quiet|safe)/.test(text),
    aggressive: /(take risks?|aggressive|maximum payout|biggest job)/.test(text),
    fast: /(fast|quick|speed|urgent|time)/.test(text),
    escape: /(extract|extraction|airfield|leave (the )?island|get off (the )?island|escape (now|immediately|solara)|begin (the )?escape|attempt (the )?escape)/.test(text)
  };
}

function nearbySafeLocation(state: GameState): string | null {
  const current = locations[state.currentLocation];
  const candidates = SAFE_LOCATIONS
    .filter((id) => state.discoveredLocations.includes(id) && locations[id])
    .map((id) => ({ id, distance: Math.hypot(locations[id].x - current.x, locations[id].y - current.y) }))
    .sort((a, b) => a.distance - b.distance || a.id.localeCompare(b.id));
  return candidates[0]?.id ?? null;
}

function mealPlan(state: GameState, reason: string): AutonomyPlan | null {
  if (state.cash < 20) return null;
  const maxHunger = Math.max(state.characters.alex.hunger, state.characters.maya.hunger);
  const minHealth = Math.min(state.characters.alex.health, state.characters.maya.health);
  const meal = state.cash >= 300 && (maxHunger >= 85 || minHealth < 60) ? "restaurant" : "quick";
  return {
    type: "eat",
    actor: "maya",
    meal,
    label: meal === "restaurant" ? "PURCHASED FULL MEAL" : "PURCHASED ROAD SUPPLIES",
    reason
  };
}

function preferredWeapon(state: GameState, character: CharacterId): WeaponId {
  return operativeProfiles[character].weaponPreference.find((weapon) => state.inventory.weapons.includes(weapon)) ?? "none";
}

function preferredVehicle(state: GameState): VehicleId {
  const mode = directiveMode(state.handler.directive);
  return [...state.inventory.vehicles].sort((a, b) => {
    if (mode.cautious && vehicles[a].attention !== vehicles[b].attention) return vehicles[a].attention - vehicles[b].attention;
    const utilityA = vehicles[a].missionModifier + (1 - vehicles[a].travelMultiplier) * (mode.fast ? 22 : 10);
    const utilityB = vehicles[b].missionModifier + (1 - vehicles[b].travelMultiplier) * (mode.fast ? 22 : 10);
    return utilityB - utilityA || a.localeCompare(b);
  })[0];
}

function missionScore(state: GameState, mission: MissionDefinition): number {
  const mode = directiveMode(state.handler.directive);
  const chance = missionCalculation(state, mission.id).chance / 100;
  const hourlyReturn = mission.baseReward * chance / Math.max(1, mission.estimatedHours);
  const risk = RISK_RANK[mission.risk];
  let multiplier = 1;
  if (mode.cautious) multiplier *= [1.04, 1.04, 0.8, 0.55][risk] ?? 1;
  else if (mode.aggressive) multiplier *= [1, 0.96, 1.05, 1.14][risk] ?? 1;
  else multiplier *= [1, 1.04, 0.94, 0.86][risk] ?? 1;
  if (mode.fast) multiplier *= Math.max(0.85, 1.2 - mission.estimatedHours / 30);
  return hourlyReturn * multiplier;
}

export function selectAutonomousMission(state: GameState): MissionDefinition | null {
  const fitting = Object.values(missions)
    .filter((mission) => mission.id !== "airport-to-hotel")
    .filter((mission) => getMissionAvailability(state, mission).available)
    .filter((mission) => mission.estimatedHours * 60 + 90 < timeRemaining(state));
  if (!fitting.length) return null;

  const remainingCash = Math.max(0, state.targetCash - state.cash);
  const major = fitting.filter((mission) => mission.kind === "major");
  const side = fitting.filter((mission) => mission.kind === "side");
  const finishingSideJobs = side.filter((mission) => mission.baseReward >= remainingCash * 0.85);
  const pool = finishingSideJobs.length && remainingCash <= 100000
    ? finishingSideJobs
    : major.length
      ? major
      : side;

  return [...pool].sort((a, b) => missionScore(state, b) - missionScore(state, a) || a.id.localeCompare(b.id))[0] ?? null;
}

function recoveryPlan(state: GameState, hours: number, reason: string): AutonomyPlan | null {
  if (timeRemaining(state) <= hours * 60 + 30) {
    return {
      type: "wait",
      actor: "team",
      label: "DEADLINE CONFLICT",
      reason: `${reason} The proposed recovery would cross the final window, so the team is waiting for the handler.`
    };
  }
  const projectedHunger = Math.max(state.characters.alex.hunger, state.characters.maya.hunger) + hours * 4.5;
  if (projectedHunger > 82) return mealPlan(state, `${reason} Maya is buying food before the team sleeps.`);
  if (!SAFE_LOCATIONS.includes(state.currentLocation)) {
    const destination = nearbySafeLocation(state);
    if (destination) {
      return {
        type: "drive",
        actor: "alex",
        destination,
        label: "MOVED TO SAFE LODGING",
        reason: `${reason} Alex selected a safer place to recover.`
      };
    }
  }
  return { type: "rest", actor: "alex", hours, label: hours >= 8 ? "CALLED FULL SLEEP" : "CALLED SHORT REST", reason };
}

export function planAutonomyStep(state: GameState): AutonomyPlan {
  if (!state.autonomy.enabled) return { type: "wait", actor: "team", label: "MANUAL CONTROL", reason: "Field autonomy is paused." };
  if (state.phase === "arrival") {
    return { type: "wait", actor: "team", label: "FINAL APPROACH", reason: "Alex and Maya are landing at Solara Island Airport." };
  }
  if (state.phase === "hotel-call") {
    return { type: "wait", actor: "team", label: "HOTEL CHECK-IN", reason: `Alex and Maya are waiting for ${state.handler.name}'s call at Hotel Aster.` };
  }
  if (state.phase === "story-choice" || state.storyChoice) {
    return { type: "wait", actor: "team", label: "AWAITING MISSION CHOICE", reason: `${state.handler.name} must choose the team's first mission.` };
  }
  if (state.phase === "story-paused") {
    return { type: "wait", actor: "team", label: "AWAITING STORY DIRECTION", reason: "Alex and Maya are holding at Hotel Aster until the next handler briefing." };
  }
  if (state.phase !== "playing") return { type: "wait", actor: "team", label: "OPERATION COMPLETE", reason: "There are no further autonomous actions." };
  if (state.currentDecision) {
    const caller = state.characters[state.currentDecision.caller].name;
    return { type: "wait", actor: state.currentDecision.caller, label: "AWAITING HANDLER", reason: `${caller} paused the operation for ${state.handler.name}'s consequential decision.` };
  }
  if (state.activeMission) return { type: "wait", actor: "team", label: "MISSION IN PROGRESS", reason: "The field team is resolving the active mission scene." };

  if (!state.flags.tutorialComplete) {
    if (state.currentLocation !== "hotel") {
      return { type: "drive", actor: "alex", destination: "hotel", label: "FOLLOWED INITIAL DIRECTIVE", reason: "Alex is taking the team from the airport to Hotel Aster." };
    }
    return { type: "start_mission", actor: "team", missionId: "airport-to-hotel", label: "STARTED FIELD ORIENTATION", reason: "Alex and Maya are establishing the operation at Hotel Aster." };
  }

  const averages = teamAverages(state);
  const maxHunger = Math.max(state.characters.alex.hunger, state.characters.maya.hunger);
  const minEnergy = Math.min(state.characters.alex.energy, state.characters.maya.energy);
  const minHealth = Math.min(state.characters.alex.health, state.characters.maya.health);
  const remainingTime = timeRemaining(state);

  if (maxHunger >= 74) {
    const plan = mealPlan(state, `Maya flagged hunger at ${Math.round(maxHunger)} and protected the team's mission readiness.`);
    if (plan) return plan;
  }

  if (minEnergy <= 28 || minHealth <= 42 || averages.heat >= 3.4) {
    const hours = remainingTime > 9 * 60 ? 8 : 3;
    const plan = recoveryPlan(
      state,
      hours,
      `Alex called recovery with energy ${Math.round(minEnergy)}, health ${Math.round(minHealth)}, and heat ${averages.heat.toFixed(1)}.`
    );
    if (plan) return plan;
  }

  const mode = directiveMode(state.handler.directive);
  if (state.cash >= state.targetCash) {
    if (!mode.escape) {
      return { type: "wait", actor: "team", label: "EXTRACTION DECISION", reason: `The $500,000 fund is secured. Alex and Maya are waiting for ${state.handler.name} to order extraction.` };
    }
    if (averages.heat > 3) {
      const plan = recoveryPlan(state, 3, `Maya will not approach the airfield at ${averages.heat.toFixed(1)} heat.`);
      if (plan) return plan;
    }
    if (state.currentLocation !== "airfield") {
      return { type: "drive", actor: "alex", destination: "airfield", label: "BEGAN FINAL EXTRACTION", reason: `${state.handler.name}'s directive authorizes the move to Santoro Airstrip.` };
    }
    return { type: "attempt_escape", actor: "team", label: "CALLED EXTRACTION", reason: "The handler authorized escape and every extraction condition is ready." };
  }

  if (maxHunger >= 58) {
    const plan = mealPlan(state, `Maya is replenishing supplies before hunger creates a mission penalty.`);
    if (plan) return plan;
  }
  if (minEnergy <= 45) {
    const plan = recoveryPlan(state, 3, `Alex scheduled a short rest before exhaustion compromises the next operation.`);
    if (plan) return plan;
  }

  const mission = selectAutonomousMission(state);
  if (!mission) {
    return { type: "wait", actor: "team", label: "NO SAFE ROUTE", reason: `No available mission fits the remaining time. Alex and Maya need ${state.handler.name}'s direction.` };
  }

  const projectedHunger = maxHunger + mission.estimatedHours * 4.5;
  const projectedEnergy = minEnergy - mission.estimatedHours * 5.2;
  if (projectedHunger > 80) {
    const plan = mealPlan(state, `Maya projected hunger at ${Math.round(projectedHunger)} after ${mission.title} and is buying supplies first.`);
    if (plan) return plan;
  }
  if (projectedEnergy < 32 || minHealth < 55) {
    const hours = projectedEnergy < 10 && remainingTime > 9 * 60 ? 8 : 3;
    const plan = recoveryPlan(state, hours, `Alex projected energy at ${Math.round(projectedEnergy)} after ${mission.title} and scheduled recovery first.`);
    if (plan) return plan;
  }

  for (const character of ["alex", "maya"] as const) {
    const weapon = preferredWeapon(state, character);
    if (state.characters[character].weapon !== weapon) {
      return {
        type: "equip",
        actor: character,
        character,
        weapon,
        label: "ADJUSTED LOADOUT",
        reason: `${state.characters[character].name} selected a loadout for ${operativeProfiles[character].planningRole}.`
      };
    }
  }

  const vehicle = preferredVehicle(state);
  if (state.inventory.activeVehicle !== vehicle) {
    return { type: "switch_vehicle", actor: "alex", vehicle, label: "SELECTED MISSION VEHICLE", reason: `Alex matched the vehicle to the handler directive and ${mission.title}.` };
  }

  if (state.currentLocation !== mission.startingLocation) {
    return { type: "drive", actor: "alex", destination: mission.startingLocation, label: "MOVED TO OBJECTIVE", reason: `Alex selected the route to ${mission.title}; Maya approved the current risk and cash profile.` };
  }

  return { type: "start_mission", actor: "team", missionId: mission.id, label: "STARTED AUTONOMOUS OPERATION", reason: `Alex and Maya selected ${mission.title} under the directive: “${state.handler.directive}”` };
}

export function executeAutonomyPlan(state: GameState, plan: AutonomyPlan): ActionResult {
  let result: ActionResult;
  switch (plan.type) {
    case "wait":
      return { ok: true, message: plan.reason };
    case "drive":
      result = driveTeam(state, plan.destination);
      break;
    case "eat":
      result = eatTogether(state, plan.meal);
      break;
    case "rest":
      result = restTogether(state, plan.hours);
      break;
    case "equip":
      result = equipWeapon(state, plan.character, plan.weapon);
      break;
    case "switch_vehicle":
      result = switchVehicle(state, plan.vehicle);
      break;
    case "start_mission":
      result = startTeamMission(state, plan.missionId);
      break;
    case "attempt_escape":
      result = attemptEscape(state);
      break;
  }

  addActivity(
    state,
    result.ok ? "autonomy" : "danger",
    `${plan.actor === "team" ? "ALEX + MAYA" : plan.actor.toUpperCase()} · ${plan.label}`,
    result.ok ? plan.reason : `${plan.reason} Action stopped: ${result.message}`
  );
  return result;
}

export function autonomyFingerprint(state: GameState, plan: AutonomyPlan): string {
  return JSON.stringify({
    plan,
    phase: state.phase,
    time: state.totalMinutes,
    cash: state.cash,
    location: state.currentLocation,
    characters: state.characters,
    activeVehicle: state.inventory.activeVehicle,
    completedMissions: state.completedMissions,
    decision: state.currentDecision?.sceneId ?? null
  });
}
