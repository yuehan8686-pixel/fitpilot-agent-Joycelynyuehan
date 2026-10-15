import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

import { localCoachReply } from "../domain/coach";
import { getExercise } from "../domain/exercises";
import { coachResponseSchema } from "../domain/schemas";
import type { CoachRequest, CoachResponse } from "../domain/types";

const structuredCoachResponseSchema = z.object({
  message: z.string().min(1),
  safetyLevel: z.enum(["normal", "caution", "stop"]),
  suggestedActions: z.array(
    z.object({
      type: z.enum(["replace_exercise", "reduce_load", "stop_workout", "none"]),
      reason: z.string(),
      exerciseId: z.string().nullable(),
    }),
  ),
});

type StructuredCoachResponse = z.infer<typeof structuredCoachResponseSchema>;
type CompleteCoachRequest = (request: CoachRequest, apiKey: string) => Promise<unknown>;

interface CoachOptions {
  apiKey?: string;
  complete?: CompleteCoachRequest;
}

function compactContext(request: CoachRequest) {
  return {
    question: request.message,
    profile: request.profile
      ? {
          age: request.profile.age,
          experience: request.profile.experience,
          goal: request.profile.goal,
          trainingDays: request.profile.trainingDays,
          sessionMinutes: request.profile.sessionMinutes,
          equipment: request.profile.equipment,
          limitations: request.profile.limitations,
          injuries: request.profile.injuries,
        }
      : null,
    plan: request.plan
      ? {
          title: request.plan.title,
          sessions: request.plan.sessions.map((session) => ({
            name: session.name,
            focus: session.focus,
            exerciseIds: session.exercises.map((exercise) => exercise.exerciseId),
          })),
        }
      : null,
    recentWorkouts: (request.history ?? []).slice(-3).map((workout) => ({
      sessionName: workout.sessionName,
      startedAt: workout.startedAt,
      finishedAt: workout.finishedAt ?? null,
      summary: workout.summary ?? null,
    })),
    activeExerciseId: request.activeExerciseId ?? null,
  };
}

async function completeWithOpenAI(request: CoachRequest, apiKey: string): Promise<CoachResponse> {
  const client = new OpenAI({ apiKey, maxRetries: 0, timeout: 12_000 });
  const response = await client.responses.parse({
    model: process.env.OPENAI_MODEL || "gpt-4o-mini",
    instructions:
      "你是谨慎、简洁的中文健身私教。仅提供一般训练建议，不做医学诊断。疼痛时建议停止当前动作；胸痛、呼吸困难、眩晕或晕厥时必须停止训练并建议寻求专业帮助。不要建议突破疼痛训练。回答控制在 120 个汉字左右。",
    input: JSON.stringify(compactContext(request)),
    text: {
      format: zodTextFormat(structuredCoachResponseSchema, "fitness_coach_response"),
    },
  });

  if (!response.output_parsed) {
    throw new Error("OpenAI returned no structured coach response");
  }

  const parsed = response.output_parsed as StructuredCoachResponse;
  return {
    message: parsed.message,
    safetyLevel: parsed.safetyLevel,
    suggestedActions: parsed.suggestedActions.map((action) => ({
      type: action.type,
      reason: action.reason,
      ...(action.exerciseId ? { exerciseId: action.exerciseId } : {}),
    })),
  };
}

export async function getCoachResponse(
  request: CoachRequest,
  options: CoachOptions = {},
): Promise<CoachResponse> {
  const fallback = localCoachReply(request);

  // Safety-critical phrases always use deterministic local rules, even when AI is enabled.
  if (fallback.safetyLevel !== "normal") return fallback;

  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY ?? "";
  if (!apiKey) return fallback;

  try {
    const result = await (options.complete ?? completeWithOpenAI)(request, apiKey);
    const parsed = coachResponseSchema.safeParse(result);
    if (!parsed.success) return fallback;
    const knownExercises = parsed.data.suggestedActions.every(
      (action) => !action.exerciseId || Boolean(getExercise(action.exerciseId)),
    );
    return knownExercises ? parsed.data : fallback;
  } catch {
    return fallback;
  }
}
