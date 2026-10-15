import { describe, expect, it } from "vitest";

import { EXERCISES, getExercise } from "../../src/domain/exercises";
import { findSubstitute, generatePlan } from "../../src/domain/plan-engine";
import type { UserProfile } from "../../src/domain/types";

const profile: UserProfile = {
  id: "plan-user",
  name: "小驼",
  age: 28,
  sex: "female",
  heightCm: 168,
  weightKg: 58,
  experience: "beginner",
  goal: "build_muscle",
  trainingDays: 3,
  sessionMinutes: 50,
  equipment: ["bodyweight", "dumbbell", "bench", "cable", "machine", "cardio"],
  limitations: [],
  injuries: [],
  safetyAcknowledged: true,
};

describe("exercise catalogue", () => {
  it("contains at least 24 exercises with unique stable IDs", () => {
    const ids = EXERCISES.map((exercise) => exercise.id);

    expect(EXERCISES.length).toBeGreaterThanOrEqual(24);
    expect(new Set(ids).size).toBe(ids.length);
    expect(EXERCISES.every((exercise) => exercise.cues.length > 0)).toBe(true);
  });
});

describe("generatePlan", () => {
  it.each([2, 3, 4, 5])("creates %i compatible sessions within the time cap", (trainingDays) => {
    const plan = generatePlan({ ...profile, trainingDays });

    expect(plan.sessions).toHaveLength(trainingDays);
    expect(plan.sessions.every((session) => session.estimatedMinutes <= profile.sessionMinutes)).toBe(true);
    for (const item of plan.sessions.flatMap((session) => session.exercises)) {
      const exercise = getExercise(item.exerciseId);
      expect(exercise).toBeDefined();
      expect(exercise!.equipment.some((equipment) => profile.equipment.includes(equipment))).toBe(true);
    }
  });

  it("removes exercises contraindicated by the user's knee injury", () => {
    const plan = generatePlan({ ...profile, injuries: ["膝盖"] });
    const selected = plan.sessions.flatMap((session) => session.exercises);

    expect(selected.length).toBeGreaterThan(0);
    expect(
      selected.every((item) => !getExercise(item.exerciseId)!.contraindications.includes("膝盖")),
    ).toBe(true);
  });

  it("does not prescribe bench-dependent exercises when no bench is available", () => {
    const plan = generatePlan({
      ...profile,
      equipment: ["bodyweight", "dumbbell"],
    });
    const selectedIds = plan.sessions.flatMap((session) =>
      session.exercises.map((exercise) => exercise.exerciseId),
    );

    expect(selectedIds).not.toContain("dumbbell-bench-press");
    expect(selectedIds).not.toContain("incline-dumbbell-press");
    expect(selectedIds).not.toContain("incline-push-up");
  });

  it("changes repetition and rest targets for a fat-loss goal", () => {
    const musclePlan = generatePlan({ ...profile, goal: "build_muscle" });
    const fatLossPlan = generatePlan({ ...profile, goal: "lose_fat" });
    const muscleExercise = musclePlan.sessions[0].exercises[0];
    const fatLossExercise = fatLossPlan.sessions[0].exercises[0];

    expect(fatLossExercise.repMin).toBeGreaterThan(muscleExercise.repMin);
    expect(fatLossExercise.restSeconds).toBeLessThan(muscleExercise.restSeconds);
  });

  it("returns a recoverable warning when no strength exercise is compatible", () => {
    const plan = generatePlan({
      ...profile,
      equipment: ["cardio"],
      limitations: ["仅可使用跑步机"],
    });

    expect(plan.warning).toContain("没有找到");
    expect(plan.sessions.every((session) => session.exercises.length === 0)).toBe(true);
  });
});

describe("findSubstitute", () => {
  it("returns a compatible exercise in the same movement pattern", () => {
    const replacement = findSubstitute("dumbbell-goblet-squat", profile, ["machine-leg-press"]);

    expect(replacement).toBeDefined();
    expect(replacement!.id).not.toBe("dumbbell-goblet-squat");
    expect(replacement!.id).not.toBe("machine-leg-press");
    expect(replacement!.movementPattern).toBe("squat");
  });
});
