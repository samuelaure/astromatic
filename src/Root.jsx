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
          templateId: "attention-v1",
          backgroundUrl: "https://assets.mixkit.co/videos/preview/mixkit-starry-night-sky-with-clouds-transiting-4340-large.mp4",
          sequences: {
            hook: "Connecting Families Through The Stars",
            problem: "Losing touch with your lineage in a busy world?",
            solution: "Astromatic creates personalized cosmic ancestry maps.",
            cta: "Discover Your Legacy",
          },
        }}
      // The render process will override durationInFrames based on calculateTotalFrames
      />
    </>
  );
};
