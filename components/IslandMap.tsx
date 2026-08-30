import { locations } from "@/game/locations";
import { vehicles } from "@/game/vehicles";
import type { GameState } from "@/types/game";

interface IslandMapProps {
  state: GameState;
  onDrive: (destination: string) => void;
}

/*
 * Hand-drawn chart of Isla Solara — a Menorca-inspired silhouette:
 * an elongated east-west island with a rugged, cape-studded north coast,
 * a smooth coved south coast, a deep fjord harbor on the southeast shore
 * and the high ground of Tor Alto just north of the island's center.
 * The SVG stretches with its container (preserveAspectRatio="none"), and
 * location nodes are placed by percentage, so land features and markers
 * stay aligned at any panel size.
 */
const ISLAND =
  "M70 292" +
  "C76 268 84 252 96 246" +
  "C108 240 118 240 126 234" +
  "C136 226 142 208 150 188" +
  "C156 168 160 146 165 130" +
  "C170 124 174 128 178 140" +
  "C184 156 190 168 198 176" +
  "C208 168 214 148 222 128" +
  "C228 112 234 104 238 108" +
  "C246 118 252 140 258 156" +
  "C266 174 278 180 292 176" +
  "C304 168 316 148 330 132" +
  "C340 142 352 152 364 154" +
  "C378 156 394 130 410 116" +
  "C422 122 436 130 450 134" +
  "C462 138 470 118 480 102" +
  "C492 84 512 76 528 76" +
  "C546 76 560 90 575 106" +
  "C590 118 606 126 620 128" +
  "C634 130 648 116 660 106" +
  "C672 112 686 120 700 124" +
  "C716 128 732 112 748 100" +
  "C760 92 780 88 796 94" +
  "C812 100 828 108 842 106" +
  "C858 104 872 118 886 132" +
  "C900 144 912 148 924 142" +
  "C936 136 948 146 958 160" +
  "C970 174 986 186 1000 194" +
  "C1016 204 1032 212 1042 224" +
  "C1050 234 1056 244 1058 254" +
  "C1062 264 1062 276 1060 288" +
  "C1058 292 1050 296 1040 300" +
  "C1028 305 1010 310 998 315" +
  "C992 317 988 317 986 318" +
  "C990 323 998 326 1008 329" +
  "C1022 334 1038 340 1048 348" +
  "C1056 354 1060 360 1060 366" +
  "C1060 374 1054 382 1046 390" +
  "C1034 402 1018 410 1002 415" +
  "C986 420 972 421 962 417" +
  "C956 413 952 407 946 407" +
  "C940 411 938 419 930 425" +
  "C916 435 900 443 888 447" +
  "C876 451 868 459 862 467" +
  "C858 473 852 477 846 475" +
  "C840 473 836 467 830 465" +
  "C818 461 806 463 794 465" +
  "C778 467 762 463 748 459" +
  "C736 455 726 449 716 445" +
  "C710 441 704 443 698 445" +
  "C688 449 678 449 668 447" +
  "C652 443 640 445 628 447" +
  "C612 449 596 451 582 449" +
  "C578 443 576 435 572 431" +
  "C568 437 566 445 560 449" +
  "C548 455 534 453 520 449" +
  "C504 445 490 443 476 441" +
  "C458 439 444 433 430 427" +
  "C412 421 396 419 380 419" +
  "C360 419 342 417 326 413" +
  "C312 411 298 407 288 403" +
  "C280 401 274 401 268 401" +
  "C262 401 256 403 248 403" +
  "C232 403 216 397 200 391" +
  "C182 385 166 377 150 369" +
  "C134 361 116 351 102 341" +
  "C88 331 76 314 70 292Z";

const MAIN_ROAD =
  "M88 286 C170 272 300 250 418 235 C500 224 520 258 583 269 C660 282 740 296 820 300 C900 304 970 296 1030 290";

const SIDE_ROADS = [
  "M88 286 C108 248 134 206 152 172 C158 160 162 152 164 144",
  "M88 286 C140 330 200 372 260 388",
  "M418 235 C450 192 490 128 526 90",
  "M583 269 C620 228 660 178 691 150",
  "M583 269 C630 318 680 368 713 401",
  "M713 401 C750 384 790 374 823 366",
  "M823 366 C830 400 840 434 846 457",
  "M820 300 C860 276 900 240 944 217",
  "M944 217 C975 242 1005 266 1030 288"
];

const SOUNDINGS: Array<[number, number, string]> = [
  [58, 168, "612"],
  [245, 58, "388"],
  [600, 42, "743"],
  [1074, 128, "525"],
  [350, 506, "470"],
  [1000, 480, "262"],
  [150, 482, "515"],
  [620, 522, "690"]
];

const WAVES: Array<[number, number]> = [
  [300, 90],
  [336, 78],
  [560, 62],
  [948, 112],
  [470, 508],
  [760, 502],
  [1022, 452],
  [180, 170]
];

function Pines({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="#3a6a4f" opacity=".5">
      <path d="M0 -9 L5 2 L-5 2Z" />
      <path d="M10 -5 L15 6 L5 6Z" />
      <path d="M-9 -4 L-4 7 L-14 7Z" />
    </g>
  );
}

function Lighthouse({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} stroke="#16333d" opacity=".85">
      <circle r="3" fill="#fffdf4" strokeWidth="1.4" />
      <path d="M-8 0h3M8 0h-3M0 -8v3M0 8v-3" strokeWidth="1.2" />
    </g>
  );
}

export function IslandMap({ state, onDrive }: IslandMapProps) {
  const current = locations[state.currentLocation];
  const blocked = Boolean(state.currentDecision || state.activeMission) || state.phase !== "playing";

  return (
    <section className="panel flex min-h-[390px] flex-col overflow-hidden">
      <header className="panel-header">
        <div><p className="label">FIELD CHART · LEVANTINE COAST</p><h2 className="panel-title">Isla Solara</h2></div>
        <div className="text-right"><p className="label">TEAM LOCATION</p><strong className="text-xs text-solara-coral">{current.name}</strong></div>
      </header>
      <div className="island-map relative min-h-0 flex-1 overflow-hidden">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1100 560" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="landGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#4e7f5e" />
              <stop offset=".45" stopColor="#6f8f5a" />
              <stop offset=".78" stopColor="#9aa266" />
              <stop offset="1" stopColor="#b8ac74" />
            </linearGradient>
            <pattern id="stoneWalls" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(23)">
              <path d="M0 13H26" stroke="#16333d" strokeWidth="1" opacity=".07" />
            </pattern>
            <clipPath id="landClip"><path d={ISLAND} /></clipPath>
            <filter id="landShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="10" stdDeviation="14" floodColor="#0a4a5e" floodOpacity=".35" />
            </filter>
          </defs>

          {/* shallow-water halo around the coast */}
          <path d={ISLAND} fill="none" stroke="#3ec3b5" strokeWidth="110" opacity=".1" />
          <path d={ISLAND} fill="none" stroke="#3ec3b5" strokeWidth="60" opacity=".14" />
          <path d={ISLAND} fill="none" stroke="#4ed2c4" strokeWidth="26" opacity=".24" />

          {/* beach rim + foam line */}
          <path d={ISLAND} fill="none" stroke="#ecd9a4" strokeWidth="20" opacity=".95" />
          <path d={ISLAND} fill="none" stroke="#f4fffb" strokeWidth="4" opacity=".9" />

          {/* land */}
          <path d={ISLAND} fill="url(#landGrad)" filter="url(#landShadow)" />

          <g clipPath="url(#landClip)">
            <rect x="0" y="0" width="1100" height="560" fill="url(#stoneWalls)" />
            {/* Tor Alto hill contours */}
            <g fill="none" stroke="#16333d">
              <ellipse cx="545" cy="200" rx="50" ry="21" opacity=".18" />
              <ellipse cx="545" cy="198" rx="34" ry="14" opacity=".24" />
              <ellipse cx="545" cy="196" rx="18" ry="8" opacity=".3" />
            </g>
            <circle cx="545" cy="194" r="2" fill="#16333d" opacity=".5" />
            {/* island name */}
            <text x="505" y="350" fontFamily="Georgia, serif" fontSize="34" letterSpacing="10" fill="#16333d" opacity=".22">ISLA SOLARA</text>
          </g>

          {/* dotted coast line, chart style */}
          <path d={ISLAND} fill="none" stroke="#14333e" strokeWidth="2.2" strokeLinecap="round" strokeDasharray=".5 9" opacity=".4" />

          {/* roads */}
          <g fill="none">
            <path d={MAIN_ROAD} stroke="#16333d" strokeOpacity=".28" strokeWidth="5.5" />
            <path d={MAIN_ROAD} stroke="#f8f1dd" strokeWidth="3.2" />
            {SIDE_ROADS.map((d) => <path key={d} d={d} stroke="#f8f1dd" strokeOpacity=".8" strokeWidth="2.2" strokeDasharray="5 6" />)}
          </g>

          {/* interior details */}
          <text x="545" y="162" textAnchor="middle" fontFamily="Georgia, serif" fontSize="9" letterSpacing="2" fill="#16333d" opacity=".6">TOR ALTO · 358 M</text>
          <Pines x={200} y={298} />
          <Pines x={360} y={306} />
          <Pines x={660} y={338} />
          <Pines x={762} y={228} />
          <Pines x={878} y={318} />
          <g transform="translate(404 219) rotate(-14)">
            <rect x="-16" y="-2.5" width="32" height="5" rx="1.5" fill="#f8f1dd" stroke="#16333d" strokeOpacity=".35" strokeWidth="1" />
          </g>
          <Lighthouse x={238} y={106} />
          <Lighthouse x={1048} y={238} />
          <text x={230} y={122} fontFamily="Georgia, serif" fontSize="7" letterSpacing="1" fill="#16333d" opacity=".7">FAR TRAMUNTANA</text>
          <text x={1006} y={254} fontFamily="Georgia, serif" fontSize="7" letterSpacing="1" fill="#16333d" opacity=".7">FAR LLEVANT</text>
          <text x={98} y={306} fontSize="11" fill="#0a5468" opacity=".8">⚓</text>
          <text x={996} y={326} fontSize="11" fill="#0a5468" opacity=".8">⚓</text>

          {/* ferry line off the marina */}
          <path d="M268 402 C230 434 192 452 160 470" fill="none" stroke="#0a5468" strokeWidth="1.5" strokeDasharray="4 5" opacity=".5" />
          <text x={146} y={480} fontSize="11" fill="#0a5468" opacity=".7">⚓</text>

          {/* sea labels + chart furniture */}
          <text x="430" y="52" fontFamily="Georgia, serif" fontStyle="italic" fontSize="14" letterSpacing="7" fill="#0a5468" opacity=".5">MAR MEDITERRÁNEO</text>
          {SOUNDINGS.map(([x, y, v]) => <text key={`${x}${y}`} x={x} y={y} fontFamily="Georgia, serif" fontStyle="italic" fontSize="9" fill="#0a5468" opacity=".35">{v}</text>)}
          {WAVES.map(([x, y]) => <path key={`${x}${y}`} d={`M${x} ${y}q5 -5 10 0t10 0`} fill="none" stroke="#0e7a94" strokeWidth="1.5" opacity=".35" />)}
          {[
            [302, 68],
            [334, 60]
          ].map(([x, y]) => <path key={`g${x}`} d={`M${x} ${y}q4 -5 8 0q4 -5 8 0`} fill="none" stroke="#16333d" strokeWidth="1.3" opacity=".5" />)}

          {/* compass rose */}
          <g transform="translate(96 88)" opacity=".85">
            <circle r="24" fill="none" stroke="#16333d" strokeWidth="1.4" opacity=".5" />
            <path d="M0 -20 L4 -4 L20 0 L4 4 L0 20 L-4 4 L-20 0 L-4 -4Z" fill="#0a5468" opacity=".6" />
            <circle r="2.4" fill="#16333d" opacity=".7" />
            <text y="-30" textAnchor="middle" fontFamily="Georgia, serif" fontSize="11" fontWeight="700" fill="#16333d">N</text>
          </g>

          {/* scale bar */}
          <g transform="translate(70 506)" stroke="#16333d" opacity=".6">
            <path d="M0 -4v8M60 -4v8M120 -4v8M0 0h120" strokeWidth="1.4" fill="none" />
            <text x="0" y="-8" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" fill="#16333d" stroke="none">0</text>
            <text x="60" y="-8" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" fill="#16333d" stroke="none">10</text>
            <text x="120" y="-8" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" fill="#16333d" stroke="none">20 KM</text>
          </g>

          {/* chart frame */}
          <rect x="5" y="5" width="1090" height="550" fill="none" stroke="#16333d" strokeOpacity=".45" strokeWidth="2" />
          <rect x="11" y="11" width="1078" height="538" fill="none" stroke="#16333d" strokeOpacity=".16" strokeWidth="1" />
        </svg>

        {Object.values(locations).map((location) => {
          const discovered = state.discoveredLocations.includes(location.id);
          const isCurrent = state.currentLocation === location.id;
          return (
            <button
              key={location.id}
              className={`map-node ${isCurrent ? "current" : ""} ${!discovered ? "locked" : ""}`}
              style={{ left: `${location.x}%`, top: `${location.y}%` }}
              disabled={!discovered || blocked || isCurrent}
              onClick={() => onDrive(location.id)}
              title={discovered ? `${location.name} · ${location.description}` : "Undiscovered location"}
            >
              <i />
              <span>{discovered ? location.shortName : "UNKNOWN"}</span>
            </button>
          );
        })}

        <div className="team-marker" style={{ left: `${current.x}%`, top: `${current.y}%` }}>
          <i className="marker-ring" />
          <span><em>✦</em></span>
          <small>{vehicles[state.inventory.activeVehicle].name}</small>
        </div>

        <div className="absolute bottom-3 left-3 rounded border border-solara-ink/35 bg-[#fffdf4]/90 px-3 py-2 text-[7px] font-bold uppercase tracking-[.16em] text-solara-ink/60 backdrop-blur">
          MENORCA-INSPIRED CARTOGRAPHY · FICTIONAL ISLAND
        </div>
      </div>
    </section>
  );
}
