import { createCharacters } from "./characters";
import { initialDiscoveredLocations } from "./locations";
import type { DialogueLine, GameState } from "@/types/game";

export const TARGET_CASH = 500000;
export const START_MINUTES = 9 * 60 + 12;
export const DEADLINE_MINUTES = 6 * 24 * 60;

function validDialogueCursor(value: unknown): value is number {
  return Number.isSafeInteger(value) && Number(value) >= 0;
}

function normalizeDialogue(lines: DialogueLine[] | undefined) {
  let assignedId = 0;
  const dialogue = (lines ?? []).map((line) => {
    const id = validDialogueCursor(line.id) && line.id > assignedId ? line.id : assignedId + 1;
    assignedId = id;
    return { ...line, id };
  });
  return { dialogue, latestId: assignedId };
}

export function createInitialState(handlerName: string, seed = Date.now()): GameState {
  const name = handlerName.trim().slice(0, 28) || "Handler";
  return {
    version: 5,
    handler: {
      name,
      directive: "Land at Solara Island Airport, then check in at Hotel Aster."
    },
    autonomy: {
      enabled: true
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
      airportArrivalComplete: false,
      objectiveUnlocked: false
    },
    dialogue: [
      { id: 1, speaker: "SYSTEM", text: "Flight 712 is approaching Solara Island Airport from the northwest.", channel: "system" }
    ],
    dialogueSerial: 1,
    dialogueReadId: 1,
    activityLog: [
      {
        id: "initial-1",
        day: 1,
        time: "09:12",
        kind: "system",
        title: "FINAL APPROACH",
        detail: `${name} is connected while Alex and Maya prepare to land.`
      }
    ],
    activitySerial: 1,
    failedMissions: 0,
    phase: "arrival",
    rng: seed >>> 0
  };
}

export function restoreState(value: unknown): GameState | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as Partial<GameState> & { version?: number };
  if (![2, 3, 4, 5].includes(candidate.version ?? 0) || !candidate.handler || !candidate.characters || !candidate.inventory) return null;
  const characters = candidate.characters as GameState["characters"];
  const legacy = candidate.version !== 5;
  const legacyPhase = candidate.phase;
  const migratedPhase = legacy && legacyPhase !== "won" && legacyPhase !== "lost" && candidate.flags?.tutorialComplete
    ? "story-paused"
    : legacyPhase ?? "arrival";
  const normalizedDialogue = normalizeDialogue(candidate.dialogue);
  const dialogueSerial = Math.max(
    normalizedDialogue.latestId,
    validDialogueCursor(candidate.dialogueSerial) ? candidate.dialogueSerial : 0
  );
  const dialogueReadId = validDialogueCursor(candidate.dialogueReadId)
    ? Math.min(candidate.dialogueReadId, dialogueSerial)
    : dialogueSerial;
  return {
    ...candidate,
    version: 5,
    autonomy: candidate.autonomy ?? { enabled: true },
    phase: migratedPhase,
    storyChoice: legacy ? undefined : candidate.storyChoice,
    openingMission: legacy ? undefined : candidate.openingMission,
    dialogue: normalizedDialogue.dialogue,
    dialogueSerial,
    dialogueReadId,
    flags: {
      ...candidate.flags,
      airportArrivalComplete: candidate.flags?.airportArrivalComplete ?? legacy
    },
    characters: {
      alex: { ...characters.alex, outfit: characters.alex.outfit ?? "casual" },
      maya: { ...characters.maya, outfit: characters.maya.outfit ?? "summer" }
    }
  } as GameState;
}
