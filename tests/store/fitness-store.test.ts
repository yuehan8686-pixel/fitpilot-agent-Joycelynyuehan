import { beforeEach, describe, expect, it } from "vitest";

import { generatePlan } from "../../src/domain/plan-engine";
import type { ExerciseFeedback, UserProfile } from "../../src/domain/types";
import {
  getRemainingRestSeconds,
  parsePersistedFitnessState,
  useFitnessStore,
} from "../../src/store/use-fitness-store";

const profile: UserProfile = {
  id: "store-user",
  name: "小驼",
  age: 28,
  sex: "female",
  heightCm: 168,
  weightKg: 58,
  experience: "beginner",
  goal: "build_muscle",
  trainingDays: 3,
  sessionMinutes: 50,
  equipment: ["bodyweight", "dumbbell", "machine", "cable"],
  limitations: [],
  injuries: [],
  safetyAcknowledged: true,
};

const feedback: ExerciseFeedback = {
  rpe: 7,
  targetFeeling: 4,
  painLevel: 0,
  emergencySymptoms: [],
};

beforeEach(() => {
  useFitnessStore.getState().resetAll();
});

describe("fitness store", () => {
  it("recovers from corrupt persisted state", () => {
    expect(parsePersistedFitnessState({ profile: "broken", activePlan: 42 })).toEqual({});
  });

  it("rejects a corrupt active workout even when the profile is valid", () => {
    expect(
      parsePersistedFitnessState({
        profile,
        activeWorkout: { id: "broken", exercises: null },
        view: "workout",
      }),
    ).toEqual({});
  });

  it("rejects corrupt workout history instead of hydrating unsafe data", () => {
    expect(
      parsePersistedFitnessState({
        profile,
        workoutHistory: [{ sessionName: "missing required fields" }],
      }),
    ).toEqual({});
  });

  it("recovers to the dashboard when a persisted workout view has no active workout", () => {
    const persisted = parsePersistedFitnessState({
      profile,
      activeWorkout: null,
      workoutHistory: [],
      view: "workout",
    });

    expect(persisted.view).toBe("dashboard");
  });

  it("starts a planned workout and logs a completed set", () => {
    const plan = generatePlan(profile);
    useFitnessStore.getState().saveProfile(profile);
    useFitnessStore.getState().createPlan();
    useFitnessStore.getState().startWorkout(plan.sessions[0].id, "2026-10-15T10:00:00.000Z");

    const active = useFitnessStore.getState().activeWorkout;
    expect(active?.sessionName).toBe(plan.sessions[0].name);

    useFitnessStore.getState().completeSet(10, 12, "2026-10-15T10:01:00.000Z");
    const updated = useFitnessStore.getState().activeWorkout;
    expect(updated?.exercises[0].setLogs).toHaveLength(1);
    expect(updated?.exercises[0].setLogs[0].weightKg).toBe(10);
  });

  it("returns to the previous surface without discarding an active workout", () => {
    useFitnessStore.getState().saveProfile(profile);
    useFitnessStore.getState().createPlan();
    const plan = useFitnessStore.getState().activePlan!;
    useFitnessStore.getState().startWorkout(plan.sessions[0].id, "2026-10-15T10:00:00.000Z");
    useFitnessStore.getState().completeSet(10, 12, "2026-10-15T10:01:00.000Z");

    const activeWorkoutId = useFitnessStore.getState().activeWorkout!.id;
    useFitnessStore.getState().goBack();

    expect(useFitnessStore.getState().view).toBe("plan");
    expect(useFitnessStore.getState().activeWorkout?.id).toBe(activeWorkoutId);
    expect(useFitnessStore.getState().activeWorkout?.exercises[0].setLogs).toHaveLength(1);
  });

  it("opens the main menu while keeping an active workout available to resume", () => {
    useFitnessStore.getState().saveProfile(profile);
    useFitnessStore.getState().createPlan();
    const plan = useFitnessStore.getState().activePlan!;
    useFitnessStore.getState().startWorkout(plan.sessions[0].id, "2026-10-15T10:00:00.000Z");

    useFitnessStore.getState().goHome();

    expect(useFitnessStore.getState().view).toBe("dashboard");
    expect(useFitnessStore.getState().activeWorkout?.sessionName).toBe(plan.sessions[0].name);
  });

  it("returns from a completed summary to the plan instead of an empty workout", () => {
    useFitnessStore.getState().saveProfile(profile);
    useFitnessStore.getState().createPlan();
    const plan = useFitnessStore.getState().activePlan!;
    useFitnessStore.getState().startWorkout(plan.sessions[0].id, "2026-10-15T10:00:00.000Z");
    useFitnessStore.getState().finishWorkout("2026-10-15T10:30:00.000Z");

    useFitnessStore.getState().goBack();

    expect(useFitnessStore.getState().view).toBe("plan");
    expect(useFitnessStore.getState().activeWorkout).toBeNull();
  });

  it("uses a safe contextual fallback when navigation history is unavailable", () => {
    useFitnessStore.getState().saveProfile(profile);
    useFitnessStore.getState().createPlan();
    const plan = useFitnessStore.getState().activePlan!;
    useFitnessStore.getState().startWorkout(plan.sessions[0].id, "2026-10-15T10:00:00.000Z");
    useFitnessStore.setState({ previousView: null });

    useFitnessStore.getState().goBack();

    expect(useFitnessStore.getState().view).toBe("plan");
  });

  it("restores remaining rest from an absolute end timestamp", () => {
    expect(
      getRemainingRestSeconds("2026-10-15T10:02:30.000Z", new Date("2026-10-15T10:01:00.000Z").getTime()),
    ).toBe(90);
  });

  it("submits feedback, replaces an exercise, and finishes the session", () => {
    useFitnessStore.getState().saveProfile(profile);
    useFitnessStore.getState().createPlan();
    const plan = useFitnessStore.getState().activePlan!;
    useFitnessStore.getState().startWorkout(plan.sessions[0].id, "2026-10-15T10:00:00.000Z");

    const original = useFitnessStore.getState().activeWorkout!.exercises[0].planned.exerciseId;
    useFitnessStore.getState().replaceExercise(original);
    expect(useFitnessStore.getState().activeWorkout!.exercises[0].planned.exerciseId).not.toBe(original);

    useFitnessStore.getState().submitFeedback(feedback);
    useFitnessStore.getState().finishWorkout("2026-10-15T10:45:00.000Z");

    expect(useFitnessStore.getState().activeWorkout).toBeNull();
    expect(useFitnessStore.getState().workoutHistory).toHaveLength(1);
    expect(useFitnessStore.getState().workoutHistory[0].finishedAt).toBe("2026-10-15T10:45:00.000Z");
  });

  it("applies an agent load suggestion to the matching planned exercise", () => {
    useFitnessStore.getState().saveProfile(profile);
    useFitnessStore.getState().createPlan();
    const exercise = useFitnessStore.getState().activePlan!.sessions[0].exercises[0];

    useFitnessStore.getState().applyLoadSuggestion(exercise.exerciseId, 9);

    const updated = useFitnessStore.getState().activePlan!.sessions[0].exercises[0];
    expect(updated.suggestedWeightKg).toBe(9);
  });

  it("clears profile, plan, active workout, and history", () => {
    useFitnessStore.getState().saveProfile(profile);
    useFitnessStore.getState().createPlan();
    useFitnessStore.getState().resetAll();

    const state = useFitnessStore.getState();
    expect(state.profile).toBeNull();
    expect(state.activePlan).toBeNull();
    expect(state.activeWorkout).toBeNull();
    expect(state.workoutHistory).toEqual([]);
  });
});
