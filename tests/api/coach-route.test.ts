import { describe, expect, it, vi } from "vitest";

import { POST } from "../../src/app/api/coach/route";
import { getCoachResponse } from "../../src/lib/openai-coach";
import type { CoachRequest, CoachResponse, UserProfile } from "../../src/domain/types";

const profile: UserProfile = {
  id: "coach-user",
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
};

const request: CoachRequest = {
  message: "今天应该练什么？",
  profile,
  history: [],
};

const aiResponse: CoachResponse = {
  message: "按计划完成今天的全身训练，主动作保持 RPE 7。",
  safetyLevel: "normal",
  suggestedActions: [],
};

describe("POST /api/coach", () => {
  it("returns 400 for invalid input", async () => {
    const response = await POST(
      new Request("http://localhost/api/coach", {
        method: "POST",
        body: JSON.stringify({ message: "" }),
      }),
    );

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: "INVALID_REQUEST" });
  });
});

describe("getCoachResponse", () => {
  it("uses the deterministic coach when no API key is configured", async () => {
    const complete = vi.fn();

    const response = await getCoachResponse(request, { apiKey: "", complete });

    expect(response.message).toContain("每周 3 次");
    expect(response.safetyLevel).toBe("normal");
    expect(complete).not.toHaveBeenCalled();
  });

  it("returns a valid structured OpenAI response", async () => {
    const complete = vi.fn().mockResolvedValue(aiResponse);

    const response = await getCoachResponse(request, { apiKey: "test-key", complete });

    expect(response).toEqual(aiResponse);
    expect(complete).toHaveBeenCalledWith(request, "test-key");
  });

  it("falls back after an upstream timeout", async () => {
    const complete = vi.fn().mockRejectedValue(new Error("Request timed out"));

    const response = await getCoachResponse(request, { apiKey: "test-key", complete });

    expect(response.message).toContain("每周 3 次");
    expect(response.safetyLevel).toBe("normal");
  });

  it("falls back when the structured output is malformed", async () => {
    const complete = vi.fn().mockResolvedValue({ message: "随便练", safetyLevel: "unknown" });

    const response = await getCoachResponse(request, { apiKey: "test-key", complete });

    expect(response.message).toContain("每周 3 次");
    expect(response.safetyLevel).toBe("normal");
  });

  it("rejects model actions that reference an unknown exercise", async () => {
    const complete = vi.fn().mockResolvedValue({
      ...aiResponse,
      suggestedActions: [
        { type: "replace_exercise", reason: "换一个动作", exerciseId: "invented-exercise" },
      ],
    });

    const response = await getCoachResponse(request, { apiKey: "test-key", complete });

    expect(response.message).toContain("每周 3 次");
    expect(response.suggestedActions).toEqual([]);
  });

  it.each([
    ["我的膝盖刺痛，还能继续深蹲吗？", "caution"],
    ["我胸痛并且呼吸困难", "stop"],
  ] as const)("preserves local safety for %s", async (message, safetyLevel) => {
    const complete = vi.fn().mockResolvedValue(aiResponse);

    const response = await getCoachResponse({ ...request, message }, { apiKey: "test-key", complete });

    expect(response.safetyLevel).toBe(safetyLevel);
    expect(response.message).toContain(safetyLevel === "stop" ? "立即停止" : "停止当前动作");
    expect(complete).not.toHaveBeenCalled();
  });
});
