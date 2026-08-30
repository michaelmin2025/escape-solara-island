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
  "M72 290" +
  "C80 260 88 248 100 240" +
  "C118 232 134 222 148 196" +
  "C156 172 158 140 166 124" +
  "C172 118 178 124 182 140" +
  "C188 156 196 164 206 162" +
  "C214 150 220 128 228 110" +
  "C232 102 238 100 242 106" +
  "C250 118 254 134 260 146" +
  "C272 162 288 168 300 162" +
  "C314 156 322 142 334 130" +
  "C344 138 354 148 366 150" +
  "C380 152 392 132 406 118" +
  "C416 120 430 126 444 130" +
  "C458 134 466 116 478 100" +
  "C488 84 506 74 528 72" +
  "C548 70 562 84 576 102" +
  "C590 116 606 124 620 126" +
  "C636 128 650 114 662 104" +
  "C674 112 688 120 700 122" +
  "C716 126 732 110 750 98" +
  "C764 90 782 86 798 92" +
  "C814 98 830 106 844 104" +
  "C860 102 874 116 888 130" +
  "C902 142 914 146 926 140" +
  "C938 134 950 144 960 158" +
  "C976 172 994 184 1008 194" +
  "C1022 204 1038 214 1048 226" +
  "C1056 236 1060 250 1060 262" +
  "C1060 272 1057 278 1052 284" +
  "C1038 296 1018 306 998 314" +
  "C978 322 960 330 946 336" +
  "C954 350 970 358 990 366" +
  "C1010 374 1030 380 1044 386" +
  "C1052 392 1056 400 1054 408" +
  "C1046 418 1034 426 1018 432" +
  "C1000 438 984 440 972 430" +
  "C964 428 958 420 950 420" +
  "C944 422 940 430 932 436" +
  "C916 446 900 452 888 456" +
  "C876 460 868 466 862 472" +
  "C856 476 850 478 844 476" +
  "C838 474 834 468 828 466" +
  "C816 462 804 464 792 466" +
  "C776 468 760 464 746 460" +
  "C734 456 724 450 714 446" +
  "C708 442 702 444 696 446" +
  "C686 450 676 450 666 448" +
  "C650 444 638 446 626 448" +
  "C610 450 594 452 580 450" +
  "C576 444 574 436 570 432" +
  "C566 438 564 446 558 450" +
  "C546 456 532 454 518 450" +
  "C502 446 488 444 474 442" +
  "C456 440 442 434 428 428" +
  "C410 422 394 420 378 420" +
  "C358 420 340 418 324 414" +
  "C310 410 296 406 286 402" +
  "C278 400 272 400 266 400" +
  "C258 400 252 402 244 402" +
  "C228 402 212 396 196 390" +
  "C178 384 162 376 148 368" +
  "C132 360 116 350 104 340" +
  "C90 330 78 314 72 290Z";

const MAIN_ROAD =
  "M88 286 C170 272 300 250 418 235 C500 224 520 258 583 269 C660 282 740 296 820 300 C900 304 970 296 1030 290";

const SIDE_ROADS = [
  "M88 286 C130 300 170 270 186 230 C196 200 180 168 168 142",
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
  [180, 80]
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
    <section className="panel map-panel flex min-h-0 flex-col overflow-hidden">
      <header className="panel-header shrink-0">
        <div><p className="label">FIELD CHART · LEVANTINE COAST</p><h2 className="panel-title">Isla Solara</h2></div>
        <div className="text-right"><p className="label">TEAM LOCATION</p><strong className="text-xs text-solara-coral">{current.name}</strong></div>
      </header>
      <div className="map-wrap min-h-0 flex-1">
        <div className="island-map relative overflow-hidden">
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
          <path d={ISLAND} fill="none" stroke="#ecd9a4" strokeWidth="14" opacity=".95" />
          <path d={ISLAND} fill="none" stroke="#f4fffb" strokeWidth="3" opacity=".9" />

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
          <Lighthouse x={240} y={112} />
          <Lighthouse x={1050} y={242} />
          <text x={242} y={134} textAnchor="middle" fontFamily="Georgia, serif" fontSize="7" letterSpacing="1" fill="#16333d" opacity=".7">FAR TRAMUNTANA</text>
          <text x={1040} y={270} textAnchor="middle" fontFamily="Georgia, serif" fontSize="7" letterSpacing="1" fill="#16333d" opacity=".7">FAR LLEVANT</text>
          <text x={98} y={306} fontSize="11" fill="#0a5468" opacity=".8">⚓</text>
          <text x={1000} y={346} fontSize="11" fill="#0a5468" opacity=".8">⚓</text>

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

        {/* compass rose — drawn in its own SVG so the stretching chart never oval it */}
        <svg className="absolute left-[3%] top-[8%] aspect-square h-[24%]" viewBox="0 0 80 92" aria-hidden="true">
          <g opacity=".85">
            <circle cx="40" cy="52" r="26" fill="rgba(255,253,244,.25)" stroke="#16333d" strokeWidth="1.5" opacity=".55" />
            <path d="M40 30 L44 48 L62 52 L44 56 L40 74 L36 56 L18 52 L36 48Z" fill="#0a5468" opacity=".6" />
            <circle cx="40" cy="52" r="2.4" fill="#16333d" opacity=".7" />
            <text x="40" y="12" textAnchor="middle" fontFamily="Georgia, serif" fontSize="13" fontWeight="700" fill="#16333d">N</text>
            <text x="40" y="90" textAnchor="middle" fontFamily="Georgia, serif" fontSize="8" letterSpacing="2" fill="#16333d" opacity=".7">SOLARA KEY</text>
          </g>
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
              {discovered ? <span>{location.shortName}</span> : null}
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
      </div>
    </section>
  );
}
