import type { MissionDefinition } from "@/types/game";
import { airportToHotel } from "./airport-to-hotel";
import { casinoJob } from "./casino-job";
import { industrialJob } from "./industrial-job";
import { marinaJob } from "./marina-job";
import { oldCityExchange, ruralCourier } from "./side-opportunities";

export const missions: Record<string, MissionDefinition> = {
  [airportToHotel.id]: airportToHotel,
  [marinaJob.id]: marinaJob,
  [casinoJob.id]: casinoJob,
  [industrialJob.id]: industrialJob,
  [ruralCourier.id]: ruralCourier,
  [oldCityExchange.id]: oldCityExchange
};

export const majorMissionIds = ["marina-job", "casino-job", "industrial-job"];

export { airportToHotel, marinaJob, casinoJob, industrialJob, ruralCourier, oldCityExchange };
