import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
        }}
      >
        <svg width="112" height="112" viewBox="0 0 36 36">
          <rect x="2" y="22" width="6" height="10" rx="1.6" fill="#F06104" />
          <rect x="11" y="15" width="6" height="17" rx="1.6" fill="#F06104" />
          <rect x="20" y="9" width="6" height="23" rx="1.6" fill="#F06104" />
          <rect x="29" y="4" width="6" height="28" rx="1.6" fill="#F06104" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
