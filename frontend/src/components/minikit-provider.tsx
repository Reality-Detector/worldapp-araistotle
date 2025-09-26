"use client"; // This isn't needed for your project, but it's harmless

import { ReactNode, useEffect } from "react";
import { MiniKit } from "@worldcoin/minikit-js";

export default function MiniKitProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // The install function expects an object like { app_id: "..." }
    MiniKit.install({
      app_id: "app_31a60f60d27f7ae23f866444152cfad0",
    });
  }, []);

  return <>{children}</>;
}