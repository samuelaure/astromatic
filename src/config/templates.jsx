import React from "react";
import { ReelV1 } from "../templates/ReelV1.jsx";

export const TemplateRegistry = (props) => {
  const { templateId } = props;

  switch (templateId) {
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
