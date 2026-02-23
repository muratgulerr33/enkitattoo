import {
  createSocialImageResponse,
  socialImageAlt,
  socialImageContentType,
  socialImageSize,
} from "./social-image";

export const runtime = "nodejs";
export const alt = socialImageAlt;
export const size = socialImageSize;
export const contentType = socialImageContentType;

export default async function OpenGraphImage() {
  return createSocialImageResponse();
}
