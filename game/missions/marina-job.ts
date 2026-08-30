import type { MissionDefinition } from "@/types/game";

export const marinaJob: MissionDefinition = {
  id: "marina-job",
  title: "The Marina Job",
  summary: "Move a contraband ledger from a luxury yacht to a hidden northern dock before harbor security closes the water.",
  contact: "Inés Vale",
  startingLocation: "marina",
  estimatedHours: 9,
  baseReward: 185000,
  risk: "moderate",
  kind: "major",
  requirements: [{ type: "flag", value: "objectiveUnlocked", label: "Answer the hotel call" }],
  scenes: [
    {
      id: "briefing",
      type: "phone_call",
      nextSceneId: "meet-ines",
      effects: { timeMinutes: 20 },
      lines: [
        { speaker: "HANDLER", text: "Port Lucero. Inés Vale has a ledger worth more than the yacht carrying it.", channel: "phone" },
        { speaker: "MAYA", text: "Negotiation first. Extraction if that fails.", channel: "phone" }
      ]
    },
    {
      id: "meet-ines",
      type: "meet_contact",
      nextSceneId: "harbor-guard",
      effects: { timeMinutes: 35 },
      lines: [
        { speaker: "INÉS", text: "The guard knows something is wrong. He is looking at your car.", channel: "field" },
        { speaker: "ALEX", text: "We can pay him, scare him, or take the service skiff.", channel: "field" }
      ]
    },
    {
      id: "harbor-guard",
      type: "decision",
      caller: "maya",
      prompt: "The harbor guard is blocking the yacht gate. How do we get past him?",
      options: [
        {
          id: "bribe",
          label: "Bribe the guard",
          description: "$10,000 · Low heat · Maya handles the exchange",
          nextSceneId: "north-run",
          effects: { cash: -10000, successModifier: 14, timeMinutes: 25 },
          requirements: [{ type: "cash", value: 10000, label: "$10,000 available" }]
        },
        {
          id: "threaten",
          label: "Let Alex threaten him",
          description: "No cost · Faster · Heat +1 · Requires a weapon",
          nextSceneId: "north-run",
          effects: { heat: 1, successModifier: 5, timeMinutes: 10 },
          requirements: [{ type: "weapon", value: "pistol", label: "An equipped weapon" }]
        },
        {
          id: "service-skiff",
          label: "Steal the service skiff",
          description: "Slower coastal route · Low surveillance · Vehicle left behind",
          nextSceneId: "north-run",
          effects: { successModifier: 10, timeMinutes: 55 }
        },
        { id: "abort", label: "Abort", description: "Preserve the team and the opportunity", abort: true }
      ]
    },
    {
      id: "north-run",
      type: "drive",
      destination: "hidden-dock",
      minutes: 75,
      nextSceneId: "transfer",
      lines: [
        { speaker: "MAYA", text: "The northern water is clear. No patrol lights.", channel: "field" },
        { speaker: "ALEX", text: "Then we finish this before they notice the ledger is gone.", channel: "field" }
      ]
    },
    { id: "transfer", type: "mission_action", label: "Extract the ledger and clear the cove", durationMinutes: 385, baseSuccess: 54 }
  ],
  outcomes: {
    success: {
      payout: 185000,
      message: "The ledger is secure. Inés owes the team and a sea escape is now possible.",
      effects: { heat: 0.6 },
      unlockVehicles: ["suv"],
      flags: { marinaContact: true, boatEscape: true }
    },
    partial: {
      payout: 100000,
      message: "Half the ledger survived the pursuit. Inés paid less, but kept the contact open.",
      effects: { heat: 1.4, health: -8 },
      flags: { marinaContact: true }
    },
    failure: { payout: 0, message: "The ledger was lost in the cove. Harbor security identified the team.", effects: { heat: 2, health: -15 } },
    aborted: { payout: 0, message: "The marina opportunity remains open." }
  }
};
