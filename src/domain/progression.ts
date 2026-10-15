import type {
  ExerciseFeedback,
  ProgressionDecision,
  ProgressionInput,
  SafetyLevel,
} from "./types";

export function evaluateFeedback(feedback: ExerciseFeedback): SafetyLevel {
  if (feedback.emergencySymptoms.length > 0 || feedback.painLevel >= 4) return "stop";
  if (feedback.painLevel > 0 || feedback.rpe >= 9) return "caution";
  return "normal";
}

function roundToHalf(value: number): number {
  return Math.max(0, Math.round(value * 2) / 2);
}

export function nextTarget(input: ProgressionInput): ProgressionDecision {
  const safetyLevel = evaluateFeedback(input.feedback);
  const currentWeight = input.sets.at(-1)?.weightKg ?? input.planned.suggestedWeightKg;

  if (safetyLevel === "stop") {
    return {
      nextWeightKg: input.feedback.emergencySymptoms.length > 0 ? 0 : roundToHalf(currentWeight * 0.9),
      nextSets: Math.max(1, input.planned.sets - 1),
      safetyLevel,
      explanation: "检测到疼痛或警告症状，停止加重并结束相关动作。",
    };
  }

  const missedMinimum = input.sets.some((set) => set.reps < input.planned.repMin);
  if (input.feedback.rpe >= 9 || missedMinimum) {
    return {
      nextWeightKg: roundToHalf(currentWeight * 0.95),
      nextSets: input.planned.sets,
      safetyLevel: "caution",
      explanation: input.feedback.rpe >= 9
        ? "本次 RPE 较高，下次小幅减重并优先保证动作质量。"
        : "本次未达到最低次数，下次小幅减重。",
    };
  }

  const completedTarget =
    input.sets.length >= input.planned.sets &&
    input.sets.every((set) => set.reps >= input.planned.repMax);
  if (
    completedTarget &&
    input.feedback.rpe <= 7 &&
    input.previousSuccessfulSessions >= 1
  ) {
    const increment = currentWeight >= 20 ? 2.5 : 1;
    return {
      nextWeightKg: roundToHalf(currentWeight + increment),
      nextSets: input.planned.sets,
      safetyLevel: "normal",
      explanation: "连续完成目标次数且余力充足，下次小幅加重。",
    };
  }

  return {
    nextWeightKg: currentWeight,
    nextSets: input.planned.sets,
    safetyLevel,
    explanation: "当前负荷与动作质量匹配，下次保持。",
  };
}
