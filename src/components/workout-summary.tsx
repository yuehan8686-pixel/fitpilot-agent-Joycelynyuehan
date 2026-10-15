"use client";

import { useFitnessStore } from "../store/use-fitness-store";
import { ScreenActions } from "./screen-actions";

export function WorkoutSummary() {
  const workout = useFitnessStore((state) => state.workoutHistory[0]);
  const setView = useFitnessStore((state) => state.setView);
  if (!workout) return <div className="empty-state"><h2>还没有训练总结</h2></div>;
  const sets = workout.exercises.reduce((sum, item) => sum + item.setLogs.length, 0);
  const volume = workout.exercises.reduce((sum, item) => sum + item.setLogs.reduce((sub, set) => sub + set.weightKg * set.reps, 0), 0);
  const minutes = Math.max(1, Math.round((new Date(workout.finishedAt!).getTime() - new Date(workout.startedAt).getTime()) / 60000));
  return <main className="summary-screen"><ScreenActions /><div className="summary-check">✓</div><span className="system-line">训练已存档</span><h1>{workout.sessionName}<br />完成。</h1><p>{workout.summary}</p><div className="summary-metrics"><div><strong>{sets}</strong><span>完成组数</span></div><div><strong>{Math.round(volume)}</strong><span>总容量 / kg</span></div><div><strong>{minutes}</strong><span>训练分钟</span></div></div><section className="adjustment-note"><span>下次调整</span><p>已保存你的重量、次数和主观反馈。下一次打开同类训练时，Agent 会优先保持动作质量，再决定是否加重。</p></section><button className="primary-action" type="button" onClick={() => setView("dashboard")}>回到训练台</button></main>;
}
