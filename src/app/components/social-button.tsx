import Image from "next/image";

export function SocialButton({
  img,
  imgAlt,
  theme,
  disabled = false,
  children,
  onClick,
}: {
  img?: string;
  imgAlt?: string;
  theme: "blue" | "black";
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex h-11 w-60 items-center rounded font-button font-bold cursor-pointer ${
        theme === "blue" ? "bg-blue" : "bg-black"
      }`}
      disabled={disabled}
    >
      {img && imgAlt && (
        <span className={` p-2 m-1 rounded ${theme === "blue" && "bg-white"}`}>
          <Image src={img} alt={imgAlt} width="24" height="24" />
        </span>
      )}
      <span className="text-sm flex-1 flex justify-center">{children}</span>
    </button>
  );
}
