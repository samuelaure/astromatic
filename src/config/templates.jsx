import React from "react";
import { MarketingV1 } from "../templates/MarketingV1";

export const TemplateRegistry = (props) => {
  const { templateId } = props;

  switch (templateId) {
    case "marketing-v1":
      return <MarketingV1 {...props} />;
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
