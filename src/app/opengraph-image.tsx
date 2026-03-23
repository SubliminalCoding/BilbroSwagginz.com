import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BilbroSwagginz — AI-powered products built in public";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0b0e0b",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 80px",
        }}
      >
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#eaf0ea",
            letterSpacing: "-2px",
            lineHeight: 1.1,
            textAlign: "center",
            marginBottom: 24,
          }}
        >
          BilbroSwagginz
        </div>
        <div
          style={{
            fontSize: 32,
            fontWeight: 500,
            color: "#4eca5c",
            textAlign: "center",
            marginBottom: 40,
          }}
        >
          AI-powered products built in public.
        </div>
        <div
          style={{
            display: "flex",
            gap: 16,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          {["ActuallyShip", "MeCoach", "AgentReplay", "SocialForge", "VoiceForge"].map(
            (name) => (
              <div
                key={name}
                style={{
                  fontSize: 18,
                  color: "#8a9a8a",
                  border: "1px solid #1e2a1e",
                  borderRadius: 8,
                  padding: "8px 20px",
                }}
              >
                {name}
              </div>
            )
          )}
        </div>
      </div>
    ),
    { ...size }
  );
}
