import { describe, test, expect } from "vitest";
import {
  calculateSequenceDuration,
  calculateTotalFrames,
} from "../src/modules/rendering/utils.ts";

describe("Timing Utils", () => {
  test("calculateSequenceDuration returns correct frames for a short text", () => {
    // "Hello world" = 2 words.
    // 2 / 2.8 = 0.71s. Max(0.71, 1.2) = 1.2s.
    // 1.2s * 30 FPS = 36 frames.
    const duration = calculateSequenceDuration("Hello world");
    expect(duration).toBe(36);
  });

  test("calculateSequenceDuration returns correct frames for a long text", () => {
    // 19 words. 19 / 2.8 = 6.7857...
    // 6.7857 * 30 = 203.57... -> Math.round -> 204 frames.
    const text =
      "This is a much longer text that has exactly nineteen words to test the duration calculation logic correctly now.";
    const duration = calculateSequenceDuration(text);
    expect(duration).toBe(204);
  });

  test("calculateTotalFrames sums up sequences and adds tail", () => {
    const sequences = {
      hook: "Short text", // 1.2s = 36 frames
      problem: "This is a bit longer and should be more than one second", // 12 words / 2.8 = 4.285s -> 129 frames
    };
    // Total = 36 + 129 + 60 (TAIL_FRAMES) = 225
    const total = calculateTotalFrames(sequences);
    expect(total).toBe(36 + 129 + 60);
  });
});
