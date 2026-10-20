import { render, screen, waitFor, within } from "@testing-library/react";
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

  it("exposes calm coach navigation and both decision modes", async () => {
    render(<AppShell />);

    expect((await screen.findAllByText("AI MODE")).length).toBeGreaterThan(0);
    expect(screen.getAllByText("LOCAL FIRST").length).toBeGreaterThan(0);
    expect(screen.getByRole("navigation", { name: "产品导航" })).toBeVisible();
    expect(screen.getByRole("button", { name: /训练台/ })).toHaveAttribute("aria-current", "page");
  });

  it("makes the agent decision chain inspectable", async () => {
    render(<AppShell />);

    await userEvent.click(await screen.findByRole("button", { name: "Agent" }));

    expect(screen.getByRole("heading", { name: "决策依据" })).toBeVisible();
    expect(screen.getByText("使用的上下文")).toBeVisible();
    expect(screen.getByText("判断依据")).toBeVisible();
    expect(screen.getByText("建议调整")).toBeVisible();
    expect(screen.getByText("安全降级")).toBeVisible();
  });

  it("keeps the applied agent recommendation as a stable decision snapshot", async () => {
    render(<AppShell />);
    await userEvent.click(await screen.findByRole("button", { name: "Agent" }));

    const change = screen.getByLabelText("建议负荷变化");
    expect(within(change).getByText("8 kg")).toBeVisible();
    expect(within(change).getByText("9 kg")).toBeVisible();
    await userEvent.click(screen.getByRole("button", { name: "应用调整" }));

    expect(screen.getByRole("button", { name: "已应用到训练计划" })).toBeVisible();
    expect(within(change).getByText("8 kg")).toBeVisible();
    expect(within(change).getByText("9 kg")).toBeVisible();
  });

  it("lets mobile plan tabs expose each session without losing selection state", async () => {
    render(<AppShell />);
    await userEvent.click(await screen.findByRole("button", { name: "计划" }));

    const firstTab = screen.getByRole("tab", { name: "全身 A" });
    const secondTab = screen.getByRole("tab", { name: "全身 B" });
    expect(firstTab).toHaveAttribute("aria-selected", "true");
    expect(secondTab).toHaveAttribute("aria-selected", "false");

    await userEvent.click(secondTab);

    expect(firstTab).toHaveAttribute("aria-selected", "false");
    expect(secondTab).toHaveAttribute("aria-selected", "true");
  });
});
