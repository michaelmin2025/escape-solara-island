import type { MissionDefinition } from "@/types/game";

export const airportToHotel: MissionDefinition = {
  id: "airport-to-hotel",
  title: "First Light",
  summary: "Drive Alex and Maya from Solara Island Airport to Hotel Aster and establish the operation.",
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
        { speaker: "MAYA", text: "This place is bigger than I expected.", channel: "field" },
        { speaker: "ALEX", text: "We get to the hotel, sleep, and figure things out tomorrow.", channel: "field" },
        { speaker: "MAYA", text: "Assuming our contact doesn't have other plans.", channel: "field" }
      ]
    },
    {
      id: "coastal-road",
      type: "drive",
      destination: "hotel",
      minutes: 52,
      nextSceneId: "hotel-arrival",
      lines: [
        { speaker: "ALEX", text: "Turquoise water, white villas, and half the island watching the road.", channel: "field" },
        { speaker: "MAYA", text: "Vacation paradise. Criminal logistics. Same coastline.", channel: "field" }
      ]
    },
    {
      id: "hotel-arrival",
      type: "phone_call",
      nextSceneId: "complete",
      lines: [
        { speaker: "SYSTEM", text: "INCOMING ENCRYPTED CALL · HANDLER", channel: "system" },
        { speaker: "ALEX", text: "We made it. Tell us why we're really here.", channel: "phone" }
      ]
    },
    { id: "complete", type: "reward", outcome: "success" }
  ],
  outcomes: {
    success: { payout: 0, message: "Hotel Aster reached. The handler is calling.", flags: { tutorialComplete: true, hotelCallPending: true } },
    partial: { payout: 0, message: "Hotel Aster reached." },
    failure: { payout: 0, message: "The tutorial route failed." },
    aborted: { payout: 0, message: "The airport route was paused." }
  }
};
