import React from "react";
import { MarketingV1 } from "../templates/MarketingV1.jsx";
import { AttentionV1 } from "../templates/AttentionV1.jsx";

export const TemplateRegistry = (props) => {
  const { templateId } = props;

  switch (templateId) {
    case "marketing-v1":
      return <MarketingV1 {...props} />;
    case "attention-v1":
      return <AttentionV1 {...props} />;
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
