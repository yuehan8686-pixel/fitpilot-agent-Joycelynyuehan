import type { Exercise } from "../domain/types";

export function ExerciseVisual({ exercise, compact = false }: { exercise: Exercise; compact?: boolean }) {
  const lower = ["squat", "hinge", "hip-extension", "knee-flexion", "knee-extension", "calf-raise"].includes(exercise.movementPattern);
  const pull = exercise.category === "pull";
  return (
    <div className={compact ? "exercise-visual compact" : "exercise-visual"} aria-hidden="true">
      <svg viewBox="0 0 240 220" role="img">
        <path className="visual-grid" d="M20 188H220M20 160H220M20 132H220" />
        <circle className="visual-head" cx="120" cy="42" r="16" />
        <path className="visual-body" d={lower ? "M120 60L112 116L80 154M112 116L155 148M82 154L54 188M155 148L182 188" : "M120 60L120 132L98 186M120 132L145 186"} />
        <path className="visual-body" d={pull ? "M120 78L72 102M120 78L170 98" : "M120 78L82 126M120 78L165 123"} />
        <circle className="visual-joint" cx="120" cy="78" r="5" />
        <circle className="visual-joint" cx={lower ? "112" : "120"} cy={lower ? "116" : "132"} r="5" />
        <path className="visual-force" d={lower ? "M44 178V118M44 118l-8 14M44 118l8 14" : "M188 136V76M188 76l-8 14M188 76l8 14"} />
        <text x="20" y="24">{exercise.shortName}</text>
        <text className="visual-code" x="20" y="210">{exercise.movementPattern.toUpperCase()}</text>
      </svg>
    </div>
  );
}
