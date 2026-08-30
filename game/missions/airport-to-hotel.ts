import type { MissionDefinition } from "@/types/game";

export const airportToHotel: MissionDefinition = {
  id: "airport-to-hotel",
  title: "Hotel Check-In",
  summary: "Drive Alex and Maya from Solara Island Airport to Hotel Aster and check in with the handler.",
  contact: "Handler",
  startingLocation: "airport",
  estimatedHours: 1,
  baseReward: 0,
  risk: "tutorial",
  kind: "tutorial",
  scenes: [
    {
      id: "arrival",
      type: "dialogue",
      nextSceneId: "coastal-road",
      effects: { timeMinutes: 8 },
      lines: [
        { speaker: "ALEX", text: "The rental is ready. Hotel Aster is our only stop.", channel: "field" },
        { speaker: "MAYA", text: "We check in, secure the room, and wait for the handler.", channel: "field" }
      ]
    },
    {
      id: "coastal-road",
      type: "drive",
      destination: "hotel",
      minutes: 52,
      nextSceneId: "hotel-arrival",
      lines: [
        { speaker: "MAYA", text: "Keep it quiet on the way in.", channel: "field" },
        { speaker: "ALEX", text: "Low profile until we know the assignment.", channel: "field" }
      ]
    },
    {
      id: "hotel-arrival",
      type: "phone_call",
      nextSceneId: "complete",
      lines: [
        { speaker: "ALEX", text: "We're checked in. The room is secure.", channel: "phone" },
        { speaker: "MAYA", text: "Call the handler. We're ready for the options.", channel: "phone" }
      ]
    },
    { id: "complete", type: "reward", outcome: "success" }
  ],
  outcomes: {
    success: { payout: 0, message: "Hotel Aster reached. The handler will call shortly.", flags: { tutorialComplete: true, hotelCallPending: true } },
    partial: { payout: 0, message: "Hotel Aster reached." },
    failure: { payout: 0, message: "The tutorial route failed." },
    aborted: { payout: 0, message: "The airport route was paused." }
  }
};
