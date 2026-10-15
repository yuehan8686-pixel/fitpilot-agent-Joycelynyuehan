export type Sex = "female" | "male" | "other";
export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type WorkoutGoal = "build_muscle" | "lose_fat" | "general_fitness";
export type SafetyLevel = "normal" | "caution" | "stop";
export type Equipment =
  | "bodyweight"
  | "dumbbell"
  | "barbell"
  | "bench"
  | "cable"
  | "machine"
  | "cardio";

export interface UserProfile {
  id: string;
  name: string;
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  experience: ExperienceLevel;
  goal: WorkoutGoal;
  trainingDays: number;
  sessionMinutes: number;
  equipment: Equipment[];
  limitations: string[];
  injuries: string[];
  safetyAcknowledged: boolean;
}

export type ExerciseCategory =
  | "warmup"
  | "legs"
  | "glutes"
  | "push"
  | "pull"
  | "shoulders"
  | "arms"
  | "core";

export interface Exercise {
  id: string;
  name: string;
  shortName: string;
  category: ExerciseCategory;
  movementPattern: string;
  equipment: Equipment[];
  difficulty: ExperienceLevel;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  setup: string[];
  cues: string[];
  mistakes: string[];
  substitutionIds: string[];
  contraindications: string[];
  illustration: string;
  defaultWeightKg: number;
}

export interface PlannedExercise {
  exerciseId: string;
  sets: number;
  repMin: number;
  repMax: number;
  targetRpe: number;
  restSeconds: number;
  suggestedWeightKg: number;
}

export interface PlanSession {
  id: string;
  name: string;
  focus: string;
  estimatedMinutes: number;
  warmup: string[];
  exercises: PlannedExercise[];
}

export interface TrainingPlan {
  id: string;
  createdAt: string;
  title: string;
  summary: string;
  warning?: string;
  sessions: PlanSession[];
}

export interface SetLog {
  id: string;
  setIndex: number;
  weightKg: number;
  reps: number;
  completedAt: string;
}

export interface ExerciseFeedback {
  rpe: number;
  targetFeeling: number;
  painLevel: number;
  painArea?: string;
  compensation?: string;
  note?: string;
  emergencySymptoms: string[];
}

export interface WorkoutExercise {
  planned: PlannedExercise;
  setLogs: SetLog[];
  feedback?: ExerciseFeedback;
}

export interface WorkoutSession {
  id: string;
  planSessionId: string;
  sessionName: string;
  startedAt: string;
  finishedAt?: string;
  currentExerciseIndex: number;
  exercises: WorkoutExercise[];
  restEndsAt?: string;
  summary?: string;
}

export interface CoachSuggestedAction {
  type: "replace_exercise" | "reduce_load" | "stop_workout" | "none";
  reason: string;
  exerciseId?: string;
}

export interface CoachRequest {
  message: string;
  profile?: UserProfile;
  plan?: TrainingPlan;
  history?: WorkoutSession[];
  activeExerciseId?: string;
}

export interface CoachResponse {
  message: string;
  safetyLevel: SafetyLevel;
  suggestedActions: CoachSuggestedAction[];
}

export interface ProgressionInput {
  planned: PlannedExercise;
  sets: SetLog[];
  feedback: ExerciseFeedback;
  previousSuccessfulSessions: number;
}

export interface ProgressionDecision {
  nextWeightKg: number;
  nextSets: number;
  safetyLevel: SafetyLevel;
  explanation: string;
}
