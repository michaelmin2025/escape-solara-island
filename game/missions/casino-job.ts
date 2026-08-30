import type { MissionDefinition } from "@/types/game";

export const casinoJob: MissionDefinition = {
  id: "casino-job",
  title: "The Miraflores Count",
  summary: "Infiltrate a southern-resort casino during the nightly count and redirect its private reserve.",
  contact: "Elian Roque",
  startingLocation: "resort",
  estimatedHours: 10,
  baseReward: 250000,
  risk: "extreme",
  kind: "major",
  requirements: [{ type: "flag", value: "objectiveUnlocked", label: "Answer the hotel call" }],
  scenes: [
    {
      id: "briefing",
      type: "phone_call",
      nextSceneId: "survey",
      effects: { timeMinutes: 25 },
      lines: [
        { speaker: "HANDLER", text: "Miraflores moves the count at midnight. Elian can get one of you onto the floor.", channel: "phone" },
        { speaker: "ALEX", text: "One inside, one on extraction. Unless we make noise.", channel: "phone" }
      ]
    },
    {
      id: "survey",
      type: "investigate",
      nextSceneId: "entry-choice",
      effects: { timeMinutes: 55 },
      lines: [
        { speaker: "MAYA", text: "Security rotates through the east hall every six minutes.", channel: "field" },
        { speaker: "ELIAN", text: "The floor entrance is elegant. The service entrance is honest.", channel: "field" }
      ]
    },
    {
      id: "entry-choice",
      type: "decision",
      caller: "maya",
      prompt: "Security changed the rotation. Which entry plan do we commit to?",
      options: [
        {
          id: "social",
          label: "Maya runs the floor",
          description: "Social infiltration · Lower heat · Best if Maya is healthy",
          nextSceneId: "vault-count",
          effects: { successModifier: 14, timeMinutes: 45 },
          requirements: [{ type: "health", value: 45, character: "maya", label: "Maya health 45+" }]
        },
        {
          id: "service",
          label: "Breach the service hall",
          description: "Fast and direct · Heat +2 · Requires the pistol",
          nextSceneId: "vault-count",
          effects: { successModifier: 7, heat: 2, timeMinutes: 15 },
          requirements: [{ type: "weapon", value: "pistol", label: "An equipped pistol" }]
        },
        {
          id: "buy-access",
          label: "Buy Elian's master key",
          description: "$25,000 · Strong odds · Elian disappears afterward",
          nextSceneId: "vault-count",
          effects: { cash: -25000, successModifier: 19, timeMinutes: 25, flags: { elianPaid: true } },
          requirements: [{ type: "cash", value: 25000, label: "$25,000 available" }]
        },
        { id: "abort", label: "Walk away", description: "Keep the casino available for another night", abort: true }
      ]
    },
    { id: "vault-count", type: "mission_action", label: "Redirect the private reserve and leave the resort", durationMinutes: 470, baseSuccess: 44 }
  ],
  outcomes: {
    success: {
      payout: 250000,
      message: "The reserve is gone before sunrise. Miraflores has no idea who to blame.",
      effects: { heat: 1.2 },
      unlockWeapons: ["rifle"],
      unlockVehicles: ["roadster"],
      flags: { casinoAccess: true }
    },
    partial: {
      payout: 130000,
      message: "The team escaped with one cash case, but security captured their route.",
      effects: { heat: 2, health: -10 },
      unlockVehicles: ["roadster"]
    },
    failure: { payout: 0, message: "The count locked down. The team escaped hurt and empty-handed.", effects: { heat: 2.5, health: -19 } },
    aborted: { payout: 0, message: "The Miraflores count remains available." }
  }
};
