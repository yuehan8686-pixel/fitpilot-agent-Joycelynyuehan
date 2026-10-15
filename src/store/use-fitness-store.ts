import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import { getExercise } from "../domain/exercises";
import { findSubstitute, generatePlan } from "../domain/plan-engine";
import { trainingPlanSchema, userProfileSchema } from "../domain/schemas";
import type {
  ExerciseFeedback,
  TrainingPlan,
  UserProfile,
  WorkoutSession,
} from "../domain/types";

export type AppView = "onboarding" | "dashboard" | "plan" | "workout" | "summary" | "coach";

type PersistedFitnessState = {
  profile?: UserProfile | null;
  activePlan?: TrainingPlan | null;
  activeWorkout?: WorkoutSession | null;
  workoutHistory?: WorkoutSession[];
  view?: AppView;
};

type FitnessState = {
  profile: UserProfile | null;
  activePlan: TrainingPlan | null;
  activeWorkout: WorkoutSession | null;
  workoutHistory: WorkoutSession[];
  view: AppView;
  setView: (view: AppView) => void;
  saveProfile: (profile: UserProfile) => void;
  createPlan: () => void;
  startWorkout: (planSessionId: string, startedAt?: string) => void;
  completeSet: (weightKg: number, reps: number, completedAt?: string) => void;
  submitFeedback: (feedback: ExerciseFeedback) => void;
  replaceExercise: (exerciseId: string) => void;
  finishWorkout: (finishedAt?: string) => void;
  resetAll: () => void;
};

const emptyState = {
  profile: null,
  activePlan: null,
  activeWorkout: null,
  workoutHistory: [],
  view: "onboarding" as AppView,
};

const memoryStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

function id(prefix: string): string {
  const random = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${prefix}-${random}`;
}

export function parsePersistedFitnessState(input: unknown): PersistedFitnessState {
  if (!input || typeof input !== "object") return {};
  const value = input as Record<string, unknown>;
  const parsed: PersistedFitnessState = {};

  if (value.profile !== undefined && value.profile !== null) {
    const profile = userProfileSchema.safeParse(value.profile);
    if (!profile.success) return {};
    parsed.profile = profile.data;
  }
  if (value.activePlan !== undefined && value.activePlan !== null) {
    const plan = trainingPlanSchema.safeParse(value.activePlan);
    if (!plan.success) return {};
    parsed.activePlan = plan.data;
  }
  if (Array.isArray(value.workoutHistory)) parsed.workoutHistory = value.workoutHistory as WorkoutSession[];
  if (value.activeWorkout === null || typeof value.activeWorkout === "object") {
    parsed.activeWorkout = value.activeWorkout as WorkoutSession | null;
  }
  if (["onboarding", "dashboard", "plan", "workout", "summary", "coach"].includes(String(value.view))) {
    parsed.view = value.view as AppView;
  }
  return parsed;
}

export function getRemainingRestSeconds(restEndsAt?: string, now = Date.now()): number {
  if (!restEndsAt) return 0;
  return Math.max(0, Math.ceil((new Date(restEndsAt).getTime() - now) / 1000));
}

export const useFitnessStore = create<FitnessState>()(
  persist(
    (set, get) => ({
      ...emptyState,
      setView: (view) => set({ view }),
      saveProfile: (profile) => set({ profile, view: "dashboard" }),
      createPlan: () => {
        const profile = get().profile;
        if (!profile) return;
        set({ activePlan: generatePlan(profile), view: "plan" });
      },
      startWorkout: (planSessionId, startedAt = new Date().toISOString()) => {
        const plan = get().activePlan;
        const session = plan?.sessions.find((item) => item.id === planSessionId);
        if (!session) return;
        set({
          activeWorkout: {
            id: id("workout"),
            planSessionId,
            sessionName: session.name,
            startedAt,
            currentExerciseIndex: 0,
            exercises: session.exercises.map((planned) => ({ planned, setLogs: [] })),
          },
          view: "workout",
        });
      },
      completeSet: (weightKg, reps, completedAt = new Date().toISOString()) => {
        const workout = get().activeWorkout;
        if (!workout) return;
        const exercises = workout.exercises.map((exercise, index) => {
          if (index !== workout.currentExerciseIndex) return exercise;
          return {
            ...exercise,
            setLogs: [
              ...exercise.setLogs,
              {
                id: id("set"),
                setIndex: exercise.setLogs.length,
                weightKg,
                reps,
                completedAt,
              },
            ],
          };
        });
        const restSeconds = exercises[workout.currentExerciseIndex].planned.restSeconds;
        const restEndsAt = new Date(new Date(completedAt).getTime() + restSeconds * 1000).toISOString();
        set({ activeWorkout: { ...workout, exercises, restEndsAt } });
      },
      submitFeedback: (feedback) => {
        const workout = get().activeWorkout;
        if (!workout) return;
        const exercises = workout.exercises.map((exercise, index) =>
          index === workout.currentExerciseIndex ? { ...exercise, feedback } : exercise,
        );
        set({
          activeWorkout: {
            ...workout,
            exercises,
            restEndsAt: undefined,
            currentExerciseIndex: Math.min(workout.currentExerciseIndex + 1, exercises.length - 1),
          },
        });
      },
      replaceExercise: (exerciseId) => {
        const { profile, activeWorkout } = get();
        if (!profile || !activeWorkout) return;
        const excluded = activeWorkout.exercises.map((exercise) => exercise.planned.exerciseId);
        const replacement = findSubstitute(exerciseId, profile, excluded);
        if (!replacement) return;
        const exercises = activeWorkout.exercises.map((exercise, index) =>
          index === activeWorkout.currentExerciseIndex
            ? {
                planned: {
                  ...exercise.planned,
                  exerciseId: replacement.id,
                  suggestedWeightKg: replacement.defaultWeightKg,
                },
                setLogs: [],
              }
            : exercise,
        );
        set({ activeWorkout: { ...activeWorkout, exercises } });
      },
      finishWorkout: (finishedAt = new Date().toISOString()) => {
        const workout = get().activeWorkout;
        if (!workout) return;
        const completedSets = workout.exercises.reduce((sum, exercise) => sum + exercise.setLogs.length, 0);
        const completed: WorkoutSession = {
          ...workout,
          finishedAt,
          restEndsAt: undefined,
          summary: `完成 ${completedSets} 组训练。已记录本次感受，下一次将据此调整。`,
        };
        set((state) => ({
          activeWorkout: null,
          workoutHistory: [completed, ...state.workoutHistory],
          view: "summary",
        }));
      },
      resetAll: () => set({ ...emptyState }),
    }),
    {
      name: "fitpilot-state",
      version: 1,
      storage: createJSONStorage(() =>
        typeof window === "undefined" ? memoryStorage : localStorage,
      ),
      partialize: (state) => ({
        profile: state.profile,
        activePlan: state.activePlan,
        activeWorkout: state.activeWorkout,
        workoutHistory: state.workoutHistory,
        view: state.view,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...parsePersistedFitnessState(persisted),
      }),
    },
  ),
);

export function activeExerciseName(): string | undefined {
  const workout = useFitnessStore.getState().activeWorkout;
  if (!workout) return undefined;
  return getExercise(workout.exercises[workout.currentExerciseIndex]?.planned.exerciseId)?.name;
}
