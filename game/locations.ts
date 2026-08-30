export interface LocationDefinition {
  id: string;
  name: string;
  shortName: string;
  x: number;
  y: number;
  district: string;
  description: string;
}

export const locations: Record<string, LocationDefinition> = {
  "west-port": {
    id: "west-port", name: "Cala Vela", shortName: "West Port", x: 8, y: 51, district: "Historic West",
    description: "A sandstone port threaded with alleys too narrow for a clean getaway."
  },
  "hidden-dock": {
    id: "hidden-dock", name: "Mourning Cove", shortName: "Hidden Dock", x: 15, y: 25, district: "Northern Coast",
    description: "A limestone inlet hidden beneath pine-covered cliffs."
  },
  marina: {
    id: "marina", name: "Port Lucero", shortName: "Marina", x: 24, y: 69, district: "Southwest Marina",
    description: "White yachts, blue water, and deals made below deck."
  },
  airfield: {
    id: "airfield", name: "Santoro Airstrip", shortName: "Final Airfield", x: 38, y: 42, district: "Rural Interior",
    description: "A private runway among dry-stone fields—the final way out."
  },
  "north-cliffs": {
    id: "north-cliffs", name: "Cinder Cliffs", shortName: "North Cliffs", x: 48, y: 15, district: "Northern Coast",
    description: "Remote headlands with long sightlines and almost no police."
  },
  rural: {
    id: "rural", name: "Esconda Interior", shortName: "Rural Interior", x: 53, y: 48, district: "Island Interior",
    description: "Pine roads, dry-stone walls, and isolated farm compounds."
  },
  estate: {
    id: "estate", name: "Valcora Estate", shortName: "Coastal Estate", x: 63, y: 26, district: "Northeast Heights",
    description: "A pale villa looking over the northern sea."
  },
  hotel: {
    id: "hotel", name: "Hotel Aster", shortName: "Hotel", x: 65, y: 72, district: "South Resort",
    description: "A whitewashed resort where the handler's first call changes everything."
  },
  airport: {
    id: "airport", name: "Solara Island Airport", shortName: "Airport", x: 75, y: 65, district: "Southeast Corridor",
    description: "A small Mediterranean terminal surrounded by pale roads and scrub."
  },
  resort: {
    id: "resort", name: "Miraflores Resort", shortName: "Casino Resort", x: 77, y: 82, district: "Southern Coves",
    description: "Turquoise coves above a casino built for people who never ask the price."
  },
  industrial: {
    id: "industrial", name: "Cinderworks Harbor", shortName: "Industrial Harbor", x: 86, y: 38, district: "Eastern Harbor",
    description: "Cranes, warehouses, and the island's most dangerous recovery contracts."
  },
  "east-city": {
    id: "east-city", name: "Puerto Nacar", shortName: "East City", x: 94, y: 52, district: "Eastern Capital",
    description: "A busy harbor city where police attention travels faster than money."
  }
};

export const initialDiscoveredLocations = ["airport", "hotel"];

export const postCallLocations = Object.keys(locations).filter((id) => id !== "hidden-dock" && id !== "estate");

export function getLocation(id: string): LocationDefinition {
  return locations[id] ?? locations.airport;
}
