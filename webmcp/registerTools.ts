import {
  addActivity,
  driveTeam,
  eatTogether,
  equipOutfit,
  equipWeapon,
  restTogether,
  selectOpeningMission,
  setAutonomyMode,
  setHandlerDirective,
  switchVehicle,
  worldState
} from "@/game/engine";
import { planAutonomyStep } from "@/game/autonomy";
import type { ActionResult, CharacterId, GameState, OpeningMissionId, OutfitId, VehicleId, WeaponId } from "@/types/game";

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

  const inspect = (message: string, data: (state: GameState) => unknown) => {
    const state = bridge.getState();
    return response(message, { ok: true, message, data: data(state) }, state);
  };

  const tools: ModelContextToolDefinition[] = [
    {
      name: "get_handler_state",
      description: "Return the human handler's identity, directive, autonomy setting, pending opening-story choice, and selected opening mission.",
      inputSchema: schema(),
      annotations: { readOnlyHint: true },
      execute: () => inspect("Handler state inspected.", (state) => ({
        handler: state.handler,
        autonomy: state.autonomy,
        phase: state.phase,
        storyChoice: state.storyChoice,
        openingMission: state.openingMission
      }))
    },
    {
      name: "get_world_state",
      description: "Return the current game state, including phase, time, location, team, opening-story choice, and selected opening mission.",
      inputSchema: schema(),
      annotations: { readOnlyHint: true },
      execute: () => inspect("World state inspected.", worldState)
    },
    {
      name: "drive_team",
      description: "Drive Alex and Maya together to a discovered Solara Island location. Travel consumes in-game time.",
      inputSchema: schema({ destination: { type: "string" } }, ["destination"]),
      execute: (args) => run("drive_team", args, (state) => driveTeam(state, String(args.destination)))
    },
    {
      name: "select_opening_mission",
      description: "Select one of the handler's three opening mission concepts. This records the choice and pauses before any mission briefing or execution.",
      inputSchema: schema({
        missionId: {
          type: "string",
          enum: ["luxury-vehicle", "arms-deal", "drug-shipment"]
        }
      }, ["missionId"]),
      execute: (args) => run(
        "select_opening_mission",
        args,
        (state) => selectOpeningMission(state, String(args.missionId) as OpeningMissionId)
      )
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
      name: "equip_outfit",
      description: "Assign summer, casual, or formal mission cover to Alex or Maya. Outfit choice affects mission success estimates.",
      inputSchema: schema({ character: { type: "string", enum: ["alex", "maya"] }, outfit: { type: "string", enum: ["summer", "casual", "formal"] } }, ["character", "outfit"]),
      execute: (args) => run("equip_outfit", args, (state) => equipOutfit(state, String(args.character) as CharacterId, String(args.outfit) as OutfitId))
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
      name: "get_agent_intention",
      description: "Return Alex and Maya's next autonomous action or the handler decision that is blocking them.",
      inputSchema: schema(),
      annotations: { readOnlyHint: true },
      execute: () => inspect("Field-team intention inspected.", planAutonomyStep)
    },
    {
      name: "set_agent_autonomy",
      description: "Enable or pause Alex and Maya's autonomous routine planning. Consequential decisions always remain with the human handler.",
      inputSchema: schema({ enabled: { type: "boolean" } }, ["enabled"]),
      execute: (args) => run("set_agent_autonomy", args, (state) => setAutonomyMode(state, Boolean(args.enabled)))
    },
    {
      name: "request_handler_decision",
      description: "Return the pending opening-story choice and any selected opening mission. This never chooses on the handler's behalf.",
      inputSchema: schema({ context: { type: "string" } }),
      annotations: { readOnlyHint: true },
      execute: (args) => inspect("Handler decision inspected.", (state) => ({
        context: args.context ?? null,
        phase: state.phase,
        storyChoice: state.storyChoice,
        openingMission: state.openingMission
      }))
    }
  ];

  for (const tool of tools) await context.registerTool(tool, { signal: controller.signal });
  return { abort: () => controller.abort(), count: tools.length };
}
