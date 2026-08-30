import { weapons } from "@/game/vehicles";
import type { CharacterState, WeaponId } from "@/types/game";

interface CharacterCardProps {
  character: CharacterState;
  availableWeapons: WeaponId[];
  onEquip: (weapon: WeaponId) => void;
}

function meterTone(value: number, inverse = false) {
  const risk = inverse ? value : 100 - value;
  return risk > 58 ? "bg-solara-coral" : risk > 32 ? "bg-solara-sun" : "bg-solara-pine";
}

function Stat({ label, value, inverse = false }: { label: string; value: number; inverse?: boolean }) {
  return (
    <div className="grid grid-cols-[45px_1fr_26px] items-center gap-2 text-[10px] text-solara-ink/55">
      <span>{label}</span>
      <div className="h-1.5 overflow-hidden rounded-full border border-solara-ink/20 bg-solara-ink/10">
        <i className={`block h-full rounded-full transition-all ${meterTone(value, inverse)}`} style={{ width: `${value}%` }} />
      </div>
      <strong className="text-right text-[9px] text-solara-ink/85">{Math.round(value)}</strong>
    </div>
  );
}

export function CharacterCard({ character, availableWeapons, onEquip }: CharacterCardProps) {
  const heat = Math.round(character.heat);
  return (
    <article className="border-b border-dashed border-solara-ink/25 p-4 last:border-b-0">
      <div className="mb-4 flex items-center gap-3">
        <div className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border-2 border-solara-ink/35 font-display text-lg font-bold text-white ${character.id === "alex" ? "bg-gradient-to-br from-solara-sun to-solara-coral" : "bg-gradient-to-br from-solara-lagoon to-solara-deep"}`}>
          {character.name[0]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="label">FIELD OPERATIVE</p>
          <h3 className="font-display text-lg text-solara-ink">{character.name}</h3>
          <p className="truncate text-[9px] text-solara-ink/50">{character.role}</p>
        </div>
        <span className="text-[11px] tracking-wider" aria-label={`${heat} of 5 heat`}>
          <span className="text-solara-coral">{"★".repeat(heat)}</span>
          <span className="text-solara-ink/25">{"★".repeat(5 - heat)}</span>
        </span>
      </div>
      <div className="space-y-2">
        <Stat label="Health" value={character.health} />
        <Stat label="Energy" value={character.energy} />
        <Stat label="Hunger" value={character.hunger} inverse />
      </div>
      <label className="label mt-4 grid grid-cols-[auto_1fr] items-center gap-3">
        LOADOUT
        <select className="control py-2 text-[10px]" value={character.weapon} onChange={(event) => onEquip(event.target.value as WeaponId)}>
          {availableWeapons.map((weapon) => <option key={weapon} value={weapon}>{weapons[weapon].name}</option>)}
        </select>
      </label>
    </article>
  );
}
