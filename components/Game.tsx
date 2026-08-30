"use client";

import Image from "next/image";
import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { AgentActivityFeed } from "./AgentActivityFeed";
import { CharacterCard } from "./CharacterCard";
import { DialoguePanel } from "./DialoguePanel";
import { IslandMap, MAP_TRAVEL_ANIMATION_MS } from "./IslandMap";
import {
  beginHotelBriefing,
  choosePath,
  completeAirportArrival,
  dayOf,
  driveTeam,
  equipOutfit,
  equipWeapon,
  formatClock,
  formatMoney,
  getObjective,
  openingMissionOptions,
  selectOpeningMission,
  setAutonomyMode,
} from "@/game/engine";
import { autonomyFingerprint, executeAutonomyPlan, planAutonomyStep } from "@/game/autonomy";
import { createInitialState, restoreState } from "@/game/state";
import handlerPortrait from "@/public/assets/portraits/handler.png";
import { registerGameTools } from "@/webmcp/registerTools";
import type { ActionResult, GameState, OpeningMissionId, OutfitId, WeaponId } from "@/types/game";

const STORAGE_KEY = "escape-solara-island:v5";
const LEGACY_STORAGE_KEYS = ["escape-solara-island:v4", "escape-solara-island:v3", "escape-solara-island:v2"];
const PORTRAIT_DIALOGUE_SPEAKERS = new Set(["ALEX", "MAYA", "HANDLER"]);

function unreadCharacterDialogueIds(lines: GameState["dialogue"], readThroughId: number) {
  return lines.flatMap((line) => (
    typeof line.id === "number" &&
    line.id > readThroughId &&
    PORTRAIT_DIALOGUE_SPEAKERS.has(line.speaker.toUpperCase())
      ? [line.id]
      : []
  ));
}

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
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState("");
  const [webMcpStatus, setWebMcpStatus] = useState("WebMCP waiting for operation");
  const [autonomyStatus, setAutonomyStatus] = useState("Alex and Maya are assessing the field.");
  const stateRef = useRef<GameState | null>(null);
  const dialoguePendingRef = useRef(false);
  const autonomyBurstRef = useRef(0);
  const lastAutonomyFingerprintRef = useRef("");
  const unreadDialogueIds = state ? unreadCharacterDialogueIds(state.dialogue, state.dialogueReadId) : [];
  const dialoguePending = unreadDialogueIds.length > 0;

  dialoguePendingRef.current = dialoguePending;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) ?? LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
      const restored = stored ? restoreState(JSON.parse(stored)) : null;
      if (restored) {
        dialoguePendingRef.current = unreadCharacterDialogueIds(restored.dialogue, restored.dialogueReadId).length > 0;
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

  const perform = useCallback((action: (draft: GameState) => ActionResult) => {
    if (!stateRef.current) throw new Error("No active operation.");
    if (dialoguePendingRef.current) {
      return {
        result: { ok: false, message: "Continue the current dialogue first." },
        state: stateRef.current
      };
    }
    const next = structuredClone(stateRef.current);
    const result = action(next);
    dialoguePendingRef.current = unreadCharacterDialogueIds(next.dialogue, next.dialogueReadId).length > 0;
    stateRef.current = next;
    setState(next);
    return { result, state: next };
  }, []);

  useEffect(() => {
    if (dialoguePending || menuOpen || state?.phase !== "hotel-call") return;
    const timer = window.setTimeout(() => {
      if (dialoguePendingRef.current || stateRef.current?.phase !== "hotel-call") return;
      const { result } = perform(beginHotelBriefing);
      if (result.ok) setToast(result.message);
    }, MAP_TRAVEL_ANIMATION_MS);
    return () => window.clearTimeout(timer);
  }, [dialoguePending, menuOpen, perform, state?.phase]);

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

  const advanceDialogue = useCallback((lineId: number) => {
    const current = stateRef.current;
    if (!current) return;
    const firstUnreadId = unreadCharacterDialogueIds(current.dialogue, current.dialogueReadId)[0];
    if (firstUnreadId === undefined || lineId !== firstUnreadId) return;
    const next = structuredClone(current);
    next.dialogueReadId = firstUnreadId;
    dialoguePendingRef.current = unreadCharacterDialogueIds(next.dialogue, next.dialogueReadId).length > 0;
    stateRef.current = next;
    setState(next);
  }, []);

  const finishArrival = useCallback(() => {
    if (stateRef.current?.phase !== "arrival") return;
    act(completeAirportArrival);
  }, [act]);

  useEffect(() => {
    if (!state || menuOpen) return;
    if (dialoguePending) {
      setAutonomyStatus("Dialogue paused. Continue the conversation before field actions resume.");
      return;
    }
    const plan = planAutonomyStep(state);
    setAutonomyStatus(plan.reason);
    if (plan.type === "wait") return;
    if (autonomyBurstRef.current >= 12) {
      setAutonomyStatus("Autonomy paused after 12 routine actions. Take one manual action to continue.");
      return;
    }
    const fingerprint = autonomyFingerprint(state, plan);
    if (lastAutonomyFingerprintRef.current === fingerprint) {
      setAutonomyStatus("Autonomy stopped before repeating the same unsuccessful action.");
      return;
    }
    const timer = window.setTimeout(() => {
      if (dialoguePendingRef.current) return;
      lastAutonomyFingerprintRef.current = fingerprint;
      autonomyBurstRef.current += 1;
      const { result } = perform((draft) => executeAutonomyPlan(draft, plan));
      setToast(result.message);
    }, 900);
    return () => window.clearTimeout(timer);
  }, [dialoguePending, menuOpen, perform, state]);

  function begin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state && !window.confirm("Start a new operation and replace the current saved run?")) return;
    const form = new FormData(event.currentTarget);
    const next = createInitialState(String(form.get("handler") ?? "Handler"));
    dialoguePendingRef.current = unreadCharacterDialogueIds(next.dialogue, next.dialogueReadId).length > 0;
    stateRef.current = next;
    setState(next);
    setMenuOpen(false);
    resetAutonomyGuard();
    setToast(`${next.handler.name}, Alex and Maya are on final approach to Solara.`);
  }

  function reset() {
    if (!window.confirm("Reset the operation and erase the current six-day run?")) return;
    localStorage.removeItem(STORAGE_KEY);
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    dialoguePendingRef.current = false;
    stateRef.current = null;
    setState(null);
    setMenuOpen(false);
    resetAutonomyGuard();
    setAutonomyStatus("Alex and Maya are assessing the field.");
    setWebMcpStatus("WebMCP waiting for operation");
  }

  if (!hydrated) return <div className="grid min-h-screen place-items-center text-xs tracking-[.2em] text-solara-pine">UNROLLING THE ISLAND CHART…</div>;

  if (!state || menuOpen) {
    return (
      <main className="opening-screen">
        <section className="opening-menu">
          <h1 className="opening-title">
            <span className="title-line">Escape</span>
            <strong className="title-hero">Solara</strong>
            <span className="title-line">Island</span>
          </h1>
          <p className="opening-tagline">Agents Alex and Maya are approaching the Mediterranean island of Solara. Their first instructions begin after landing.</p>
          {state && (
            <button type="button" className="opening-btn opening-continue" onClick={() => setMenuOpen(false)}>
              Continue operation →
            </button>
          )}
          <form className="opening-form" onSubmit={begin}>
            <label className="opening-label" htmlFor="handler-name">{state ? "START A NEW OPERATION" : "HANDLER NAME"}</label>
            <div className="opening-row">
              <input id="handler-name" name="handler" maxLength={28} required autoComplete="name" className="opening-input" placeholder={state ? "New handler name" : undefined} />
              <button className="opening-btn">{state ? "New run →" : "Begin →"}</button>
            </div>
          </form>
        </section>
      </main>
    );
  }

  const objective = getObjective(state);
  const blocked = dialoguePending || state.phase !== "playing" || Boolean(state.activeMission || state.currentDecision || state.storyChoice);
  const selectedOpeningMission = openingMissionOptions.find((option) => option.id === state.openingMission);
  const storyStage = state.phase === "arrival"
    ? "Final approach"
    : !state.flags.tutorialComplete
      ? "Hotel check-in"
      : state.phase === "story-choice"
        ? "Mission selection"
        : state.phase === "story-paused"
          ? "Awaiting your script"
          : "Opening chapter";

  return (
    <main className="game-shell">
      <header className="topbar">
        <div className="topbar-cluster topbar-cluster--left">
          <button type="button" className="main-menu-button" onClick={() => { resetAutonomyGuard(); setMenuOpen(true); }}>
            <span className="main-menu-icon" aria-hidden="true"><i /><i /><i /></span>
            <span><small>NAVIGATION</small><strong>MAIN MENU</strong></span>
          </button>
          <div className="top-stat top-handler">
            <span className="handler-portrait"><Image src={handlerPortrait} alt="Unknown handler" fill sizes="32px" placeholder="blur" /></span>
            <span className="handler-copy"><small>HANDLER</small><strong>{state.handler.name}</strong></span>
          </div>
          <div className="top-stat top-log"><small>EXPEDITION LOG</small><strong>DAY {Math.min(dayOf(state), 6)} · {formatClock(state)}</strong></div>
        </div>
        <div className="top-funds" aria-label={`Current chapter: ${storyStage}. Player-directed story.`}>
          <small>CURRENT CHAPTER</small>
          <strong>{storyStage}</strong>
          <span>PLAYER-DIRECTED STORY</span>
        </div>
        <div className="topbar-cluster topbar-cluster--right">
          <div className="top-stat top-objective">
            <small>CURRENT OBJECTIVE</small>
            <strong className="obj-title">{objective.title}</strong>
            <div className="obj-bar"><i style={{ width: `${Math.max(3, objective.progress * 100)}%` }} /></div>
          </div>
          <div className="top-stat top-story"><small>STORY STATUS</small><strong>{storyStage}</strong></div>
          <div className="mcp-pill"><i /><span>{webMcpStatus}</span></div>
          <button onClick={reset} className="top-reset" aria-label="Reset operation">↻</button>
        </div>
      </header>

      <div className="game-grid">
        <aside className="flex min-h-0 flex-col gap-3">
          <section className="panel operative-dashboard flex min-h-0 flex-1 flex-col overflow-hidden">
            <header className="panel-header operative-dashboard__header shrink-0">
              <div><p className="label">HANDLER OPERATIONS</p><h2 className="panel-title">Active operatives</h2><p className="operative-dashboard__status">{autonomyStatus}</p></div>
              <button type="button" disabled={dialoguePending} aria-pressed={state.autonomy.enabled} onClick={() => act((draft) => setAutonomyMode(draft, !draft.autonomy.enabled))} className={`badge transition-colors disabled:cursor-not-allowed disabled:opacity-45 ${state.autonomy.enabled ? "border-emerald-700/45 bg-emerald-700/10 text-emerald-800" : "border-solara-ink/25 bg-transparent text-solara-ink/45"}`}>{state.autonomy.enabled ? "AUTO · ON" : "AUTO · OFF"}</button>
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

        </aside>

        <section className="center-column">
          <IslandMap state={state} onDrive={(destination) => act((draft) => driveTeam(draft, destination))} onArrivalComplete={finishArrival} interactionDisabled={dialoguePending} />
          <DialoguePanel
            lines={state.dialogue}
            decision={state.currentDecision ?? state.storyChoice}
            handlerName={state.handler.name}
            readThroughId={state.dialogueReadId}
            onAdvance={advanceDialogue}
            onChoose={(option) => act((draft) => draft.storyChoice
              ? selectOpeningMission(draft, option as OpeningMissionId)
              : choosePath(draft, option))}
          />
        </section>

        <aside className="flex min-h-0 flex-col gap-3">
          <AgentActivityFeed activity={state.activityLog} />
          <section className="panel shrink-0 p-3">
            <p className="label">STORY DIRECTION</p>
            <h2 className="panel-title mt-1">{selectedOpeningMission?.label ?? storyStage}</h2>
            <p className="mt-2 text-[9px] leading-4 text-solara-ink/55">
              {state.phase === "arrival"
                ? "Flight 712 is approaching from the northwest."
                : state.phase === "story-choice"
                  ? "Choose one operation in the dialogue box."
                  : state.phase === "story-paused"
                    ? "The opening stops here until you write the next briefing."
                    : "Alex and Maya are heading to Hotel Aster for the handler's call."}
            </p>
            {(state.storyChoice || state.openingMission) && (
              <ol className="mt-3 grid gap-1.5" aria-label="Handler mission options">
                {openingMissionOptions.map((option) => {
                  const selected = option.id === state.openingMission;
                  return (
                    <li key={option.id} className={`rounded border px-2.5 py-2 text-[8px] font-bold ${selected ? "border-solara-coral/55 bg-solara-coral/10 text-solara-coral" : "border-solara-ink/15 text-solara-ink/45"}`}>
                      <span aria-hidden="true">{selected ? "◆" : "◇"}</span> {option.label}
                    </li>
                  );
                })}
              </ol>
            )}
          </section>
        </aside>
      </div>

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
