"use client";

import { useMemo } from "react";
import { computeJumpRun } from "@/lib/winds/jumprun";
import type { WindLayer, JumpProfile, JumpRunResult } from "@/lib/winds/types";
import { DEFAULT_JUMP_PROFILE } from "@/lib/winds/constants";

export function useJumpRun(
  layers: WindLayer[] | null,
  profile?: Partial<JumpProfile>
): JumpRunResult | null {
  return useMemo(() => {
    if (!layers || layers.length === 0) return null;

    const fullProfile: JumpProfile = {
      ...DEFAULT_JUMP_PROFILE,
      ...profile,
    };

    return computeJumpRun(layers, fullProfile);
  }, [layers, profile]);
}
