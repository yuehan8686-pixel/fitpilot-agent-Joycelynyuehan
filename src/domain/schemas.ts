import { z } from "zod";

export const equipmentSchema = z.enum([
  "bodyweight",
  "dumbbell",
  "barbell",
  "bench",
  "cable",
  "machine",
  "cardio",
]);

export const userProfileSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(24),
  age: z.number().int().min(18).max(90),
  sex: z.enum(["female", "male", "other"]),
  heightCm: z.number().min(120).max(230),
  weightKg: z.number().min(30).max(300),
  experience: z.enum(["beginner", "intermediate", "advanced"]),
  goal: z.enum(["build_muscle", "lose_fat", "general_fitness"]),
  trainingDays: z.number().int().min(2).max(5),
  sessionMinutes: z.number().int().min(20).max(120),
  equipment: z.array(equipmentSchema).min(1),
  limitations: z.array(z.string()),
  injuries: z.array(z.string()),
  safetyAcknowledged: z.literal(true),
});

const plannedExerciseSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.number().int().min(1).max(8),
  repMin: z.number().int().min(1).max(100),
  repMax: z.number().int().min(1).max(100),
  targetRpe: z.number().min(1).max(10),
  restSeconds: z.number().int().min(15).max(600),
  suggestedWeightKg: z.number().min(0).max(1000),
});

const planSessionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  focus: z.string().min(1),
  estimatedMinutes: z.number().int().positive(),
  warmup: z.array(z.string()),
  exercises: z.array(plannedExerciseSchema),
});

export const trainingPlanSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().datetime(),
  title: z.string().min(1),
  summary: z.string().min(1),
  warning: z.string().optional(),
  sessions: z.array(planSessionSchema).min(1).max(5),
});

export const coachSuggestedActionSchema = z.object({
  type: z.enum(["replace_exercise", "reduce_load", "stop_workout", "none"]),
  reason: z.string(),
  exerciseId: z.string().optional(),
});

export const coachResponseSchema = z.object({
  message: z.string().min(1),
  safetyLevel: z.enum(["normal", "caution", "stop"]),
  suggestedActions: z.array(coachSuggestedActionSchema),
});

export const coachRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  profile: userProfileSchema.optional(),
  plan: trainingPlanSchema.optional(),
  history: z.array(z.unknown()).max(20).optional(),
  activeExerciseId: z.string().optional(),
});
