import { existsSync } from "node:fs";
import { join } from "node:path";

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExerciseVisual, exerciseGuideAsset } from "../../src/components/exercise-visual";
import { getExercise } from "../../src/domain/exercises";

describe("ExerciseVisual", () => {
  it.each([
    ["bodyweight-squat", "bodyweight-squat.png"],
    ["machine-chest-press", "machine-chest-press.png"],
    ["lat-pulldown", "lat-pulldown.png"],
    ["dumbbell-rdl", "dumbbell-rdl.png"],
    ["plank", "plank.png"],
    ["hip-thrust", "hip-thrust.png"],
    ["machine-shoulder-press", "machine-shoulder-press.png"],
    ["seated-cable-row", "seated-cable-row.png"],
    ["dumbbell-goblet-squat", "dumbbell-goblet-squat.png"],
    ["cable-curl", "cable-curl.png"],
    ["machine-leg-press", "machine-leg-press.png"],
    ["one-arm-dumbbell-row", "one-arm-dumbbell-row.png"],
    ["dumbbell-lateral-raise", "dumbbell-lateral-raise.png"],
    ["bird-dog", "bird-dog.png"],
  ])("maps %s to its own exercise-specific guide", (exerciseId, filename) => {
    const exercise = getExercise(exerciseId)!;
    const assetPath = exerciseGuideAsset(exercise);

    expect(assetPath).toBe(`/exercise-guides/exact/${filename}`);
    expect(existsSync(join(process.cwd(), "public", assetPath.replace(/^\//, "")))).toBe(true);
  });

  it("renders the exercise as an accessible digital-human demonstration", () => {
    const exercise = getExercise("bodyweight-squat")!;
    render(<ExerciseVisual exercise={exercise} />);

    const image = screen.getByRole("img", { name: "徒手深蹲数字教练动作示范" });
    expect(image).toHaveAttribute("src", "/exercise-guides/exact/bodyweight-squat.png");
    expect(screen.getByText("股四头肌 · 臀大肌")).toBeVisible();
  });
});
