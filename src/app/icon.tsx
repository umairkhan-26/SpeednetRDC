import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 14,
        }}
      >
        <svg width="40" height="40" viewBox="0 0 36 36">
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
