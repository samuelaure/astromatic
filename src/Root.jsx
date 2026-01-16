import { Composition } from "remotion";
import { TemplateRegistry } from "./config/templates.jsx";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Main"
        component={TemplateRegistry}
        durationInFrames={300} // Default value
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          templateId: "reel-v1",
          backgroundUrl: "", // Will fallback to the local video in ReelV1
          sequences: {
            hook: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
            problem:
              "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
            solution:
              "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.",
            cta: "Duis aute irure dolor in reprehenderit.",
          },
        }}
        // The render process will override durationInFrames based on calculateTotalFrames
      />
    </>
  );
};
