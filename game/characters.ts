import type { CharacterId, CharacterState, WeaponId } from "@/types/game";

export interface OperativeProfile {
  id: CharacterId;
  planningRole: string;
  priorities: string[];
  weaponPreference: WeaponId[];
}

export const operativeProfiles: Record<CharacterId, OperativeProfile> = {
  alex: {
    id: "alex",
    planningRole: "movement, timing, and physical readiness",
    priorities: ["speed", "energy", "vehicle", "extraction"],
    weaponPreference: ["rifle", "shotgun", "smg", "pistol", "none"]
  },
  maya: {
    id: "maya",
    planningRole: "risk, supplies, and social cover",
    priorities: ["heat", "health", "cash", "negotiation"],
    weaponPreference: ["smg", "pistol", "rifle", "shotgun", "none"]
  }
};

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
