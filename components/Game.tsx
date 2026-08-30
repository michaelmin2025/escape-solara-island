"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AgentActivityFeed } from "./AgentActivityFeed";
import { CharacterCard } from "./CharacterCard";
import { DialoguePanel } from "./DialoguePanel";
import { IslandMap, MAP_TRAVEL_ANIMATION_MS } from "./IslandMap";
import { MissionPanel } from "./MissionPanel";
import {
  answerHotelCall,
  attemptEscape,
  choosePath,
  dayOf,
  driveTeam,
  eatTogether,
  equipOutfit,
  equipWeapon,
  escapeReadiness,
  formatClock,
  formatDuration,
  formatMoney,
  getObjective,
  restTogether,
  setAutonomyMode,
  setHandlerDirective,
  startTeamMission,
  switchVehicle,
  timeRemaining
} from "@/game/engine";
import { autonomyFingerprint, executeAutonomyPlan, planAutonomyStep } from "@/game/autonomy";
import { createInitialState, restoreState } from "@/game/state";
import { vehicles } from "@/game/vehicles";
import handlerPortrait from "@/public/assets/portraits/handler.png";
import { registerGameTools } from "@/webmcp/registerTools";
import type { ActionResult, GameState, OutfitId, VehicleId, WeaponId } from "@/types/game";

const STORAGE_KEY = "escape-solara-island:v4";
const LEGACY_STORAGE_KEYS = ["escape-solara-island:v3", "escape-solara-island:v2"];

function Palm({ x, flip = false }: { x: number; flip?: boolean }) {
  return (
    <g transform={`translate(${x} 662) scale(${flip ? -1.1 : 1.1} 1.1)`} fill="none" stroke="#170533" strokeLinecap="round">
      <path d="M-8 2 C0 -60 12 -122 36 -172 L52 -168 C30 -118 18 -58 12 2 Z" fill="#170533" stroke="none" />
      <path d="M44 -170 C20 -200 -18 -212 -52 -204" strokeWidth="9" />
      <path d="M44 -170 C34 -208 8 -234 -28 -242" strokeWidth="9" />
      <path d="M44 -170 C58 -212 92 -232 132 -232" strokeWidth="9" />
      <path d="M44 -170 C88 -196 130 -192 162 -168" strokeWidth="9" />
      <path d="M44 -170 C92 -172 134 -152 158 -120" strokeWidth="9" />
      <path d="M44 -170 C20 -194 -12 -196 -44 -180" strokeWidth="9" />
    </g>
  );
}

function OpeningScene() {
  return (
    <div className="opening-scene" aria-hidden="true">
      <svg viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="skyGrad" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="900">
            <stop offset="0" stopColor="#12042e" />
            <stop offset=".3" stopColor="#3c0d5c" />
            <stop offset=".5" stopColor="#8f1a6e" />
            <stop offset=".63" stopColor="#e13a78" />
            <stop offset=".72" stopColor="#ff6a4d" />
            <stop offset=".78" stopColor="#ffb36b" />
          </linearGradient>
          <linearGradient id="sunGrad" gradientUnits="userSpaceOnUse" x1="0" y1="420" x2="0" y2="660">
            <stop offset="0" stopColor="#fff3c9" />
            <stop offset=".45" stopColor="#ffd07e" />
            <stop offset=".78" stopColor="#ff8a5e" />
            <stop offset="1" stopColor="#ff4f96" />
          </linearGradient>
          <linearGradient id="seaGrad" gradientUnits="userSpaceOnUse" x1="0" y1="660" x2="0" y2="900">
            <stop offset="0" stopColor="#0f6f80" />
            <stop offset="1" stopColor="#052738" />
          </linearGradient>
        </defs>

        <rect width="1600" height="660" fill="url(#skyGrad)" />
        {[[120, 82, 2.4], [262, 150, 1.8], [420, 62, 2.8], [680, 122, 1.6], [902, 58, 2.2], [1062, 142, 1.8], [1182, 88, 2.6], [1342, 168, 1.8], [1482, 62, 2.4]].map(([x, y, r]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r={r} fill="#ffe9f4" opacity=".55" />
        ))}
        <path d="M330 236q10 -12 20 0q10 -12 20 0" stroke="#170533" strokeWidth="4" fill="none" opacity=".55" strokeLinecap="round" />
        <path d="M446 196q8 -10 16 0q8 -10 16 0" stroke="#170533" strokeWidth="3.4" fill="none" opacity=".5" strokeLinecap="round" />
        <path d="M1240 216q9 -11 18 0q9 -11 18 0" stroke="#170533" strokeWidth="3.4" fill="none" opacity=".5" strokeLinecap="round" />

        {/* retro sun with synthwave slits — slit rects reuse the sky gradient so they cut cleanly */}
        <circle cx="1080" cy="660" r="250" fill="url(#sunGrad)" />
        <rect x="820" y="556" width="520" height="7" fill="url(#skyGrad)" />
        <rect x="820" y="580" width="520" height="9" fill="url(#skyGrad)" />
        <rect x="820" y="604" width="520" height="11" fill="url(#skyGrad)" />
        <rect x="820" y="628" width="520" height="14" fill="url(#skyGrad)" />
        <rect x="820" y="652" width="520" height="17" fill="url(#skyGrad)" />

        <rect y="660" width="1600" height="240" fill="url(#seaGrad)" />
        <rect y="662" width="1600" height="2" fill="#9adfd8" opacity=".35" />
        <rect y="700" width="1600" height="2" fill="#9adfd8" opacity=".14" />
        <rect y="748" width="1600" height="2" fill="#9adfd8" opacity=".1" />
        <rect y="804" width="1600" height="2" fill="#9adfd8" opacity=".07" />
        <g fill="#ffb36b">
          <rect x="1022" y="672" width="116" height="6" rx="3" opacity=".5" />
          <rect x="1040" y="690" width="80" height="5" rx="2.5" opacity=".38" />
          <rect x="1028" y="712" width="104" height="5" rx="2.5" opacity=".28" />
          <rect x="1048" y="736" width="64" height="4" rx="2" opacity=".2" />
          <rect x="1032" y="762" width="96" height="4" rx="2" opacity=".13" />
          <rect x="1052" y="790" width="56" height="4" rx="2" opacity=".08" />
        </g>

        <Palm x={210} />
        <Palm x={1390} flip />
      </svg>
    </div>
  );
}

export function Game() {
  const [state, setState] = useState<GameState | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [toast, setToast] = useState("");
  const [webMcpStatus, setWebMcpStatus] = useState("WebMCP waiting for operation");
  const [autonomyStatus, setAutonomyStatus] = useState("Alex and Maya are assessing the field.");
  const [hotelCallVisible, setHotelCallVisible] = useState(false);
  const stateRef = useRef<GameState | null>(null);
  const autonomyBurstRef = useRef(0);
  const lastAutonomyFingerprintRef = useRef("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) ?? LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
      const restored = stored ? restoreState(JSON.parse(stored)) : null;
      if (restored) {
        stateRef.current = restored;
        setState(restored);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setHydrated(true);
    }
  }, []);

  useEffect(() => {
    stateRef.current = state;
    if (hydrated && state) localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [hydrated, state]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(""), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (state?.phase !== "hotel-call") {
      setHotelCallVisible(false);
      return;
    }

    const timer = window.setTimeout(() => setHotelCallVisible(true), MAP_TRAVEL_ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [state?.phase]);

  const perform = useCallback((action: (draft: GameState) => ActionResult) => {
    if (!stateRef.current) throw new Error("No active operation.");
    const next = structuredClone(stateRef.current);
    const result = action(next);
    stateRef.current = next;
    setState(next);
    return { result, state: next };
  }, []);

  const hasState = state !== null;
  useEffect(() => {
    if (!hasState) return;
    let cancelled = false;
    let abort: (() => void) | undefined;
    registerGameTools({ getState: () => stateRef.current as GameState, perform })
      .then((registration) => {
        if (cancelled) registration?.abort();
        else if (registration) {
          abort = registration.abort;
          setWebMcpStatus(`${registration.count} WebMCP tools online`);
        } else setWebMcpStatus("WebMCP preview unavailable · manual controls active");
      })
      .catch(() => setWebMcpStatus("WebMCP registration blocked · manual controls active"));
    return () => {
      cancelled = true;
      abort?.();
    };
  }, [hasState, perform]);

  const resetAutonomyGuard = useCallback(() => {
    autonomyBurstRef.current = 0;
    lastAutonomyFingerprintRef.current = "";
  }, []);

  const act = useCallback((action: (draft: GameState) => ActionResult) => {
    resetAutonomyGuard();
    const { result } = perform(action);
    setToast(result.message);
    return result;
  }, [perform, resetAutonomyGuard]);

  useEffect(() => {
    if (!state) return;
    const plan = planAutonomyStep(state);
    setAutonomyStatus(plan.reason);
    if (plan.type === "wait") return;
    if (autonomyBurstRef.current >= 12) {
      setAutonomyStatus("Autonomy paused after 12 routine actions. Relay a directive or take one manual action to continue.");
      return;
    }
    const fingerprint = autonomyFingerprint(state, plan);
    if (lastAutonomyFingerprintRef.current === fingerprint) {
      setAutonomyStatus("Autonomy stopped before repeating the same unsuccessful action.");
      return;
    }
    const timer = window.setTimeout(() => {
      lastAutonomyFingerprintRef.current = fingerprint;
      autonomyBurstRef.current += 1;
      const { result } = perform((draft) => executeAutonomyPlan(draft, plan));
      setToast(result.message);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [perform, state]);

  function begin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const next = createInitialState(String(form.get("handler") ?? "Handler"));
    stateRef.current = next;
    setState(next);
    resetAutonomyGuard();
    setToast(`${next.handler.name}, Alex and Maya are waiting at the airport.`);
  }

  function reset() {
    if (!window.confirm("Reset the operation and erase the current six-day run?")) return;
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    stateRef.current = null;
    setState(null);
    resetAutonomyGuard();
    setAutonomyStatus("Alex and Maya are assessing the field.");
    setWebMcpStatus("WebMCP waiting for operation");
  }

  if (!hydrated) return <div className="grid min-h-screen place-items-center text-xs tracking-[.2em] text-solara-pine">UNROLLING THE ISLAND CHART…</div>;

  if (!state) {
    return (
      <main className="opening-screen">
        <section className="opening-menu">
          <h1 className="opening-title">
            <span className="title-line">Escape</span>
            <strong className="title-hero">Solara</strong>
            <span className="title-line">Island</span>
          </h1>
          <p className="opening-tagline">Agents Alex and Maya have landed on the beautiful Mediterranean island and are awaiting your orders.</p>
          <form className="opening-form" onSubmit={begin}>
            <label className="opening-label" htmlFor="handler-name">HANDLER NAME</label>
            <div className="opening-row">
              <input id="handler-name" name="handler" maxLength={28} required autoComplete="name" className="opening-input" />
              <button className="opening-btn">Begin →</button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  const readiness = escapeReadiness(state);
  const objective = getObjective(state);
  const blocked = state.phase !== "playing" || Boolean(state.activeMission || state.currentDecision);

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="brand"><span>S</span><div><small>ESCAPE</small><strong>SOLARA ISLAND</strong></div></div>
        <div className="top-stat top-handler">
          <span className="handler-portrait"><Image src={handlerPortrait} alt="Unknown handler" fill sizes="36px" placeholder="blur" /></span>
          <span><small>HANDLER</small><strong>{state.handler.name}</strong></span>
        </div>
        <div className="top-stat"><small>EXPEDITION LOG</small><strong>DAY {Math.min(dayOf(state), 6)} · {formatClock(state)}</strong></div>
        <div className="top-stat top-objective">
          <small>CURRENT OBJECTIVE</small>
          <strong className="obj-line"><span className="obj-title">{objective.title}</span><span className="obj-cash">{formatMoney(state.cash)} / {formatMoney(state.targetCash)}</span></strong>
          <div className="obj-bar"><i style={{ width: `${Math.max(3, objective.progress * 100)}%` }} /></div>
        </div>
        <div className="top-stat"><small>FINAL WINDOW</small><strong>{formatDuration(timeRemaining(state))}</strong></div>
        <div className="mcp-pill"><i />{webMcpStatus}</div>
        <button onClick={reset} className="mr-3 grid h-8 w-8 place-items-center self-center rounded-full border border-solara-ink/30 text-solara-ink/60 hover:border-solara-ink/70 hover:text-solara-ink" aria-label="Reset operation">↻</button>
      </header>

      <div className="game-grid">
        <aside className="flex min-h-0 flex-col gap-3">
          <section className="panel operative-dashboard flex min-h-0 flex-1 flex-col overflow-hidden">
            <header className="panel-header operative-dashboard__header shrink-0">
              <div><p className="label">HANDLER OPERATIONS</p><h2 className="panel-title">Active operatives</h2><p className="operative-dashboard__status">{autonomyStatus}</p></div>
              <button type="button" aria-pressed={state.autonomy.enabled} onClick={() => act((draft) => setAutonomyMode(draft, !draft.autonomy.enabled))} className={`badge transition-colors ${state.autonomy.enabled ? "border-emerald-700/45 bg-emerald-700/10 text-emerald-800" : "border-solara-ink/25 bg-transparent text-solara-ink/45"}`}>{state.autonomy.enabled ? "AUTO · ON" : "AUTO · OFF"}</button>
            </header>
            <div className="operative-roster">
              {Object.values(state.characters).map((character) => (
                <CharacterCard
                  key={character.id}
                  character={character}
                  availableWeapons={state.inventory.weapons}
                  disabled={blocked}
                  onEquipWeapon={(weapon) => act((draft) => equipWeapon(draft, character.id, weapon as WeaponId))}
                  onEquipOutfit={(outfit) => act((draft) => equipOutfit(draft, character.id, outfit as OutfitId))}
                />
              ))}
            </div>
          </section>

          <section className="panel supply-post shrink-0 p-3">
            <p className="label">SUPPLY POST</p>
            <p className="mt-1 text-[8px] leading-3 text-solara-ink/45">With autonomy on, Maya purchases meals and Alex schedules recovery when the team needs it.</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button disabled={blocked} onClick={() => act((draft) => eatTogether(draft, "quick"))} className="small-action"><strong>Quick meal</strong><small>$20 · 35m</small></button>
              <button disabled={blocked} onClick={() => act((draft) => eatTogether(draft, "restaurant"))} className="small-action"><strong>Restaurant</strong><small>$100 · 1h</small></button>
              <button disabled={blocked} onClick={() => act((draft) => restTogether(draft, 3))} className="small-action"><strong>Short rest</strong><small>3 hours</small></button>
              <button disabled={blocked} onClick={() => act((draft) => restTogether(draft, 8))} className="small-action"><strong>Full sleep</strong><small>8 hours</small></button>
            </div>
            <label className="label mt-3 grid grid-cols-[auto_1fr] items-center gap-3">ACTIVE VEHICLE
              <select disabled={blocked} value={state.inventory.activeVehicle} onChange={(event) => act((draft) => switchVehicle(draft, event.target.value as VehicleId))} className="control py-2 text-[9px]">
                {state.inventory.vehicles.map((vehicle) => <option key={vehicle} value={vehicle}>{vehicles[vehicle].name}</option>)}
              </select>
            </label>
          </section>
        </aside>

        <section className="center-column">
          <IslandMap state={state} onDrive={(destination) => act((draft) => driveTeam(draft, destination))} />
          <DialoguePanel
            lines={state.dialogue}
            decision={state.currentDecision}
            handlerName={state.handler.name}
            onChoose={(option) => act((draft) => choosePath(draft, option))}
          />
        </section>

        <aside className="flex min-h-0 flex-col gap-3">
          <AgentActivityFeed activity={state.activityLog} />
          <MissionPanel state={state} onDrive={(destination) => act((draft) => driveTeam(draft, destination))} onStart={(mission) => act((draft) => startTeamMission(draft, mission))} />
          <section className="panel shrink-0 p-3">
            <p className="label">FINAL EXTRACTION</p>
              <h2 className="panel-title mt-1">Escape readiness</h2>
              <div className="my-3 grid grid-cols-3 gap-1.5">
                {Object.entries({ Objective: readiness.objective, "$500K": readiness.cash, Team: readiness.alive, Airfield: readiness.airfield, "Wanted ≤ 3": readiness.heat, Time: readiness.time }).map(([label, ready]) => (
                  <span key={label} className={`rounded border px-1 py-2 text-center text-[7px] font-bold ${ready ? "border-solara-pine/40 bg-solara-pine/10 text-solara-pine" : "border-solara-ink/15 text-solara-ink/40"}`}>{ready ? "✓" : "○"} {label}</span>
                ))}
              </div>
              <button disabled={blocked} onClick={() => act(attemptEscape)} className="btn-primary w-full px-3 py-3 text-[9px] font-black tracking-widest disabled:opacity-40">ATTEMPT ESCAPE ✈</button>
          </section>
        </aside>
      </div>

      <form className="directive-bar" onSubmit={(event) => { event.preventDefault(); const form = new FormData(event.currentTarget); act((draft) => setHandlerDirective(draft, String(form.get("directive") ?? ""))); }}>
        <div className="flex items-center gap-3"><span className="handler-directive-portrait"><Image src={handlerPortrait} alt="Unknown handler" fill sizes="40px" placeholder="blur" /></span><div><p className="label">HANDLER DIRECTIVE</p><strong className="text-[10px] text-solara-ink/55">Strategy for Alex + Maya</strong></div></div>
        <input key={state.handler.directive} name="directive" defaultValue={state.handler.directive} maxLength={180} className="control px-4 py-3 text-[11px]" />
        <button className="btn-ghost px-5 text-[8px] font-black tracking-widest">RELAY DIRECTIVE ↗</button>
      </form>

      {state.phase === "hotel-call" && hotelCallVisible && (
        <div className="modal-layer" role="dialog" aria-modal="true" aria-labelledby="hotel-call-title">
          <section className="modal-card max-w-xl text-center">
            <div className="modal-card-body">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full border-2 border-solara-coral/50 bg-solara-coral/10 text-2xl text-solara-coral">☎</span>
              <p className="label mt-5">INCOMING CALL · {state.handler.name.toUpperCase()}</p>
              <h2 id="hotel-call-title" className="mt-3 font-display text-4xl italic text-solara-ink">The real operation begins</h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-solara-ink/60">Alex and Maya reached Hotel Aster. Deliver the six-day objective and open the three major mission routes.</p>
              <button onClick={() => act(answerHotelCall)} className="btn-primary mt-6 px-6 py-3 text-[9px] font-black tracking-widest">ANSWER THE CALL →</button>
            </div>
          </section>
        </div>
      )}

      {(state.phase === "won" || state.phase === "lost") && state.ending && (
        <div className="modal-layer" role="dialog" aria-modal="true">
          <section className="modal-card max-w-xl text-center">
            <div className="modal-card-body">
              <div className="mx-auto h-20 w-20 rounded-full border-2 border-solara-ink/35 bg-gradient-to-br from-solara-sun to-solara-coral shadow-[0_10px_40px_rgba(217,95,67,.4)]" />
              <p className="label mt-5">{state.phase === "won" ? "EXPEDITION COMPLETE" : "EXPEDITION FAILED"}</p>
              <h2 className="mt-3 font-display text-4xl italic text-solara-ink">{state.ending.title}</h2>
              <p className="mt-3 text-sm leading-6 text-solara-ink/60">{state.ending.message}</p>
              <div className="my-6 grid grid-cols-2 border-l border-t border-solara-ink/20 text-left text-[9px]"><span className="border-b border-r border-solara-ink/20 p-3 text-solara-ink/50">HANDLER<strong className="mt-1 block text-solara-ink/85">{state.handler.name}</strong></span><span className="border-b border-r border-solara-ink/20 p-3 text-solara-ink/50">FINAL STATUS<strong className="mt-1 block text-solara-ink/85">Day {Math.min(dayOf(state), 6)} · {formatClock(state)}</strong></span><span className="border-b border-r border-solara-ink/20 p-3 text-solara-ink/50">CASH<strong className="mt-1 block text-solara-coral">{formatMoney(state.cash)}</strong></span><span className="border-b border-r border-solara-ink/20 p-3 text-solara-ink/50">MISSIONS<strong className="mt-1 block text-solara-ink/85">{Object.keys(state.completedMissions).length} resolved</strong></span></div>
              <button onClick={reset} className="btn-primary px-6 py-3 text-[9px] font-black tracking-widest">NEW EXPEDITION ↻</button>
            </div>
          </section>
        </div>
      )}

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}
