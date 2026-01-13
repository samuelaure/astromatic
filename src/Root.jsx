import { Composition } from "remotion";
import { TemplateRegistry } from "./config/templates";

export const RemotionRoot = () => {
  return (
    <>
      <Composition
        id="Main"
        component={TemplateRegistry}
        durationInFrames={300} // Default, will be overridden by logic later
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          templateId: "marketing-v1",
          sequences: {
            hook: "Loading...",
            problem: "",
            solution: "",
            cta: "",
          },
        }}
      />
    </>
  );
};
