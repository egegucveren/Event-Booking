// App icon generator: renders a simple PulsePass mark for the browser tab and metadata.
import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background: "linear-gradient(135deg, #ff6b3d 0%, #ffb266 100%)",
          borderRadius: 12,
          color: "#07111f",
          display: "flex",
          fontSize: 18,
          fontWeight: 800,
          height: "100%",
          justifyContent: "center",
          width: "100%"
        }}
      >
        PP
      </div>
    ),
    size
  );
}
