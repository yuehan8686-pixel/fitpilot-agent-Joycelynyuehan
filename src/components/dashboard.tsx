"use client";

import { useFitnessStore } from "../store/use-fitness-store";
import { getExercise } from "../domain/exercises";
import { DecisionPanel } from "./decision-panel";

export function Dashboard() {
  const profile = useFitnessStore((state) => state.profile);
  const plan = useFitnessStore((state) => state.activePlan);
  const history = useFitnessStore((state) => state.workoutHistory);
  const activeWorkout = useFitnessStore((state) => state.activeWorkout);
  const createPlan = useFitnessStore((state) => state.createPlan);
  const resetAll = useFitnessStore((state) => state.resetAll);
  const setView = useFitnessStore((state) => state.setView);

  if (!profile) return null;
  const goal = { build_muscle: "增肌塑形", lose_fat: "减脂与体能", general_fitness: "基础健康" }[profile.goal];
  const displayName = profile.name === "小驼" ? "小高" : profile.name;

  return (
    <main className="dashboard-screen">
      <section className="dashboard-hero">
        <div><span className="system-line">TRAINING CONSOLE / 今日状态</span><h1>{displayName}，今天练得明白一点。</h1><p>{goal} · 每周 {profile.trainingDays} 次 · 每次 {profile.sessionMinutes} 分钟</p></div>
      </section>

      <section className="status-grid" aria-label="训练状态概览">
        <article><span>今日状态</span><strong>{history.length > 0 ? "已完成训练" : "就绪"}</strong><small>{history.length > 0 ? `${history[0].sessionName} · 记录已安全存档` : "恢复良好 · 可按计划训练"}</small></article>
        <article><span>连续训练</span><strong>3 周</strong><small>完成率 86%</small></article>
        <article><span>规则守护</span><strong>已启用</strong><small>疼痛与异常症状优先</small></article>
        <article className="local-card"><span>LOCAL FIRST</span><strong>数据留在设备上</strong><small>AI 不可用时继续由本地规则安全运行</small></article>
      </section>

      <section className="dashboard-grid">
        <article className="next-session-panel">
          <span className="panel-code">NEXT SESSION</span>
          {activeWorkout ? <><h2>{activeWorkout.sessionName}</h2><p>训练进度已保留，可以随时接着完成。</p><div className="session-metrics"><span><b>{activeWorkout.currentExerciseIndex + 1}</b> 当前动作</span><span><b>{activeWorkout.exercises.length}</b> 总动作</span></div><button className="primary-action" type="button" onClick={() => setView("workout")}>继续训练 {activeWorkout.sessionName}</button></> : plan ? <><h2>{plan.sessions[0].name}</h2><p>{plan.sessions[0].focus} · 约 {plan.sessions[0].estimatedMinutes} 分钟</p><div className="dashboard-exercises">{plan.sessions[0].exercises.slice(0, 3).map((item, index) => { const exercise = getExercise(item.exerciseId); return exercise ? <div className="dashboard-exercise" key={item.exerciseId}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{exercise.name}</strong><small>{item.sets} 组 × {item.repMin}–{item.repMax} 次 · 休息 {item.restSeconds}s</small></div></div> : null; })}</div><button className="primary-action" type="button" onClick={() => setView("plan")}>查看今日计划</button></> : <><h2>还没有训练计划</h2><p>根据你的档案生成第一周安排。</p><button className="primary-action" type="button" onClick={createPlan}>生成训练计划</button></>}
        </article>
        <DecisionPanel compact title="为什么这样安排？" context={`训练档案 · 本周计划 · 最近 ${Math.max(history.length, 1)} 次训练`} evidence="上次完成目标次数，RPE 7，无疼痛。" recommendation="今天保持动作顺序与目标负荷。" fallback="出现疼痛或异常症状时，本地规则立即停止加量。" actionLabel="查看完整依据" onApply={() => setView("coach")} />
      </section>
      <footer className="data-controls"><span>档案和训练记录仅保存在当前浏览器。</span><button type="button" onClick={() => { if (window.confirm("确定清除本机档案、计划和训练记录吗？")) resetAll(); }}>重置本机数据</button></footer>
    </main>
  );
}
