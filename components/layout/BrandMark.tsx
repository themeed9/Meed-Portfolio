import Image from "next/image";

type BrandMarkProps = {
  context?: "hero" | "surface";
  size?: number;
};

export default function BrandMark({ context = "surface", size = 44 }: BrandMarkProps) {
  return (
    <span
      className={`brand-mark brand-mark--${context}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Image
        src="/meed-mark-light.svg"
        alt=""
        width={size}
        height={size}
        loading="eager"
        className="brand-mark-light"
      />
      <Image
        src="/meed-mark-dark.svg"
        alt=""
        width={size}
        height={size}
        loading="eager"
        className="brand-mark-dark"
      />
    </span>
  );
}
