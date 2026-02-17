import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  staticFile,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
  Loop,
  Audio,
} from "remotion";
import { calculateSequenceDuration, TAIL_FRAMES } from "../modules/rendering/utils.ts";
import { getThemeByBrand } from "../modules/shared/themes.ts";
import React from "react";

const theme = getThemeByBrand("mafa");

interface SimpleTextProps {
  text: string;
  duration: number;
  noFadeIn?: boolean;
  fontFamily: string;
  fontWeight?: React.CSSProperties["fontWeight"];
  letterSpacing?: string;
  typewriter?: boolean;
}

const SimpleText: React.FC<SimpleTextProps> = ({
  text,
  duration,
  noFadeIn = false,
  fontFamily,
  fontWeight = "400",
  letterSpacing = "normal",
  typewriter = false,
}) => {
  const frame = useCurrentFrame();

  const typingDuration = Math.min(30, duration - 20);
  const charsToShow = typewriter
    ? Math.floor(
      interpolate(frame, [0, typingDuration], [0, text.length], {
        extrapolateRight: "clamp",
      }),
    )
    : text.length;

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
    <AbsoluteFill
      style={{
        opacity,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "200px 140px 300px 140px",
      }}
    >
      <h1
        style={{
          fontFamily,
          fontSize: "70px",
          color: "white",
          fontWeight,
          lineHeight: "1.2",
          textShadow: "0px 4px 10px rgba(0,0,0,0.5)",
          margin: 0,
          letterSpacing,
        }}
      >
        {text.split("").map((char, i) => (
          <span
            key={i}
            style={{
              opacity: i < charsToShow ? 1 : 0,
            }}
          >
            {char}
          </span>
        ))}
      </h1>
    </AbsoluteFill>
  );
};

export interface MAFAT1Props {
  sequences: {
    hook: string;
    problem: string;
    solution: string;
    cta: string;
  };
  videoIndex1?: number;
  videoIndex2?: number;
  video1Duration?: number;
  video2Duration?: number;
  musicIndex?: number;
  r2BaseUrl?: string;
}

const SmartVideo: React.FC<{ src: string; videoDuration: number; fillDuration: number }> = ({ src, videoDuration, fillDuration }) => {
  const vDuration = Math.round(videoDuration);
  const fDuration = Math.round(fillDuration);

  if (vDuration > 0 && vDuration < fDuration) {
    return (
      <Loop durationInFrames={vDuration}>
        <OffthreadVideo
          src={src}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          muted
        />
      </Loop>
    );
  }
  return (
    <OffthreadVideo
      src={src}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
      muted
    />
  );
};

export const MAFAT1: React.FC<MAFAT1Props> = ({
  sequences,
  videoIndex1 = 1,
  videoIndex2 = 2,
  video1Duration = 0,
  video2Duration = 0,
  musicIndex = 1,
  r2BaseUrl = "",
}) => {
  const { hook, problem, solution, cta } = sequences;
  const { durationInFrames } = useVideoConfig();

  const hookDuration = calculateSequenceDuration(hook);
  const problemDuration = calculateSequenceDuration(problem);
  const solutionDuration = calculateSequenceDuration(solution);
  const ctaDuration = calculateSequenceDuration(cta) + TAIL_FRAMES;

  const t1 = hookDuration;
  const t2 = t1 + problemDuration;
  const t3 = t2 + solutionDuration;

  const fill1 = t2;
  const fill2 = durationInFrames - t2;

  const pad = (n: number) => String(n).padStart(4, "0");

  const bg1 = r2BaseUrl
    ? `${r2BaseUrl}/ManualFamiliar/videos/M_VID_${pad(videoIndex1)}.mp4`
    : staticFile(`background_videos/astro-background-video-${videoIndex1}.mp4`);

  const bg2 = r2BaseUrl
    ? `${r2BaseUrl}/ManualFamiliar/videos/M_VID_${pad(videoIndex2)}.mp4`
    : staticFile(`background_videos/astro-background-video-${videoIndex2}.mp4`);

  const music = r2BaseUrl
    ? `${r2BaseUrl}/ManualFamiliar/audios/M_AUD_${pad(musicIndex)}.m4a`
    : staticFile(`background_music/astro-background-music-${musicIndex}.mp3`);

  return (
    <AbsoluteFill>
      <Loop durationInFrames={durationInFrames}>
        <Audio src={music} volume={0.5} />
      </Loop>

      <Sequence from={0} durationInFrames={fill1}>
        <AbsoluteFill>
          <SmartVideo
            src={bg1}
            videoDuration={video1Duration}
            fillDuration={fill1}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={t2} durationInFrames={fill2}>
        <AbsoluteFill>
          <SmartVideo
            src={bg2}
            videoDuration={video2Duration}
            fillDuration={fill2}
          />
        </AbsoluteFill>
      </Sequence>

      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: theme.overlay.backgroundColor,
          }}
        />
      </AbsoluteFill>

      <Sequence from={0} durationInFrames={hookDuration}>
        <SimpleText
          text={hook}
          duration={hookDuration}
          noFadeIn={true}
          fontFamily={theme.hook.fontFamily}
          fontWeight={theme.hook.fontWeight as any}
          letterSpacing={theme.hook.letterSpacing}
          typewriter={false}
        />
      </Sequence>

      <Sequence from={t1} durationInFrames={problemDuration}>
        <SimpleText
          text={problem}
          duration={problemDuration}
          fontFamily={theme.body.fontFamily}
          fontWeight={theme.body.fontWeight as any}
          typewriter={true}
        />
      </Sequence>

      <Sequence from={t2} durationInFrames={solutionDuration}>
        <SimpleText
          text={solution}
          duration={solutionDuration}
          fontFamily={theme.body.fontFamily}
          fontWeight={theme.body.fontWeight as any}
          typewriter={false}
        />
      </Sequence>

      <Sequence from={t3} durationInFrames={ctaDuration}>
        <SimpleText
          text={cta}
          duration={ctaDuration}
          fontFamily={theme.body.fontFamily}
          fontWeight={theme.body.fontWeight as any}
          typewriter={true}
        />
      </Sequence>
    </AbsoluteFill>
  );
};
