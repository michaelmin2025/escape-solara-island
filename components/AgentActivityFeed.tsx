import type { ActivityEntry } from "@/types/game";

const colors: Record<ActivityEntry["kind"], string> = {
  webmcp: "text-solara-foam",
  travel: "text-sky-300",
  dialogue: "text-white/80",
  decision: "text-solara-sun",
  success: "text-emerald-300",
  partial: "text-amber-300",
  danger: "text-[#ff9b85]",
  recovery: "text-violet-300",
  system: "text-white/65"
};

export function AgentActivityFeed({ activity }: { activity: ActivityEntry[] }) {
  return (
    <section className="panel panel-night flex min-h-0 flex-1 flex-col overflow-hidden">
      <header className="panel-header"><div><p className="label !text-solara-foam/80">SHIP-TO-SHORE WIRE</p><h2 className="panel-title">Agent activity</h2></div><span className="flex items-center gap-1 rounded border border-solara-foam/25 px-2 py-1 text-[7px] font-black tracking-widest text-solara-foam"><i className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />LIVE</span></header>
      <p className="border-b border-solara-foam/15 bg-white/[.03] px-4 py-3 text-[9px] leading-4 text-solara-foam/50">WebMCP calls and visible world changes share this feed.</p>
      <ol className="min-h-0 flex-1 overflow-y-auto scrollbar-thin">
        {activity.map((item) => (
          <li key={item.id} className="grid grid-cols-[44px_1fr] gap-3 border-b border-solara-foam/12 px-3 py-3">
            <div className="border-r border-solara-foam/15 pr-2 text-right text-[8px] text-solara-foam/40"><strong className="block text-solara-foam/60">D{item.day}</strong>{item.time}</div>
            <div><strong className={`block font-mono text-[9px] leading-4 ${colors[item.kind]}`}>{item.title}</strong><p className="mt-1 text-[9px] leading-4 text-solara-foam/45">{item.detail}</p></div>
          </li>
        ))}
      </ol>
    </section>
  );
}
