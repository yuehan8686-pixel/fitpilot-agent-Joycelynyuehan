import { describe, expect, it } from "vitest";

import { coachResponseSchema, userProfileSchema } from "../../src/domain/schemas";

const validProfile = {
  id: "demo-user",
  name: "小驼",
  age: 28,
  sex: "female",
  heightCm: 168,
  weightKg: 58,
  experience: "beginner",
  goal: "build_muscle",
  trainingDays: 3,
  sessionMinutes: 50,
  equipment: ["bodyweight", "dumbbell", "machine"],
  limitations: [],
  injuries: [],
  safetyAcknowledged: true,
} as const;

describe("userProfileSchema", () => {
  it("accepts a complete fitness profile", () => {
    expect(userProfileSchema.parse(validProfile)).toEqual(validProfile);
  });

  it.each([1, 6])("rejects %i training days per week", (trainingDays) => {
    expect(() => userProfileSchema.parse({ ...validProfile, trainingDays })).toThrow();
  });
});

describe("coachResponseSchema", () => {
  it.each(["normal", "caution", "stop"] as const)(
    "accepts the %s safety level",
    (safetyLevel) => {
      const response = {
        message: "已根据本次状态给出建议。",
        safetyLevel,
        suggestedActions: [],
      };

      expect(coachResponseSchema.parse(response)).toEqual(response);
    },
  );

  it("rejects an unknown safety level", () => {
    expect(() =>
      coachResponseSchema.parse({
        message: "test",
        safetyLevel: "urgent",
        suggestedActions: [],
      }),
    ).toThrow();
  });
});
