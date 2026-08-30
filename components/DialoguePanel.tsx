import type { DialogueLine } from "@/types/game";

export function DialoguePanel({ lines }: { lines: DialogueLine[] }) {
  const visible = lines.slice(-5);
  return (
    <section className="panel overflow-hidden">
      <header className="panel-header py-2"><div><p className="label">POSTCARDS FROM THE FIELD</p><h2 className="panel-title">Field dialogue</h2></div><span className="rounded border border-solara-ink/25 px-2 py-1 text-[7px] font-black tracking-widest text-solara-pine">DIRECT LINE</span></header>
      <div className="flex gap-3 overflow-x-auto p-3 scrollbar-thin">
        {visible.map((line, index) => (
          <div key={`${line.speaker}-${index}-${line.text}`} className={`min-w-[210px] flex-1 rounded-md border p-3 ${line.channel === "phone" ? "border-solara-sun/60 bg-[#fdf3d3]" : line.channel === "system" ? "border-solara-lagoon/50 bg-solara-lagoon/10" : "border-solara-ink/20 bg-white/45"}`}>
            <strong className={`text-[8px] tracking-[.14em] ${line.channel === "phone" ? "text-[#9a6a10]" : "text-solara-pine"}`}>{line.speaker}</strong>
            <p className="mt-1 font-display text-[11px] italic leading-4 text-solara-ink/75">“{line.text}”</p>
          </div>
        ))}
      </div>
    </section>
  );
}
