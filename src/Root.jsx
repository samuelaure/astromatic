import { Composition } from "remotion";
import { TemplateRegistry } from "./config/templates";

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
          templateId: "marketing-v1",
          backgroundUrl: "",
          sequences: {
            hook: "Hook Text Placeholder",
            problem: "Problem Text Placeholder",
            solution: "Solution Text Placeholder",
            cta: "CTA Text Placeholder",
          },
        }}
        // The render process will override durationInFrames based on calculateTotalFrames
      />
    </>
  );
};
