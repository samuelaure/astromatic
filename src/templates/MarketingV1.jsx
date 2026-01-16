import React from "react";
import { AbsoluteFill, Video, Sequence, useCurrentFrame } from "remotion";
import { calculateSequenceDuration } from "../core/timing.js";

const SAFE_ZONE_TOP = 250;
const SAFE_ZONE_BOTTOM = 400;

const TextBlock = ({
  text,
  style,
  textStyle,
  width = "80%",
  height = 300,
  opacity = 1,
}) => {
  return (
    <div
      style={{
        width,
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(0, 0, 0, 0.45)",
        borderRadius: "24px",
        padding: "40px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
        opacity,
        ...style,
      }}
    >
      <h1
        style={{
          margin: 0,
          color: "#fff",
          fontSize: "64px",
          textAlign: "center",
          fontFamily: "helvetica",
          lineHeight: 1.4,
          // Using a basic scale-down logic for long text
          transform: text.length > 50 ? "scale(0.8)" : "scale(1)",
          ...textStyle,
        }}
      >
        {text}
      </h1>
    </div>
  );
};

export const MarketingV1 = ({ backgroundUrl, sequences }) => {
  const frame = useCurrentFrame();

  // Timing logic
  const hookDuration = calculateSequenceDuration(sequences.hook);
  const problemDuration = calculateSequenceDuration(sequences.problem);
  const solutionDuration = calculateSequenceDuration(sequences.solution);
  const ctaDuration = calculateSequenceDuration(sequences.cta);

  const startProblem = hookDuration;
  const startSolution = startProblem + problemDuration;
  const startCta = startSolution + solutionDuration;

  return (
    <AbsoluteFill style={{ backgroundColor: "black" }}>
      {/* Background with Dark Overlay */}
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
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.45)",
            }}
          />
        </AbsoluteFill>
      )}

      {/* 1. Hook: Start to HookDuration */}
      <Sequence from={0} durationInFrames={hookDuration}>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <TextBlock text={sequences.hook} width="90%" height={500} />
        </AbsoluteFill>
      </Sequence>

      {/* 2. Problem: Appears after Hook */}
      <Sequence from={startProblem} durationInFrames={problemDuration}>
        <AbsoluteFill
          style={{ justifyContent: "center", alignItems: "center" }}
        >
          <TextBlock text={sequences.problem} width="90%" height={400} />
        </AbsoluteFill>
      </Sequence>

      {/* 3. Solution & CTA: Appear together but in different halves */}
      <Sequence
        from={startSolution}
        durationInFrames={solutionDuration + ctaDuration}
      >
        <AbsoluteFill
          style={{ padding: `${SAFE_ZONE_TOP}px 0 ${SAFE_ZONE_BOTTOM}px 0` }}
        >
          {/* Solution: Upper Half */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextBlock text={sequences.solution} width="90%" height={350} />
          </div>

          {/* CTA: Lower Half (appears at startCta) */}
          <div
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {frame >= startCta && (
              <TextBlock
                text={sequences.cta}
                width="90%"
                height={300}
                style={{ backgroundColor: "rgba(255, 255, 255, 0.45)" }}
                textStyle={{ color: "rgba(0, 0, 0, 1)" }}
              />
            )}
          </div>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
