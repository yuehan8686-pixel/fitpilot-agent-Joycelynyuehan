"use client";

import { getExercise } from "../domain/exercises";
import { useFitnessStore } from "../store/use-fitness-store";
import { ExerciseVisual } from "./exercise-visual";
import { ScreenActions } from "./screen-actions";

export function PlanView() {
  const plan = useFitnessStore((state) => state.activePlan);
  const startWorkout = useFitnessStore((state) => state.startWorkout);
  if (!plan) return <div className="empty-state"><h2>计划尚未生成</h2></div>;

  return (
    <main className="plan-screen">
      <header className="page-heading"><ScreenActions /><span className="system-line">本周程序</span><h1>{plan.title}</h1><p>{plan.summary}</p></header>
      {plan.warning && <p className="pain-alert" role="alert">{plan.warning}</p>}
      <div className="plan-sessions">
        {plan.sessions.map((session, sessionIndex) => (
          <article className="plan-session" key={session.id}>
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
