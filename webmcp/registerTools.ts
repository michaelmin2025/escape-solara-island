import {
  addActivity,
  answerHotelCall,
  attemptEscape,
  availableMissions,
  choosePath,
  driveTeam,
  eatTogether,
  equipWeapon,
  getMissionAvailability,
  missionCalculation,
  restTogether,
  setHandlerDirective,
  startTeamMission,
  switchVehicle,
  worldState
} from "@/game/engine";
import { missions } from "@/game/missions";
import type { ActionResult, CharacterId, GameState, VehicleId, WeaponId } from "@/types/game";

export interface GameBridge {
  getState: () => GameState;
  perform: (action: (draft: GameState) => ActionResult) => { result: ActionResult; state: GameState };
}

const schema = (properties: Record<string, unknown> = {}, required: string[] = []) => ({ type: "object", properties, required });

function response(message: string, data: unknown, state: GameState): ModelContextToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify({ message, data, world: worldState(state) }, null, 2) }]
  };
}

export async function registerGameTools(bridge: GameBridge): Promise<{ abort: () => void; count: number } | null> {
  const context = document.modelContext;
  if (!context?.registerTool) return null;
  const controller = new AbortController();

  const run = (name: string, args: Record<string, unknown>, action: (state: GameState) => ActionResult) => {
    const { result, state } = bridge.perform((draft) => {
      addActivity(draft, "webmcp", name, Object.keys(args).length ? JSON.stringify(args) : "Structured tool call");
      return action(draft);
    });
    return response(result.message, result, state);
  };

  const tools: ModelContextToolDefinition[] = [
    {
      name: "get_handler_state",
      description: "Return the human handler's identity, strategic directive, and any decision waiting for them.",
      inputSchema: schema(),
      annotations: { readOnlyHint: true },
      execute: (args) => run("get_handler_state", args, (state) => ({ ok: true, message: "Handler state inspected.", data: { handler: state.handler, decision: state.currentDecision } }))
    },
    {
      name: "get_world_state",
      description: "Return the complete strategic state: time, location, objective, team, cash, missions, and escape readiness.",
      inputSchema: schema(),
      annotations: { readOnlyHint: true },
      execute: (args) => run("get_world_state", args, (state) => ({ ok: true, message: "World state inspected.", data: worldState(state) }))
    },
    {
      name: "get_available_missions",
      description: "List major and side opportunities with requirements, outcomes, starting locations, and current success estimates.",
      inputSchema: schema({ includeLocked: { type: "boolean" } }),
      annotations: { readOnlyHint: true },
      execute: (args) => run("get_available_missions", args, (state) => ({
        ok: true,
        message: "Mission network inspected.",
        data: availableMissions(state, Boolean(args.includeLocked)).map(({ mission, available, reason }) => ({
          id: mission.id,
          title: mission.title,
          summary: mission.summary,
          kind: mission.kind,
          risk: mission.risk,
          startingLocation: mission.startingLocation,
          estimatedHours: mission.estimatedHours,
          baseReward: mission.baseReward,
          available,
          reason,
          calculation: missionCalculation(state, mission.id)
        }))
      }))
    },
    {
      name: "inspect_mission",
      description: "Inspect a single data-driven mission, its scene structure, availability, and transparent success factors.",
      inputSchema: schema({ missionId: { type: "string", enum: Object.keys(missions) } }, ["missionId"]),
      annotations: { readOnlyHint: true },
      execute: (args) => run("inspect_mission", args, (state) => {
        const mission = missions[String(args.missionId)];
        return mission
          ? { ok: true, message: `${mission.title} inspected.`, data: { mission, availability: getMissionAvailability(state, mission), calculation: missionCalculation(state, mission.id) } }
          : { ok: false, message: "Unknown mission." };
      })
    },
    {
      name: "drive_team",
      description: "Drive Alex and Maya together to a discovered Solara Island location. Travel consumes in-game time.",
      inputSchema: schema({ destination: { type: "string" } }, ["destination"]),
      execute: (args) => run("drive_team", args, (state) => driveTeam(state, String(args.destination)))
    },
    {
      name: "answer_hotel_call",
      description: "Answer the handler's call after the opening airport-to-hotel mission and unlock the $500,000 objective.",
      inputSchema: schema(),
      execute: (args) => run("answer_hotel_call", args, answerHotelCall)
    },
    {
      name: "meet_major_client",
      description: "Compatibility action for the opening client encounter. At Hotel Aster, this answers the brokered handler call and unlocks the main objective.",
      inputSchema: schema(),
      execute: (args) => run("meet_major_client", args, answerHotelCall)
    },
    {
      name: "start_team_mission",
      description: "Start a mission with Alex and Maya together. Routine scenes run automatically until a human decision or outcome.",
      inputSchema: schema({ missionId: { type: "string", enum: Object.keys(missions) } }, ["missionId"]),
      execute: (args) => run("start_team_mission", args, (state) => startTeamMission(state, String(args.missionId)))
    },
    {
      name: "choose_path",
      description: "Apply the human handler's choice to the paused mission and continue through structured scenes.",
      inputSchema: schema({ option: { type: "string" } }, ["option"]),
      execute: (args) => run("choose_path", args, (state) => choosePath(state, String(args.option)))
    },
    {
      name: "eat_together",
      description: "Have Alex and Maya share a quick or restaurant meal to manage hunger and recovery.",
      inputSchema: schema({ meal: { type: "string", enum: ["quick", "restaurant"] } }, ["meal"]),
      execute: (args) => run("eat_together", args, (state) => eatTogether(state, args.meal === "restaurant" ? "restaurant" : "quick"))
    },
    {
      name: "rest_together",
      description: "Rest Alex and Maya together for 2–8 hours, recovering more at Hotel Aster or in the rural interior.",
      inputSchema: schema({ hours: { type: "integer", minimum: 2, maximum: 8 } }, ["hours"]),
      execute: (args) => run("rest_together", args, (state) => restTogether(state, Number(args.hours)))
    },
    {
      name: "equip_weapon",
      description: "Assign an acquired weapon to Alex or Maya.",
      inputSchema: schema({ character: { type: "string", enum: ["alex", "maya"] }, weapon: { type: "string", enum: ["none", "pistol", "shotgun", "smg", "rifle"] } }, ["character", "weapon"]),
      execute: (args) => run("equip_weapon", args, (state) => equipWeapon(state, String(args.character) as CharacterId, String(args.weapon) as WeaponId))
    },
    {
      name: "switch_vehicle",
      description: "Switch to an acquired vehicle before travel or a mission.",
      inputSchema: schema({ vehicle: { type: "string", enum: ["rental", "roadster", "suv", "grand-tourer"] } }, ["vehicle"]),
      execute: (args) => run("switch_vehicle", args, (state) => switchVehicle(state, String(args.vehicle) as VehicleId))
    },
    {
      name: "set_handler_directive",
      description: "Record the human handler's high-level strategic directive in the shared game state.",
      inputSchema: schema({ directive: { type: "string", minLength: 1, maxLength: 180 } }, ["directive"]),
      execute: (args) => run("set_handler_directive", args, (state) => setHandlerDirective(state, String(args.directive)))
    },
    {
      name: "request_handler_decision",
      description: "Return the consequential mission decision currently waiting for the human handler. This never chooses on their behalf.",
      inputSchema: schema({ context: { type: "string" } }),
      annotations: { readOnlyHint: true },
      execute: (args) => run("request_handler_decision", args, (state) => ({ ok: true, message: state.currentDecision ? "A human decision is pending." : "No human decision is pending.", data: { context: args.context ?? null, decision: state.currentDecision } }))
    },
    {
      name: "attempt_escape",
      description: "Attempt final extraction from Santoro Airstrip. Requires $500,000, both operatives alive, heat at 3 or lower, and time remaining.",
      inputSchema: schema(),
      execute: (args) => run("attempt_escape", args, attemptEscape)
    }
  ];

  for (const tool of tools) await context.registerTool(tool, { signal: controller.signal });
  return { abort: () => controller.abort(), count: tools.length };
}
