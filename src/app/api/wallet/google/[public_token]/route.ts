import { NextResponse } from "next/server";
import { getPublicBaseUrl, guestUrl } from "@/lib/urls";
import { getActiveWalletGuest, googleWalletConfigured, googleWalletSaveUrl, walletSetupHtml } from "@/lib/wallet";

export async function GET(request: Request, context: { params: Promise<{ public_token: string }> }) {
  if (!googleWalletConfigured()) {
    return new NextResponse(
      walletSetupHtml("Google Wallet is nog niet ingesteld", [
        "GOOGLE_WALLET_ISSUER_ID",
        "GOOGLE_WALLET_CLASS_ID",
        "GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL",
        "GOOGLE_WALLET_PRIVATE_KEY",
      ]),
      { status: 501, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  const { public_token } = await context.params;
  const guest = await getActiveWalletGuest(public_token);
  if (!guest) {
    return new NextResponse("Deze ledenkaart is niet actief.", { status: 404 });
  }

  const baseUrl = getPublicBaseUrl(new Headers(request.headers));
  const saveUrl = googleWalletSaveUrl(guest, guestUrl(guest.public_token, baseUrl));
  return NextResponse.redirect(saveUrl);
}
