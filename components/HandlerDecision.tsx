import type { DecisionState } from "@/types/game";

export function HandlerDecision({ decision, handlerName, onChoose }: { decision: DecisionState; handlerName: string; onChoose: (option: string) => void }) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="decision-title">
      <section className="modal-card max-w-2xl">
        <div className="modal-card-body">
          <div className="absolute right-8 top-8 flex items-end gap-1" aria-hidden="true"><i className="h-1 w-1 bg-solara-coral" /><i className="h-2 w-1 bg-solara-coral" /><i className="h-3 w-1 bg-solara-coral" /><i className="h-4 w-1 bg-solara-coral" /></div>
          <p className="label">FIELD TEAM → HANDLER</p>
          <h2 id="decision-title" className="mt-3 font-display text-4xl italic text-solara-ink">Decision required</h2>
          <p className="mt-3 max-w-xl text-sm leading-6 text-solara-ink/65">{decision.prompt}</p>
          <blockquote className="my-5 rounded-r-md border-l-4 border-solara-coral bg-[#fdf3d3] p-4 font-display text-sm italic text-solara-ink/80"><strong className="mr-2 font-sans text-[9px] not-italic tracking-widest text-solara-coral">{decision.caller.toUpperCase()}:</strong>{handlerName}, what&apos;s the call?</blockquote>
          <div className="space-y-2">
            {decision.options.map((option, index) => (
              <button key={option.id} disabled={!option.available} onClick={() => onChoose(option.id)} className="group grid w-full grid-cols-[36px_1fr] items-center gap-3 rounded-md border border-solara-ink/25 bg-white/50 p-3 text-left transition hover:border-solara-coral/70 hover:bg-[#fdf3d3] disabled:cursor-not-allowed disabled:opacity-35">
                <span className="grid h-8 w-8 place-items-center rounded border-2 border-solara-coral/60 font-display text-[13px] font-bold text-solara-coral group-hover:bg-solara-coral group-hover:text-white">{String.fromCharCode(65 + index)}</span>
                <div><strong className="block text-xs text-solara-ink">{option.label}</strong><small className="mt-1 block text-[9px] text-solara-ink/50">{option.available ? option.description : option.unavailableReason}</small></div>
              </button>
            ))}
          </div>
          <p className="mt-5 text-center text-[8px] tracking-wider text-solara-ink/40">AI progression is paused until the human handler chooses.</p>
        </div>
      </section>
    </div>
  );
}
