import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppShell } from "../../src/components/app-shell";
import type { UserProfile } from "../../src/domain/types";
import { useFitnessStore } from "../../src/store/use-fitness-store";

const profile: UserProfile = {
  id: "shell-user",
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
  useFitnessStore.getState().setView("dashboard");
});

describe("AppShell", () => {
  it("returns to the top when switching product surfaces", async () => {
    const scrollTo = vi.fn();
    vi.stubGlobal("scrollTo", scrollTo);
    render(<AppShell />);

    await waitFor(() => expect(screen.getByRole("button", { name: "计划" })).toBeVisible());
    scrollTo.mockClear();
    await userEvent.click(screen.getByRole("button", { name: "计划" }));

    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
  });

  it("uses the refined one-line dashboard greeting and migrates the demo name", async () => {
    render(<AppShell />);

    const heading = await screen.findByRole("heading", { name: "小高，今天练得明白一点。" });
    expect(heading.querySelector("br")).toBeNull();
  });

  it("shows back and main-menu actions on every deep surface", async () => {
    render(<AppShell />);

    await userEvent.click(await screen.findByRole("button", { name: "计划" }));
    expect(screen.getByRole("button", { name: "返回" })).toBeVisible();
    expect(screen.getByRole("button", { name: "返回主菜单" })).toBeVisible();

    await userEvent.click(screen.getAllByRole("button", { name: /^开始/ })[0]);
    expect(screen.getByRole("button", { name: "返回" })).toBeVisible();
    expect(screen.getByRole("button", { name: "返回主菜单" })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "返回主菜单" }));
    expect(await screen.findByRole("button", { name: /^继续训练/ })).toBeVisible();

    await userEvent.click(screen.getByRole("button", { name: "Agent" }));
    expect(screen.getByRole("button", { name: "返回" })).toBeVisible();
    expect(screen.getByRole("button", { name: "返回主菜单" })).toBeVisible();
    const coachHeading = screen.getByRole("heading", { name: "问具体一点，答案才有用。" });
    expect(coachHeading.querySelector("br")).toBeNull();
  });
});
