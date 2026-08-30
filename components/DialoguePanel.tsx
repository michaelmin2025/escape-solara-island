import Image, { type StaticImageData } from "next/image";
import { useEffect, useId, useRef } from "react";

import alexPortrait from "@/public/assets/portraits/alex.png";
import handlerPortrait from "@/public/assets/portraits/handler.png";
import mayaPortrait from "@/public/assets/portraits/maya.png";
import type { DecisionState, DialogueLine, StoryChoiceState } from "@/types/game";

type DialogueDecision = DecisionState | StoryChoiceState;

interface DialoguePanelProps {
  lines: DialogueLine[];
  decision?: DialogueDecision;
  handlerName: string;
  readThroughId: number;
  onAdvance: (lineId: number) => void;
  onChoose: (option: string) => void;
}

const portraits: Record<string, StaticImageData> = {
  ALEX: alexPortrait,
  MAYA: mayaPortrait,
  HANDLER: handlerPortrait
};

const INTERACTIVE_TARGETS = [
  "a[href]",
  "button",
  "input",
  "textarea",
  "select",
  "summary",
  "[contenteditable]:not([contenteditable='false'])",
  "[role='button']",
  "[role='link']",
  "[role='checkbox']",
  "[role='combobox']",
  "[role='menuitem']",
  "[role='menuitemcheckbox']",
  "[role='menuitemradio']",
  "[role='option']",
  "[role='radio']",
  "[role='slider']",
  "[role='spinbutton']",
  "[role='switch']",
  "[role='tab']",
  "[role='textbox']",
  "[role='treeitem']",
  "[tabindex]:not([tabindex='-1'])"
].join(", ");

export function DialoguePanel({
  lines,
  decision,
  handlerName,
  readThroughId,
  onAdvance,
  onChoose
}: DialoguePanelProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const firstDecisionOptionRef = useRef<HTMLButtonElement>(null);
  const followingLatestRef = useRef(true);
  const firstPaintRef = useRef(true);
  const decisionPromptId = useId();
  const decisionKey = decision ? ("sceneId" in decision ? `${decision.missionId}:${decision.sceneId}` : decision.id) : "none";
  const conversationLines = lines.flatMap((line) => {
    const speaker = line.speaker.toUpperCase();
    const portrait = portraits[speaker];
    return portrait && typeof line.id === "number" ? [{ line, lineId: line.id, portrait, speaker }] : [];
  });
  const firstUnreadIndex = conversationLines.findIndex(({ lineId }) => lineId > readThroughId);
  const firstUnreadLine = firstUnreadIndex >= 0 ? conversationLines[firstUnreadIndex] : undefined;
  const firstUnreadLineId = firstUnreadLine?.lineId;
  const hasUnreadLine = Boolean(firstUnreadLine);
  const visibleConversationLines = firstUnreadLine
    ? conversationLines.filter(({ lineId }) => lineId <= readThroughId || lineId === firstUnreadLine.lineId)
    : conversationLines.filter(({ lineId }) => lineId <= readThroughId);
  const decisionReady = Boolean(decision) && !hasUnreadLine;
  const firstEnabledOptionIndex = decisionReady && decision
    ? decision.options.findIndex((option) => option.available)
    : -1;
  const visibleCursorId = visibleConversationLines.at(-1)?.lineId ?? 0;

  function advanceOneLine() {
    if (firstUnreadLineId === undefined) return;
    followingLatestRef.current = true;
    onAdvance(firstUnreadLineId);
  }

  useEffect(() => {
    const log = logRef.current;
    if (!log || (!firstPaintRef.current && !followingLatestRef.current)) return;
    const frame = window.requestAnimationFrame(() => {
      log.scrollTop = log.scrollHeight;
      firstPaintRef.current = false;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [visibleCursorId, decisionKey]);

  useEffect(() => {
    if (!decisionReady || firstEnabledOptionIndex < 0) return;
    const frame = window.requestAnimationFrame(() => firstDecisionOptionRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [decisionKey, decisionReady, firstEnabledOptionIndex]);

  useEffect(() => {
    if (!hasUnreadLine) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || (event.key !== " " && event.code !== "Space") || event.repeat) return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;

      const target = event.target;
      if (target instanceof Element && target.closest(INTERACTIVE_TARGETS)) return;

      event.preventDefault();
      followingLatestRef.current = true;
      if (firstUnreadLineId !== undefined) onAdvance(firstUnreadLineId);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [firstUnreadLineId, hasUnreadLine, onAdvance]);

  function trackScroll() {
    const log = logRef.current;
    if (!log) return;
    followingLatestRef.current = log.scrollHeight - log.scrollTop - log.clientHeight < 24;
  }

  return (
    <section className={`jrpg-box ${decisionReady ? "has-decision" : ""}`} aria-label="Character dialogue history">
      <span className="jrpg-tag">{decision ? `INCOMING CALL · ${decision.caller.toUpperCase()}` : "FIELD COMMS · DIALOGUE LOG"}</span>
      <div
        ref={logRef}
        className="jrpg-log"
        role="log"
        aria-label="Conversation history. Newest messages are at the bottom."
        aria-live="polite"
        aria-relevant="additions"
        tabIndex={0}
        onScroll={trackScroll}
      >
        {visibleConversationLines.map(({ line, lineId, portrait, speaker }) => {
          const displayName = speaker === "HANDLER" ? handlerName : speaker.charAt(0) + speaker.slice(1).toLowerCase();
          const isUnread = lineId === firstUnreadLine?.lineId;
          return (
            <article
              key={lineId}
              className={`jrpg-line ${isUnread ? "is-unread" : ""}`}
              aria-current={isUnread ? "true" : undefined}
            >
              <div className="jrpg-portrait" aria-hidden="true">
                <Image src={portrait} alt="" fill sizes="68px" placeholder="blur" />
              </div>
              <div className="jrpg-copy">
                <strong className="jrpg-speaker">{displayName}</strong>
                <p>{line.text}</p>
              </div>
            </article>
          );
        })}
        {!visibleConversationLines.length && <p className="jrpg-empty-line">Awaiting the first character transmission…</p>}
      </div>
      {decisionReady && decision ? (
        <div className="jrpg-decision" role="group" aria-labelledby={decisionPromptId}>
          <p id={decisionPromptId} className="jrpg-prompt" role="status" aria-live="polite" aria-atomic="true">
            {decision.prompt}
          </p>
          <div className="jrpg-options">
            {decision.options.map((option, index) => (
              <button
                ref={index === firstEnabledOptionIndex ? firstDecisionOptionRef : undefined}
                type="button"
                key={option.id}
                disabled={!option.available}
                onClick={() => onChoose(option.id)}
                className="jrpg-option"
              >
                <span className="jrpg-cursor" aria-hidden="true">▶</span>
                <span className="jrpg-key">{String.fromCharCode(65 + index)}</span>
                <span className="jrpg-opt-text">
                  <strong>{option.label}</strong>
                  <small>{option.available ? option.description : ("unavailableReason" in option ? option.unavailableReason : "Unavailable")}</small>
                </span>
              </button>
            ))}
          </div>
          <p className="jrpg-note">
            {"sceneId" in decision
              ? `Operation paused — ${handlerName}, what's the call?`
              : `Story paused — ${handlerName}, choose the first mission.`}
          </p>
        </div>
      ) : hasUnreadLine ? (
        <div className="jrpg-advance">
          <span className="jrpg-progress" aria-hidden="true">
            Message {firstUnreadIndex + 1} of {conversationLines.length}
          </span>
          <button
            type="button"
            className="jrpg-continue"
            aria-label={`Continue dialogue. Current message ${firstUnreadIndex + 1} of ${conversationLines.length}.`}
            aria-keyshortcuts="Space"
            onClick={advanceOneLine}
          >
            <span>Continue</span>
            <kbd>Space</kbd>
          </button>
        </div>
      ) : (
        <p className="jrpg-note jrpg-note-idle">Two latest conversations stay in view · scroll up for history</p>
      )}
    </section>
  );
}
