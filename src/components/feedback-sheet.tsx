"use client";

import { useState } from "react";

import type { ExerciseFeedback } from "../domain/types";

export function FeedbackSheet({ onSubmit }: { onSubmit: (feedback: ExerciseFeedback) => void }) {
  const [rpe, setRpe] = useState(7);
  const [targetFeeling, setTargetFeeling] = useState(4);
  const [painLevel, setPainLevel] = useState(0);
  const [painArea, setPainArea] = useState("");
  const [compensation, setCompensation] = useState("");

  return (
    <section className="feedback-sheet">
      <div className="feedback-title"><span>组后校准</span><strong>这一组感觉怎么样？</strong></div>
      <label>
        <span>用力程度 RPE <b>{rpe}</b></span>
        <input type="range" min={1} max={10} value={rpe} onChange={(event) => setRpe(Number(event.target.value))} />
      </label>
      <label>
        <span>目标肌群感受 <b>{targetFeeling}/5</b></span>
        <input type="range" min={1} max={5} value={targetFeeling} onChange={(event) => setTargetFeeling(Number(event.target.value))} />
      </label>
      <div className="feedback-grid">
        <label><span>疼痛程度</span><select value={painLevel} onChange={(event) => setPainLevel(Number(event.target.value))}><option value="0">无疼痛</option><option value="1">轻微不适</option><option value="2">持续不适</option><option value="3">明显疼痛</option><option value="4">需要停止</option><option value="5">严重疼痛</option></select></label>
        <label><span>疼痛部位</span><input value={painArea} onChange={(event) => setPainArea(event.target.value)} placeholder="可选" /></label>
      </div>
      <label><span>哪里容易代偿？</span><input value={compensation} onChange={(event) => setCompensation(event.target.value)} placeholder="例如：肩膀容易耸起" /></label>
      {painLevel > 0 && <p className="pain-alert" role="alert"><strong>停止当前动作</strong>。疼痛不是正常训练强度，不要继续加重。</p>}
      <button className="primary-action" type="button" onClick={() => onSubmit({ rpe, targetFeeling, painLevel, painArea: painArea || undefined, compensation: compensation || undefined, emergencySymptoms: [] })}>保存反馈，下一动作</button>
    </section>
  );
}
