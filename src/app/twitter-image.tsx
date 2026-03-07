import { renderSocialImage } from "./social-image";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";
export const alt = "Enki Tattoo";

export default async function TwitterImage() {
  return renderSocialImage();
}
