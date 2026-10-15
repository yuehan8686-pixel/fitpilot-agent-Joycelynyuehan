"use client";

import { useFitnessStore } from "../store/use-fitness-store";

export function Dashboard() {
  const profile = useFitnessStore((state) => state.profile);
  const plan = useFitnessStore((state) => state.activePlan);
  const history = useFitnessStore((state) => state.workoutHistory);
  const createPlan = useFitnessStore((state) => state.createPlan);
  const resetAll = useFitnessStore((state) => state.resetAll);
  const setView = useFitnessStore((state) => state.setView);

  if (!profile) return null;
  const goal = { build_muscle: "增肌塑形", lose_fat: "减脂与体能", general_fitness: "基础健康" }[profile.goal];

  return (
    <main className="dashboard-screen">
      <section className="dashboard-hero">
        <div><span className="system-line">训练档案已连接</span><h1>{profile.name}，今天<br />练得明白一点。</h1><p>{goal} · 每周 {profile.trainingDays} 次 · 每次 {profile.sessionMinutes} 分钟</p></div>
        <div className="readiness-dial"><span>READY</span><strong>{history.length > 0 ? "82" : "76"}</strong><small>今日状态</small></div>
      </section>

      <section className="dashboard-grid">
        <article className="next-session-panel">
          <span className="panel-code">NEXT SESSION</span>
          {plan ? <><h2>{plan.sessions[0].name}</h2><p>{plan.sessions[0].focus}</p><div className="session-metrics"><span><b>{plan.sessions[0].exercises.length}</b> 个动作</span><span><b>{plan.sessions[0].estimatedMinutes}</b> 分钟</span></div><button className="primary-action" type="button" onClick={() => setView("plan")}>查看今日计划</button></> : <><h2>还没有训练计划</h2><p>根据你的档案生成第一周安排。</p><button className="primary-action" type="button" onClick={createPlan}>生成训练计划</button></>}
        </article>
        <article className="history-panel">
          <span className="panel-code">TRAINING LOG</span><h2>{history.length}</h2><p>已完成训练</p>
          {history[0] ? <small>{history[0].sessionName}<br />{new Date(history[0].finishedAt!).toLocaleDateString("zh-CN")}</small> : <small>第一条训练记录会出现在这里。</small>}
        </article>
        <button className="coach-entry" type="button" onClick={() => setView("coach")}><span>问问训练 Agent</span><b>打开对话</b></button>
      </section>
      <footer className="data-controls"><span>档案和训练记录仅保存在当前浏览器。</span><button type="button" onClick={() => { if (window.confirm("确定清除本机档案、计划和训练记录吗？")) resetAll(); }}>重置本机数据</button></footer>
    </main>
  );
}
