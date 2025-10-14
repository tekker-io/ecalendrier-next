export function Button({
  type = "button",
  size = "normal",
  theme = "transparent",
  children,
}: {
  type?: "button" | "submit" | "reset";
  size?: "small" | "normal" | "large";
  theme?: "dark" | "transparent" | "danger" | "success";
  children: React.ReactNode;
}) {
  return (
    <button
      type={type}
      className={`flex items-center gap-1 rounded cursor-pointer py-2 ${
        size === "small" ? "px-2" : size === "normal" ? "px-4" : "px-6"
      } ${
        theme === "danger"
          ? "bg-red hover:bg-red/90"
          : theme === "success"
          ? "bg-green hover:bg-green/90"
          : theme === "dark"
          ? "bg-black hover:bg-black/90"
          : "bg-black/0 hover:bg-black/10"
      } text-white`}
    >
      {children}
    </button>
  );
}
