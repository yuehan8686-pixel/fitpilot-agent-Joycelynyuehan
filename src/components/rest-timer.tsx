"use client";

import { useEffect, useState } from "react";

import { getRemainingRestSeconds } from "../store/use-fitness-store";

export function RestTimer({ restEndsAt, onSkip }: { restEndsAt: string; onSkip: () => void }) {
  const [remaining, setRemaining] = useState(() => getRemainingRestSeconds(restEndsAt));

  useEffect(() => {
    const tick = () => setRemaining(getRemainingRestSeconds(restEndsAt));
    tick();
    const timer = window.setInterval(tick, 500);
    return () => window.clearInterval(timer);
  }, [restEndsAt]);

  const minutes = Math.floor(remaining / 60).toString().padStart(2, "0");
  const seconds = (remaining % 60).toString().padStart(2, "0");

  if (remaining <= 0) return null;
  return (
    <div className="rest-strip" role="status">
      <div><span className="pulse-dot" />休息 {minutes}:{seconds}</div>
      <button type="button" onClick={onSkip}>跳过休息</button>
    </div>
  );
}
