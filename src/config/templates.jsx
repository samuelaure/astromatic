/**
 * Registry to resolve template IDs to components.
 * Currently serves as a placeholder until templates are added.
 */
export const TemplateRegistry = ({ templateId, ...props }) => {
  // Logic to return specific template components will go here
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: "black",
        color: "white",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontSize: "40px",
        fontFamily: "sans-serif",
      }}
    >
      Template: {templateId}
    </div>
  );
};
