import { describe, expect, it } from "vitest";

import { evaluateFeedback, nextTarget } from "../../src/domain/progression";
import type { ExerciseFeedback, ProgressionInput } from "../../src/domain/types";

const planned = {
  exerciseId: "dumbbell-goblet-squat",
  sets: 2,
  repMin: 8,
  repMax: 12,
  targetRpe: 7,
  restSeconds: 90,
  suggestedWeightKg: 10,
};

const feedback: ExerciseFeedback = {
  rpe: 7,
  targetFeeling: 4,
  painLevel: 0,
  emergencySymptoms: [],
};

function input(overrides: Partial<ProgressionInput> = {}): ProgressionInput {
  return {
    planned,
    sets: [
      { id: "s1", setIndex: 0, weightKg: 10, reps: 12, completedAt: "2026-10-15T10:00:00.000Z" },
      { id: "s2", setIndex: 1, weightKg: 10, reps: 12, completedAt: "2026-10-15T10:02:00.000Z" },
    ],
    feedback,
    previousSuccessfulSessions: 1,
    ...overrides,
  };
}

describe("evaluateFeedback", () => {
  it("stops training for emergency symptoms", () => {
    expect(evaluateFeedback({ ...feedback, emergencySymptoms: ["胸部不适"] })).toBe("stop");
  });

  it("treats joint pain as at least caution", () => {
    expect(evaluateFeedback({ ...feedback, painLevel: 2, painArea: "膝盖" })).toBe("caution");
  });
});

describe("nextTarget", () => {
  it("adds a small load after repeated complete low-RPE work", () => {
    const decision = nextTarget(input());

    expect(decision.nextWeightKg).toBe(11);
    expect(decision.safetyLevel).toBe("normal");
  });

  it("reduces load after RPE 9", () => {
    const decision = nextTarget(input({ feedback: { ...feedback, rpe: 9 } }));

    expect(decision.nextWeightKg).toBeLessThan(10);
    expect(decision.explanation).toContain("RPE");
  });

  it("reduces load after missed minimum repetitions", () => {
    const decision = nextTarget(
      input({
        sets: [{ id: "s1", setIndex: 0, weightKg: 10, reps: 6, completedAt: "2026-10-15T10:00:00.000Z" }],
      }),
    );

    expect(decision.nextWeightKg).toBeLessThan(10);
  });

  it("never increases load when pain is reported", () => {
    const decision = nextTarget(input({ feedback: { ...feedback, painLevel: 4, painArea: "膝盖" } }));

    expect(decision.nextWeightKg).toBeLessThanOrEqual(10);
    expect(decision.safetyLevel).toBe("stop");
  });
});
