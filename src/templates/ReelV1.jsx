import React from "react";
import {
  AbsoluteFill,
  Video,
  Sequence,
  staticFile,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { calculateSequenceDuration, TAIL_FRAMES } from "../core/timing.js";

const FONT_FAMILY =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const SimpleText = ({ text, duration, noFadeIn = false }) => {
  const frame = useCurrentFrame();

  // Fade in and out
  const opacity = interpolate(
    frame,
    [0, noFadeIn ? 0 : 10, duration - 10, duration],
    [noFadeIn ? 1 : 0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        flex: 1,
        padding: "0 80px",
      }}
    >
      <h1
        style={{
          fontFamily: FONT_FAMILY,
          fontSize: "80px",
          color: "white",
          fontWeight: "700",
          lineHeight: "1.2",
          textShadow: "0px 4px 10px rgba(0,0,0,0.5)",
          margin: 0,
        }}
      >
        {text}
      </h1>
    </div>
  );
};

export const ReelV1 = ({ backgroundUrl, sequences }) => {
  const { hook, problem, solution, cta } = sequences;
  const { durationInFrames } = useVideoConfig();

  // Use local file as fallback if backgroundUrl is not provided
  const videoSrc = backgroundUrl || staticFile("background.mp4");

  const hookDuration = calculateSequenceDuration(hook);
  const problemDuration = calculateSequenceDuration(problem);
  const solutionDuration = calculateSequenceDuration(solution);
  const ctaDuration = calculateSequenceDuration(cta) + TAIL_FRAMES;

  const t1 = hookDuration;
  const t2 = t1 + problemDuration;
  const t3 = t2 + solutionDuration;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Background Video Layer with native looping enabled */}
      <AbsoluteFill>
        <Video
          src={videoSrc}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          muted
          loop
        />
        {/* Dark Overlay for readability */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        />
      </AbsoluteFill>

      {/* Sequence 1: Hook - No fade in to ensure it shows on frame 0 for the cover */}
      <Sequence from={0} durationInFrames={hookDuration}>
        <SimpleText text={hook} duration={hookDuration} noFadeIn={true} />
      </Sequence>

      {/* Sequence 2: Problem */}
      <Sequence from={t1} durationInFrames={problemDuration}>
        <SimpleText text={problem} duration={problemDuration} />
      </Sequence>

      {/* Sequence 3: Solution */}
      <Sequence from={t2} durationInFrames={solutionDuration}>
        <SimpleText text={solution} duration={solutionDuration} />
      </Sequence>

      {/* Sequence 4: CTA - Extended to stay on screen until the very end */}
      <Sequence from={t3} durationInFrames={ctaDuration}>
        <SimpleText text={cta} duration={ctaDuration} />
      </Sequence>
    </AbsoluteFill>
  );
};
