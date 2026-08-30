import { formatMoney, getMissionAvailability, missionCalculation } from "@/game/engine";
import { getLocation } from "@/game/locations";
import { missions } from "@/game/missions";
import type { GameState } from "@/types/game";

interface MissionPanelProps {
  state: GameState;
  onDrive: (destination: string) => void;
  onStart: (missionId: string) => void;
}

const riskStamp: Record<string, string> = {
  extreme: "bg-solara-coral text-white",
  high: "bg-orange-500 text-white",
  moderate: "bg-solara-sun text-[#5c430e]",
  tutorial: "bg-solara-lagoon text-white",
  side: "bg-solara-olive text-white"
};

export function MissionPanel({ state, onDrive, onStart }: MissionPanelProps) {
  const visible = Object.values(missions).filter((mission) => state.flags.tutorialComplete ? mission.id !== "airport-to-hotel" : mission.id === "airport-to-hotel");
  return (
    <section className="panel flex min-h-[230px] flex-col overflow-hidden">
      <header className="panel-header py-3"><div><p className="label">OPPORTUNITY BOARD</p><h2 className="panel-title">Work around the island</h2></div><span className="text-[8px] font-bold tracking-wider text-solara-ink/40">THREE MAJOR ROUTES · SIDE WORK UNLOCKS LATER</span></header>
      <div className="flex min-h-0 flex-1 gap-3 overflow-x-auto p-3 scrollbar-thin">
        {visible.map((mission) => {
          const status = getMissionAvailability(state, mission);
          const completed = state.completedMissions[mission.id];
          const isHere = state.currentLocation === mission.startingLocation;
          const calculation = missionCalculation(state, mission.id);
          const canAct = status.available && !state.currentDecision && !state.activeMission;
          return (
            <article key={mission.id} className={`flex w-[255px] min-w-[255px] flex-col rounded-md border p-3 ${mission.kind === "major" ? "border-solara-sun/70 bg-[#fdf3d3]/60" : "border-solara-ink/20 bg-white/45"} ${!status.available && !completed ? "opacity-45" : ""}`}>
              <div className="flex items-center gap-2 text-[7px] font-black uppercase tracking-wider text-solara-ink/45"><span className={`rounded px-1.5 py-1 ${riskStamp[mission.risk] ?? riskStamp.side}`}>{mission.risk}</span><span className="truncate">{getLocation(mission.startingLocation).shortName}</span><span className="ml-auto">~{mission.estimatedHours}H</span></div>
              <h3 className="mt-3 font-display text-sm text-solara-ink">{mission.title}</h3>
              <p className="mt-1 flex-1 text-[9px] leading-4 text-solara-ink/50">{mission.summary}</p>
              <div className="my-3 flex items-center justify-between border-y border-dashed border-solara-ink/25 py-2"><strong className="font-display text-xs text-solara-coral">{mission.baseReward ? formatMoney(mission.baseReward) : "ORIENTATION"}</strong><span className="text-[8px] font-bold text-solara-ink/45">{completed ? completed.toUpperCase() : `${calculation.chance}% PLAN`}</span></div>
              <button
                disabled={!canAct}
                onClick={() => isHere ? onStart(mission.id) : onDrive(mission.startingLocation)}
                className="btn-ghost px-3 py-2 text-[8px] font-black uppercase tracking-wider disabled:cursor-not-allowed disabled:opacity-40"
              >
                {completed && !mission.repeatable ? completed : !status.available ? status.reason : isHere ? "Start operation" : `Drive to ${getLocation(mission.startingLocation).shortName}`}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}
