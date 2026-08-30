import { createCharacters } from "./characters";
import { initialDiscoveredLocations } from "./locations";
import type { GameState } from "@/types/game";

export const TARGET_CASH = 500000;
export const START_MINUTES = 9 * 60 + 12;
export const DEADLINE_MINUTES = 6 * 24 * 60;

export function createInitialState(handlerName: string, seed = Date.now()): GameState {
  const name = handlerName.trim().slice(0, 28) || "Handler";
  return {
    version: 2,
    handler: {
      name,
      directive: "Get Alex and Maya to the hotel. Keep them together."
    },
    totalMinutes: START_MINUTES,
    cash: 2500,
    targetCash: TARGET_CASH,
    objectiveUnlocked: false,
    clientMet: false,
    currentLocation: "airport",
    previousLocation: "airport",
    discoveredLocations: [...initialDiscoveredLocations],
    characters: createCharacters(),
    inventory: {
      weapons: ["none"],
      vehicles: ["rental"],
      activeVehicle: "rental"
    },
    completedMissions: {},
    missionAttempts: {},
    flags: {
      tutorialComplete: false,
      hotelCallPending: false,
      objectiveUnlocked: false
    },
    dialogue: [
      { speaker: "SYSTEM", text: "Alex and Maya have landed at Solara Island Airport.", channel: "system" },
      { speaker: "MAYA", text: `${name}, we're on the ground. Where do you want us?`, channel: "phone" }
    ],
    activityLog: [
      {
        id: "initial-1",
        day: 1,
        time: "09:12",
        kind: "system",
        title: "Operation channel established",
        detail: `${name} is connected to Alex and Maya.`
      }
    ],
    activitySerial: 1,
    failedMissions: 0,
    phase: "playing",
    rng: seed >>> 0
  };
}

export function restoreState(value: unknown): GameState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<GameState>;
  if (candidate.version !== 2 || !candidate.handler || !candidate.characters || !candidate.inventory) return null;
  return candidate as GameState;
}
