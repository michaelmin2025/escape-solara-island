import { useEffect, useRef } from "react";
import type { DecisionState, DialogueLine } from "@/types/game";

interface DialoguePanelProps {
  lines: DialogueLine[];
  decision?: DecisionState;
  handlerName: string;
  onChoose: (option: string) => void;
}

/*
 * JRPG-style command box: the handler reads the field chatter here and,
 * when Alex or Maya calls in with a branch point, chooses an option
 * directly in the box — no modal interruption.
 */
export function DialoguePanel({ lines, decision, handlerName, onChoose }: DialoguePanelProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const recent = lines.slice(-4);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTop = log.scrollHeight;
  }, [lines.length, decision?.sceneId]);

  return (
    <section className="jrpg-box" aria-label="Field communications">
      <span className="jrpg-tag">{decision ? `INCOMING CALL · ${decision.caller.toUpperCase()}` : "FIELD COMMS"}</span>
      <div ref={logRef} className="jrpg-log">
        {recent.map((line, index) => (
          <p key={`${line.speaker}-${index}-${line.text}`} className="jrpg-line">
            <strong className="jrpg-speaker">{line.speaker}</strong>
            <span>“{line.text}”</span>
          </p>
        ))}
      </div>
      {decision ? (
        <div className="jrpg-decision">
          <p className="jrpg-prompt">{decision.prompt}</p>
          <div className="jrpg-options">
            {decision.options.map((option, index) => (
              <button key={option.id} disabled={!option.available} onClick={() => onChoose(option.id)} className="jrpg-option">
                <span className="jrpg-cursor" aria-hidden="true">▶</span>
                <span className="jrpg-key">{String.fromCharCode(65 + index)}</span>
                <span className="jrpg-opt-text">
                  <strong>{option.label}</strong>
                  <small>{option.available ? option.description : option.unavailableReason}</small>
                </span>
              </button>
            ))}
          </div>
          <p className="jrpg-note">Operation paused — {handlerName}, what&apos;s the call?</p>
        </div>
      ) : (
        <p className="jrpg-note jrpg-note-idle">Direct Alex + Maya from the chart, the board, or your directive.</p>
      )}
    </section>
  );
}
