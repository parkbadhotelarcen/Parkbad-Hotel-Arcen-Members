import { appUrl } from "@/lib/config";

export function getPublicBaseUrl(headersList?: Headers) {
  const configured = process.env.NEXT_PUBLIC_APP_URL;
  if (configured && !configured.includes("localhost")) return configured.replace(/\/$/, "");

  const host = headersList?.get("x-forwarded-host") || headersList?.get("host");
  if (host) {
    const proto = headersList?.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }

  return appUrl.replace(/\/$/, "");
}

export function activationUrl(token: string | null, baseUrl = getPublicBaseUrl()) {
  return token ? `${baseUrl}/activate/${token}` : "";
}

export function guestUrl(token: string | null, baseUrl = getPublicBaseUrl()) {
  return token ? `${baseUrl}/guest/${token}` : "";
}
