import { ImageResponse } from "next/og";

export const alt = "Abdulhameed Abdulsalam | Product Designer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "linear-gradient(135deg, #0f0f0a 0%, #1a1a14 50%, #14140f 100%)",
          fontFamily: "Geist, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "24px",
          }}
        >
          <span
            style={{
              fontSize: "24px",
              fontWeight: 700,
              letterSpacing: "8px",
              color: "#A3B33A",
              textTransform: "uppercase",
            }}
          >
            MEED
          </span>
        </div>
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#f5f5f0",
            lineHeight: 1.05,
            letterSpacing: "-2px",
            margin: 0,
          }}
        >
          Product Designer
        </h1>
        <h1
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#A3B33A",
            lineHeight: 1.05,
            letterSpacing: "-2px",
            margin: 0,
          }}
        >
          with an AI Edge
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "#999990",
            marginTop: "32px",
            maxWidth: "600px",
            lineHeight: 1.4,
          }}
        >
          Product design, design systems & AI-enhanced workflows
        </p>
      </div>
    ),
    { ...size }
  );
}
