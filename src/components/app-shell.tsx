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
  const hideNav = view === "workout" || view === "summary";
  return <div className="app-frame"><header className="top-bar"><button className="brand-lockup" type="button" onClick={() => setView("dashboard")}><span className="brand-mark">FP</span><span>FITPILOT</span></button><span className="mode-badge">LOCAL FIRST</span></header>{content}{!hideNav && <nav className="bottom-nav" aria-label="主导航"><button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>训练台</button><button className={view === "plan" ? "active" : ""} onClick={() => setView("plan")}>计划</button><button className={view === "coach" ? "active" : ""} onClick={() => setView("coach")}>Agent</button></nav>}</div>;
}
