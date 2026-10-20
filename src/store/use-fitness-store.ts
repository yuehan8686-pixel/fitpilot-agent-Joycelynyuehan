import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

import { getExercise } from "../domain/exercises";
import { findSubstitute, generatePlan } from "../domain/plan-engine";
import {
  trainingPlanSchema,
  userProfileSchema,
  workoutSessionSchema,
} from "../domain/schemas";
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
  previousView: AppView | null;
  setView: (view: AppView) => void;
  goBack: () => void;
  goHome: () => void;
  saveProfile: (profile: UserProfile) => void;
  createPlan: () => void;
  startWorkout: (planSessionId: string, startedAt?: string) => void;
  completeSet: (weightKg: number, reps: number, completedAt?: string) => void;
  submitFeedback: (feedback: ExerciseFeedback) => void;
  applyLoadSuggestion: (exerciseId: string, nextWeightKg: number) => void;
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
  previousView: null as AppView | null,
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

function canOpenView(view: AppView, state: FitnessState): boolean {
  if (view === "onboarding") return !state.profile;
  if (view === "plan") return Boolean(state.activePlan);
  if (view === "workout") return Boolean(state.activeWorkout);
  if (view === "summary") return state.workoutHistory.length > 0;
  return Boolean(state.profile);
}

function fallbackBackView(state: FitnessState): AppView {
  if ((state.view === "workout" || state.view === "summary") && state.activePlan) return "plan";
  return "dashboard";
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
  if (value.workoutHistory !== undefined) {
    const history = workoutSessionSchema.array().safeParse(value.workoutHistory);
    if (!history.success) return {};
    parsed.workoutHistory = history.data;
  }
  if (value.activeWorkout === null) {
    parsed.activeWorkout = null;
  } else if (value.activeWorkout !== undefined) {
    const workout = workoutSessionSchema.safeParse(value.activeWorkout);
    if (!workout.success) return {};
    parsed.activeWorkout = workout.data;
  }
  if (["onboarding", "dashboard", "plan", "workout", "summary", "coach"].includes(String(value.view))) {
    parsed.view = value.view as AppView;
  }

  if (!parsed.profile) {
    if (parsed.activePlan || parsed.activeWorkout || (parsed.workoutHistory?.length ?? 0) > 0) return {};
    parsed.view = "onboarding";
  } else if (
    (parsed.view === "workout" && !parsed.activeWorkout) ||
    (parsed.view === "plan" && !parsed.activePlan) ||
    (parsed.view === "summary" && (parsed.workoutHistory?.length ?? 0) === 0)
  ) {
    parsed.view = "dashboard";
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
      setView: (view) => set((state) => view === state.view ? state : { view, previousView: state.view }),
      goBack: () => set((state) => ({
        view: state.previousView && canOpenView(state.previousView, state)
          ? state.previousView
          : fallbackBackView(state),
        previousView: null,
      })),
      goHome: () => set((state) => ({ view: "dashboard", previousView: state.view })),
      saveProfile: (profile) => set((state) => ({ profile, view: "dashboard", previousView: state.view })),
      createPlan: () => {
        const profile = get().profile;
        if (!profile) return;
        set((state) => ({ activePlan: generatePlan(profile), view: "plan", previousView: state.view }));
      },
      startWorkout: (planSessionId, startedAt = new Date().toISOString()) => {
        const plan = get().activePlan;
        const session = plan?.sessions.find((item) => item.id === planSessionId);
        if (!session) return;
        set((state) => ({
          activeWorkout: {
            id: id("workout"),
            planSessionId,
            sessionName: session.name,
            startedAt,
            currentExerciseIndex: 0,
            exercises: session.exercises.map((planned) => ({ planned, setLogs: [] })),
          },
          view: "workout",
          previousView: state.view,
        }));
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
        const currentExercise = exercises[workout.currentExerciseIndex];
        const restSeconds = currentExercise.planned.restSeconds;
        const restEndsAt = currentExercise.setLogs.length < currentExercise.planned.sets
          ? new Date(new Date(completedAt).getTime() + restSeconds * 1000).toISOString()
          : undefined;
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
      applyLoadSuggestion: (exerciseId, nextWeightKg) => set((state) => ({
        activePlan: state.activePlan ? {
          ...state.activePlan,
          sessions: state.activePlan.sessions.map((session) => ({
            ...session,
            exercises: session.exercises.map((exercise) => exercise.exerciseId === exerciseId
              ? { ...exercise, suggestedWeightKg: nextWeightKg }
              : exercise),
          })),
        } : null,
        activeWorkout: state.activeWorkout ? {
          ...state.activeWorkout,
          exercises: state.activeWorkout.exercises.map((exercise) =>
            exercise.planned.exerciseId === exerciseId && exercise.setLogs.length === 0
              ? { ...exercise, planned: { ...exercise.planned, suggestedWeightKg: nextWeightKg } }
              : exercise,
          ),
        } : null,
      })),
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
          previousView: state.view,
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
