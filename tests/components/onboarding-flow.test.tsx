import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { OnboardingFlow } from "../../src/components/onboarding-flow";

describe("OnboardingFlow", () => {
  it("renders the welcome message as the two requested lines", () => {
    render(<OnboardingFlow onComplete={vi.fn()} />);

    const heading = screen.getByRole("heading", { level: 1 });
    const lines = heading.querySelectorAll("[data-heading-line]");
    expect(lines).toHaveLength(2);
    expect(lines[0]).toHaveTextContent("先认识一下你，");
    expect(lines[1]).toHaveTextContent("再为你安排专属训练计划");
  });

  it("requires a name before creating a profile", async () => {
    const onComplete = vi.fn();
    render(<OnboardingFlow onComplete={onComplete} />);

    await userEvent.click(screen.getByRole("checkbox", { name: /我了解/ }));
    await userEvent.click(screen.getByRole("button", { name: "生成我的训练计划" }));

    expect(screen.getByText("请填写你的称呼")).toBeVisible();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("rejects training days outside two to five", async () => {
    const onComplete = vi.fn();
    render(<OnboardingFlow onComplete={onComplete} />);

    await userEvent.type(screen.getByLabelText("你的称呼"), "小驼");
    fireEvent.change(screen.getByLabelText("每周训练天数"), { target: { value: "1" } });
    await userEvent.click(screen.getByRole("checkbox", { name: /我了解/ }));
    await userEvent.click(screen.getByRole("button", { name: "生成我的训练计划" }));

    expect(screen.getByText("每周训练天数应为 2–5 天")).toBeVisible();
    expect(onComplete).not.toHaveBeenCalled();
  });

  it("requires safety acknowledgement and returns a complete profile", async () => {
    const onComplete = vi.fn();
    render(<OnboardingFlow onComplete={onComplete} />);
    await userEvent.type(screen.getByLabelText("你的称呼"), "小驼");

    await userEvent.click(screen.getByRole("button", { name: "生成我的训练计划" }));
    expect(screen.getByText("请先确认安全说明")).toBeVisible();

    await userEvent.click(screen.getByRole("checkbox", { name: /我了解/ }));
    await userEvent.click(screen.getByRole("button", { name: "生成我的训练计划" }));

    expect(onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "小驼",
        trainingDays: 3,
        safetyAcknowledged: true,
      }),
    );
  });
});
