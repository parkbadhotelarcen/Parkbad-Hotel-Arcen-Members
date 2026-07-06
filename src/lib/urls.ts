import { appUrl } from "@/lib/config";

export function activationUrl(token: string | null) {
  return token ? `${appUrl}/activate/${token}` : "";
}

export function guestUrl(token: string | null) {
  return token ? `${appUrl}/guest/${token}` : "";
}
