import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ExerciseVisual, exerciseGuideAsset } from "../../src/components/exercise-visual";
import { getExercise } from "../../src/domain/exercises";

describe("ExerciseVisual", () => {
  it("maps movement patterns to a professional digital-coach guide", () => {
    expect(exerciseGuideAsset("squat")).toBe("/exercise-guides/squat.png");
    expect(exerciseGuideAsset("vertical-pull")).toBe("/exercise-guides/pull.png");
    expect(exerciseGuideAsset("anti-extension")).toBe("/exercise-guides/core.png");
  });

  it("renders the exercise as an accessible digital-human demonstration", () => {
    const exercise = getExercise("bodyweight-squat")!;
    render(<ExerciseVisual exercise={exercise} />);

    const image = screen.getByRole("img", { name: "徒手深蹲数字教练动作示范" });
    expect(image).toHaveAttribute("src", "/exercise-guides/squat.png");
    expect(screen.getByText("股四头肌 · 臀大肌")).toBeVisible();
  });
});
