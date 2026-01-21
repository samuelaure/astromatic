import React from "react";
import { ASFAT1 } from "../templates/ASFA-T1.jsx";

export const TemplateRegistry = (props) => {
  const { templateId } = props;

  switch (templateId) {
    case "asfa-t1":
      return <ASFAT1 {...props} />;
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
