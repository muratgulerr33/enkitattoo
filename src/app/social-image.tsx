import { ImageResponse } from "next/og";
import { headers } from "next/headers";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "Enki Tattoo";

function arrayBufferToBase64(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

async function getLogoDataUrl(): Promise<string> {
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  const protocol =
    requestHeaders.get("x-forwarded-proto") ?? (host?.includes("localhost") ? "http" : "https");

  if (!host) {
    throw new Error("Missing host header for OG image generation");
  }

  const iconArrayBuffer = await fetch(`${protocol}://${host}/icon.png`, {
    cache: "force-cache",
  }).then((res) => res.arrayBuffer());
  const base64 = arrayBufferToBase64(iconArrayBuffer);
  return `data:image/png;base64,${base64}`;
}

export async function renderSocialImage() {
  const logoDataUrl = await getLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          background: "#0B0B0D",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: "-24%",
            background:
              "radial-gradient(circle at 50% 46%, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.06) 24%, rgba(11,11,13,0.92) 68%, rgba(11,11,13,1) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxShadow: "inset 0 0 180px rgba(0, 0, 0, 0.58)",
          }}
        />
        <img
          src={logoDataUrl}
          alt="Enki Tattoo"
          width={520}
          height={520}
          style={{
            objectFit: "contain",
            zIndex: 1,
            filter: "drop-shadow(0 22px 54px rgba(0,0,0,0.64))",
          }}
        />
      </div>
    ),
    size,
  );
}
