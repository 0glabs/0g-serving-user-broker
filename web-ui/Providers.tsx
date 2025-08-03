"use client";

import { RainbowProvider } from "./src/providers/RainbowProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return <RainbowProvider>{children}</RainbowProvider>;
}
