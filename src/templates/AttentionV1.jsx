import React from "react";
import {
  AbsoluteFill,
  Video,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
  InterpolateOptions,
  interpolate,
} from "remotion";
import { calculateSequenceDuration } from "../core/timing.js";

const FONT_FAMILY =
  "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const TransitioningText = ({
  text,
  startFrame,
  duration,
  type = "default",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const relativeFrame = frame - startFrame;

  const entrance = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 12 },
  });

  const exit = spring({
    frame: relativeFrame - (duration - 10),
    fps,
    config: { damping: 12 },
  });

  const opacity = interpolate(
    relativeFrame,
    [0, 5, duration - 5, duration],
    [0, 1, 1, 0],
  );
  const scale =
    type === "hook"
      ? interpolate(entrance - exit, [0, 1], [0.8, 1.1])
      : interpolate(entrance - exit, [0, 1], [0.95, 1]);

  const translateY = interpolate(entrance - exit, [0, 1], [20, 0]);

  return (
    <div
      style={{
        opacity,
        transform: `scale(${scale}) translateY(${translateY}px)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 60px",
      }}
    >
      <h1
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: type === "hook" ? 900 : 600,
          fontSize: type === "hook" ? "110px" : "80px",
          color: "white",
          lineHeight: 1.1,
          textShadow: "0 10px 30px rgba(0,0,0,0.5)",
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        {text}
      </h1>
      {type === "cta" && (
        <div
          style={{
            marginTop: "40px",
            height: "8px",
            width: "120px",
            backgroundColor: "#7c7cff",
            borderRadius: "4px",
          }}
        />
      )}
    </div>
  );
};

export const AttentionV1 = ({ backgroundUrl, sequences }) => {
  const { hook, problem, solution, cta } = sequences;

  const hookDuration = calculateSequenceDuration(hook);
  const problemDuration = calculateSequenceDuration(problem);
  const solutionDuration = calculateSequenceDuration(solution);
  const ctaDuration = calculateSequenceDuration(cta);

  const t1 = hookDuration;
  const t2 = t1 + problemDuration;
  const t3 = t2 + solutionDuration;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0f172a" }}>
      {/* Background Layer */}
      {backgroundUrl && (
        <AbsoluteFill>
          <Video
            src={backgroundUrl}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
            muted
          />
          {/* Subtle Aesthetic Overlay */}
          <AbsoluteFill
            style={{
              background:
                "radial-gradient(circle, rgba(15,23,42,0.3) 0%, rgba(15,23,42,0.8) 100%)",
            }}
          />
        </AbsoluteFill>
      )}

      {/* 1. Hook */}
      <Sequence from={0} durationInFrames={hookDuration}>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <TransitioningText
            text={hook}
            startFrame={0}
            duration={hookDuration}
            type="hook"
          />
        </AbsoluteFill>
      </Sequence>

      {/* 2. Problem */}
      <Sequence from={t1} durationInFrames={problemDuration}>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <TransitioningText
            text={problem}
            startFrame={t1}
            duration={problemDuration}
          />
        </AbsoluteFill>
      </Sequence>

      {/* 3. Solution */}
      <Sequence from={t2} durationInFrames={solutionDuration}>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <TransitioningText
            text={solution}
            startFrame={t2}
            duration={solutionDuration}
          />
        </AbsoluteFill>
      </Sequence>

      {/* 4. CTA */}
      <Sequence from={t3} durationInFrames={ctaDuration}>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <TransitioningText
            text={cta}
            startFrame={t3}
            duration={ctaDuration}
            type="cta"
          />
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
