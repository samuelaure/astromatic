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
import { calculateSequenceDuration } from "../modules/rendering/utils.ts";
import { getThemeByBrand } from "../modules/shared/themes.ts";
import React from "react";

const theme = getThemeByBrand("asfa");

interface SimpleTextProps {
  text: string;
  duration: number;
  noFadeIn?: boolean;
  fontFamily: string;
  fontWeight?: React.CSSProperties["fontWeight"];
  letterSpacing?: string;
  children?: React.ReactNode;
}

const SimpleText: React.FC<SimpleTextProps> = ({
  text,
  duration,
  noFadeIn = false,
  fontFamily,
  fontWeight = "400",
  letterSpacing = "normal",
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    noFadeIn
      ? [0, Math.max(0.1, duration - 10), duration]
      : [0, 10, Math.max(10.1, duration - 10), duration],
    noFadeIn ? [1, 1, 0] : [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <AbsoluteFill
      style={{
        opacity,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "0 180px",
      }}
    >
      <div style={{ position: "relative", width: "100%" }}>
        {children && (
          <div
            style={{
              position: "absolute",
              bottom: "105%",
              width: "100%",
              display: "flex",
              justifyContent: "center",
            }}
          >
            {children}
          </div>
        )}

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
            zIndex: 1,
          }}
        >
          {text}
        </h1>
      </div>
    </AbsoluteFill>
  );
};

const DynamicMessage: React.FC<{ text: string; duration: number }> = ({ text, duration }) => {
  const frame = useCurrentFrame();

  const getFontSize = (len: number) => {
    if (len < 40) return "95px";
    if (len < 80) return "85px";
    if (len < 120) return "75px";
    if (len < 180) return "65px";
    if (len < 250) return "55px";
    if (len < 350) return "45px";
    if (len < 500) return "38px";
    return "30px";
  };

  const opacity = interpolate(
    frame,
    [0, 15, Math.max(15.1, duration - 10), duration],
    [0, 1, 1, 0],
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
        padding: "240px 160px 340px 160px",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p
          style={{
            fontFamily: theme.body.fontFamily,
            fontSize: getFontSize(text.length),
            color: "white",
            fontWeight: theme.body.fontWeight as any,
            lineHeight: "1.4",
            textShadow: "0px 2px 8px rgba(0,0,0,0.6)",
            margin: 0,
            whiteSpace: "pre-wrap",
          }}
        >
          {text}
        </p>
      </div>
    </AbsoluteFill>
  );
};

export interface ASFAT2Props {
  sequences: {
    hook: string;
    message: string;
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

export const ASFAT2: React.FC<ASFAT2Props> = ({
  sequences,
  videoIndex1 = 1,
  videoIndex2 = 2,
  video1Duration = 0,
  video2Duration = 0,
  musicIndex = 1,
  r2BaseUrl = "",
}) => {
  const { hook, message } = sequences;
  const { durationInFrames } = useVideoConfig();

  const hookDuration = calculateSequenceDuration(hook);
  const messageDuration = durationInFrames - hookDuration;

  const pad = (n: number) => String(n).padStart(4, "0");

  const bg1 = r2BaseUrl
    ? `${r2BaseUrl}/AstrologiaFamiliar/videos/ASFA_VID_${pad(videoIndex1)}.mp4`
    : staticFile(`background_videos/astro-background-video-${videoIndex1}.mp4`);

  const bg2 = r2BaseUrl
    ? `${r2BaseUrl}/AstrologiaFamiliar/videos/ASFA_VID_${pad(videoIndex2)}.mp4`
    : staticFile(`background_videos/astro-background-video-${videoIndex2}.mp4`);

  const music = r2BaseUrl
    ? `${r2BaseUrl}/AstrologiaFamiliar/audios/ASFA_AUD_${pad(musicIndex)}.m4a`
    : staticFile(`background_music/astro-background-music-${musicIndex}.mp3`);

  return (
    <AbsoluteFill>
      <Loop durationInFrames={durationInFrames}>
        <Audio src={music} volume={0.5} />
      </Loop>

      <Sequence from={0} durationInFrames={hookDuration}>
        <AbsoluteFill>
          <SmartVideo
            src={bg1}
            videoDuration={video1Duration}
            fillDuration={hookDuration}
          />
        </AbsoluteFill>
      </Sequence>

      <Sequence from={hookDuration} durationInFrames={messageDuration}>
        <AbsoluteFill>
          <SmartVideo
            src={bg2}
            videoDuration={video2Duration}
            fillDuration={messageDuration}
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
        >
          <div style={{ fontSize: "140px" }}>✉️</div>
        </SimpleText>
      </Sequence>

      <Sequence from={hookDuration} durationInFrames={messageDuration}>
        <DynamicMessage text={message} duration={messageDuration} />
      </Sequence>
    </AbsoluteFill>
  );
};
