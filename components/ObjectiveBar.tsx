import { formatMoney, getObjective } from "@/game/engine";
import type { GameState } from "@/types/game";

export function ObjectiveBar({ state }: { state: GameState }) {
  const objective = getObjective(state);
  const progress = Math.max(3, objective.progress * 100);
  return (
    <section className="panel grid grid-cols-[auto_minmax(180px,.9fr)_minmax(220px,1.25fr)] items-center gap-4 px-4 py-3 max-sm:grid-cols-[auto_1fr]">
      <span className="grid h-9 w-9 place-items-center rounded-full border-2 border-solara-ink/35 bg-white/50 text-solara-coral">◎</span>
      <div><p className="label">CURRENT OBJECTIVE</p><h3 className="font-display text-sm text-solara-ink">{objective.title}</h3><p className="mt-1 text-[9px] text-solara-ink/50">{objective.detail}</p></div>
      <div className="max-sm:col-span-2">
        <div className="relative h-2.5 overflow-hidden rounded-full border border-solara-ink/25 bg-solara-ink/10">
          <i className="block h-full rounded-full bg-gradient-to-r from-solara-sun to-solara-coral transition-all" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-1 flex items-center justify-between text-[8px] font-bold tracking-widest text-solara-ink/40"><span>ROUTE TO THE AIRFIELD</span><span>{formatMoney(state.cash)} / {formatMoney(state.targetCash)} ✈</span></p>
      </div>
    </section>
  );
}
