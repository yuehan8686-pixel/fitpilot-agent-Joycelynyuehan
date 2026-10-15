"use client";

import { useState, type FormEvent } from "react";

import { localCoachReply } from "../domain/coach";
import type { CoachResponse } from "../domain/types";
import { useFitnessStore } from "../store/use-fitness-store";
import { ScreenActions } from "./screen-actions";

export function CoachPanel() {
  const profile = useFitnessStore((state) => state.profile);
  const plan = useFitnessStore((state) => state.activePlan);
  const history = useFitnessStore((state) => state.workoutHistory);
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState<CoachResponse[]>([]);
  const [pending, setPending] = useState(false);
  const [lastQuestion, setLastQuestion] = useState("");
  const [error, setError] = useState("");

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

  return <main className="coach-screen"><header className="page-heading coach-heading"><ScreenActions /><span className="system-line">AI 训练 Agent · 本地安全兜底</span><h1>问具体一点，答案才有用。</h1><p>它能读取你的档案和训练记录；未配置 API 时自动使用本地规则。</p></header><div className="coach-prompts">{["今天应该练什么？", "这个动作哪里要注意？", "我觉得膝盖疼怎么办？"].map((prompt) => <button key={prompt} type="button" onClick={() => setMessage(prompt)}>{prompt}</button>)}</div><div className="coach-log" aria-live="polite">{responses.length === 0 ? <div className="coach-empty"><span>{pending ? "AGENT THINKING" : "AGENT READY"}</span><p>{pending ? "正在结合你的档案生成建议…" : "可以询问计划、动作提示、换动作或本次负荷。"}</p></div> : responses.map((response, index) => <article className={`coach-response ${response.safetyLevel}`} key={index}><span>{response.safetyLevel === "normal" ? "训练建议" : response.safetyLevel === "caution" ? "注意" : "停止训练"}</span><p>{response.message}</p></article>)}</div>{error ? <div className="coach-network-note" role="status"><span>{error}</span><button type="button" disabled={pending} onClick={() => void askCoach(lastQuestion)}>重试 AI</button></div> : null}<form className="coach-input" onSubmit={submit}><input aria-label="向训练 Agent 提问" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="输入你的问题…" disabled={pending} /><button type="submit" disabled={pending}>{pending ? "思考中" : "发送"}</button></form></main>;
}
