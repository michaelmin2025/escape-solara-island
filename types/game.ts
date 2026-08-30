export type CharacterId = "alex" | "maya";
export type WeaponId = "none" | "pistol" | "shotgun" | "smg" | "rifle";
export type VehicleId = "rental" | "roadster" | "suv" | "grand-tourer";
export type MissionOutcome = "success" | "partial" | "failure" | "aborted";
export type GamePhase = "playing" | "hotel-call" | "won" | "lost";

export interface HandlerState {
  name: string;
  directive: string;
}

export interface CharacterState {
  id: CharacterId;
  name: string;
  role: string;
  health: number;
  energy: number;
  hunger: number;
  heat: number;
  weapon: WeaponId;
}

export interface DialogueLine {
  speaker: string;
  text: string;
  channel?: "field" | "phone" | "system";
}

export interface ActivityEntry {
  id: string;
  day: number;
  time: string;
  kind: "webmcp" | "travel" | "dialogue" | "decision" | "success" | "partial" | "danger" | "recovery" | "system";
  title: string;
  detail: string;
}

export interface SceneEffects {
  timeMinutes?: number;
  cash?: number;
  heat?: number;
  health?: number;
  energy?: number;
  hunger?: number;
  successModifier?: number;
  flags?: Record<string, boolean>;
}

export interface Requirement {
  type: "flag" | "weapon" | "vehicle" | "cash" | "health" | "completed";
  value: string | number;
  character?: CharacterId;
  label: string;
}

export interface DecisionOption {
  id: string;
  label: string;
  description: string;
  nextSceneId?: string;
  effects?: SceneEffects;
  requirements?: Requirement[];
  abort?: boolean;
}

interface BaseScene {
  id: string;
  nextSceneId?: string;
  effects?: SceneEffects;
}

export interface DialogueScene extends BaseScene {
  type: "dialogue" | "phone_call" | "meet_contact" | "investigate";
  lines: DialogueLine[];
}

export interface DriveScene extends BaseScene {
  type: "drive";
  destination: string;
  minutes: number;
  lines?: DialogueLine[];
}

export interface DecisionScene extends BaseScene {
  type: "decision";
  caller: CharacterId;
  prompt: string;
  options: DecisionOption[];
}

export interface ActionScene extends BaseScene {
  type: "mission_action";
  durationMinutes: number;
  baseSuccess: number;
  label: string;
}

export interface RewardScene extends BaseScene {
  type: "reward";
  outcome: MissionOutcome;
}

export type MissionScene = DialogueScene | DriveScene | DecisionScene | ActionScene | RewardScene;

export interface OutcomeDefinition {
  payout: number;
  message: string;
  effects?: SceneEffects;
  unlockWeapons?: WeaponId[];
  unlockVehicles?: VehicleId[];
  flags?: Record<string, boolean>;
}

export interface MissionDefinition {
  id: string;
  title: string;
  summary: string;
  contact: string;
  startingLocation: string;
  estimatedHours: number;
  baseReward: number;
  risk: "tutorial" | "moderate" | "high" | "extreme" | "side";
  kind: "tutorial" | "major" | "side";
  repeatable?: boolean;
  requirements?: Requirement[];
  scenes: MissionScene[];
  outcomes: Record<MissionOutcome, OutcomeDefinition>;
}

export interface ActiveMission {
  missionId: string;
  sceneId: string;
  successModifier: number;
  branchLabel?: string;
}

export interface DecisionState {
  missionId: string;
  sceneId: string;
  caller: CharacterId;
  prompt: string;
  options: Array<DecisionOption & { available: boolean; unavailableReason?: string }>;
}

export interface EndingState {
  title: string;
  message: string;
}

export interface GameState {
  version: 2;
  handler: HandlerState;
  totalMinutes: number;
  cash: number;
  targetCash: number;
  objectiveUnlocked: boolean;
  clientMet: boolean;
  currentLocation: string;
  previousLocation: string;
  discoveredLocations: string[];
  characters: Record<CharacterId, CharacterState>;
  inventory: {
    weapons: WeaponId[];
    vehicles: VehicleId[];
    activeVehicle: VehicleId;
  };
  completedMissions: Record<string, MissionOutcome>;
  missionAttempts: Record<string, number>;
  activeMission?: ActiveMission;
  currentDecision?: DecisionState;
  flags: Record<string, boolean>;
  dialogue: DialogueLine[];
  activityLog: ActivityEntry[];
  activitySerial: number;
  failedMissions: number;
  phase: GamePhase;
  ending?: EndingState;
  rng: number;
}

export interface ActionResult {
  ok: boolean;
  message: string;
  outcome?: MissionOutcome | "won";
  decision?: DecisionState;
  data?: unknown;
}
