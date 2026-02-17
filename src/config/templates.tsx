import React from "react";
import { ASFAT1, ASFAT1Props } from "../templates/ASFA-T1.tsx";
import { ASFAT2, ASFAT2Props } from "../templates/ASFA-T2.tsx";
import { MAFAT1, MAFAT1Props } from "../templates/MAFA-T1.tsx";
import { MAFAT2, MAFAT2Props } from "../templates/MAFA-T2.tsx";

type TemplateProps = (ASFAT1Props | ASFAT2Props | MAFAT1Props | MAFAT2Props) & { templateId: string };

export const TemplateRegistry: React.FC<TemplateProps> = (props) => {
  const { templateId } = props;

  switch (templateId) {
    case "asfa-t1":
      return <ASFAT1 {...(props as ASFAT1Props)} />;
    case "asfa-t2":
      return <ASFAT2 {...(props as ASFAT2Props)} />;
    case "mafa-t1":
      return <MAFAT1 {...(props as MAFAT1Props)} />;
    case "mafa-t2":
      return <MAFAT2 {...(props as MAFAT2Props)} />;
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
