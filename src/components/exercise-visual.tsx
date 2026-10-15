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

export function exerciseGuideAsset(pattern: string): string {
  return `/exercise-guides/${guideByPattern[pattern] ?? "core"}.png`;
}

export function ExerciseVisual({ exercise, compact = false }: { exercise: Exercise; compact?: boolean }) {
  return (
    <figure className={compact ? "exercise-visual compact" : "exercise-visual"}>
      <img src={exerciseGuideAsset(exercise.movementPattern)} alt={compact ? "" : `${exercise.name}数字教练动作示范`} />
      {!compact && <figcaption><span>{exercise.movementPattern.toUpperCase()}</span><strong>{exercise.primaryMuscles.join(" · ")}</strong></figcaption>}
    </figure>
  );
}
