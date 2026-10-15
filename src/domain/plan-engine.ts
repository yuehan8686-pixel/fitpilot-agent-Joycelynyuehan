import { EXERCISES, getExercise } from "./exercises";
import type {
  Exercise,
  ExerciseCategory,
  PlanSession,
  PlannedExercise,
  TrainingPlan,
  UserProfile,
} from "./types";

const difficultyRank = { beginner: 0, intermediate: 1, advanced: 2 } as const;

const scheduleTemplates: Record<number, Array<{ name: string; focus: string; categories: ExerciseCategory[] }>> = {
  2: [
    { name: "全身 A", focus: "蹲、推、拉", categories: ["legs", "push", "pull", "glutes", "core"] },
    { name: "全身 B", focus: "髋、肩、背", categories: ["glutes", "shoulders", "pull", "legs", "core"] },
  ],
  3: [
    { name: "全身 A", focus: "腿与水平推拉", categories: ["legs", "push", "pull", "glutes", "core"] },
    { name: "全身 B", focus: "臀与垂直推拉", categories: ["glutes", "shoulders", "pull", "legs", "arms"] },
    { name: "全身 C", focus: "动作巩固", categories: ["legs", "push", "pull", "shoulders", "core"] },
  ],
  4: [
    { name: "上肢 A", focus: "胸、背、肩", categories: ["push", "pull", "shoulders", "arms"] },
    { name: "下肢 A", focus: "腿、臀、核心", categories: ["legs", "glutes", "core"] },
    { name: "上肢 B", focus: "背、肩、手臂", categories: ["pull", "shoulders", "push", "arms"] },
    { name: "下肢 B", focus: "臀、腿、稳定", categories: ["glutes", "legs", "core"] },
  ],
  5: [
    { name: "推", focus: "胸、肩、肱三头", categories: ["push", "shoulders", "arms"] },
    { name: "拉", focus: "背、肱二头", categories: ["pull", "arms", "core"] },
    { name: "腿", focus: "腿、臀", categories: ["legs", "glutes", "core"] },
    { name: "上肢", focus: "上肢动作巩固", categories: ["push", "pull", "shoulders", "arms"] },
    { name: "全身", focus: "轻量全身", categories: ["legs", "push", "pull", "glutes", "core"] },
  ],
};

function matchesInjury(exercise: Exercise, profile: UserProfile): boolean {
  return profile.injuries.some((injury) =>
    exercise.contraindications.some(
      (item) => injury.includes(item) || item.includes(injury),
    ),
  );
}

function isCompatible(exercise: Exercise, profile: UserProfile): boolean {
  return (
    exercise.category !== "warmup" &&
    difficultyRank[exercise.difficulty] <= difficultyRank[profile.experience] &&
    exercise.equipment.some((equipment) => profile.equipment.includes(equipment)) &&
    !matchesInjury(exercise, profile)
  );
}

function planned(exercise: Exercise, profile: UserProfile): PlannedExercise {
  const beginner = profile.experience === "beginner";
  return {
    exerciseId: exercise.id,
    sets: beginner ? 2 : 3,
    repMin: exercise.category === "core" ? 8 : 8,
    repMax: exercise.category === "core" ? 12 : 12,
    targetRpe: beginner ? 7 : 8,
    restSeconds: ["legs", "glutes", "push", "pull"].includes(exercise.category) ? 90 : 60,
    suggestedWeightKg: exercise.defaultWeightKg,
  };
}

function buildSession(
  index: number,
  template: { name: string; focus: string; categories: ExerciseCategory[] },
  pool: Exercise[],
  profile: UserProfile,
): PlanSession {
  const maxExercises = Math.min(6, Math.max(1, Math.floor((profile.sessionMinutes - 8) / 7)));
  const selected: Exercise[] = [];

  for (let offset = 0; offset < template.categories.length && selected.length < maxExercises; offset += 1) {
    const category = template.categories[offset];
    const candidates = pool.filter(
      (exercise) => exercise.category === category && !selected.some((item) => item.id === exercise.id),
    );
    if (candidates.length > 0) {
      selected.push(candidates[index % candidates.length]);
    }
  }

  return {
    id: `session-${index + 1}`,
    name: template.name,
    focus: template.focus,
    estimatedMinutes: Math.min(profile.sessionMinutes, 8 + selected.length * 7),
    warmup: ["3–5 分钟低强度热身", "为第一个动作做 1–2 组轻重量准备组"],
    exercises: selected.map((exercise) => planned(exercise, profile)),
  };
}

export function generatePlan(profile: UserProfile): TrainingPlan {
  const templates = scheduleTemplates[profile.trainingDays] ?? scheduleTemplates[3];
  const pool = EXERCISES.filter((exercise) => isCompatible(exercise, profile));
  const sessions = templates.map((template, index) => buildSession(index, template, pool, profile));
  const noExercises = sessions.every((session) => session.exercises.length === 0);

  return {
    id: `plan-${profile.id}`,
    createdAt: new Date().toISOString(),
    title: `${profile.trainingDays} 日训练计划`,
    summary: noExercises
      ? "需要补充器械或调整限制后再生成力量训练。"
      : `按每周 ${profile.trainingDays} 次、每次约 ${profile.sessionMinutes} 分钟安排。`,
    warning: noExercises ? "没有找到同时满足器械与身体限制的力量动作，请调整条件或咨询专业教练。" : undefined,
    sessions,
  };
}

export function findSubstitute(
  exerciseId: string,
  profile: UserProfile,
  excludedIds: string[] = [],
): Exercise | undefined {
  const source = getExercise(exerciseId);
  if (!source) return undefined;

  return EXERCISES.find(
    (candidate) =>
      candidate.id !== exerciseId &&
      !excludedIds.includes(candidate.id) &&
      candidate.movementPattern === source.movementPattern &&
      isCompatible(candidate, profile),
  );
}
