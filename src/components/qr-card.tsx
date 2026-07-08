import Image from "next/image";
import { qrDataUrl } from "@/lib/actions";

export async function QrCard({
  url,
  label,
  guestNumber,
  showUrl = true,
  showLabel = true,
  bare = false,
}: {
  url: string;
  label: string;
  guestNumber?: string;
  showUrl?: boolean;
  showLabel?: boolean;
  bare?: boolean;
}) {
  const src = await qrDataUrl(url);
  return (
    <div className={bare ? "text-center" : "card p-5 text-center"}>
      <div className="mx-auto w-fit rounded-lg border border-landal-100 bg-white p-3 shadow-card">
        <Image src={src} alt={label} width={232} height={232} className="rounded-md" />
      </div>
      {showLabel && <div className="mt-4 text-xs font-black uppercase tracking-wide text-landal-600">{label}</div>}
      {guestNumber && <div className="mt-1 text-2xl font-black tracking-wide text-landal-900">{guestNumber}</div>}
      {showUrl && <div className="mt-1 break-all text-xs text-slate-500">{url}</div>}
    </div>
  );
}
