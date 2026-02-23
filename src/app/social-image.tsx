import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

export const socialImageSize = {
  width: 1200,
  height: 630,
};

export const socialImageContentType = "image/png";
export const socialImageAlt = "Enki Tattoo";

const socialTitle = "Enki Tattoo";
const socialSubtitle = "Mersin Dövme & Piercing | Enki Tattoo";
const iconPath = path.join(process.cwd(), "public", "icon.png");
const geistFontCandidates = [
  path.join(process.cwd(), "public", "fonts", "Geist-Regular.woff2"),
  path.join(process.cwd(), "public", "fonts", "Geist-Medium.woff2"),
  path.join(process.cwd(), "public", "fonts", "Geist.woff2"),
];

async function loadFirstExistingFont(): Promise<Buffer | null> {
  for (const candidate of geistFontCandidates) {
    try {
      return await readFile(candidate);
    } catch {
      continue;
    }
  }
  return null;
}

async function loadLogoDataUrl(): Promise<string> {
  const iconBuffer = await readFile(iconPath);
  return `data:image/png;base64,${iconBuffer.toString("base64")}`;
}

export async function createSocialImageResponse() {
  const [logoDataUrl, fontData] = await Promise.all([loadLogoDataUrl(), loadFirstExistingFont()]);
  const fontFamily = fontData ? "Geist" : "system-ui, -apple-system, Segoe UI, sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "#0B0B0D",
          color: "#F5F5F5",
          fontFamily,
          padding: "56px 72px",
          textAlign: "center",
        }}
      >
        <img
          src={logoDataUrl}
          alt="Enki Tattoo"
          width={220}
          height={220}
          style={{ objectFit: "contain" }}
        />
        <div
          style={{
            marginTop: 30,
            fontSize: 74,
            lineHeight: 1,
            fontWeight: 700,
            letterSpacing: -1,
          }}
        >
          {socialTitle}
        </div>
        <div
          style={{
            marginTop: 18,
            fontSize: 35,
            lineHeight: 1.25,
            fontWeight: 500,
            opacity: 0.92,
          }}
        >
          {socialSubtitle}
        </div>
      </div>
    ),
    {
      ...socialImageSize,
      // TODO: Add local Geist woff2 into public/fonts if you want exact font parity.
      fonts: fontData
        ? [
            {
              name: "Geist",
              data: fontData,
              style: "normal",
              weight: 500,
            },
          ]
        : undefined,
    },
  );
}
