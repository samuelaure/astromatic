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
    fontFamily,
    fontWeight = "400",
    letterSpacing = "normal",
    children,
}) => {
    const frame = useCurrentFrame();
    const opacity = interpolate(
        frame,
        [0, 10, Math.max(10.1, duration - 10), duration],
        [0, 1, 1, 0],
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
                padding: "200px 140px 300px 140px",
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
                {text}
            </h1>
            {children}
        </AbsoluteFill>
    );
};

const DynamicMessage = ({ text, duration }) => {
    const frame = useCurrentFrame();

    // Simple dynamic font sizing based on length
    // 0-50 chars: 80px
    // 50-150 chars: 60px
    // 150-300 chars: 45px
    // 300+ chars: 35px
    const getFontSize = (len) => {
        if (len < 50) return "80px";
        if (len < 150) return "60px";
        if (len < 300) return "45px";
        return "35px";
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
                padding: "100px 120px",
            }}
        >
            <p
                style={{
                    fontFamily: ralewayFamily,
                    fontSize: getFontSize(text.length),
                    color: "white",
                    fontWeight: "400",
                    lineHeight: "1.4",
                    textShadow: "0px 2px 8px rgba(0,0,0,0.6)",
                    margin: 0,
                }}
            >
                {text}
            </p>
        </AbsoluteFill>
    );
};

export const ASFAT2 = ({
    sequences,
    videoIndex1 = 1,
    videoIndex2 = 2,
    musicIndex = 1,
    r2BaseUrl = "",
}) => {
    const { hook, message } = sequences;
    const { durationInFrames } = useVideoConfig();

    const hookDuration = calculateSequenceDuration(hook);
    // Give message more time if it's longer
    const messageDuration = durationInFrames - hookDuration;

    // Helper to pad numbers to 4 digits
    const pad = (n) => String(n).padStart(4, "0");

    const bg1 = r2BaseUrl
        ? `${r2BaseUrl}/astrologia_familiar/videos/ASFA_VID_${pad(videoIndex1)}.mp4`
        : staticFile(`background_videos/astro-background-video-${videoIndex1}.mp4`);

    const bg2 = r2BaseUrl
        ? `${r2BaseUrl}/astrologia_familiar/videos/ASFA_VID_${pad(videoIndex2)}.mp4`
        : staticFile(`background_videos/astro-background-video-${videoIndex2}.mp4`);

    const music = r2BaseUrl
        ? `${r2BaseUrl}/astrologia_familiar/audios/ASFA_AUD_${pad(musicIndex)}.m4a`
        : staticFile(`background_music/astro-background-music-${musicIndex}.mp3`);

    return (
        <AbsoluteFill>
            <Loop durationInFrames={durationInFrames}>
                <Audio src={music} volume={0.5} />
            </Loop>

            <Sequence from={0} durationInFrames={hookDuration}>
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

            <Sequence from={hookDuration} durationInFrames={messageDuration}>
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

            {/* Dark Overlay */}
            <AbsoluteFill style={{ pointerEvents: "none" }}>
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.55)",
                    }}
                />
            </AbsoluteFill>

            {/* Sequence 1: Hook + Emoji */}
            <Sequence from={0} durationInFrames={hookDuration}>
                <SimpleText
                    text={hook}
                    duration={hookDuration}
                    fontFamily={frauncesFamily}
                    fontWeight="700"
                    letterSpacing="0.03em"
                >
                    <div style={{ fontSize: "140px", marginTop: "40px" }}>✉️</div>
                </SimpleText>
            </Sequence>

            {/* Sequence 2: Message */}
            <Sequence from={hookDuration} durationInFrames={messageDuration}>
                <DynamicMessage text={message} duration={messageDuration} />
            </Sequence>
        </AbsoluteFill>
    );
};
