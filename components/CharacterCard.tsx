import Image from "next/image";
import type { IconType } from "react-icons";
import { FaStar } from "react-icons/fa6";
import {
  GiMachineGun,
  GiPistolGun,
  GiSawedOffShotgun,
  GiShirt,
  GiTShirt,
  GiTie,
  GiWinchesterRifle
} from "react-icons/gi";
import { MdBlock } from "react-icons/md";
import alexPortrait from "@/public/assets/portraits/alex.png";
import mayaPortrait from "@/public/assets/portraits/maya.png";
import { outfits } from "@/game/outfits";
import { weapons } from "@/game/vehicles";
import type { CharacterId, CharacterState, OutfitId, WeaponId } from "@/types/game";

const portraits: Record<CharacterId, typeof alexPortrait> = {
  alex: alexPortrait,
  maya: mayaPortrait
};

const weaponIcons: Record<WeaponId, IconType> = {
  none: MdBlock,
  pistol: GiPistolGun,
  shotgun: GiSawedOffShotgun,
  smg: GiMachineGun,
  rifle: GiWinchesterRifle
};

const outfitIcons: Record<OutfitId, IconType> = {
  summer: GiShirt,
  casual: GiTShirt,
  formal: GiTie
};

const outfitOrder: OutfitId[] = ["summer", "casual", "formal"];

interface CharacterCardProps {
  character: CharacterState;
  availableWeapons: WeaponId[];
  disabled?: boolean;
  onEquipWeapon: (weapon: WeaponId) => void;
  onEquipOutfit: (outfit: OutfitId) => void;
}

function meterTone(value: number, inverse = false) {
  const risk = inverse ? value : 100 - value;
  return risk > 58 ? "bg-solara-coral" : risk > 32 ? "bg-solara-sun" : "bg-solara-pine";
}

function Stat({ label, value, inverse = false }: { label: string; value: number; inverse?: boolean }) {
  return (
    <div className="operative-stat">
      <span>{label}</span>
      <div className="operative-stat__track">
        <i className={meterTone(value, inverse)} style={{ width: `${value}%` }} />
      </div>
      <strong>{Math.round(value)}</strong>
    </div>
  );
}

function WantedStatus({ value }: { value: number }) {
  const wanted = Math.min(6, Math.max(0, Math.round(value)));
  return (
    <div className="wanted-status" aria-label={`Wanted status ${wanted} of 6 stars`}>
      <span>Wanted status</span>
      <span className="wanted-status__stars" aria-hidden="true">
        {Array.from({ length: 6 }, (_, index) => (
          <FaStar key={index} className={index < wanted ? "is-active" : ""} />
        ))}
      </span>
    </div>
  );
}

export function CharacterCard({ character, availableWeapons, disabled = false, onEquipWeapon, onEquipOutfit }: CharacterCardProps) {
  return (
    <article className={`operative-card operative-card--${character.id}`}>
      <div className="operative-card__profile">
        <div className="operative-portrait">
          <Image
            src={portraits[character.id]}
            alt={`${character.name}, field operative`}
            fill
            sizes="88px"
            className="object-cover"
            placeholder="blur"
          />
        </div>

        <div className="operative-identity">
          <p className="label">FIELD OPERATIVE</p>
          <h3>{character.name}</h3>
          <p>{character.role}</p>
        </div>
      </div>

      <div className="operative-condition" aria-label={`${character.name} condition`}>
        <Stat label="Health" value={character.health} />
        <Stat label="Energy" value={character.energy} />
        <Stat label="Hunger" value={character.hunger} inverse />
        <WantedStatus value={character.heat} />
      </div>

      <div className="operative-equipment">
        <fieldset className="equipment-group">
          <legend>Weapon</legend>
          <div className="weapon-options" role="radiogroup" aria-label={`${character.name} weapon`}>
            {availableWeapons.map((weapon) => {
              const WeaponIcon = weaponIcons[weapon];
              const selected = character.weapon === weapon;
              return (
                <button
                  key={weapon}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={weapons[weapon].name}
                  title={weapons[weapon].name}
                  disabled={disabled}
                  className={`weapon-option ${selected ? "is-selected" : ""}`}
                  onClick={() => onEquipWeapon(weapon)}
                >
                  <WeaponIcon aria-hidden="true" />
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="equipment-group">
          <legend>Outfit</legend>
          <div className="outfit-options" role="radiogroup" aria-label={`${character.name} outfit`}>
            {outfitOrder.map((outfit) => {
              const OutfitIcon = outfitIcons[outfit];
              const selected = character.outfit === outfit;
              return (
                <button
                  key={outfit}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  title={outfits[outfit].description}
                  disabled={disabled}
                  className={`outfit-option ${selected ? "is-selected" : ""}`}
                  onClick={() => onEquipOutfit(outfit)}
                >
                  <OutfitIcon aria-hidden="true" />
                  <span>{outfits[outfit].name.replace(" Wear", "")}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </article>
  );
}
