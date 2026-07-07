import { NextResponse } from "next/server";
import { appleWalletConfigured, getActiveWalletGuest, walletSetupHtml } from "@/lib/wallet";

export async function GET(_request: Request, context: { params: Promise<{ public_token: string }> }) {
  const { public_token } = await context.params;
  const guest = await getActiveWalletGuest(public_token);
  if (!guest) {
    return new NextResponse("Deze ledenkaart is niet actief.", { status: 404 });
  }

  if (!appleWalletConfigured()) {
    return new NextResponse(
      walletSetupHtml("Apple Wallet is nog niet ingesteld", [
        "APPLE_WALLET_PASS_TYPE_ID",
        "APPLE_WALLET_TEAM_ID",
        "APPLE_WALLET_CERTIFICATE_BASE64",
        "APPLE_WALLET_PRIVATE_KEY_BASE64",
        "APPLE_WALLET_WWDR_CERTIFICATE_BASE64",
      ]),
      { status: 501, headers: { "content-type": "text/html; charset=utf-8" } },
    );
  }

  return new NextResponse(
    walletSetupHtml("Apple Wallet generator ontbreekt nog", [
      "De Apple-certificaten zijn herkend.",
      "De volgende stap is het ondertekende .pkpass bestand genereren.",
    ]),
    { status: 501, headers: { "content-type": "text/html; charset=utf-8" } },
  );
}
