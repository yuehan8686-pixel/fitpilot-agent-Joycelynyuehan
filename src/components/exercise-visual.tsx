import type { Exercise } from "../domain/types";

const guideByPattern: Record<string, string> = {
  squat: "squat",
  "knee-flexion": "squat",
  "knee-extension": "squat",
  "calf-raise": "squat",
  hinge: "hinge",
  "hip-extension": "glutes",
  "horizontal-push": "push",
  "incline-push": "push",
  "chest-fly": "push",
  "vertical-pull": "pull",
  "horizontal-pull": "pull",
  "vertical-push": "shoulders",
  "lateral-raise": "shoulders",
  "elbow-flexion": "arms",
  "elbow-extension": "arms",
  "anti-extension": "core",
  stability: "core",
  walk: "core",
  mobility: "core",
};

const exactExerciseGuideIds = new Set([
  "bodyweight-squat",
  "machine-chest-press",
  "lat-pulldown",
  "dumbbell-rdl",
  "plank",
  "hip-thrust",
  "machine-shoulder-press",
  "seated-cable-row",
  "dumbbell-goblet-squat",
  "cable-curl",
  "machine-leg-press",
  "one-arm-dumbbell-row",
  "dumbbell-lateral-raise",
  "bird-dog",
]);

export function exerciseGuideAsset(exercise: Pick<Exercise, "id" | "movementPattern">): string {
  if (exactExerciseGuideIds.has(exercise.id)) {
    return `/exercise-guides/exact/${exercise.id}.png`;
  }

  return `/exercise-guides/${guideByPattern[exercise.movementPattern] ?? "core"}.png`;
}

export function ExerciseVisual({ exercise, compact = false }: { exercise: Exercise; compact?: boolean }) {
  return (
    <figure className={compact ? "exercise-visual compact" : "exercise-visual"}>
      <img src={exerciseGuideAsset(exercise)} alt={compact ? "" : `${exercise.name}数字教练动作示范`} />
      {!compact && <figcaption><span>{exercise.movementPattern.toUpperCase()}</span><strong>{exercise.primaryMuscles.join(" · ")}</strong></figcaption>}
    </figure>
  );
}
