import type { OutfitId } from "@/types/game";

export interface OutfitDefinition {
  name: string;
  description: string;
  missionModifiers: Record<string, number>;
}

export const outfits: Record<OutfitId, OutfitDefinition> = {
  summer: {
    name: "Summer Wear",
    description: "Light linen and resort-ready layers for warm-weather cover.",
    missionModifiers: {
      "airport-to-hotel": 2,
      "marina-job": 6,
      "rural-courier": 5,
      "old-city-exchange": 2
    }
  },
  casual: {
    name: "Casual Wear",
    description: "Low-profile field clothing that blends into working districts.",
    missionModifiers: {
      "airport-to-hotel": 2,
      "marina-job": 3,
      "industrial-job": 6,
      "rural-courier": 4,
      "old-city-exchange": 3
    }
  },
  formal: {
    name: "Formal Wear",
    description: "Tailored social cover for private rooms, buyers, and high society.",
    missionModifiers: {
      "marina-job": 2,
      "casino-job": 7,
      "old-city-exchange": 6
    }
  }
};

export function outfitMissionModifier(outfitId: OutfitId, missionId: string) {
  return outfits[outfitId].missionModifiers[missionId] ?? 0;
}
