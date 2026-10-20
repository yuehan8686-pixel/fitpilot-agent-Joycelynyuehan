"use client";

import { useEffect, useState } from "react";

import { useFitnessStore } from "../store/use-fitness-store";
import { CoachPanel } from "./coach-panel";
import { Dashboard } from "./dashboard";
import { OnboardingFlow } from "./onboarding-flow";
import { PlanView } from "./plan-view";
import { WorkoutRunner } from "./workout-runner";
import { WorkoutSummary } from "./workout-summary";

export function AppShell() {
  const [mounted, setMounted] = useState(false);
  const profile = useFitnessStore((state) => state.profile);
  const view = useFitnessStore((state) => state.view);
  const saveProfile = useFitnessStore((state) => state.saveProfile);
  const createPlan = useFitnessStore((state) => state.createPlan);
  const setView = useFitnessStore((state) => state.setView);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (mounted) window.scrollTo({ top: 0, behavior: "instant" });
  }, [mounted, view]);
  if (!mounted) return <main className="boot-screen"><span>FITPILOT</span><div className="boot-line" /></main>;
  if (!profile) return <OnboardingFlow onComplete={(next) => { saveProfile(next); createPlan(); }} />;

  const content = view === "plan" ? <PlanView /> : view === "workout" ? <WorkoutRunner /> : view === "summary" ? <WorkoutSummary /> : view === "coach" ? <CoachPanel /> : <Dashboard />;
  return (
    <div className="app-frame">
      <header className="top-bar">
        <button className="brand-lockup" type="button" onClick={() => setView("dashboard")}><span className="brand-mark">FP</span><span>FITPILOT</span></button>
        <div className="top-modes"><span className="mode-chip ai">AI MODE</span><span className="mode-chip local">LOCAL FIRST</span></div>
      </header>
      <div className="product-shell">
        <nav className="product-nav" aria-label="产品导航">
          <button aria-current={view === "dashboard" ? "page" : undefined} className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}><span />训练台</button>
          <button aria-current={view === "plan" ? "page" : undefined} className={view === "plan" ? "active" : ""} onClick={() => setView("plan")}><span />计划</button>
          <button aria-current={view === "coach" ? "page" : undefined} className={view === "coach" ? "active" : ""} onClick={() => setView("coach")}><span />Agent</button>
          <small>LOCAL DATA<br />安全规则始终启用</small>
        </nav>
        <div className="product-content">{content}</div>
      </div>
    </div>
  );
}
