"use client";

import { useFitnessStore } from "../store/use-fitness-store";

export function ScreenActions() {
  const goBack = useFitnessStore((state) => state.goBack);
  const goHome = useFitnessStore((state) => state.goHome);

  return (
    <nav className="screen-actions" aria-label="页面导航">
      <button type="button" onClick={goBack}><span aria-hidden="true">←</span> 返回</button>
      <button type="button" onClick={goHome}><span aria-hidden="true">⌂</span> 返回主菜单</button>
    </nav>
  );
}
