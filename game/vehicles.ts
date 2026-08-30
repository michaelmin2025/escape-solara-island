import type { VehicleId, WeaponId } from "@/types/game";

export const weapons: Record<WeaponId, { name: string; modifier: number }> = {
  none: { name: "Unarmed", modifier: 0 },
  pistol: { name: "Valcora Pistol", modifier: 8 },
  shotgun: { name: "Harbor Shotgun", modifier: 14 },
  smg: { name: "Silenced SMG", modifier: 18 },
  rifle: { name: "Casino Carbine", modifier: 23 }
};

export const vehicles: Record<VehicleId, { name: string; travelMultiplier: number; missionModifier: number; attention: number }> = {
  rental: { name: "Ivory Rental Coupé", travelMultiplier: 1, missionModifier: 0, attention: 0 },
  roadster: { name: "Miraflores Roadster", travelMultiplier: 0.72, missionModifier: 8, attention: 1 },
  suv: { name: "Port Lucero SUV", travelMultiplier: 0.84, missionModifier: 10, attention: 0 },
  "grand-tourer": { name: "Valcora Grand Tourer", travelMultiplier: 0.64, missionModifier: 14, attention: 1 }
};
