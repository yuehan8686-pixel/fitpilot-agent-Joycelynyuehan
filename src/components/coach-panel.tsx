"use client";

import { useState, type FormEvent } from "react";

import { localCoachReply } from "../domain/coach";
import type { CoachResponse } from "../domain/types";
import { useFitnessStore } from "../store/use-fitness-store";

export function CoachPanel() {
  const profile = useFitnessStore((state) => state.profile);
  const plan = useFitnessStore((state) => state.activePlan);
  const history = useFitnessStore((state) => state.workoutHistory);
  const setView = useFitnessStore((state) => state.setView);
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState<CoachResponse[]>([]);

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!message.trim()) return;
    setResponses((items) => [...items, localCoachReply({ message, profile: profile ?? undefined, plan: plan ?? undefined, history })]);
    setMessage("");
  }

  return <main className="coach-screen"><header className="page-heading"><button type="button" onClick={() => setView("dashboard")}>返回</button><span className="system-line">本地训练 Agent</span><h1>问具体一点，<br />答案才有用。</h1><p>它能读取你的档案和训练记录；未配置 API 时使用本地规则。</p></header><div className="coach-prompts">{["今天应该练什么？", "这个动作哪里要注意？", "我觉得膝盖疼怎么办？"].map((prompt) => <button key={prompt} type="button" onClick={() => setMessage(prompt)}>{prompt}</button>)}</div><div className="coach-log">{responses.length === 0 ? <div className="coach-empty"><span>AGENT READY</span><p>可以询问计划、动作提示、换动作或本次负荷。</p></div> : responses.map((response, index) => <article className={`coach-response ${response.safetyLevel}`} key={index}><span>{response.safetyLevel === "normal" ? "训练建议" : response.safetyLevel === "caution" ? "注意" : "停止训练"}</span><p>{response.message}</p></article>)}</div><form className="coach-input" onSubmit={submit}><input aria-label="向训练 Agent 提问" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="输入你的问题…" /><button type="submit">发送</button></form></main>;
}
