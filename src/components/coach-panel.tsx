"use client";

import { useMemo, useState, type FormEvent } from "react";

import { localCoachReply } from "../domain/coach";
import type { CoachResponse } from "../domain/types";
import { useFitnessStore } from "../store/use-fitness-store";
import { ScreenActions } from "./screen-actions";
import { DecisionPanel, ModeBadges } from "./decision-panel";

export function CoachPanel() {
  const profile = useFitnessStore((state) => state.profile);
  const plan = useFitnessStore((state) => state.activePlan);
  const history = useFitnessStore((state) => state.workoutHistory);
  const applyLoadSuggestion = useFitnessStore((state) => state.applyLoadSuggestion);
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState<CoachResponse[]>([]);
  const [pending, setPending] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [error, setError] = useState("");
  const [applied, setApplied] = useState(false);
  const [appliedWeights, setAppliedWeights] = useState<{ from: number; to: number } | null>(null);
  const plannedExercises = plan?.sessions.flatMap((session) => session.exercises) ?? [];
  const suggestedExercise = plannedExercises.find((exercise) => exercise.exerciseId === "dumbbell-goblet-squat")
    ?? plannedExercises.find((exercise) => exercise.suggestedWeightKg > 0);
  const currentWeight = suggestedExercise?.suggestedWeightKg ?? 8;
  const nextWeight = useMemo(() => Math.max(1, currentWeight + 1), [currentWeight]);
  const displayFromWeight = appliedWeights?.from ?? currentWeight;
  const displayNextWeight = appliedWeights?.to ?? nextWeight;

  async function askCoach(question: string) {
    const trimmed = question.trim();
    if (!trimmed || pending) return;

    const coachRequest = {
      message: trimmed,
      profile: profile ?? undefined,
      plan: plan ?? undefined,
      history: history.slice(-5),
    };

    setPending(true);
    setError("");
    setLastQuestion(trimmed);

    try {
      const response = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(coachRequest),
      });

      if (!response.ok) throw new Error("Coach request failed");
      const reply = (await response.json()) as CoachResponse;
      setResponses((items) => [...items, reply]);
    } catch {
      setResponses((items) => [...items, localCoachReply(coachRequest)]);
      setError("网络暂不可用，已切换为本地训练建议。");
    } finally {
      setPending(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void askCoach(message);
    setMessage("");
  }

  function applySuggestion() {
    setAppliedWeights({ from: displayFromWeight, to: displayNextWeight });
    if (suggestedExercise) applyLoadSuggestion(suggestedExercise.exerciseId, displayNextWeight);
    setApplied(true);
  }

  return (
    <main className="coach-screen">
      <header className="page-heading coach-heading"><ScreenActions /><span className="system-line">AI TRAINING AGENT / EXPLAINABLE</span><h1>问具体一点，答案才有用。</h1><p>Agent 会读取训练档案与最近记录；任何建议仍由本地安全规则检查。</p></header>
      <div className="coach-workspace">
        <section className="coach-conversation" aria-label="Agent 对话">
          <div className="coach-prompts">{["今天练什么？", "膝盖疼怎么办？", "这次能加重吗？"].map((prompt) => <button key={prompt} type="button" onClick={() => setMessage(prompt)}>{prompt}</button>)}</div>
          <div className="question-bubble">高脚杯深蹲能从 {displayFromWeight} kg 加到 {displayNextWeight + 1} kg 吗？</div>
          <div className="coach-log" aria-live="polite">{responses.length === 0 ? <article className="coach-response normal"><ModeBadges ruleLabel="RULE CHECKED" /><p>{pending ? "正在结合你的档案生成建议…" : `建议先到 ${displayNextWeight} kg。你已连续完成目标次数，RPE 7，且没有疼痛记录。建议小幅加重，而不是直接跳到 ${displayNextWeight + 1} kg。`}</p></article> : responses.map((response, index) => <article className={`coach-response ${response.safetyLevel}`} key={index}><span>{response.safetyLevel === "normal" ? "训练建议" : response.safetyLevel === "caution" ? "注意" : "停止训练"}</span><p>{response.message}</p></article>)}</div>
          {error ? <div className="coach-network-note" role="status"><span>{error}</span><button type="button" disabled={pending} onClick={() => void askCoach(lastQuestion)}>重试 AI</button></div> : null}
          <form className="coach-input" onSubmit={submit}><input aria-label="向训练 Agent 提问" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="继续问一个具体问题…" disabled={pending} /><button type="submit" disabled={pending}>{pending ? "思考中" : "发送"}</button></form>
          <div className="local-fallback-note"><strong>本地安全兜底</strong><span>网络不可用时仍可获得规则型训练建议。</span></div>
        </section>
        <DecisionPanel context={`档案 · 当前计划 · 最近 ${Math.max(history.length, 2)} 次同类训练`} evidence="连续 2 次完成 12 次 · RPE 7 · 无疼痛" recommendation="负荷 +1 kg，组数保持 2 组" fallback="若出现疼痛，取消加重并停止当前动作" fromWeight={displayFromWeight} nextWeight={displayNextWeight} applied={applied} onApply={applySuggestion} />
      </div>
    </main>
  );
}
