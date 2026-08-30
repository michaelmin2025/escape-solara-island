import { formatMoney, getMissionAvailability, missionCalculation } from "@/game/engine";
import { getLocation } from "@/game/locations";
import { missions } from "@/game/missions";
import type { GameState } from "@/types/game";

interface MissionPanelProps {
  state: GameState;
  onDrive: (destination: string) => void;
  onStart: (missionId: string) => void;
}

const riskChip: Record<string, string> = {
  extreme: "bg-solara-coral text-white",
  high: "bg-orange-500 text-white",
  moderate: "bg-solara-sun text-[#5c430e]",
  tutorial: "bg-solara-lagoon text-white",
  side: "bg-solara-olive text-white"
};

export function MissionPanel({ state, onDrive, onStart }: MissionPanelProps) {
  const visible = Object.values(missions).filter((mission) => state.flags.tutorialComplete ? mission.id !== "airport-to-hotel" : mission.id === "airport-to-hotel");
  return (
    <section className="panel flex max-h-[336px] shrink-0 flex-col overflow-hidden">
      <header className="panel-header shrink-0 py-2"><div><p className="label">OPPORTUNITY BOARD</p><h2 className="panel-title">Work on the island</h2></div></header>
      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-2 scrollbar-thin">
        {visible.map((mission) => {
          const status = getMissionAvailability(state, mission);
          const completed = state.completedMissions[mission.id];
          const isHere = state.currentLocation === mission.startingLocation;
          const calculation = missionCalculation(state, mission.id);
          const canAct = status.available && !state.currentDecision && !state.activeMission;
          return (
            <article key={mission.id} className={`rounded-md border p-2.5 ${mission.kind === "major" ? "border-solara-sun/70 bg-[#fdf3d3]/60" : "border-solara-ink/20 bg-white/45"} ${!status.available && !completed ? "opacity-45" : ""}`}>
              <div className="flex items-center gap-2">
                <span className={`rounded px-1.5 py-0.5 text-[7px] font-black uppercase tracking-wider ${riskChip[mission.risk] ?? riskChip.side}`}>{mission.risk}</span>
                <strong className="ml-auto font-display text-[12px] text-solara-coral">{mission.baseReward ? formatMoney(mission.baseReward) : "ORIENTATION"}</strong>
              </div>
              <h3 className="mt-1.5 font-display text-[13px] leading-tight text-solara-ink">{mission.title}</h3>
              <p className="mt-1 text-[8px] font-bold uppercase tracking-wider text-solara-ink/45">{getLocation(mission.startingLocation).shortName} · ~{mission.estimatedHours}H · {completed ? completed : `${calculation.chance}% plan`}</p>
              <button
                disabled={!canAct}
                onClick={() => isHere ? onStart(mission.id) : onDrive(mission.startingLocation)}
                className="btn-ghost mt-2 w-full px-2 py-1.5 text-[8px] font-black uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-40"
              >
                {completed && !mission.repeatable ? `Completed · ${completed}` : !status.available ? status.reason : isHere ? "Start operation" : `Drive to ${getLocation(mission.startingLocation).shortName}`}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
