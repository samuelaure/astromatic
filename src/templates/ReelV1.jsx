import React from "react";
import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Loop,
} from "remotion";
import { loadFont as loadFraunces } from "@remotion/google-fonts/Fraunces";
import { loadFont as loadRaleway } from "@remotion/google-fonts/Raleway";
import { calculateSequenceDuration, TAIL_FRAMES } from "../core/timing.js";

const { fontFamily: frauncesFamily } = loadFraunces("normal", {
  weights: ["700"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});
const { fontFamily: ralewayFamily } = loadRaleway("normal", {
  weights: ["400"],
  subsets: ["latin"],
  ignoreTooManyRequestsWarning: true,
});

const SimpleText = ({
  text,
  duration,
  noFadeIn = false,
  fontFamily,
  fontWeight = "400",
  letterSpacing = "normal",
  typewriter = false,
}) => {
  const frame = useCurrentFrame();

  // Typewriter effect reveal logic
  const typingDuration = Math.min(30, duration - 20);
  const charsToShow = typewriter
    ? Math.floor(
      interpolate(frame, [0, typingDuration], [0, text.length], {
        extrapolateRight: "clamp",
      }),
    )
    : text.length;

  const displayedText = text.slice(0, charsToShow);

  // Opacity timing logic
  // If typewriter is on OR noFadeIn is true, we start at opacity 1 instantly.
  // Otherwise, we fade in over 10 frames.
  const hasInstantStart = typewriter || noFadeIn;

  const opacity = interpolate(
    frame,
    hasInstantStart
      ? [0, Math.max(0.1, duration - 10), duration]
      : [0, 10, Math.max(10.1, duration - 10), duration],
    hasInstantStart ? [1, 1, 0] : [0, 1, 1, 0],
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
          fontFamily,
          fontSize: "80px",
          color: "white",
          fontWeight,
          lineHeight: "1.2",
          textShadow: "0px 4px 10px rgba(0,0,0,0.5)",
          margin: 0,
          letterSpacing,
        }}
      >
        {displayedText}
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

  // Determine background sources
  // We use staticFile for our local randomization logic
  const bg1 = staticFile("background1.mp4");
  const bg2 = staticFile("background2.mp4");

  return (
    <AbsoluteFill>
      {/* Background Layer 1: Start to T2 (Solution Start) */}
      <Sequence from={0} durationInFrames={t2}>
        <AbsoluteFill>
          <Loop durationInFrames={120}>
            <OffthreadVideo
              src={bg1}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              muted
            />
          </Loop>
        </AbsoluteFill>
      </Sequence>

      {/* Background Layer 2: T2 to End */}
      <Sequence from={t2} durationInFrames={durationInFrames - t2}>
        <AbsoluteFill>
          <Loop durationInFrames={120}>
            <OffthreadVideo
              src={bg2}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              muted
            />
          </Loop>
        </AbsoluteFill>
      </Sequence>

      {/* Dark Overlay for readability (Global) */}
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
          }}
        />
      </AbsoluteFill>

      {/* Sequence 1: Hook - Fraunces Bold 700 with letter spacing. No fade/writing to ensure cover visibility. */}
      <Sequence from={0} durationInFrames={hookDuration}>
        <SimpleText
          text={hook}
          duration={hookDuration}
          noFadeIn={true}
          fontFamily={frauncesFamily}
          fontWeight="700"
          letterSpacing="0.03em"
          typewriter={false}
        />
      </Sequence>

      {/* Sequence 2: Problem - Raleway Regular 400. Using writing effect. */}
      <Sequence from={t1} durationInFrames={problemDuration}>
        <SimpleText
          text={problem}
          duration={problemDuration}
          fontFamily={ralewayFamily}
          fontWeight="400"
          typewriter={true}
        />
      </Sequence>

      {/* Sequence 3: Solution - Raleway Regular 400. Standard reveal. */}
      <Sequence from={t2} durationInFrames={solutionDuration}>
        <SimpleText
          text={solution}
          duration={solutionDuration}
          fontFamily={ralewayFamily}
          fontWeight="400"
          typewriter={false}
        />
      </Sequence>

      {/* Sequence 4: CTA - Raleway Regular 400. Using writing effect. */}
      <Sequence from={t3} durationInFrames={ctaDuration}>
        <SimpleText
          text={cta}
          duration={ctaDuration}
          fontFamily={ralewayFamily}
          fontWeight="400"
          typewriter={true}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
