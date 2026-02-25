"use client";

import { useMemo } from "react";
import { computeJumpRun } from "@/lib/winds/jumprun";
import type { WindLayer, DropzoneConfig, JumpRunResult } from "@/lib/winds/types";

export function useJumpRun(
  layers: WindLayer[] | null,
  config: DropzoneConfig
): JumpRunResult | null {
  return useMemo(() => {
    if (!layers || layers.length === 0) return null;
    return computeJumpRun(layers, config);
  }, [layers, config]);
}
