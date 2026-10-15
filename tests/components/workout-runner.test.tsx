import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";

import { WorkoutRunner } from "../../src/components/workout-runner";
import type { UserProfile } from "../../src/domain/types";
import { useFitnessStore } from "../../src/store/use-fitness-store";

const profile: UserProfile = {
  id: "ui-user",
  name: "小驼",
  age: 28,
  sex: "female",
  heightCm: 168,
  weightKg: 58,
  experience: "beginner",
  goal: "build_muscle",
  trainingDays: 3,
  sessionMinutes: 50,
  equipment: ["bodyweight", "dumbbell", "machine", "cable"],
  limitations: [],
  injuries: [],
  safetyAcknowledged: true,
};

beforeEach(() => {
  useFitnessStore.getState().resetAll();
  useFitnessStore.getState().saveProfile(profile);
  useFitnessStore.getState().createPlan();
  const first = useFitnessStore.getState().activePlan!.sessions[0];
  useFitnessStore.getState().startWorkout(first.id);
});

describe("WorkoutRunner", () => {
  it("completes a set with one action and starts rest", async () => {
    render(<WorkoutRunner />);

    await userEvent.click(screen.getByRole("button", { name: "完成第 1 组" }));

    expect(useFitnessStore.getState().activeWorkout!.exercises[0].setLogs).toHaveLength(1);
    expect(screen.getByText(/休息 01:/)).toBeVisible();
  });

  it("replaces the active exercise with a compatible alternative", async () => {
    render(<WorkoutRunner />);
    const original = screen.getByTestId("current-exercise-name").textContent;

    await userEvent.click(screen.getByRole("button", { name: "换个动作" }));

    expect(screen.getByTestId("current-exercise-name").textContent).not.toBe(original);
  });

  it("submits exercise feedback and advances to the next movement", async () => {
    render(<WorkoutRunner />);
    const original = screen.getByTestId("current-exercise-name").textContent;

    await userEvent.click(screen.getByRole("button", { name: "完成第 1 组" }));
    await userEvent.click(screen.getByRole("button", { name: "完成第 2 组" }));
    await userEvent.click(screen.getByRole("button", { name: "保存反馈，下一动作" }));

    expect(screen.getByTestId("current-exercise-name").textContent).not.toBe(original);
  });

  it("shows stop guidance when pain is reported", async () => {
    render(<WorkoutRunner />);

    await userEvent.click(screen.getByRole("button", { name: "完成第 1 组" }));
    await userEvent.click(screen.getByRole("button", { name: "完成第 2 组" }));
    await userEvent.selectOptions(screen.getByLabelText("疼痛程度"), "4");

    expect(screen.getByRole("alert")).toHaveTextContent("停止当前动作");
  });

  it("returns to the plan without ending or resetting the workout", async () => {
    render(<WorkoutRunner />);
    await userEvent.click(screen.getByRole("button", { name: "完成第 1 组" }));

    await userEvent.click(screen.getByRole("button", { name: "返回" }));

    expect(useFitnessStore.getState().view).toBe("plan");
    expect(useFitnessStore.getState().activeWorkout?.exercises[0].setLogs).toHaveLength(1);
  });
});
