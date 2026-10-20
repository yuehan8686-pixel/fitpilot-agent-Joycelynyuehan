import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: "FitPilot | 运动表现智能终端",
  description: "本地优先、规则守护的 AI 训练闭环：从计划、执行到反馈调整。",
  applicationName: "FitPilot",
  manifest: "/manifest.webmanifest",
  icons: [{ rel: "icon", url: "/icon.svg", type: "image/svg+xml" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "FitPilot",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#f3f6ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
