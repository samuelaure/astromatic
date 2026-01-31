import React from "react";
import { ASFAT1, ASFAT1Props } from "../templates/ASFA-T1.tsx";
import { ASFAT2, ASFAT2Props } from "../templates/ASFA-T2.tsx";

type TemplateProps = (ASFAT1Props | ASFAT2Props) & { templateId: string };

export const TemplateRegistry: React.FC<TemplateProps> = (props) => {
  const { templateId } = props;

  switch (templateId) {
    case "asfa-t1":
      return <ASFAT1 {...(props as ASFAT1Props)} />;
    case "asfa-t2":
      return <ASFAT2 {...(props as ASFAT2Props)} />;
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
