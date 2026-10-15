import { getExercise } from "./exercises";
import type { CoachRequest, CoachResponse } from "./types";

const emergencyWords = ["胸痛", "胸闷", "眩晕", "晕倒", "呼吸困难", "心悸"];
const painWords = ["疼", "痛", "扭伤", "刺痛"];

export function localCoachReply(request: CoachRequest): CoachResponse {
  const emergency = emergencyWords.some((word) => request.message.includes(word));
  if (emergency) {
    return {
      message: "请立即停止训练。若症状持续或严重，请尽快联系医疗专业人员或当地急救服务。",
      safetyLevel: "stop",
      suggestedActions: [{ type: "stop_workout", reason: "出现运动警告症状" }],
    };
  }

  const pain = painWords.some((word) => request.message.includes(word));
  if (pain) {
    return {
      message: "疼痛不是正常训练强度。先停止当前动作，不要继续加重；记录疼痛部位后再选择无痛替代动作。",
      safetyLevel: "caution",
      suggestedActions: [{ type: "replace_exercise", reason: "用户报告疼痛" }],
    };
  }

  if (!request.profile) {
    return {
      message: "先完成训练档案，我才能根据时间、器械和身体限制给出可靠建议。",
      safetyLevel: "caution",
      suggestedActions: [{ type: "none", reason: "缺少训练档案" }],
    };
  }

  const activeExercise = request.activeExerciseId
    ? getExercise(request.activeExerciseId)
    : undefined;
  if (activeExercise) {
    return {
      message: `${activeExercise.name}：${activeExercise.cues.join("；")}。如果动作幅度内出现疼痛，请停止。`,
      safetyLevel: "normal",
      suggestedActions: [],
    };
  }

  return {
    message: `按你每周 ${request.profile.trainingDays} 次的安排，今天先完成计划动作并如实记录 RPE。稳定完成比临时加量更重要。`,
    safetyLevel: "normal",
    suggestedActions: [],
  };
}
