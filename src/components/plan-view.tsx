"use client";

import { useState } from "react";

import { getExercise } from "../domain/exercises";
import { useFitnessStore } from "../store/use-fitness-store";
import { ExerciseVisual } from "./exercise-visual";
import { ScreenActions } from "./screen-actions";

export function PlanView() {
  const [selectedSession, setSelectedSession] = useState(0);
  const plan = useFitnessStore((state) => state.activePlan);
  const startWorkout = useFitnessStore((state) => state.startWorkout);
  if (!plan) return <div className="empty-state"><h2>计划尚未生成</h2></div>;

  return (
    <main className="plan-screen">
      <header className="page-heading"><ScreenActions /><span className="system-line">本周程序</span><h1>{plan.title}</h1><p>{plan.summary}</p></header>
      {plan.warning && <p className="pain-alert" role="alert">{plan.warning}</p>}
      <section className="status-grid plan-overview" aria-label="本周计划概览">
        <article><span>本周频率</span><strong>{plan.sessions.length} 次</strong><small>{plan.sessions.map((session) => session.name.replace("全身 ", "")).join(" / ")}</small></article>
        <article><span>单次时长</span><strong>{plan.sessions[0]?.estimatedMinutes ?? 40} 分钟</strong><small>含热身与组间休息</small></article>
        <article><span>目标强度</span><strong>RPE 7</strong><small>新手保留 3 次余力</small></article>
        <article className="local-card"><span>RULE GUARD</span><strong>规则已检查</strong><small>器械、经验和身体限制均已匹配</small></article>
      </section>
      <div className="mobile-session-tabs" role="tablist" aria-label="选择训练日">
        {plan.sessions.map((session, index) => (
          <button
            aria-controls={`session-panel-${session.id}`}
            aria-selected={selectedSession === index}
            className={selectedSession === index ? "active" : ""}
            id={`session-tab-${session.id}`}
            key={session.id}
            onClick={() => setSelectedSession(index)}
            role="tab"
            type="button"
          >
            {session.name}
          </button>
        ))}
      </div>
      <div className="plan-sessions">
        {plan.sessions.map((session, sessionIndex) => (
          <article
            aria-labelledby={`session-tab-${session.id}`}
            className={`plan-session${selectedSession === sessionIndex ? " mobile-active" : ""}`}
            id={`session-panel-${session.id}`}
            key={session.id}
            role="tabpanel"
          >
            <div className="session-top"><span>{String(sessionIndex + 1).padStart(2, "0")}</span><div><h2>{session.name}</h2><p>{session.focus} · 约 {session.estimatedMinutes} 分钟</p></div></div>
            <div className="exercise-stack">
              {session.exercises.map((item, index) => { const exercise = getExercise(item.exerciseId); return exercise ? <div className="plan-exercise" key={item.exerciseId}><ExerciseVisual exercise={exercise} compact /><span>{index + 1}</span><div><strong>{exercise.name}</strong><small>{item.sets} 组 × {item.repMin}–{item.repMax} 次 · 休息 {item.restSeconds}s</small></div></div> : null; })}
            </div>
            <button className="primary-action" disabled={session.exercises.length === 0} type="button" onClick={() => startWorkout(session.id)}>开始 {session.name}</button>
          </article>
        ))}
      </div>
    </main>
  );
}
