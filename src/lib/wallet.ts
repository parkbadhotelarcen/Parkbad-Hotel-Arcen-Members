import crypto from "node:crypto";
import { createAdminClient } from "@/lib/supabase/server";
import { fullName } from "@/lib/loyalty";
import type { Guest } from "@/lib/types";

function base64Url(input: string | Buffer) {
  return Buffer.from(input).toString("base64url");
}

function signJwt(payload: Record<string, unknown>, serviceAccountEmail: string, privateKey: string) {
  const header = { alg: "RS256", typ: "JWT" };
  const encodedHeader = base64Url(JSON.stringify(header));
  const encodedPayload = base64Url(JSON.stringify(payload));
  const body = `${encodedHeader}.${encodedPayload}`;
  const signature = crypto.createSign("RSA-SHA256").update(body).sign(privateKey.replace(/\\n/g, "\n"));
  return `${body}.${base64Url(signature)}`;
}

export async function getActiveWalletGuest(publicToken: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("guests")
    .select("*")
    .eq("public_token", publicToken)
    .eq("status", "active")
    .maybeSingle();

  return (data || null) as Guest | null;
}

export function googleWalletConfigured() {
  return Boolean(
    process.env.GOOGLE_WALLET_ISSUER_ID &&
      process.env.GOOGLE_WALLET_CLASS_ID &&
      process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL &&
      process.env.GOOGLE_WALLET_PRIVATE_KEY,
  );
}

export function appleWalletConfigured() {
  return Boolean(
    process.env.APPLE_WALLET_PASS_TYPE_ID &&
      process.env.APPLE_WALLET_TEAM_ID &&
      process.env.APPLE_WALLET_CERTIFICATE_BASE64 &&
      process.env.APPLE_WALLET_PRIVATE_KEY_BASE64 &&
      process.env.APPLE_WALLET_WWDR_CERTIFICATE_BASE64,
  );
}

export function googleWalletSaveUrl(guest: Guest, progressUrl: string) {
  const issuerId = process.env.GOOGLE_WALLET_ISSUER_ID!;
  const classId = process.env.GOOGLE_WALLET_CLASS_ID!;
  const serviceAccountEmail = process.env.GOOGLE_WALLET_SERVICE_ACCOUNT_EMAIL!;
  const privateKey = process.env.GOOGLE_WALLET_PRIVATE_KEY!;
  const objectId = `${issuerId}.${guest.guest_number.replace(/[^A-Za-z0-9_.-]/g, "_")}`;

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    iss: serviceAccountEmail,
    aud: "google",
    typ: "savetowallet",
    iat: now,
    origins: [process.env.NEXT_PUBLIC_APP_URL || ""].filter(Boolean),
    payload: {
      genericObjects: [
        {
          id: objectId,
          classId,
          genericType: "GENERIC_TYPE_UNSPECIFIED",
          hexBackgroundColor: "#004C49",
          cardTitle: {
            defaultValue: {
              language: "nl-NL",
              value: "Landal Vaste Gasten Club",
            },
          },
          subheader: {
            defaultValue: {
              language: "nl-NL",
              value: "Parkbad Hotel Arcen Members",
            },
          },
          header: {
            defaultValue: {
              language: "nl-NL",
              value: fullName(guest.first_name, guest.last_name),
            },
          },
          barcode: {
            type: "QR_CODE",
            value: progressUrl,
            alternateText: guest.guest_number,
          },
          textModulesData: [
            {
              id: "guest_number",
              header: "Gastnummer",
              body: guest.guest_number,
            },
            {
              id: "visits",
              header: "Bezoeken",
              body: String(guest.total_visits),
            },
            {
              id: "level",
              header: "Level",
              body: guest.current_level,
            },
          ],
          linksModuleData: {
            uris: [
              {
                uri: progressUrl,
                description: "Voortgang bekijken",
                id: "progress",
              },
            ],
          },
        },
      ],
    },
  };

  return `https://pay.google.com/gp/v/save/${signJwt(payload, serviceAccountEmail, privateKey)}`;
}

export function walletSetupHtml(title: string, items: string[]) {
  return `<!doctype html>
<html lang="nl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #fbfaf5; color: #003836; font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
      main { width: min(92vw, 560px); background: white; border: 1px solid #d2f1ef; border-radius: 12px; box-shadow: 0 18px 45px rgba(0, 76, 73, .10); padding: 28px; }
      h1 { margin: 0 0 12px; font-size: 28px; }
      p, li { line-height: 1.6; color: #334155; }
      code { background: #edfafa; color: #00625f; padding: 2px 6px; border-radius: 6px; }
    </style>
  </head>
  <body>
    <main>
      <h1>${title}</h1>
      <p>Deze Wallet-koppeling is technisch voorbereid, maar mist nog instellingen in Vercel.</p>
      <ul>${items.map((item) => `<li><code>${item}</code></li>`).join("")}</ul>
    </main>
  </body>
</html>`;
}
