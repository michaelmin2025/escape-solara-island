import type { CharacterState } from "@/types/game";

export function createCharacters(): Record<"alex" | "maya", CharacterState> {
  return {
    alex: {
      id: "alex",
      name: "Alex",
      role: "Driver · Fieldwork",
      health: 92,
      energy: 86,
      hunger: 18,
      heat: 0,
      weapon: "none"
    },
    maya: {
      id: "maya",
      name: "Maya",
      role: "Negotiation · Infiltration",
      health: 96,
      energy: 89,
      hunger: 16,
      heat: 0,
      weapon: "none"
    }
  };
}
