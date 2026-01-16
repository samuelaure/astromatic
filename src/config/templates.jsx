import React from "react";
import { MarketingV1 } from "../templates/MarketingV1.jsx";
import { AttentionV1 } from "../templates/AttentionV1.jsx";
import { ReelV1 } from "../templates/ReelV1.jsx";

export const TemplateRegistry = (props) => {
  const { templateId } = props;

  switch (templateId) {
    case "marketing-v1":
      return <MarketingV1 {...props} />;
    case "attention-v1":
      return <AttentionV1 {...props} />;
    case "reel-v1":
      return <ReelV1 {...props} />;
    default:
      return (
        <div
          style={{
            flex: 1,
            backgroundColor: "black",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          Unknown Template: {templateId}
        </div>
      );
  }
};
