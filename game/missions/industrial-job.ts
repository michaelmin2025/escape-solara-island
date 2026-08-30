import type { MissionDefinition } from "@/types/game";

export const industrialJob: MissionDefinition = {
  id: "industrial-job",
  title: "Cinderworks Recovery",
  summary: "Recover a seized prototype and its engineer before an eastern-harbor syndicate ships both off-island.",
  contact: "Dr. Sera Venn",
  startingLocation: "industrial",
  estimatedHours: 9,
  baseReward: 175000,
  risk: "high",
  kind: "major",
  requirements: [{ type: "flag", value: "objectiveUnlocked", label: "Answer the hotel call" }],
  scenes: [
    {
      id: "briefing",
      type: "phone_call",
      nextSceneId: "yard-contact",
      effects: { timeMinutes: 20 },
      lines: [
        { speaker: "HANDLER", text: "Cinderworks has a prototype and the engineer who built it. Recover both if you can.", channel: "phone" },
        { speaker: "MAYA", text: "And if we can only recover one?", channel: "phone" },
        { speaker: "HANDLER", text: "That is why I'm still on the line.", channel: "phone" }
      ]
    },
    {
      id: "yard-contact",
      type: "meet_contact",
      nextSceneId: "recovery-choice",
      effects: { timeMinutes: 40 },
      lines: [
        { speaker: "SERA", text: "The prototype is on a truck. My engineer is in the rural relay house.", channel: "field" },
        { speaker: "ALEX", text: "Two targets, one shipping window.", channel: "field" }
      ]
    },
    {
      id: "recovery-choice",
      type: "decision",
      caller: "alex",
      prompt: "The prototype truck is leaving. Do we chase it or rescue the engineer first?",
      options: [
        {
          id: "truck",
          label: "Intercept the prototype truck",
          description: "Higher payout odds · Vehicle-dependent · Engineer left behind",
          nextSceneId: "rural-pursuit",
          effects: { successModifier: 8, heat: 1, timeMinutes: 20 }
        },
        {
          id: "engineer",
          label: "Rescue the engineer",
          description: "Slower · Lower immediate payout · Unlocks technical help",
          nextSceneId: "rural-pursuit",
          effects: { successModifier: 13, timeMinutes: 65, flags: { engineerPriority: true } }
        },
        {
          id: "split",
          label: "Split Alex and Maya",
          description: "Attempt both · High ceiling · Injury risk",
          nextSceneId: "rural-pursuit",
          effects: { successModifier: 4, health: -5, timeMinutes: 35 }
        },
        { id: "abort", label: "Abort", description: "Do not create an enemy at Cinderworks", abort: true }
      ]
    },
    {
      id: "rural-pursuit",
      type: "drive",
      destination: "rural",
      minutes: 60,
      nextSceneId: "recovery",
      lines: [
        { speaker: "ALEX", text: "These interior roads were not made for a pursuit.", channel: "field" },
        { speaker: "MAYA", text: "Then use the walls. They cannot pass us either.", channel: "field" }
      ]
    },
    { id: "recovery", type: "mission_action", label: "Complete the Cinderworks recovery", durationMinutes: 390, baseSuccess: 50 }
  ],
  outcomes: {
    success: {
      payout: 175000,
      message: "The recovery is complete. Sera provides weapons and a clean vehicle route.",
      effects: { heat: 0.8 },
      unlockWeapons: ["shotgun", "smg"],
      unlockVehicles: ["grand-tourer"],
      flags: { seraContact: true }
    },
    partial: {
      payout: 90000,
      message: "One target made it out. Sera pays half and offers limited support.",
      effects: { heat: 1.3, health: -9 },
      unlockWeapons: ["shotgun"],
      flags: { seraContact: true }
    },
    failure: { payout: 0, message: "Cinderworks shipped the prototype. The syndicate now knows the team.", effects: { heat: 2, health: -17 }, flags: { cinderworksEnemy: true } },
    aborted: { payout: 0, message: "The Cinderworks recovery remains available." }
  }
};
