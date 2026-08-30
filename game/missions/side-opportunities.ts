import type { MissionDefinition } from "@/types/game";

export const ruralCourier: MissionDefinition = {
  id: "rural-courier",
  title: "Dry-Stone Courier",
  summary: "Carry a sealed case across the rural interior without using the checkpointed main road.",
  contact: "Inés Network",
  startingLocation: "rural",
  estimatedHours: 4,
  baseReward: 80000,
  risk: "side",
  kind: "side",
  repeatable: true,
  requirements: [{ type: "completed", value: 1, label: "Complete one major mission" }],
  scenes: [
    { id: "briefing", type: "dialogue", nextSceneId: "run", effects: { timeMinutes: 25 }, lines: [{ speaker: "MAYA", text: "No names, no main road, no opening the case.", channel: "field" }] },
    { id: "run", type: "mission_action", label: "Complete the rural courier run", durationMinutes: 215, baseSuccess: 63 }
  ],
  outcomes: {
    success: { payout: 80000, message: "The case crossed the interior unseen.", effects: { heat: 0.2 } },
    partial: { payout: 42000, message: "The case arrived late and the contact cut the fee.", effects: { heat: 0.6 } },
    failure: { payout: 0, message: "The courier route was compromised.", effects: { heat: 1, health: -6 } },
    aborted: { payout: 0, message: "The courier run was cancelled." }
  }
};

export const oldCityExchange: MissionDefinition = {
  id: "old-city-exchange",
  title: "Cala Vela Exchange",
  summary: "Use Maya's social cover to trade stolen account keys through the western old city.",
  contact: "Elian Network",
  startingLocation: "west-port",
  estimatedHours: 3.5,
  baseReward: 70000,
  risk: "side",
  kind: "side",
  repeatable: true,
  requirements: [{ type: "completed", value: 1, label: "Complete one major mission" }],
  scenes: [
    { id: "briefing", type: "dialogue", nextSceneId: "exchange", effects: { timeMinutes: 30 }, lines: [{ speaker: "ALEX", text: "Too many alleys for a car. Maya takes the meeting; I hold the exit.", channel: "field" }] },
    { id: "exchange", type: "mission_action", label: "Complete the old-city exchange", durationMinutes: 180, baseSuccess: 68 }
  ],
  outcomes: {
    success: { payout: 70000, message: "The account keys changed hands without a trace.", effects: { heat: 0.1 } },
    partial: { payout: 38000, message: "The buyer cut the offer, but the team left clean.", effects: { heat: 0.4 } },
    failure: { payout: 0, message: "The buyer vanished and local police marked the vehicle.", effects: { heat: 1.2 } },
    aborted: { payout: 0, message: "The exchange was cancelled." }
  }
};
